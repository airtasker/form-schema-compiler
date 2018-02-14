import { OPERATORS } from '../const';
import apply from './apply';

const applyUnaryExpression = ({ operator, argument }, options) => {
  switch (operator) {
    case OPERATORS.Not:
      return !apply(argument, options);
    case OPERATORS.Add:
      return +apply(argument, options);
    case OPERATORS.Subtract:
      return -apply(argument, options);
    default:
      throw new Error(
        `wrong UnaryExpression ${JSON.stringify({ operator, argument })}`,
      );
  }
};

export default applyUnaryExpression;
