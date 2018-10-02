export const TYPES = {
  Numeric: "Numeric",
  String: "String",
  Boolean: "Boolean",
  Object: "Object",
  Array: "Array",
  Null: "Null",
  RegExp: "RegExp",
  Identifier: "Identifier",
  AssignExpression: "AssignExpression",
  ObjectExpression: "ObjectExpression",
  ObjectProperty: "ObjectProperty",
  ArrayExpression: "ArrayExpression",
  BinaryExpression: "BinaryExpression",
  UnaryExpression: "UnaryExpression",
  CallExpression: "CallExpression",
  MemberExpression: "MemberExpression",
  Components: "Components",
  Operator: "Operator",
  Punctuation: "Punctuation",
  Raw: "Raw"
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
  TYPES.UnaryExpression
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

export const PUNCTUATIONS = {
  Braces: ["{", "}"],
  SquareBrackets: ["[", "]"],
  Parentheses: ["(", ")"],
  Separator: ",",
  Colon: ":"
};

export const ANNOTATION_TYPES = {
  PropertyBinding: "PropertyBinding",
  Template: "Template",
  Component: "Component",
  EventBinding: "EventBinding",
  TwoWayBinding: "TwoWayBinding"
};

export const ANNOTATIONS = {
  [ANNOTATION_TYPES.PropertyBinding]: ["{", "}"],
  [ANNOTATION_TYPES.Template]: ["#", "#"],
  [ANNOTATION_TYPES.Component]: ["<", ">"],
  [ANNOTATION_TYPES.EventBinding]: ["(", ")"],
  [ANNOTATION_TYPES.TwoWayBinding]: ["[", "]"]
};

export const GLOBAL_FUNCTIONS = {
  toString: "toString"
};

// [minimum version, maximum version]
export const COMPATIBLE_SCHEMA_VERSION = ["0.0.16", "0.0.17"];
