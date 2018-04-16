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
  Numeric: 'Numeric',
  String: 'String',
  Boolean: 'Boolean',
  Null: 'Null',
  RegExp: 'RegExp',
  Identifier: 'Identifier',
  BinaryExpression: 'BinaryExpression',
  UnaryExpression: 'UnaryExpression',
  CallExpression: 'CallExpression',
  Components: 'Components',
  Operator: 'Operator',
  Punctuation: 'Punctuation',
  Raw: 'Raw',
};

export const PRIMITIVES = [
  TYPES.Numeric,
  TYPES.String,
  TYPES.Boolean,
  TYPES.Null,
];

export const OBJECTS = [TYPES.RegExp, TYPES.Identifier, TYPES.Component];

export const EXPRESSIONS = [
  TYPES.BinaryExpression,
  TYPES.CallExpression,
  TYPES.UnaryExpression,
];

export const OPERATORS = {
  Add: '+',
  Subtract: '-',
  Multiply: '*',
  Remainder: '%',
  Divide: '/',
  GreaterThan: '>',
  GreaterThanOrEqualTo: '>=',
  LessThan: '<',
  LessThanOrEqualTo: '<=',
  EqualTo: 'is',
  NotEqualTo: 'isnt',
  And: 'and',
  Or: 'or',
  Match: 'match',
  Not: 'not',
};

export const ANNOTATION_TYPES = {
  Expression: 'Expression',
  Template: 'Template',
  Component: 'Component',
  Action: 'Action',
  DataBinding: 'DataBinding',
};

export const ANNOTATIONS = {
  [ANNOTATION_TYPES.Expression]: ['{', '}'],
  [ANNOTATION_TYPES.Template]: ['#', '#'],
  [ANNOTATION_TYPES.Component]: ['<', '>'],
  [ANNOTATION_TYPES.Action]: ['(', ')'],
  [ANNOTATION_TYPES.DataBinding]: ['[', ']'],
};

export const GLOBAL_FUNCTIONS = {
  toString: 'toString'
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
    key5: []
  }
  ```
  to
  ```
  {
    key: {type: "String", value: "1"},
    key2: {type: "Number", value: 1},
    key3: {type: "Null", value: null},
    key4: {type: "Boolean", value: true},
    key5: {type: "Raw", value: []},
  }
  ```
* `<key>`: component annoation  
  compile

  ```
    {"<key>": {/*component schema*/}}
  ```

  to

  ```
    {"key": {/*component ast*/}}
  ```

* `[key]`: data binding
  compile
  ```
    {"[key]": "foo"}
  ```
  to
  ```
    {"key": { type: "identifier", name: "foo" }
  ```
* `#key#`: template  
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
    {"{key}": "1 + 2"}
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
* `(key)`: action, eventValue is a special identifier that's reference the action callback value  
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
