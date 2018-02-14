import { TYPES } from './../const';
import apply from "./apply";
import { parseExpressionString } from "../parsers";

const applyWithStringExpression = (str, options) => {
  const ast = parseExpressionString(str);
  return apply(ast, options);
};

describe("interpreter apply()", () => {
  let options;

  beforeEach(() => {
    const variableGetter = jest.fn();
    const applyComponents = jest.fn();
    options = {
      variableGetter,
      applyComponents
    };
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
      expect(applyWithStringExpression(data.given, options)).toEqual(
        data.expect
      );
    });
  });

  it("should support identity", () => {
    options.variableGetter.mockReturnValue("bar");
    expect(applyWithStringExpression("foo", options)).toEqual("bar");
    expect(options.variableGetter).toHaveBeenCalledWith("foo");
  });

  it("should support components", () => {
    options.applyComponents.mockReturnValue("returnValue");
    expect(
      apply(
        {
          type: TYPES.Components,
          components: [],
          a: 1,
          b: 2
        },
        options
      )
    ).toEqual("returnValue");
    expect(options.applyComponents).toHaveBeenCalledWith({
      components: [],
      a: 1,
      b: 2
    });
  });

  it("should support function call", () => {
    options.variableGetter
      .mockReturnValueOnce(str => str)
      .mockReturnValueOnce("world");

    expect(applyWithStringExpression('whatAmISay("world")', options)).toEqual(
      "world"
    );
    expect(options.variableGetter).toHaveBeenCalled();
  });
});
