import apply from "./apply";

const applyCallExpression = (expression, options) => {
  const callee = apply(expression.callee, options);
  if (typeof callee !== "function") {
    throw new Error(
      `Wrong call expression, callee have to be function ${JSON.stringify(
        expression
      )}`
    );
  }

  const args = expression.arguments.map(arg => apply(arg, options));

  return callee(...args);
};

export default applyCallExpression;
