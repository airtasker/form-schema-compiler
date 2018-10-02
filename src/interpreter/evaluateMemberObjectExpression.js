const evaluateMemberObjectExpression = (ast, env, evaluate) => {
  const object = evaluate(ast.object, env);
  const property = evaluate(ast.property, env);

  if (object == null) {
    return null;
  }

  return object[property];
};

export default evaluateMemberObjectExpression;
