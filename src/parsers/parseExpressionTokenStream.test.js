import createInputStream from "../tokenizers/createInputStream";
import createExpressionTokenStream from "../tokenizers/createExpressionTokenStream";
import parseExpressionTokenStream from "./parseExpressionTokenStream";

import { OPERATORS, TYPES } from "../const";
import { createIdentifier, createValue, createCallExpression } from "../utils";

const parse = str =>
  parseExpressionTokenStream(
    createExpressionTokenStream(createInputStream(str))
  );

describe("parseExpressionTokenStream", () => {
  it("should parse identifier", () => {
    const ast = parse("foobar");
    expect(ast).toEqual(createIdentifier("foobar"));
  });

  it("should parse null", () => {
    const ast = parse("null");
    expect(ast).toEqual(createValue(null));
  });

  it("should parse string", () => {
    const ast = parse(`'asdfsad"f'`);
    expect(ast).toEqual(createValue('asdfsad"f'));

    const ast2 = parse(`"asdfsad'f"`);
    expect(ast2).toEqual(createValue("asdfsad'f"));
  });

  describe("should parse boolean", () => {
    it("should parse true", () => {
      const ast = parse("true");
      expect(ast).toEqual(createValue(true));
    });

    it("should parse false", () => {
      const ast = parse("false");
      expect(ast).toEqual(createValue(false));
    });
  });

  describe("should parse expression", () => {
    describe("should parse unary expression", () => {
      it("should parse not unary expression", () => {
        const ast = parse("not true");
        expect(ast).toEqual({
          type: TYPES.UnaryExpression,
          operator: OPERATORS.Not,
          argument: createValue(true)
        });
      });

      it("should parse not unary expression within binary expression", () => {
        const ast = parse("not true or not (true is not false)");
        expect(ast).toEqual({
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
        const ast = parse("not hello(not a)");
        expect(ast).toEqual({
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
        const ast = parse("-1");
        expect(ast).toEqual({
          type: TYPES.UnaryExpression,
          operator: OPERATORS.Subtract,
          argument: createValue(1)
        });
      });

      it("should parse add unary expression", () => {
        const ast = parse("+foo");
        expect(ast).toEqual({
          type: TYPES.UnaryExpression,
          operator: OPERATORS.Add,
          argument: createIdentifier("foo")
        });
      });

      it("should parse chained unary expression", () => {
        const ast = parse("not - + foo");
        expect(ast).toEqual({
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
      it("should parse assign expression", () => {
        const ast = parse("a = 1");
        expect(ast).toEqual({
          type: TYPES.AssignExpression,
          operator: OPERATORS.Assign,
          left: createIdentifier("a"),
          right: createValue(1)
        });
      });
      
      it("should parse binary expression", () => {
        const ast = parse("a < 1");
        expect(ast).toEqual({
          type: TYPES.BinaryExpression,
          operator: OPERATORS.LessThan,
          left: createIdentifier("a"),
          right: createValue(1)
        });
      });

      it("should parse an complex binary expression", () => {
        debugger;
        const ast = parse("a >= 5 and b <= 2000 or c > 5 or d < 5 ");
        expect(ast).toEqual({
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
      const ast = parse("hello(1)(2)(3)");
      expect(ast).toEqual({
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
      const ast = parse('hello(a, "c")');
      expect(ast).toEqual({
        type: TYPES.CallExpression,
        callee: createIdentifier("hello"),
        arguments: [createIdentifier("a"), createValue("c")]
      });
    });

    it("should parse an equation expression", () => {
      const ast = parse("1 + 2 * 3 - -4");
      expect(ast).toEqual({
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
      const ast = parse("1 * +2 isnt not 3");
      expect(ast).toEqual({
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
      const ast = parse("1 * (2 + 3) / 4");
      expect(ast).toEqual({
        type: TYPES.BinaryExpression,
        operator: OPERATORS.Divide,
        left: {
          type: TYPES.BinaryExpression,
          operator: OPERATORS.Multiply,
          left: createValue(1),
          right: {
            type: TYPES.BinaryExpression,
            operator: OPERATORS.Add,
            left: createValue(2),
            right: createValue(3)
          }
        },
        right: createValue(4)
      });
    });

    it("should work with call expression [FE-1398]", () => {
      const ast = parse("hello(1) / 2");
      expect(ast).toEqual({
        type: TYPES.BinaryExpression,
        operator: OPERATORS.Divide,
        left: createCallExpression(createIdentifier("hello"), createValue(1)),
        right: createValue(2)
      });
    });
  });

  describe("should parse object expression", () => {
    it("should parse empty object expression ", () => {
      const ast = parse("{}");
      expect(ast).toEqual({
        type: TYPES.ObjectExpression,
        properties: []
      });
    });

    it("should parse object expression with one key", () => {
      const stream = createExpressionTokenStream(createInputStream("{a: 1}"));
      const ast = parse("{a: 1}");

      expect(ast).toEqual({
        type: TYPES.ObjectExpression,
        properties: [
          {
            key: createIdentifier("a"),
            value: createValue(1)
          }
        ]
      });
    });

    it("should parse object expression with multiple keys", () => {
      const ast = parse("{a: 1, 'b': 2, 1: x, d: 1 + 1}");
      expect(ast).toEqual({
        type: TYPES.ObjectExpression,
        properties: [
          {
            key: createIdentifier("a"),
            value: createValue(1)
          },
          {
            key: createValue("b"),
            value: createValue(2)
          },
          {
            key: createValue(1),
            value: createIdentifier("x")
          },
          {
            key: createIdentifier("d"),
            value: {
              type: TYPES.BinaryExpression,
              operator: OPERATORS.Add,
              left: createValue(1),
              right: createValue(1)
            }
          }
        ]
      });
    });

    it("should throw errors on wrong schemas", () => {
      expect(() => parse("{a>1}")).toThrow();
      expect(() => parse('{"a"}')).toThrow();
      expect(() => parse("{1}")).toThrow();
      expect(() => parse("{a}")).toThrow();
    });

    it("should parse nested object expression", () => {
      const ast = parse("{a:{b:{c:1}, d: []}}");
      expect(ast).toEqual({
        type: TYPES.ObjectExpression,
        properties: [
          {
            key: createIdentifier("a"),
            value: {
              type: TYPES.ObjectExpression,
              properties: [
                {
                  key: createIdentifier("b"),
                  value: {
                    type: TYPES.ObjectExpression,
                    properties: [
                      {
                        key: createIdentifier("c"),
                        value: createValue(1)
                      }
                    ]
                  }
                },
                {
                  key: createIdentifier("d"),
                  value: {
                    type: TYPES.ArrayExpression,
                    elements: []
                  }
                }
              ]
            }
          }
        ]
      });
    });

    it("should parse array expression", () => {
      const ast = parse("['a', 'b', c, 1, [], [1], {}, 1 + 1]");
      expect(ast).toEqual({
        type: TYPES.ArrayExpression,
        elements: [
          createValue("a"),
          createValue("b"),
          createIdentifier("c"),
          createValue(1),
          {
            type: TYPES.ArrayExpression,
            elements: []
          },
          {
            type: TYPES.ArrayExpression,
            elements: [createValue(1)]
          },
          {
            type: TYPES.ObjectExpression,
            properties: []
          },
          {
            type: TYPES.BinaryExpression,
            operator: OPERATORS.Add,
            left: createValue(1),
            right: createValue(1)
          }
        ]
      });
    });

    it("should parse Member Expression", () => {
      const ast = parse("a[1]()[1+1]");
      expect(ast).toEqual({
        type: TYPES.MemberExpression,
        object: createCallExpression({
          type: TYPES.MemberExpression,
          object: createIdentifier("a"),
          property: createValue(1)
        }),
        property: {
          type: TYPES.BinaryExpression,
          operator: OPERATORS.Add,
          left: createValue(1),
          right: createValue(1)
        }
      });
    });
  });
});
