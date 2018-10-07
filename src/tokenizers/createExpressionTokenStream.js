import find from "lodash/find";
import { OPERATORS, PUNCTUATIONS } from "./../const";
import * as utils from "./utils";
import { BOOLEANS, TYPES } from "../const";

const defaultShouldEnd = inputStream => inputStream.eof();

/**
 * transpiling expression string input to an expression token stream
 * e.g "a" to {type: identifier, name: 'a'}
 * more example see tests
 * @param {{next, peek, croak}}: inputStream
 * @param {Function}: shouldEnd
 * @param {{eof}}: shouldEnd
 * @returns {{next: (function(): Object), peek: (function(): Object), eof: (function(): boolean), croak: (function(*)), position: (function(): {pos: number, line: number, col: number})}}
 */
const createExpressionTokenStream = (
  inputStream,
  shouldEnd = defaultShouldEnd,
  errors = {
    eof: "Not expect input ended at time"
  }
) => {
  let isStringTemplateMode = false;

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
    if (utils.isKeyword(value)) {
      return {
        type: TYPES.Keyword,
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

  const readString = ch => {
    inputStream.next();
    const ast = {
      type: TYPES.String,
      value: utils.readEscaped(inputStream, c => c === ch)
    };
    inputStream.next();
    return ast;
  };

  let stringTemplateExpressionSteam = null;
  const initStringTemplateMode = () => {
    stringTemplateExpressionSteam = null;
    isStringTemplateMode = true;
  };

  const readTemplateLiteral = () => {
    let ch = inputStream.peek();

    if (inputStream.eof()) {
      inputStream.croak(`String template does not end`);
    }

    if (stringTemplateExpressionSteam) {
      if (stringTemplateExpressionSteam.eof()) {
        stringTemplateExpressionSteam = null;
        return {
          type: TYPES.Punctuation,
          value: inputStream.next()
        };
      }
      return stringTemplateExpressionSteam.next();
    }

    if (utils.isBackQuote(ch)) {
      isStringTemplateMode = false;
      return {
        type: TYPES.Punctuation,
        value: inputStream.next()
      };
    }

    if (utils.isBraceStart(ch)) {
      const ast = {
        type: TYPES.Punctuation,
        value: inputStream.next()
      };
      stringTemplateExpressionSteam = createExpressionTokenStream(
        inputStream,
        (stream, c) => utils.isBraceEnd(c),
        {
          eof: 'String Template expression missing a "}"'
        }
      );
      if (stringTemplateExpressionSteam.eof()) {
        inputStream.croak(
          "Unexpected empty expression in string template e.g {}"
        );
      }
      return ast;
    }

    // must be string
    return {
      type: TYPES.String,
      value: utils.readEscaped(
        inputStream,
        c => utils.isBraceStart(c) || utils.isBackQuote(c)
      )
    };
  };

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

  const regexpLeadingTokens = [
    {
      type: TYPES.Punctuation,
      value: PUNCTUATIONS.Parentheses[0]
    },
    {
      type: TYPES.Punctuation,
      value: PUNCTUATIONS.Separator
    },
    {
      type: TYPES.Operator,
      value: OPERATORS.Match
    }
  ];

  // check previous token if read /
  // if previous token is number or string or identifier it's must be division instead of a start of regex
  const canBeRegexp = () =>
    queue.length === 0 || find(regexpLeadingTokens, queue[0]) !== undefined;

  // eslint-disable-next-line consistent-return
  function readNext() {
    utils.readWhile(inputStream, utils.isWhitespace);

    const ch = inputStream.peek();
    if (isStringTemplateMode) {
      return readTemplateLiteral();
    }

    if (shouldEnd(inputStream, ch)) {
      return null;
    }
    if (ch === "#") {
      skipComment();
      return readNext();
    }
    if (utils.isStringStart(ch)) {
      return readString(ch);
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

    if (utils.isBackQuote(ch)) {
      initStringTemplateMode();
      return {
        type: TYPES.Punctuation,
        value: inputStream.next()
      };
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

    if (inputStream.eof()) {
      inputStream.croak(errors.eof);
    } else {
      inputStream.croak(`Can't handle character: "${ch}"`);
    }
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
