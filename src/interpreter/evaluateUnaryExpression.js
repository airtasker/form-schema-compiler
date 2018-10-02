import { OPERATORS } from "../const";

const evaluateUnaryExpression = ({ operator, argument }, env, evaluate) => {
  switch (operator) {
    case OPERATORS.Not:
      return !evaluate(argument, env);
    case OPERATORS.Add:
      return +evaluate(argument, env);
    case OPERATORS.Subtract:
      return -evaluate(argument, env);
    default:
      throw new Error(
        `wrong UnaryExpression ${JSON.stringify({ operator, argument })}`
      );
  }
};

export default evaluateUnaryExpression;
