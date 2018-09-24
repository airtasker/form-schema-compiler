import { OPERATORS } from "../const";

const applyUnaryExpression = ({ operator, argument }, { apply }) => {
  switch (operator) {
    case OPERATORS.Not:
      return !apply(argument);
    case OPERATORS.Add:
      return +apply(argument);
    case OPERATORS.Subtract:
      return -apply(argument);
    default:
      throw new Error(
        `wrong UnaryExpression ${JSON.stringify({ operator, argument })}`
      );
  }
};

export default applyUnaryExpression;
