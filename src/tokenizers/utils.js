import flatten from "lodash/flatten";
import { BOOLEANS, OPERATORS, PUNCTUATIONS } from "../const";

export const isBoolean = str => BOOLEANS.includes(str);

const operatorStrings = Object.values(OPERATORS);
export const isOperatorString = str => operatorStrings.includes(str);

const operatorChars = [
  OPERATORS.Add,
  OPERATORS.Subtract,
  OPERATORS.Multiply,
  OPERATORS.Divide,
  OPERATORS.Assign
];
export const isOperatorChar = ch => operatorChars.includes(ch);
export const isNull = str => str === "null";

const operatorStartChars = [OPERATORS.GreaterThan, OPERATORS.LessThan];
export const isOperatorStart = ch => operatorStartChars.includes(ch);

const digitChars = "0123456789";
export const isDigit = ch => digitChars.includes(ch);

export const isIdStart = ch => /[a-z_]/i.test(ch);

export const isId = ch => isIdStart(ch) || isDigit(ch);

const punctuationChars = flatten(Object.values(PUNCTUATIONS));

export const isPunctuation = ch => punctuationChars.includes(ch);

export const isRegexpStart = ch => ch === "/";

export const isStringStart = ch => ch === "'" || ch === '"';

const whitespaceChars = " \t\n\r";
export const isWhitespace = ch => whitespaceChars.includes(ch);

/**
 * concat input stream chunk until a failure predicate
 * @param inputStream
 * @param predicate
 * @returns {string}
 */
export const readWhile = (inputStream, predicate) => {
  let str = "";
  while (!inputStream.eof() && predicate(inputStream.peek()))
    str += inputStream.next();
  return str;
};

/**
 * concat input stream chunk until a truthy shouldStop
 * Escape EVERY char next to '\'
 * @param inputStream
 * @param shouldStop(char) callback
 * @returns {string}
 */
export const readEscaped = (inputStream, shouldStop) => {
  let escaped = false;
  let str = "";
  inputStream.next();
  while (!inputStream.eof()) {
    const ch = inputStream.next();
    if (escaped) {
      str += ch;
      escaped = false;
    } else if (ch === "\\") {
      escaped = true;
    } else if (shouldStop(ch)) {
      break;
    } else {
      str += ch;
    }
  }
  return str;
};

/**
 * concat input stream chunk until a truthy shouldStop.
 * Will not check a char next to '\'
 * @param inputStream
 * @param shouldStop(char) callback return concatenation if true
 * @param removeEscapeWhenEscaped boolean if true will remove escape char if escaped
 * @returns {string}
 */
export const readWhileWithEscaped = (
  inputStream,
  shouldStop,
  removeEscapeWhenEscaped = false
) => {
  let escaped = false;
  let str = "";
  while (!inputStream.eof()) {
    const ch = inputStream.next();
    const stop = shouldStop(ch);

    if (!escaped && stop) {
      break;
    }

    if (escaped && stop && removeEscapeWhenEscaped) {
      str = str.substr(0, str.length - 1);
    }

    if (!escaped && shouldStop(ch)) {
      break;
    }
    str += ch;
    escaped = ch === "\\" && !escaped;
  }
  return str;
};

/**
 * peek, next, queue
 * peek will return current token without moving index
 * next will return current token and moving index
 * queue will store all previous tokens.
 * @param nextFn
 * @param queueSize
 * @returns {{peek: peek, next: next, queue: Array}}
 */
export const createPeekAndNext = (nextFn, queueSize = 0) => {
  let current;
  const queue = [];

  function next() {
    const token = current;
    current = null;
    if (token) {
      return token;
    }

    const result = nextFn();
    if (queueSize) {
      queue.push(result);
      if (queue.length > queueSize) {
        queue.shift();
      }
    }

    return result;
  }

  function peek() {
    if (!current) {
      current = next();
    }
    return current;
  }

  return {
    peek,
    next,
    queue
  };
};
