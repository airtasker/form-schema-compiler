import { OPERATORS } from "../const";

const handleRegex = (left, operator, right) => {
  const regex = right instanceof RegExp ? right : new RegExp(right);
  if (left == null) {
    return regex.test("");
  }
  return regex.test(left);
};

export const evaluateNonBranchableBinaryExpression = ({ operator, left, right }) => {
  switch (operator) {
    case OPERATORS.LessThan:
      return left < right;
    case OPERATORS.LessThanOrEqualTo:
      return left <= right;
    case OPERATORS.GreaterThan:
      return left > right;
    case OPERATORS.GreaterThanOrEqualTo:
      return left >= right;
    case OPERATORS.EqualTo:
      return left === right;
    case OPERATORS.NotEqualTo:
      return left !== right;
    case OPERATORS.Match:
      return handleRegex(left, operator, right);
    case OPERATORS.Add:
      return left + right;
    case OPERATORS.Subtract:
      return left - right;
    case OPERATORS.Multiply:
      return left * right;
    case OPERATORS.Divide:
      return left / right;
    case OPERATORS.Remainder:
      return left % right;
    default:
      throw new Error(
        `unknown binary expression: ${{ operator, left, right }}`
      );
  }
};

const evaluateBinaryExpression = ({ operator, left, right }, env, evaluate) => {
  switch (operator) {
    // specially handling for OR and AND
    case OPERATORS.Or:
      // if left is true will ignore right
      return evaluate(left, env) || evaluate(right, env);
    case OPERATORS.And:
      // if left is false will ignore right
      return evaluate(left, env) && evaluate(right, env);
    default:
      return evaluateNonBranchableBinaryExpression({
        operator,
        left: evaluate(left, env),
        right: evaluate(right, env)
      });
  }
};

export default evaluateBinaryExpression;
