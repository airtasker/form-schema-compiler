import { compileComponents, compileProps } from "./compileComponents";
import { TYPES, ANNOTATION_TYPES } from "./const";
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
          "{propertyBinding}": "b",
          "{nestedObject}": {
            "{nestedProp}": {
              "{nestedNestedProp}": "n"
            },
            "<nestedComponent>": {
              type: "Component"
            }
          },
          "(event)": "c",
          "#template#": "a+d"
        })
      ).toEqual({
        propertyBinding: {
          type: ANNOTATION_TYPES.PropertyBinding,
          value: createProgram(createIdentifier("b")),
          nested: false
        },
        nestedObject: {
          type: ANNOTATION_TYPES.PropertyBinding,
          nested: true,
          value: {
            nestedProp: {
              type: ANNOTATION_TYPES.PropertyBinding,
              nested: true,
              value: {
                nestedNestedProp: {
                  type: ANNOTATION_TYPES.PropertyBinding,
                  value: createProgram(createIdentifier("n")),
                  nested: false
                }
              }
            },
            nestedComponent: {
              type: TYPES.Components,
              components: [
                {
                  type: "Component"
                }
              ]
            }
          }
        },
        onEvent: {
          type: ANNOTATION_TYPES.EventBinding,
          value: createProgram(createIdentifier("c"))
        },
        template: {
          type: ANNOTATION_TYPES.PropertyBinding,
          value: createProgram({
            type: "TemplateLiteral",
            expressions: [],
            quasis: [createValue("a+d")]
          })
        }
      });
    });

    it("Should throw if there is TwoWayBinding", () => {
      expect(() =>
        compileProps({
          "[twoWayBinding]": "b"
        })
      ).toThrow();
    });
  });
});
