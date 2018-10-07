import { compileComponents, compileProps } from "./compileComponents";
import { TYPES } from "./const";
import { createValue, createIdentifier, createProgram } from "./utils";

describe("compileComponents", () => {
  it("Should throw Error if components is not object", () => {
    expect(() => compileComponents("")).toThrow();
    expect(() => compileComponents(1)).toThrow();
    expect(() => compileComponents(1)).toThrow();
  });

  it("Should throw Error if component don't have type", () => {
    expect(() => compileComponents({})).toThrow();
  });

  it("Should always wrapped with in components", () => {
    expect(
      compileComponents({
        type: "Hello"
      })
    ).toEqual({
      type: TYPES.Components,
      components: [
        {
          type: "Hello"
        }
      ]
    });
  });

  it("Should compile nested components", () => {
    expect(
      compileComponents({
        type: "Parent",
        "<children>": {
          type: "Children",
          "<grandChildren>": [
            {
              type: "GrandChild1"
            },
            {
              type: "GrandChild2"
            }
          ]
        }
      })
    ).toEqual({
      type: TYPES.Components,
      components: [
        {
          type: "Parent",
          children: {
            type: TYPES.Components,
            components: [
              {
                type: "Children",
                grandChildren: {
                  type: TYPES.Components,
                  components: [
                    {
                      type: "GrandChild1"
                    },
                    {
                      type: "GrandChild2"
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    });
  });

  describe("compileProps", () => {
    it("Should compile normal props", () => {
      expect(
        compileProps({
          a: "",
          b: null,
          c: 1,
          d: true,
          e: [],
          f: {}
        })
      ).toEqual({
        a: createValue(""),
        b: createValue(null),
        c: createValue(1),
        d: createValue(true),
        e: {
          type: TYPES.Raw,
          value: []
        },
        f: {
          type: TYPES.Raw,
          value: {}
        }
      });
    });

    it("Should compile expression props", () => {
      expect(
        compileProps({
          "[twoWayBinding]": "a",
          "{propertyBinding}": "b",
          "(event)": "c",
          "#template#": "a+d"
        })
      ).toEqual({
        twoWayBinding: createProgram(createIdentifier("a")),
        propertyBinding: createProgram(createIdentifier("b")),
        onEvent: createProgram(createIdentifier("c")),
        template: createProgram({
          type: "TemplateLiteral",
          expressions: [],
          quasis: [createValue("a+d")]
        })
      });
    });
  });
});
