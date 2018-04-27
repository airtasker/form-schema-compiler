/**
 * transpiling string input to a stream
 * @param input:string
 * @returns {{next: (function()), peek: (function(): string), eof: (function(): boolean), croak: (function(*)), position: (function(): {pos: number, line: number, col: number})}}
 */
const createInputStream = input => {
  if (typeof input !== "string") {
    throw new Error("expression must be a string instead of " + typeof input);
  }
  let pos = 0;
  let line = 1;
  let col = 0;

  const next = () => {
    const ch = input.charAt(pos);
    pos += 1;
    if (ch === "\n") {
      line += 1;
      col = 0;
    } else {
      col += 1;
    }
    return ch;
  };

  const peek = () => input.charAt(pos);

  const eof = () => peek() === "";

  const croak = msg => {
    throw new Error(`${msg} (${line}:${col})`);
  };

  const position = () => ({
    pos,
    line,
    col
  });

  return {
    next,
    peek,
    eof,
    croak,
    position
  };
};

export default createInputStream;
