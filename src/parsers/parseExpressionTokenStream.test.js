import createInputStream from "../tokenizers/createInputStream";
import createExpressionTokenStream from "../tokenizers/createExpressionTokenStream";
import parseExpressionTokenStream from "./parseExpressionTokenStream";

import { OPERATORS, TYPES } from "../const";

const parse = str =>
  parseExpressionTokenStream(
    createExpressionTokenStream(createInputStream(str))
  );

describe("parseExpressionTokenStream", () => {
  it("should parse identifier", () => {
    const parsed = parse("foobar");
    expect(parsed).toEqual({
      type: TYPES.Identifier,
      name: "foobar"
    });
  });

  it("should parse null", () => {
    const parsed = parse("null");
    expect(parsed).toEqual({
      type: TYPES.Null,
      value: null
    });
  });

  it("should parse string", () => {
    const parsed = parse(`'asdfsad"f'`);
    expect(parsed).toEqual({
      type: TYPES.String,
      value: 'asdfsad"f'
    });

    const parsed2 = parse(`"asdfsad'f"`);
    expect(parsed2).toEqual({
      type: TYPES.String,
      value: "asdfsad'f"
    });
  });

  describe("should parse boolean", () => {
    it("should parse true", () => {
      const parsed = parse("true");
      expect(parsed).toEqual({
        type: TYPES.Boolean,
        value: true
      });
    });

    it("should parse false", () => {
      const parsed = parse("false");
      expect(parsed).toEqual({
        type: TYPES.Boolean,
        value: false
      });
    });
  });

  describe("should parse expression", () => {
    describe("should parse unary expression", () => {
      it("should parse not unary expression", () => {
        const parsed = parse("not true");
        expect(parsed).toEqual({
          type: TYPES.UnaryExpression,
          operator: OPERATORS.Not,
          argument: {
            type: TYPES.Boolean,
            value: true
          }
        });
      });

      it("should parse not unary expression within binary expression", () => {
        const parsed = parse("not true or not (true is not false)");
        expect(parsed).toEqual({
          type: TYPES.BinaryExpression,
          left: {
            type: TYPES.UnaryExpression,
            operator: OPERATORS.Not,
            argument: {
              type: TYPES.Boolean,
              value: true
            }
          },
          operator: OPERATORS.Or,
          right: {
            type: TYPES.UnaryExpression,
            operator: OPERATORS.Not,
            argument: {
              type: TYPES.BinaryExpression,
              left: {
                type: TYPES.Boolean,
                value: true
              },
              operator: OPERATORS.EqualTo,
              right: {
                type: TYPES.UnaryExpression,
                operator: OPERATORS.Not,
                argument: {
                  type: TYPES.Boolean,
                  value: false
                }
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
            callee: {
              type: TYPES.Identifier,
              name: "hello"
            },
            arguments: [
              {
                type: TYPES.UnaryExpression,
                operator: OPERATORS.Not,
                argument: {
                  type: TYPES.Identifier,
                  name: "a"
                }
              }
            ]
          }
        });
      });
    });

    it("should parse subtract unary expression", () => {
      const parsed = parse("-1");
      expect(parsed).toEqual({
        type: TYPES.UnaryExpression,
        operator: OPERATORS.Subtract,
        argument: {
          type: TYPES.Numeric,
          value: 1
        }
      });
    });

    it("should parse add unary expression", () => {
      const parsed = parse("+foo");
      expect(parsed).toEqual({
        type: TYPES.UnaryExpression,
        operator: OPERATORS.Add,
        argument: {
          type: TYPES.Identifier,
          name: "foo"
        }
      });
    });

    it("should parse binary expression", () => {
      const parsed = parse("a < 1");
      expect(parsed).toEqual({
        type: TYPES.BinaryExpression,
        operator: OPERATORS.LessThan,
        left: {
          type: TYPES.Identifier,
          name: "a"
        },
        right: {
          type: TYPES.Numeric,
          value: 1
        }
      });
    });

    it("should parse call expression", () => {
      const parsed = parse('hello(a, "c")');
      expect(parsed).toEqual({
        type: TYPES.CallExpression,
        callee: {
          type: TYPES.Identifier,
          name: "hello"
        },
        arguments: [
          {
            type: TYPES.Identifier,
            name: "a"
          },
          {
            type: TYPES.String,
            value: "c"
          }
        ]
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
          left: {
            type: TYPES.Numeric,
            value: 1
          },
          right: {
            type: TYPES.BinaryExpression,
            operator: OPERATORS.Multiply,
            left: {
              type: TYPES.Numeric,
              value: 2
            },
            right: {
              type: TYPES.Numeric,
              value: 3
            }
          }
        },
        right: {
          type: TYPES.UnaryExpression,
          operator: OPERATORS.Subtract,
          argument: {
            type: TYPES.Numeric,
            value: 4
          }
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
          left: {
            type: TYPES.Numeric,
            value: 1
          },
          right: {
            type: TYPES.UnaryExpression,
            operator: OPERATORS.Add,
            argument: {
              type: TYPES.Numeric,
              value: 2
            }
          }
        },
        right: {
          type: TYPES.UnaryExpression,
          operator: OPERATORS.Not,
          argument: {
            type: TYPES.Numeric,
            value: 3
          }
        }
      });
    });

    it("should work with parenthesis", () => {
      const parsed = parse("1 * (2 + 3)");
      expect(parsed).toEqual({
        type: TYPES.BinaryExpression,
        operator: OPERATORS.Multiply,
        left: {
          type: TYPES.Numeric,
          value: 1
        },
        right: {
          type: TYPES.BinaryExpression,
          operator: OPERATORS.Add,
          left: {
            type: TYPES.Numeric,
            value: 2
          },
          right: {
            type: TYPES.Numeric,
            value: 3
          }
        }
      });
    });
  });
});
