export const TYPES = {
  Numeric: "Numeric",
  String: "String",
  Boolean: "Boolean",
  Null: "Null",
  RegExp: "RegExp",
  Identifier: "Identifier",
  BinaryExpression: "BinaryExpression",
  UnaryExpression: "UnaryExpression",
  CallExpression: "CallExpression",
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
  TYPES.BinaryExpression,
  TYPES.CallExpression,
  TYPES.UnaryExpression
];

export const OPERATORS = {
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
  [OPERATORS.GreaterThanOrEqualTo]: 7,
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
  Parentheses: ["(", ")"],
  Separator: ","
};

export const ANNOTATION_TYPES = {
  Expression: "Expression",
  Template: "Template",
  Component: "Component",
  Action: "Action",
  DataBinding: "DataBinding"
};

export const ANNOTATIONS = {
  [ANNOTATION_TYPES.Expression]: ["{", "}"],
  [ANNOTATION_TYPES.Template]: ["#", "#"],
  [ANNOTATION_TYPES.Component]: ["<", ">"],
  [ANNOTATION_TYPES.Action]: ["(", ")"],
  [ANNOTATION_TYPES.DataBinding]: ["[", "]"]
};

export const GLOBAL_FUNCTIONS = {
  toString: "toString"
};

// [minimum version, maximum version]
export const COMPATIBLE_SCHEMA_VERSION = ["0.0.1", "0.0.12"];
