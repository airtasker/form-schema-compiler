const applyMemberObjectExpression = (expression, { apply }) => {
  const object = apply(expression.object);
  const property = apply(expression.property);

  if (object == null) {
    return null;
  }

  return object[property];
};

export default applyMemberObjectExpression;
