Air tasker from schema compiler
=========================

## Installation

```
npm install --save airtasker-form-schema-compiler
```

This assumes that you’re using [npm](http://npmjs.com/) package manager with a module bundler like [Webpack](https://webpack.js.org/) or [Browserify](http://browserify.org/) to consume [CommonJS modules](http://webpack.github.io/docs/commonjs.html).

If you don’t yet use [npm](http://npmjs.com/) or a modern module bundler, and would rather prefer a single-file [UMD](https://github.com/umdjs/umd) build that makes `ReactRedux` available as a global object.


## Documentation

### compileComponents(schema):AST

Compile an airtasker form schema to an AST (abstract structure tree).

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



### schema

Airtasker form schema using [JSON schema](http://json-schema.org/).


## License

MIT