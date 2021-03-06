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

  it("should support TemplateLiteral", () => {
    env.set("world", "world");
    env.set("foo", () => "bar");
    expect(
      evaluateWithStringExpression("`hello {world}, {`foo`}{foo()}`", env)
    ).toBe("hello world, foobar");
  });

  it("should support program", () => {
    env.set("foobar", jest.fn());
    env.set("hello", jest.fn());
    expect(
      evaluateWithStringExpression('foobar(); hello({"a":3}); 1+3', env)
    ).toBe(4);
    expect(env.get("foobar")).toHaveBeenCalled();
    expect(env.get("hello")).toHaveBeenCalledWith({
      a: 3
    });
  });

  describe("if statement", () => {
    it("should support if consequent", () => {
      env.set("test", jest.fn().mockReturnValue(true));
      env.set("consequent", jest.fn().mockReturnValue('foobar'));
      env.set("alternate", jest.fn());
      expect(
        evaluateWithStringExpression('if test() then consequent() else alternate()', env)
      ).toBe('foobar');
      expect(env.get("test")).toHaveBeenCalled();
      expect(env.get("consequent")).toHaveBeenCalled();
      expect(env.get("alternate")).not.toHaveBeenCalled();
    });

    it("should support if alternate", () => {
      env.set("test", jest.fn().mockReturnValue(false));
      env.set("consequent", jest.fn());
      env.set("alternate", jest.fn().mockReturnValue('foobar'));
      expect(
        evaluateWithStringExpression('if test() then consequent() else alternate()', env)
      ).toBe('foobar');
      expect(env.get("test")).toHaveBeenCalled();
      expect(env.get("consequent")).not.toHaveBeenCalled();
      expect(env.get("alternate")).toHaveBeenCalled();
    });

    it("should support chained if", () => {
      env.set("test", jest.fn().mockReturnValue(false));
      env.set("test2", jest.fn().mockReturnValue(false));
      env.set("consequent", jest.fn());
      env.set("alternate", jest.fn().mockReturnValue('foobar'));
      expect(
        evaluateWithStringExpression('if test() then consequent() else if test2() else alternate()', env)
      ).toBe('foobar');
      expect(env.get("test")).toHaveBeenCalled();
      expect(env.get("test2")).toHaveBeenCalled();
      expect(env.get("consequent")).not.toHaveBeenCalled();
      expect(env.get("alternate")).toHaveBeenCalled();
    });

    it("should support if with blocks", () => {
      env.set("test", jest.fn().mockReturnValue(true));
      env.set("call1", jest.fn());
      env.set("call2", jest.fn());
      expect(
        evaluateWithStringExpression('if test() then {call1(); call2();\n 123+110}', env)
      ).toBe(233);
      expect(env.get("test")).toHaveBeenCalled();
      expect(env.get("call1")).toHaveBeenCalled();
      expect(env.get("call2")).toHaveBeenCalled();
    });
  });
});
