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

/**
those const not used in the app, leave here for reference

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

 */

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

// [minimum version, maximum version]
export const COMPATIBLE_SCHEMA_VERSION = ["0.0.16", "0.1.3"];
