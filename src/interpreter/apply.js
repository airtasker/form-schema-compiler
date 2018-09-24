import { TYPES } from "../const";
import applyIdentifier from "./applyIdentifier";
import applyUnaryExpression from "./applyUnaryExpression";
import applyBinaryExpression from "./applyBinaryExpression";
import applyCallExpression from "./applyCallExpression";
import applyMemberObjectExpression from "./applyMemberObjectExpression";
import applyObjectExpression from "./applyObjectExpression";
import applyArrayExpression from "./applyArrayExpression";
import { hasKey } from "../utils";

const getValue = ({ value }) => value;
const toRegExp = ({ pattern, flags }) => new RegExp(pattern, flags);
const applyComponents = (expression, options) =>
  options.applyComponents(expression);

const TypeHandlers = {
  [TYPES.Numeric]: getValue,
  [TYPES.String]: getValue,
  [TYPES.Boolean]: getValue,
  [TYPES.Null]: getValue,
  [TYPES.Raw]: getValue,
  [TYPES.RegExp]: toRegExp,
  [TYPES.Identifier]: applyIdentifier,
  [TYPES.UnaryExpression]: applyUnaryExpression,
  [TYPES.BinaryExpression]: applyBinaryExpression,
  [TYPES.CallExpression]: applyCallExpression,
  [TYPES.Components]: applyComponents,
  [TYPES.MemberExpression]: applyMemberObjectExpression,
  [TYPES.ObjectExpression]: applyObjectExpression,
  [TYPES.ArrayExpression]: applyArrayExpression
};

/**
 *
 * @param type
 * @param expression
 * @param options:{{variableGetter, applyComponents, apply}}
 * @returns {*}
 */
const apply = ({ type, ...expression }, options) => {
  if (hasKey(TypeHandlers, type)) {
    return TypeHandlers[type](expression, options);
  }
  throw new Error(`Wrong type ${type}, ${JSON.stringify(expression)}`);
};

/**
 * build options and apply
 * @param {*} expression
 * @param {*} options
 */
const buildOptionsAndApply = (expression, options = {}) => {
  if (
    typeof options.variableGetter !== "function" ||
    typeof options.applyComponents !== "function"
  ) {
    throw new Error(`Can't found variableGetter or applyComponents in options`);
  }

  const optionsWithApply = {
    ...options,
    apply: expr => apply(expr, optionsWithApply)
  };

  return apply(expression, optionsWithApply);
};

export default buildOptionsAndApply;
