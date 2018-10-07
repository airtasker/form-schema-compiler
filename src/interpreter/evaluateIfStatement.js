const evaluateIfStatement = (
  { test, consequent, alternate },
  env,
  evaluate
) => {
  if (evaluate(test, env)) {
    return consequent ? evaluate(consequent, env) : null;
  }
  return alternate ? evaluate(alternate, env) : null;
};
export default evaluateIfStatement;
