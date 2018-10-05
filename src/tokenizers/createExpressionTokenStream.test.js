import createExpressionTokenStream from "./createExpressionTokenStream";
import createInputStream from "./createInputStream";
import { TYPES } from "../const";
import { createIdentifier, createValue } from "../utils";

const create = str => createExpressionTokenStream(createInputStream(str));

describe("createExpressionTokenStream", () => {
  it("should peek without move index", () => {
    const stream = create("hello");
    const peeked = stream.peek();

    expect(stream.eof()).toBeFalsy();
    expect(stream.next()).toEqual(peeked);
    expect(stream.eof()).toBeTruthy();
  });

  it("should recognize identifier", () => {
    const stream = create("hello");
    expect(stream.next()).toEqual(createIdentifier("hello"));
  });

  it("should recognize null", () => {
    const stream = create("null");
    expect(stream.next()).toEqual(createValue(null));
  });

  it("should recognize boolean", () => {
    const stream = create("false true");

    expect(stream.next()).toEqual(createValue(false));
    expect(stream.next()).toEqual(createValue(true));
  });

  describe("should recognize number", () => {
    it("should recognize integer", () => {
      const stream = create("0 1 23456 7890");

      expect(stream.next()).toEqual(createValue(0));
      expect(stream.next()).toEqual(createValue(1));
      expect(stream.next()).toEqual(createValue(23456));
      expect(stream.next()).toEqual(createValue(7890));
    });

    it("should recognize float", () => {
      const stream = create("3.14 5.2678");

      expect(stream.next()).toEqual(createValue(3.14));
      expect(stream.next()).toEqual(createValue(5.2678));
    });
  });

  describe("should recognize string", () => {
    it("should recognize double quote string", () => {
      const stream = create('"asdf"');

      expect(stream.next()).toEqual(createValue("asdf"));
    });

    it("should recognize single quote string", () => {
      const stream = create("'asdf'");

      expect(stream.next()).toEqual(createValue("asdf"));
    });

    it("should recognize mixed quote string", () => {
      const stream = create("'asdf\"'");

      expect(stream.next()).toEqual(createValue('asdf"'));
    });

    it("should recognize escape", () => {
      const stream = create("'\\a\\s\\d\\f\\\\'");

      expect(stream.next()).toEqual(createValue("asdf\\"));
    });

    it("should throw error when it's not valid", () => {
      let stream = create("'asdfasdf");
      expect(() => stream.next()).toThrow();

      stream = create('"asdfasdf');
      expect(() => stream.next()).toThrow();
    });
  });

  describe("should recognize regexp", () => {
    it("should recognize regexp in binary expression", () => {
      const stream = create("budget match /\\s\\//gimuy");
      expect(stream.next()).toEqual(createIdentifier("budget"));
      expect(stream.next()).toEqual({
        type: TYPES.Operator,
        value: "match"
      });
      expect(stream.next()).toEqual(createValue(/\s\//gimuy));
    });

    it("should recognize regexp at start", () => {
      const stream = create("/[abc]/iy ");
      expect(stream.next()).toEqual(createValue(/[abc]/iy));
    });

    it("should recognize regexp in call expression", () => {
      const stream = create("call(/\\s\\//g)");
      expect(stream.next()).toEqual(createIdentifier("call"));
      expect(stream.next()).toEqual({
        type: TYPES.Punctuation,
        value: "("
      });
      expect(stream.next()).toEqual(createValue(/\s\//g));
      expect(stream.next()).toEqual({
        type: TYPES.Punctuation,
        value: ")"
      });
    });
  });

  it("should recognize punctuation", () => {
    const stream = create("(){}[],:");

    expect(stream.next()).toEqual({
      type: TYPES.Punctuation,
      value: "("
    });

    expect(stream.next()).toEqual({
      type: TYPES.Punctuation,
      value: ")"
    });

    expect(stream.next()).toEqual({
      type: TYPES.Punctuation,
      value: "{"
    });

    expect(stream.next()).toEqual({
      type: TYPES.Punctuation,
      value: "}"
    });

    expect(stream.next()).toEqual({
      type: TYPES.Punctuation,
      value: "["
    });

    expect(stream.next()).toEqual({
      type: TYPES.Punctuation,
      value: "]"
    });

    expect(stream.next()).toEqual({
      type: TYPES.Punctuation,
      value: ","
    });

    expect(stream.next()).toEqual({
      type: TYPES.Punctuation,
      value: ":"
    });
  });

  it("should recognize operators", () => {
    const stream = create("+-*>=<=match<and>or not is isnt 1 /");

    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: "+"
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: "-"
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: "*"
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: ">="
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: "<="
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: "match"
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: "<"
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: "and"
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: ">"
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: "or"
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: "not"
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: "is"
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: "isnt"
    });
    expect(stream.next()).toEqual(createValue(1));
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: "/"
    });
  });

  it("should recognize '/' operator after () [FE-1398]", () => {
    const stream = create(") /");

    expect(stream.next()).toEqual({
      type: TYPES.Punctuation,
      value: ")"
    });
    expect(stream.next()).toEqual({
      type: TYPES.Operator,
      value: "/"
    });
  });

  describe("string template literal", () => {
    it("should support empty template literal", () => {
      const stream = create("``");

      expect(stream.next()).toEqual({
        type: TYPES.Punctuation,
        value: "`"
      });
      expect(stream.next()).toEqual({
        type: TYPES.Punctuation,
        value: "`"
      });
      expect(stream.eof()).toBeTruthy();
    });

    it("should support complex template literal", () => {
      const stream = create("`'\"foo\"'\\{\\`{`1{1}`}bar`");
      expect(stream.next()).toEqual({
        type: TYPES.Punctuation,
        value: "`"
      });
      expect(stream.next()).toEqual(createValue(`'"foo"'{\``));
      expect(stream.next()).toEqual({
        type: TYPES.Punctuation,
        value: "{"
      });
      expect(stream.next()).toEqual({
        type: TYPES.Punctuation,
        value: "`"
      });
      expect(stream.next()).toEqual(createValue(`1`));
      expect(stream.next()).toEqual({
        type: TYPES.Punctuation,
        value: "{"
      });
      expect(stream.next()).toEqual(createValue(1));
      expect(stream.next()).toEqual({
        type: TYPES.Punctuation,
        value: "}"
      });
      expect(stream.next()).toEqual({
        type: TYPES.Punctuation,
        value: "`"
      });
      expect(stream.next()).toEqual({
        type: TYPES.Punctuation,
        value: "}"
      });
      expect(stream.next()).toEqual(createValue("bar"));
      expect(stream.next()).toEqual({
        type: TYPES.Punctuation,
        value: "`"
      });
      expect(stream.eof()).toBeTruthy();
    });

    it("should throw error when it's not valid", () => {
      let stream = create("`{}`");
      stream.next();
      expect(() => stream.next()).toThrow();

      stream = create("`1");
      stream.next();
      expect(() => stream.next()).toThrow();
    });
  });
});
