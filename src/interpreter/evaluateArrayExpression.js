const evaluateArrayExpression = ({ elements }, env, evaluate) =>
  elements.map(element => evaluate(element, env));

export default evaluateArrayExpression;
