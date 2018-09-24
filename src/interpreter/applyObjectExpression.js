const applyObjectExpression = ({ properties }, { apply }) =>
  properties.reduce((result, { key, value }) => {
    result[apply(key)] = apply(value);
    return result;
  }, {});

export default applyObjectExpression;
