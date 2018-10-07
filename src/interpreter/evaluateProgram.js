// evaluate both block and program statement
const evaluateProgram = ({ body }, env, evaluate) => {
  if (body.length === 0) {
    return null;
  }
  const lstIndex = body.length - 1;
  for (let i = 0; i < lstIndex; i++) {
    evaluate(body[i], env);
  }
  return evaluate(body[lstIndex], env); // always return the last value
};

export default evaluateProgram;
