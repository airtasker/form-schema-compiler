import mapValues from 'lodash/mapValues';

const evaluatePropertyBindingExpression = ({ value }, env, evaluate) => {
  if ('type' in value) {
    return evaluate(value, env);  
  }
  return mapValues(value, (ast) => evaluate(ast, env));
}

export default evaluatePropertyBindingExpression;
