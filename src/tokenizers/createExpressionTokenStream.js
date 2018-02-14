import * as utils from "./utils";
import { BOOLEANS, TYPES } from "../const";

const defaultShouldEnd = () => false;

/**
 * transpiling expression string input to an expression token stream
 * e.g "a" to {type: identifier, name: 'a'}
 * more example see tests
 * @param inputStream: InputStream
 * @returns {{next: (function(): Object), peek: (function(): Object), eof: (function(): boolean), croak: (function(*)), position: (function(): {pos: number, line: number, col: number})}}
 */
const createExpressionTokenStream = (
  inputStream,
  shouldEnd = defaultShouldEnd
) => {
  const readNumber = () => {
    let hasDot = false;
    const number = utils.readWhile(inputStream, ch => {
      if (ch === ".") {
        if (hasDot) {
          inputStream.croak(`Unexpected token:. , double dot in a number`);
        }
        hasDot = true;
        return true;
      }
      return utils.isDigit(ch);
    });
    return { type: TYPES.Numeric, value: Number(number) };
  };

  /**
   * readIdentifier
   * @returns {*}
   */
  function readIdentifier() {
    // read until char is not matching identifier rule
    const value = utils.readWhile(inputStream, utils.isId);

    if (utils.isBoolean(value)) {
      // if identifier is  'true' or 'false' then it's a boolean
      return {
        type: TYPES.Boolean,
        value: value === BOOLEANS[1]
      };
    }
    if (utils.isOperatorString(value)) {
      // if identifier is 'is' 'isnt' 'not' 'match' then it's an operator
      return {
        type: TYPES.Operator,
        value
      };
    }
    if (utils.isNull(value)) {
      // if identifier is  'null' then it's a null
      return {
        type: TYPES.Null,
        value: null
      };
    }

    return {
      type: TYPES.Identifier,
      name: value
    };
  }

  const validFlagChars = "gimuy";
  const readRegexp = () => {
    inputStream.next();
    // read regexp until see tne regexp ending char (/)
    const pattern = utils.readWhileWithEscaped(inputStream, ch => ch === "/");

    let flags = "";
    while (!inputStream.eof()) {
      const ch = inputStream.peek();
      if (validFlagChars.includes(ch) && !flags.includes(ch)) {
        // only add valid flags and not allow duplication
        flags += ch;
        inputStream.next();
      } else if (utils.isWhitespace(ch) || utils.isPunctuation(ch)) {
        // end of regexp
        break;
      } else {
        inputStream.croak(
          `Uncaught SyntaxError: Invalid regular expression flags: "${flags}${ch}"`
        );
      }
    }

    return {
      type: TYPES.RegExp,
      pattern,
      flags
    };
  };

  const readString = () => ({
    type: TYPES.String,
    value: utils.readEscaped(inputStream, utils.isStringStart)
  });

  const readOperator = () => {
    let value = inputStream.next();
    if (inputStream.peek() === "=") {
      value += inputStream.next();
    }
    return {
      type: TYPES.Operator,
      value
    };
  };

  const skipComment = () => {
    inputStream.next();
    utils.readWhile(inputStream, ch => ch !== "\n" && ch !== "#");
    inputStream.next();
  };

  // eslint-disable-next-line no-use-before-define
  const { peek, next, queue } = utils.createPeekAndNext(readNext, 1);

  const notRegexpPreviousTypes = [
    TYPES.Numeric,
    TYPES.String,
    TYPES.Identifier
  ];

  // check previous token if read /
  // if previous token is number or string or identifier it's must be division instead of a start of regex
  const canBeRegexp = () =>
    queue.length === 0 || !notRegexpPreviousTypes.includes(queue[0].type);

  // eslint-disable-next-line consistent-return
  function readNext() {
    utils.readWhile(inputStream, utils.isWhitespace);

    const ch = inputStream.peek();
    if (inputStream.eof() || shouldEnd(ch)) {
      return null;
    }
    if (ch === "#") {
      skipComment();
      return readNext();
    }
    if (utils.isStringStart(ch)) {
      return readString();
    }
    if (utils.isDigit(ch)) {
      return readNumber();
    }
    if (utils.isIdStart(ch)) {
      return readIdentifier();
    }
    if (utils.isRegexpStart(ch) && canBeRegexp()) {
      return readRegexp();
    }
    if (utils.isOperatorStart(ch)) {
      // when read a char is > or < means this possibly a >= or <=
      return readOperator();
    }
    if (utils.isPunctuation(ch)) {
      return {
        type: TYPES.Punctuation,
        value: inputStream.next()
      };
    }
    if (utils.isOperatorChar(ch)) {
      return {
        type: TYPES.Operator,
        value: inputStream.next()
      };
    }
    inputStream.croak(`Can't handle character: ${ch}`);
  }

  const eof = () => peek() === null;

  return {
    ...inputStream,
    next,
    peek,
    eof
  };
};

export default createExpressionTokenStream;
