import { Adapter, Attrs, Listener, setAttrs } from './tag';

export class State<A> {
  readonly data: A;
  readonly listeners: Array<[Listener<A>, HTMLElement]>;

  constructor(a: A) {
    this.data = a;
    this.listeners = [];
  }

  onUpdate(f: Listener<A>): Adapter {
    return (e: HTMLElement) => {
      this.listeners.push([f, e]);
    };
  }

  update(g: (a: A) => A): void {
    this.listeners.forEach(([f, e]) => {
      setAttrs(e, f(g(this.data)));
    });
  }
}
