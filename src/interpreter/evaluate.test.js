import { TYPES } from "../const";
import evaluate from "./evaluate";
import { parseExpressionString } from "../parsers";
import Environment from "./Environment";

const evaluateWithStringExpression = (str, env) => {
  const ast = parseExpressionString(str);
  return evaluate(ast, env);
};

describe("interpreter evaluate()", () => {
  let env;

  beforeEach(() => {
    env = new Environment();
  });

  [
    {
      title: "should support binary expression",
      given: "1 + 1",
      expect: 2
    },
    {
      title: "should support complicate equation",
      given: "1 + 2 * 3 - +(4 + 5) * (2 / 2) - -2",
      expect: 0
    },
    {
      title: "should support complicate expression",
      given:
        "(true and true or (false or true)) is (false or true) is (false or false)",
      expect: false
    },
    {
      title: "should support + unary expression",
      given: "-1",
      expect: -1
    },
    {
      title: "should support - unary expression",
      given: "1",
      expect: 1
    },
    {
      title: "should support not unary expression",
      given: "not true",
      expect: false
    },
    {
      title: "should support string",
      given: '"hello"',
      expect: "hello"
    },
    {
      title: "should support numeric",
      given: "1",
      expect: 1
    },
    {
      title: "should support boolean",
      given: "true",
      expect: true
    },
    {
      title: "should support null",
      given: "null",
      expect: null
    },
    {
      title: "should support regex",
      given: '"a" match /A/i',
      expect: true
    }
  ].forEach(data => {
    it(data.title, () => {
      expect(evaluateWithStringExpression(data.given, env)).toEqual(
        data.expect
      );
    });
  });

  it("should support assign", () => {
    expect(evaluateWithStringExpression("a = 1", env)).toBe(1);
    expect(env.get("a")).toBe(1);
  });

  it("should support identity", () => {
    env.get = jest.fn().mockReturnValue("bar");
    expect(evaluateWithStringExpression("foo", env)).toBe("bar");
    expect(env.get).toHaveBeenCalledWith("foo");
  });

  it("should support components", () => {
    env.evaluateComponents = jest.fn().mockReturnValue("returnValue");
    expect(
      evaluate(
        {
          type: TYPES.Components,
          components: [],
          a: 1,
          b: 2
        },
        env
      )
    ).toBe("returnValue");
    expect(env.evaluateComponents).toHaveBeenCalledWith({
      components: [],
      a: 1,
      b: 2
    });
  });

  it("should support function call", () => {
    env.get = jest
      .fn()
      .mockReturnValueOnce(str => str)
      .mockReturnValueOnce("world");

    expect(evaluateWithStringExpression('whatAmISay("world")', env)).toBe(
      "world"
    );
    expect(env.get).toHaveBeenCalled();
  });

  it("should support Object", () => {
    expect(evaluateWithStringExpression("{}", env)).toEqual({});
    env.set("c", "d");
    expect(
      evaluateWithStringExpression(
        '{"a": 1, "b": {}, c: 1 + 2, "e": "hello"}',
        env
      )
    ).toEqual({
      a: 1,
      b: {},
      d: 3,
      e: "hello"
    });
  });

  it("should support Array", () => {
    expect(evaluateWithStringExpression("[]", env)).toEqual([]);

    env.set("b", "c");
    expect(evaluateWithStringExpression('["a", b, 3, {}, 1 + 1]', env)).toEqual(
      ["a", "c", 3, {}, 2]
    );
  });

  it("should support MemberObject", () => {
    env.set("a", [0]);
    expect(evaluateWithStringExpression("a[0]", env)).toBe(0);

    env.set("a", { a: 1 });
    expect(evaluateWithStringExpression("a['a']", env)).toBe(1);
  });
});
