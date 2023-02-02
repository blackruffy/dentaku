import {
  Stream,
  digit,
  expr,
  float,
  integer,
  md,
  mdTerms,
  pm,
  pmTerms,
} from '../src/parser';

test('parse digit', () => {
  expect(digit(new Stream('1', 0)).get()).toBe(1);
});

test('parse integer', () => {
  expect(integer(new Stream('123', 0)).get()).toBe(123);
});

test('parse float', () => {
  expect(float(new Stream('123', 0)).get()).toBe(123);

  expect(float(new Stream('123.456', 0)).get()).toBe(123.456);
});

test('pm', () => {
  expect(pm(new Stream('+', 0)).get()).toBe('+');

  expect(pm(new Stream('-', 0)).get()).toBe('-');
});

test('md', () => {
  expect(md(new Stream('*', 0)).get()).toBe('*');

  expect(md(new Stream('/', 0)).get()).toBe('/');
});

test('mdTerm', () => {
  expect(mdTerms(new Stream('2', 0)).get()).toBe(2);

  expect(mdTerms(new Stream('2 * 3', 0)).get()).toBe(6);

  expect(mdTerms(new Stream('6 / 3', 0)).get()).toBe(2);

  expect(mdTerms(new Stream('2 * 3 / 10 * 5', 0)).get()).toBe(3);
});

test('pmTerm', () => {
  expect(pmTerms(new Stream('2', 0)).get()).toBe(2);

  expect(pmTerms(new Stream('2 + 3', 0)).get()).toBe(5);

  expect(pmTerms(new Stream('6 - 3', 0)).get()).toBe(3);

  expect(pmTerms(new Stream('2 + 3 - 10 * 5', 0)).get()).toBe(-45);

  expect(pmTerms(new Stream('2 * 3 - 10 * 5', 0)).get()).toBe(-44);
});

test('expr', () => {
  expect(expr(new Stream('  2  +  3   - 10  *   5  ', 0)).get()).toBe(-45);

  expect(expr(new Stream('  2 + 3 - 10 * 5  .', 0)).isSuccess()).toBe(false);
});
