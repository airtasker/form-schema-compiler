import createInputStream from "../tokenizers/createInputStream";
import createExpressionTokenStream from "../tokenizers/createExpressionTokenStream";
import parseExpressionTokenStream from "./parseExpressionTokenStream";

import { OPERATORS, TYPES } from "../const";
import { createIdentifier, createValue } from "../utils";

const parse = str =>
  parseExpressionTokenStream(
    createExpressionTokenStream(createInputStream(str))
  );

describe("parseExpressionTokenStream", () => {
  it("should parse identifier", () => {
    const parsed = parse("foobar");
    expect(parsed).toEqual(createIdentifier("foobar"));
  });

  it("should parse null", () => {
    const parsed = parse("null");
    expect(parsed).toEqual(createValue(null));
  });

  it("should parse string", () => {
    const parsed = parse(`'asdfsad"f'`);
    expect(parsed).toEqual(createValue('asdfsad"f'));

    const parsed2 = parse(`"asdfsad'f"`);
    expect(parsed2).toEqual(createValue("asdfsad'f"));
  });

  describe("should parse boolean", () => {
    it("should parse true", () => {
      const parsed = parse("true");
      expect(parsed).toEqual(createValue(true));
    });

    it("should parse false", () => {
      const parsed = parse("false");
      expect(parsed).toEqual(createValue(false));
    });
  });

  describe("should parse expression", () => {
    describe("should parse unary expression", () => {
      it("should parse not unary expression", () => {
        const parsed = parse("not true");
        expect(parsed).toEqual({
          type: TYPES.UnaryExpression,
          operator: OPERATORS.Not,
          argument: createValue(true)
        });
      });

      it("should parse not unary expression within binary expression", () => {
        const parsed = parse("not true or not (true is not false)");
        expect(parsed).toEqual({
          type: TYPES.BinaryExpression,
          left: {
            type: TYPES.UnaryExpression,
            operator: OPERATORS.Not,
            argument: createValue(true)
          },
          operator: OPERATORS.Or,
          right: {
            type: TYPES.UnaryExpression,
            operator: OPERATORS.Not,
            argument: {
              type: TYPES.BinaryExpression,
              left: createValue(true),
              operator: OPERATORS.EqualTo,
              right: {
                type: TYPES.UnaryExpression,
                operator: OPERATORS.Not,
                argument: createValue(false)
              }
            }
          }
        });
      });

      it("should parse not unary expression within call expression", () => {
        const parsed = parse("not hello(not a)");
        expect(parsed).toEqual({
          type: TYPES.UnaryExpression,
          operator: OPERATORS.Not,
          argument: {
            type: TYPES.CallExpression,
            callee: createIdentifier("hello"),
            arguments: [
              {
                type: TYPES.UnaryExpression,
                operator: OPERATORS.Not,
                argument: createIdentifier("a")
              }
            ]
          }
        });
      });

      it("should parse subtract unary expression", () => {
        const parsed = parse("-1");
        expect(parsed).toEqual({
          type: TYPES.UnaryExpression,
          operator: OPERATORS.Subtract,
          argument: createValue(1)
        });
      });

      it("should parse add unary expression", () => {
        const parsed = parse("+foo");
        expect(parsed).toEqual({
          type: TYPES.UnaryExpression,
          operator: OPERATORS.Add,
          argument: createIdentifier("foo")
        });
      });

      it("should parse chained unary expression", () => {
        const parsed = parse("not - + foo");
        expect(parsed).toEqual({
          type: TYPES.UnaryExpression,
          operator: OPERATORS.Not,
          argument: {
            type: TYPES.UnaryExpression,
            operator: OPERATORS.Subtract,
            argument: {
              type: TYPES.UnaryExpression,
              operator: OPERATORS.Add,
              argument: createIdentifier("foo")
            }
          }
        });
      });
    });

    describe("binary expression", () => {
      it("should parse binary expression", () => {
        const parsed = parse("a < 1");
        expect(parsed).toEqual({
          type: TYPES.BinaryExpression,
          operator: OPERATORS.LessThan,
          left: createIdentifier("a"),
          right: createValue(1)
        });
      });

      it("should parse an complex binary expression", () => {
        debugger;
        const parsed = parse("a >= 5 and b <= 2000 or c > 5 or d < 5 ");
        expect(parsed).toEqual({
          type: TYPES.BinaryExpression,
          operator: OPERATORS.Or,
          left: {
            type: TYPES.BinaryExpression,
            operator: OPERATORS.Or,
            left: {
              type: TYPES.BinaryExpression,
              operator: OPERATORS.And,
              left: {
                type: TYPES.BinaryExpression,
                operator: OPERATORS.GreaterThanOrEqualTo,
                left: createIdentifier("a"),
                right: createValue(5)
              },
              right: {
                type: TYPES.BinaryExpression,
                operator: OPERATORS.LessThanOrEqualTo,
                left: createIdentifier("b"),
                right: createValue(2000)
              }
            },
            right: {
              type: TYPES.BinaryExpression,
              operator: OPERATORS.GreaterThan,
              left: createIdentifier("c"),
              right: createValue(5)
            }
          },
          right: {
            type: TYPES.BinaryExpression,
            operator: OPERATORS.LessThan,
            left: createIdentifier("d"),
            right: createValue(5)
          }
        });
      });
    });

    it("should parse chained call expression", () => {
      const parsed = parse("hello(1)(2)(3)");
      expect(parsed).toEqual({
        type: TYPES.CallExpression,
        callee: {
          type: TYPES.CallExpression,
          callee: {
            type: TYPES.CallExpression,
            callee: createIdentifier("hello"),
            arguments: [createValue(1)]
          },
          arguments: [createValue(2)]
        },
        arguments: [createValue(3)]
      });
    });

    it("should parse call expression", () => {
      const parsed = parse('hello(a, "c")');
      expect(parsed).toEqual({
        type: TYPES.CallExpression,
        callee: createIdentifier("hello"),
        arguments: [createIdentifier("a"), createValue("c")]
      });
    });

    it("should parse an equation expression", () => {
      const parsed = parse("1 + 2 * 3 - -4");
      expect(parsed).toEqual({
        type: TYPES.BinaryExpression,
        operator: OPERATORS.Subtract,
        left: {
          type: TYPES.BinaryExpression,
          operator: OPERATORS.Add,
          left: createValue(1),
          right: {
            type: TYPES.BinaryExpression,
            operator: OPERATORS.Multiply,
            left: createValue(2),
            right: createValue(3)
          }
        },
        right: {
          type: TYPES.UnaryExpression,
          operator: OPERATORS.Subtract,
          argument: createValue(4)
        }
      });
    });

    it("should parse a complex expression", () => {
      const parsed = parse("1 * +2 isnt not 3");
      expect(parsed).toEqual({
        type: TYPES.BinaryExpression,
        operator: OPERATORS.NotEqualTo,
        left: {
          type: TYPES.BinaryExpression,
          operator: OPERATORS.Multiply,
          left: createValue(1),
          right: {
            type: TYPES.UnaryExpression,
            operator: OPERATORS.Add,
            argument: createValue(2)
          }
        },
        right: {
          type: TYPES.UnaryExpression,
          operator: OPERATORS.Not,
          argument: createValue(3)
        }
      });
    });

    it("should work with parenthesis", () => {
      const parsed = parse("1 * (2 + 3)");
      expect(parsed).toEqual({
        type: TYPES.BinaryExpression,
        operator: OPERATORS.Multiply,
        left: createValue(1),
        right: {
          type: TYPES.BinaryExpression,
          operator: OPERATORS.Add,
          left: createValue(2),
          right: createValue(3)
        }
      });
    });
  });
});
