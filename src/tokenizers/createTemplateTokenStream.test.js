import createInputStream from './createInputStream';
import createTemplateTokenStream from './createTemplateTokenStream';
import {
  GLOBAL_FUNCTIONS,
  OPERATORS,
  PUNCTUATIONS,
  TYPES,
} from '../const';

const create = (str) => createTemplateTokenStream(createInputStream(str));

const empty = {
  type: TYPES.String,
  value: '',
};

const call = {
  type: TYPES.Identifier,
  name: GLOBAL_FUNCTIONS.toString,
};

const concat = {
  type: TYPES.Operator,
  value: OPERATORS.Add,
};

const parenthesis = [
  {
    type: TYPES.Punctuation,
    value: PUNCTUATIONS.Parentheses[0],
  },
  {
    type: TYPES.Punctuation,
    value: PUNCTUATIONS.Parentheses[1],
  },
];

describe('createTemplateTokenStream', () => {
  it('should able to use \\ to escape {', () => {
    const stream = create('foo\\{bar');
    expect(stream.next()).toEqual({
      type: TYPES.String,
      value: 'foo{bar',
    });
    expect(stream.eof()).toBeTruthy();
  });

  it('should support expression at the start', () => {
    const stream = create('{bar} foo');

    expect(stream.next()).toEqual(empty);

    expect(stream.next()).toEqual(concat);

    expect(stream.next()).toEqual(call);

    expect(stream.next()).toEqual(parenthesis[0]);

    expect(stream.next()).toEqual({
      type: TYPES.Identifier,
      name: 'bar',
    });
    expect(stream.next()).toEqual(parenthesis[1]);

    expect(stream.next()).toEqual(concat);

    expect(stream.next()).toEqual({
      type: TYPES.String,
      value: ' foo',
    });
    expect(stream.eof()).toBeTruthy();
  });

  it('should support expression at the end', () => {
    const stream = create('foo {bar}');
    expect(stream.next()).toEqual({
      type: TYPES.String,
      value: 'foo ',
    });
    expect(stream.next()).toEqual(concat);
    expect(stream.next()).toEqual(call);
    expect(stream.next()).toEqual(parenthesis[0]);
    expect(stream.next()).toEqual({
      type: TYPES.Identifier,
      name: 'bar',
    });
    expect(stream.next()).toEqual(parenthesis[1]);
    expect(stream.eof()).toBeTruthy();
  });

  it('should support multi expression', () => {
    const stream = create('foo {bar} hello {"world"}');
    expect(stream.next()).toEqual({
      type: TYPES.String,
      value: 'foo ',
    });
    expect(stream.next()).toEqual(concat);
    expect(stream.next()).toEqual(call);
    expect(stream.next()).toEqual(parenthesis[0]);
    expect(stream.next()).toEqual({
      type: TYPES.Identifier,
      name: 'bar',
    });
    expect(stream.next()).toEqual(parenthesis[1]);
    expect(stream.next()).toEqual(concat);

    expect(stream.next()).toEqual({
      type: TYPES.String,
      value: ' hello ',
    });

    expect(stream.next()).toEqual(concat);
    expect(stream.next()).toEqual(call);
    expect(stream.next()).toEqual(parenthesis[0]);
    expect(stream.next()).toEqual({
      type: TYPES.String,
      value: 'world',
    });
    expect(stream.next()).toEqual(parenthesis[1]);
    expect(stream.eof()).toBeTruthy();
  });

  it('should ignore with empty expression', () => {
    const stream = create('{}f{}o{}o{}');
    expect(stream.next()).toEqual({
      type: TYPES.String,
      value: 'foo',
    });
    expect(stream.eof()).toBeTruthy();
  });
});
