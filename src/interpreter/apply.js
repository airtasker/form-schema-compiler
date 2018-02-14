import { TYPES } from "../const";
import applyIdentifier from "./applyIdentifier";
import applyUnaryExpression from "./applyUnaryExpression";
import applyBinaryExpression from "./applyBinaryExpression";
import applyCallExpression from "./applyCallExpression";
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
  [TYPES.Components]: applyComponents
};

/**
 *
 * @param type
 * @param expression
 * @param options:{{variableGetter, applyComponents}}
 * @returns {*}
 */
const apply = ({ type, ...expression }, options = {}) => {
  if (
    typeof options.variableGetter !== "function" ||
    typeof options.applyComponents !== "function"
  ) {
    throw new Error(`Can't found variableGetter or applyComponents in options`);
  }
  if (hasKey(TypeHandlers, type)) {
    return TypeHandlers[type](expression, options);
  }
  throw new Error(`Wrong type ${type}, ${JSON.stringify(expression)}`);
};

export default apply;
