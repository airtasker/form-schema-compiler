const toString = obj => {
  switch (typeof obj) {
    case "string":
      return obj;
    case "number":
      if (Number.isNaN(obj)) {
        return "";
      }
      return obj.toString();
    default:
      // all other types will be convert to '' for convenience
      return "";
  }
};

const evaluateTemplateLiteral = ({ expressions, quasis }, env, evaluate) =>
  quasis.reduce(
    (retVal, { value }, i) =>
      retVal +
      value +
      toString(i < expressions.length && evaluate(expressions[i], env)),
    ""
  );

export default evaluateTemplateLiteral;
