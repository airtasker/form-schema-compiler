# Air tasker from schema compiler

Helps your create a security (sandbox) custom form.  
[![npm downloads](https://img.shields.io/npm/dm/@airtasker/form-schema-compiler.svg?style=flat-square)](https://www.npmjs.com/package/@airtasker/form-schema-compiler)

## Installation

```
npm install --save @airtasker/form-schema-compiler
```

This assumes that you’re using [npm](http://npmjs.com/) package manager with a module bundler like [Webpack](https://webpack.js.org/) or [Browserify](http://browserify.org/) to consume [CommonJS modules](http://webpack.github.io/docs/commonjs.html).

If you don’t yet use [npm](http://npmjs.com/) or a modern module bundler, and would rather prefer a single-file [UMD](https://github.com/umdjs/umd) build that makes `FormSchemaCompiler` available as a global object.

## Documentation

### compileComponents(schema, [options]):AST

Compile an airtasker form schema to an AST (abstract structure tree).

#### Arguments

* `schema`: Airtaker form schema
* `options`: { `typeCompilers` }
  * `typeCompilers`: { [`TYPE`]: `createCompiler()`:{[`before(schema)`], [`after(AST)`]}}: you can add custom **components compiler**. it have high priority than default components compiler.

### apply(ast, options):any

Apply an AST.

#### Arguments

* `ast`: an compiled AST

* `options`: { `variableGetter(name)`, `applyComponents` }

  * `variableGetter(name)`(function): if there is a identifier type, will use this function to get variable value
  * `applyComponents(componentASTs)`(function): components type handler.

### const

a const file

```
export const TYPES = {
  Numeric: "Numeric",
  String: "String",
  Boolean: "Boolean",
  Object: "Object",
  Array: "Array",
  Null: "Null",
  RegExp: "RegExp",
  Identifier: "Identifier",
  Keyword: 'Keyword',
  AssignExpression: "AssignExpression",
  ObjectExpression: "ObjectExpression",
  ObjectProperty: "ObjectProperty",
  ArrayExpression: "ArrayExpression",
  BinaryExpression: "BinaryExpression",
  UnaryExpression: "UnaryExpression",
  CallExpression: "CallExpression",
  TemplateLiteral: "TemplateLiteral",
  MemberExpression: "MemberExpression",
  IfStatement: "IfStatement",
  Components: "Components",
  Operator: "Operator",
  Punctuation: "Punctuation",
  Raw: "Raw",
  Program: 'Program',
  BlockStatement: 'BlockStatement',
  PropertyBinding: 'PropertyBinding',
  EventBinding: 'EventBinding',
};

export const PRIMITIVES = [
  TYPES.Numeric,
  TYPES.String,
  TYPES.Boolean,
  TYPES.Null
];

export const OBJECTS = [TYPES.RegExp, TYPES.Identifier, TYPES.Component];

export const EXPRESSIONS = [
  TYPES.ObjectExpression,
  TYPES.ArrayExpression,
  TYPES.BinaryExpression,
  TYPES.AssignExpression,
  TYPES.CallExpression,
  TYPES.UnaryExpression,
  TYPES.TemplateLiteral,
];

export const OPERATORS = {
  Assign: "=",
  Add: "+",
  Subtract: "-",
  Multiply: "*",
  Remainder: "%",
  Divide: "/",
  GreaterThan: ">",
  GreaterThanOrEqualTo: ">=",
  LessThan: "<",
  LessThanOrEqualTo: "<=",
  EqualTo: "is",
  NotEqualTo: "isnt",
  And: "and",
  Or: "or",
  Match: "match",
  Not: "not"
};

export const PRECEDENCE = {
  [OPERATORS.Assign]: 1,
  [OPERATORS.Or]: 2,
  [OPERATORS.And]: 3,
  [OPERATORS.GreaterThan]: 7,
  [OPERATORS.GreaterThanOrEqualTo]: 7,
  [OPERATORS.LessThan]: 7,
  [OPERATORS.LessThanOrEqualTo]: 7,
  [OPERATORS.EqualTo]: 7,
  [OPERATORS.NotEqualTo]: 7,
  [OPERATORS.Match]: 7,
  [OPERATORS.Add]: 10,
  [OPERATORS.Subtract]: 10,
  [OPERATORS.Multiply]: 20,
  [OPERATORS.Divide]: 20,
  [OPERATORS.Remainder]: 20
};

export const BOOLEANS = ["false", "true"];
export const IF_KEYWORDS = {
  If: 'if',
  Else: 'else',
  Then: 'then'
}
export const KEYWORDS = [...BOOLEANS, ...Object.values(IF_KEYWORDS)];

export const PUNCTUATIONS = {
  Braces: ["{", "}"],
  SquareBrackets: ["[", "]"],
  Parentheses: ["(", ")"],
  Separator: ",",
  Colon: ":",
  BackQuote: "`",
  SemiColon: ";",
};

export const ANNOTATION_TYPES = {
  [TYPES.PropertyBinding]: TYPES.PropertyBinding,
  [TYPES.EventBinding]: TYPES.EventBinding,
  Template: "Template",
  Components: "Components",
  TwoWayBinding: "TwoWayBinding"
};

export const ANNOTATIONS = {
  [ANNOTATION_TYPES.PropertyBinding]: ["{", "}"],
  [ANNOTATION_TYPES.Template]: ["#", "#"],
  [ANNOTATION_TYPES.Components]: ["<", ">"],
  [ANNOTATION_TYPES.EventBinding]: ["(", ")"],
  [ANNOTATION_TYPES.TwoWayBinding]: ["[", "]"]
};


```

### Schema

Airtasker form schema using [JSON schema](http://json-schema.org/).

#### Annotation

* `key`: no annotation, compile as json  
  compile
  ```
  {
    key: "1",
    key2: 1,
    key3: null,
    key4: true,
    key5: [],
    key6: {}
  }
  ```
  to
  ```
  {
    key: {type: "String", value: "1"},
    key2: {type: "Number", value: 1},
    key3: {type: "Null", value: null},
    key4: {type: "Boolean", value: true},
    key5: {type: "Array", value: []},
    key6: {type: "Object", value: {}}
  }
  ```
* `<key>`: component annotation  
  compile

  ```
    {"<key>": {/*component schema*/}}
  ```

  to

  ```
    {"key": {/*component ast*/}}
  ```

* `[key]`: two way data binding  
  compile
  ```
    {"[key]": "foo"}
  ```
  to
  ```
    {"key": { type: "identifier", name: "foo" }
  ```
* `#key#`: string template  
  compile
  ```
    {"#key#": "foo{"bar"}"}
  ```
  to
  ```
    {
      "key": {
        type: "BinaryExpression",
        left: { type: "String", value: "foo" },
        operator: "+",
        right: {
          type: "callExpression",
          callee: { type: "identifier", name: "toString" },
          arguments: [{ type: "identifier", name: "bar" }]
        }
      }
    }
  ```
* `{key}`: expression  
  compile
  ```
    {
      "{key}": "1 + 2",
      "{key2}": "{k: 1, date: dueDate}"
    }
  ```
  to
  ```
    {
      "key": {
        type: "BinaryExpression",
        left: { type: "Numeric", value: "1" },
        operator: "+",
        right: { type: "Numeric", value: "2" },
      }
    }
  ```
* `(key)`: event binding, eventValue is a special identifier that's reference the action callback value  
  compile
  ```
    {"(click)": "doAction(eventValue)"}
  ```
  to
  ```
    {
      "onClick": {
        type: "callExpression",
        callee: { type: "identifier", name: "doAction" },
        arguments: [{ type: "identifier", name: "eventValue" }]
      }
    }
  ```

## License

MIT
