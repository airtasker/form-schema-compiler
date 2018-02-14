import { OPERATORS } from '../const';
import apply from './apply';

const handleRegex = (left, operator, right) => {
  const regex = right instanceof RegExp ? right : new RegExp(right);
  if (left === undefined) {
    return regex.test('');
  }
  return regex.test(left);
};

export const evalBinaryExpression = ({ operator, left, right }) => {
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
    case OPERATORS.Or:
      return left || right;
    case OPERATORS.And:
      return left && right;
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
        `unknown binary expression: ${{ operator, left, right }}`,
      );
  }
};

const applyBinaryExpression = ({ operator, left, right }, options) =>
  evalBinaryExpression({
    operator,
    left: apply(left, options),
    right: apply(right, options),
  });

export default applyBinaryExpression;
