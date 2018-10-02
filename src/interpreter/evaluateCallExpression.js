const evaluateCallExpression = (ast, env, evaluate) => {
  const callee = evaluate(ast.callee, env);
  if (typeof callee !== "function") {
    throw new Error(
      `Wrong call expression, callee have to be function ${JSON.stringify(
        ast
      )}`
    );
  }

  const args = ast.arguments.map(arg => evaluate(arg, env));

  return callee(...args);
};

export default evaluateCallExpression;
