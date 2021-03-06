import { TYPES } from "../const";
import evaluateIdentifier from "./evaluateIdentifier";
import evaluateProgram from "./evaluateProgram";
import evaluateUnaryExpression from "./evaluateUnaryExpression";
import evaluateAssignExpression from "./evaluateAssignExpression";
import evaluateBinaryExpression from "./evaluateBinaryExpression";
import evaluateCallExpression from "./evaluateCallExpression";
import evaluateMemberObjectExpression from "./evaluateMemberObjectExpression";
import evaluateObjectExpression from "./evaluateObjectExpression";
import evaluateArrayExpression from "./evaluateArrayExpression";
import evaluateTemplateLiteral from "./evaluateTemplateLiteral";
import evaluateIfStatement from "./evaluateIfStatement";
import evaluateEventBindingExpression from "./evaluateEventBindingExpression";
import evaluatePropertyBindingExpression from "./evaluatePropertyBindingExpression";
import { hasKey } from "../utils";
import Environment from "./Environment";

const getValue = ({ value }) => value;
const toRegExp = ({ pattern, flags }) => new RegExp(pattern, flags);
const evaluateComponents = (expression, env) =>
  env.evaluateComponents(expression);

const TypeHandlers = {
  [TYPES.Numeric]: getValue,
  [TYPES.String]: getValue,
  [TYPES.Boolean]: getValue,
  [TYPES.Null]: getValue,
  [TYPES.Raw]: getValue,
  [TYPES.RegExp]: toRegExp,
  [TYPES.Identifier]: evaluateIdentifier,
  [TYPES.UnaryExpression]: evaluateUnaryExpression,
  [TYPES.AssignExpression]: evaluateAssignExpression,
  [TYPES.BinaryExpression]: evaluateBinaryExpression,
  [TYPES.CallExpression]: evaluateCallExpression,
  [TYPES.Components]: evaluateComponents,
  [TYPES.MemberExpression]: evaluateMemberObjectExpression,
  [TYPES.ObjectExpression]: evaluateObjectExpression,
  [TYPES.ArrayExpression]: evaluateArrayExpression,
  [TYPES.TemplateLiteral]: evaluateTemplateLiteral,
  [TYPES.Program]: evaluateProgram,
  [TYPES.BlockStatement]: evaluateProgram,
  [TYPES.IfStatement]: evaluateIfStatement,
  [TYPES.EventBinding]: evaluateEventBindingExpression,
  [TYPES.PropertyBinding]: evaluatePropertyBindingExpression,
};

/**
 * evaluate
 * @param {*} ast
 * @param {Environment} environment
 * @returns {*}
 */
const evaluate = ({ type, ...ast }, environment) => {
  if (hasKey(TypeHandlers, type)) {
    return TypeHandlers[type](ast, environment, evaluate);
  }
  throw new Error(`Wrong type ${type}, ${JSON.stringify({ type, ...ast })}`);
};

/**
 * evaluateWithEnvironmentCheck
 * @param {*} ast
 * @param {Environment} environment
 * @returns {*}
 */
const evaluateWithEnvironmentCheck = (ast, environment) => {
  if (!(environment instanceof Environment)) {
    throw new Error(`Can't evaluate without a proper Environment instance`);
  }
  return evaluate(ast, environment);
};

export default evaluateWithEnvironmentCheck;
