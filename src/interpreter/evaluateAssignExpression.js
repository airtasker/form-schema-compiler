const evaluateAssignExpression = ({ left, right }, env, evaluate) =>
  env.set(left.name, evaluate(right, env));
export default evaluateAssignExpression;
