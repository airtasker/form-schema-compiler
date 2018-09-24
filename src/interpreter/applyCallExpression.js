const applyCallExpression = (expression, { apply }) => {
  const callee = apply(expression.callee);
  if (typeof callee !== "function") {
    throw new Error(
      `Wrong call expression, callee have to be function ${JSON.stringify(
        expression
      )}`
    );
  }

  const args = expression.arguments.map(arg => apply(arg));

  return callee(...args);
};

export default applyCallExpression;
