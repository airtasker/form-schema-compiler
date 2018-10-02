const evaluateObjectExpression = ({ properties }, env, evaluate) =>
  properties.reduce((result, { key, value }) => {
    result[evaluate(key, env)] = evaluate(value, env);
    return result;
  }, {});

export default evaluateObjectExpression;
