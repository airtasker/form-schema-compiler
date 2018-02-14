import createExpressionTokenStream from './createExpressionTokenStream';
import createInputStream from './createInputStream';
import { TYPES } from '../const';

const create = (str) => createExpressionTokenStream(createInputStream(str));

describe('createExpressionTokenStream', () => {
  it('should peek without move index', () => {
    const stream = create('hello');
    const peeked = stream.peek();

    expect(stream.eof()).toBeFalsy();
    expect(stream.next()).toEqual(peeked);
    expect(stream.eof()).toBeTruthy();
  });

  it('should recognize identifier', () => {
    const stream = create('hello');
    expect(stream.next()).toEqual({
      type: TYPES.Identifier,
      name: 'hello',
    });
  });

  it('should recognize null', () => {
    const stream = create('null');
    expect(stream.next()).toEqual({
      type: TYPES.Null,
      value: null,
    });
  });

  it('should recognize boolean', () => {
    const stream = create('false true');

    expect(stream.next()).toEqual({
      type: TYPES.Boolean,
      value: false,
    });
    expect(stream.next()).toEqual({
      type: TYPES.Boolean,
      value: true,
    });
  });

  describe('should recognize number', () => {
    it('should recognize integer', () => {
      const stream = create('0 1 23456 7890');

      expect(stream.next()).toEqual({
        type: TYPES.Numeric,
        value: 0,
      });
      expect(stream.next()).toEqual({
        type: TYPES.Numeric,
        value: 1,
      });
      expect(stream.next()).toEqual({
        type: TYPES.Numeric,
        value: 23456,
      });
      expect(stream.next()).toEqual({
        type: TYPES.Numeric,
        value: 7890,
      });
    });

    it('should recognize float', () => {
      const stream = create('3.14 5.2678');

      expect(stream.next()).toEqual({
        type: TYPES.Numeric,
        value: 3.14,
      });
      expect(stream.next()).toEqual({
        type: TYPES.Numeric,
        value: 5.2678,
      });
    });
  });

  describe('should recognize string', () => {
    it('should recognize double quote string', () => {
      const stream = create('"asdf"');

      expect(stream.next()).toEqual({
        type: TYPES.String,
        value: 'asdf',
      });
    });

    it('should recognize single quote string', () => {
      const stream = create("'asdf'");

      expect(stream.next()).toEqual({
        type: TYPES.String,
        value: 'asdf',
      });
    });

    it('should recognize escape', () => {
      const stream = create("'\\a\\s\\d\\f\\\\'");

      expect(stream.next()).toEqual({
        type: TYPES.String,
        value: 'asdf\\',
      });
    });
  });

  describe('should recognize regexp', () => {
    it('should recognize regexp in binary expression', () => {
      const stream = create('budget match /\\s\\//gimuy');
      expect(stream.next()).toEqual({
        type: TYPES.Identifier,
        name: 'budget',
      });
      expect(stream.next()).toEqual({
        type: TYPES.Operator,
        value: 'match',
      });
      expect(stream.next()).toEqual({
        type: TYPES.RegExp,
        pattern: '\\s\\/',
        flags: 'gimuy',
      });
    });

    it('should recognize regexp at start', () => {
      const stream = create('/[abc]/iy ');
      expect(stream.next()).toEqual({
        type: TYPES.RegExp,
        pattern: '[abc]',
        flags: 'iy',
      });
    });

    it('should recognize regexp in call expression', () => {
      const stream = create('call(/\\s\\//g)');
      expect(stream.next()).toEqual({
        type: TYPES.Identifier,
        name: 'call',
      });
      expect(stream.next()).toEqual({
        type: TYPES.Punctuation,
        value: '(',
      });
      expect(stream.next()).toEqual({
        type: TYPES.RegExp,
        pattern: '\\s\\/',
        flags: 'g',
      });
      expect(stream.next()).toEqual({
        type: TYPES.Punctuation,
        value: ')',
      });
    });
  });


  it('should recognize punctuation', () => {
    const stream = create('(),');

    expect(stream.next()).toEqual({
      type: TYPES.Punctuation,
      value: '(',
    });

    expect(stream.next()).toEqual({
      type: TYPES.Punctuation,
      value: ')',
    });

    expect(stream.next()).toEqual({
      type: TYPES.Punctuation,
      value: ',',
    });
  });

  it('should recognize operators', () => {
    const stream = create('+-*>=<=match<and>or not is isnt 1 /');

    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: '+',
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: '-',
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: '*',
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: '>=',
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: '<=',
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: 'match',
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: '<',
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: 'and',
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: '>',
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: 'or',
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: 'not',
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: 'is',
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: 'isnt',
    });
    expect(stream.next()).toEqual({
      type: TYPES.Numeric,
      value: 1,
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: '/',
    });
  });
});
