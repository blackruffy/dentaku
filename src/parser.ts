/*
  expr := muldiv ((+|-) muldiv)*
  muldiv := num ((*|/) num)*
  num := digit (. digit)*
*/

export class Stream {
  readonly buffer: string;
  readonly index: number;

  constructor(buffer: string, index: number) {
    this.buffer = buffer;
    this.index = index;
  }

  get(): string {
    return this.buffer.charAt(this.index);
  }

  at(index: number): Stream {
    return new Stream(this.buffer, index);
  }

  move(n: number): Stream {
    return this.at(this.index + n);
  }
}

export interface Output<A> {
  readonly stream: Stream;

  match<B>(onFailure: (f: Failure<A>) => B, onSuccess: (s: Success<A>) => B): B;

  chain<B>(f: (s: Success<A>) => Output<B>): Output<B>;

  map<B>(f: (a: A) => B): Output<B>;

  recover(f: (_: Failure<A>) => Output<A>): Output<A>;

  rollback(stream: Stream): Output<A>;

  get(): A;

  isSuccess(): boolean;
}

export class Success<A> implements Output<A> {
  readonly value: A;
  readonly stream: Stream;

  constructor(value: A, stream: Stream) {
    this.value = value;
    this.stream = stream;
  }

  match<B>(
    _onFailure: (f: Failure<A>) => B,
    onSuccess: (s: Success<A>) => B,
  ): B {
    return onSuccess(this);
  }

  chain<B>(f: (s: Success<A>) => Output<B>): Output<B> {
    return f(this);
  }

  map<B>(f: (a: A) => B): Output<B> {
    return new Success(f(this.value), this.stream);
  }

  recover(_f: (_: Failure<A>) => Output<A>): Output<A> {
    return this;
  }

  rollback(_stream: Stream): Output<A> {
    return this;
  }

  get(): A {
    return this.value;
  }

  isSuccess(): boolean {
    return true;
  }
}

export class Failure<A> implements Output<A> {
  readonly error: Error;
  readonly stream: Stream;

  constructor(msg: string, stream: Stream) {
    this.error = new Error(msg);
    this.stream = stream;
  }

  match<B>(
    onFailure: (f: Failure<A>) => B,
    _onSuccess: (s: Success<A>) => B,
  ): B {
    return onFailure(this);
  }

  chain<B>(_f: (s: Success<A>) => Output<B>): Output<B> {
    return new Failure(this.error.message, this.stream);
  }

  map<B>(_f: (a: A) => B): Output<B> {
    return new Failure(this.error.message, this.stream);
  }

  recover(f: (_: Failure<A>) => Output<A>): Output<A> {
    return f(this);
  }

  rollback(stream: Stream): Output<A> {
    return new Failure(this.error.message, stream);
  }

  get(): A {
    throw this.error;
  }

  isSuccess(): boolean {
    return false;
  }
}

export function anyChar(stream: Stream): Output<string> {
  const x = stream.get();
  return x === ''
    ? new Failure('Invalid index of stream', stream)
    : new Success(x, stream.move(1));
}

export function char(a: string, stream: Stream): Output<string> {
  return anyChar(stream).chain(s =>
    s.value === a ? s : new Failure(``, stream),
  );
}

export function digit(stream: Stream): Output<number> {
  return anyChar(stream).chain(s => {
    const x = parseInt(s.value);
    return isNaN(x)
      ? new Failure<number>('should be digit', stream)
      : new Success(x, s.stream);
  });
}

export function integer(stream: Stream): Output<number> {
  return digit(stream)
    .chain(s =>
      integer(s.stream).match(
        _ => s,
        t => new Success(parseInt(`${s.value}${t.value}`), t.stream),
      ),
    )
    .rollback(stream);
}

export function float(stream: Stream): Output<number> {
  return integer(stream)
    .chain(s =>
      char('.', s.stream)
        .chain(a =>
          integer(a.stream).chain(
            b => new Success(parseFloat(`${s.value}.${b.value}`), b.stream),
          ),
        )
        .recover(() => s),
    )
    .rollback(stream);
}

export function pm(stream: Stream): Output<string> {
  return char('+', stream).recover(() => char('-', stream));
}

export function md(stream: Stream): Output<string> {
  return char('*', stream).recover(() => char('/', stream));
}

export function space(stream: Stream): Output<void> {
  return char(' ', stream).map(() => {
    return;
  });
}

export function spaces0(stream: Stream): Output<void> {
  return space(stream)
    .chain(a => spaces0(a.stream))
    .recover(() => new Success(undefined, stream));
}

export function spaces1(stream: Stream): Output<void> {
  return space(stream).chain(a => spaces0(a.stream));
}

export function termRight(
  x: number,
  op: (stream: Stream) => Output<string>,
  term: (stream: Stream) => Output<number>,
  merge: (x: number, op: string, y: number) => number,
  stream: Stream,
): Output<number> {
  return spaces1(stream)
    .chain(b =>
      op(b.stream).chain(c =>
        spaces1(c.stream).chain(d =>
          term(d.stream).map(e => merge(x, c.value, e)),
        ),
      ),
    )
    .chain(y => termRight(y.value, op, term, merge, y.stream))
    .recover(() => new Success(x, stream));
}

export function terms(
  op: (stream: Stream) => Output<string>,
  term: (stream: Stream) => Output<number>,
  merge: (x: number, op: string, y: number) => number,
  stream: Stream,
): Output<number> {
  return term(stream).chain(a => termRight(a.value, op, term, merge, a.stream));
}

export function mdTerms(stream: Stream): Output<number> {
  return terms(md, float, (x, op, y) => (op === '*' ? x * y : x / y), stream);
}

export function pmTerms(stream: Stream): Output<number> {
  return terms(pm, mdTerms, (x, op, y) => (op === '+' ? x + y : x - y), stream);
}

export function expr(stream: Stream): Output<number> {
  return spaces0(stream)
    .chain(a =>
      pmTerms(a.stream).chain(b => spaces0(b.stream).map(() => b.value)),
    )
    .chain(c =>
      c.stream.index === c.stream.buffer.length
        ? new Success(c.value, c.stream)
        : new Failure(`Invalid token: ${c.stream.get()}`, c.stream),
    );
}

export function evaluate(expression: string): number {
  return expr(new Stream(expression, 0)).get();
}
