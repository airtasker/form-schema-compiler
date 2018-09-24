const applyArrayExpression = ({ elements }, { apply }) =>
  elements.map(element => apply(element));

export default applyArrayExpression;
