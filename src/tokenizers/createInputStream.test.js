import createInputStream from './createInputStream';

test('createInputStream', () => {
  const stream = createInputStream('ab');
  expect(stream.eof()).toBeFalsy();

  expect(stream.peek()).toEqual('a');
  expect(stream.next()).toEqual('a');
  expect(stream.peek()).toEqual('b');
  expect(stream.next()).toEqual('b');

  expect(stream.eof()).toBeTruthy();
});
