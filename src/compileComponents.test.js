import compileComponents, { compileProps } from "./compileComponents";
import { TYPES } from "./const";

describe("compileComponents", () => {
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
        a: {
          type: TYPES.String,
          value: ""
        },
        b: {
          type: TYPES.Null,
          value: null
        },
        c: {
          type: TYPES.Numeric,
          value: 1
        },
        d: {
          type: TYPES.Boolean,
          value: true
        },
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
          "[dataBinding]": "a",
          "{exp}": "b",
          "(action)": "c",
          "#template#": "a+d"
        })
      ).toEqual({
        dataBinding: {
          type: TYPES.Identifier,
          name: "a"
        },
        exp: {
          type: TYPES.Identifier,
          name: "b"
        },
        onAction: {
          type: TYPES.Identifier,
          name: "c"
        },
        template: {
          type: TYPES.String,
          value: "a+d"
        }
      });
    });
  });
});
