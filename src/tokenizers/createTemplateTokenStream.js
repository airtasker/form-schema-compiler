/* eslint-disable no-use-before-define */
import * as utils from './utils';
import {
  ANNOTATIONS,
  GLOBAL_FUNCTIONS,
  OPERATORS,
  PUNCTUATIONS,
  TYPES,
} from '../const';
import createExpressionTokenStream from './createExpressionTokenStream';

/**
 * transpiling template string input to an expression token stream
 * e.g "hello{world}" to "hello" + toString(world)
 * if read string then concatenate to a string,
 * parse expression if read {}
 * @param inputStream: InputStream
 * @returns {{next: (function(): Object), peek: (function(): Object), eof: (function(): boolean), croak: (function(*)), position: (function(): {pos: number, line: number, col: number})}}
 */
const createTemplateTokenStream = (inputStream) => {
  const isBracketStart = (ch) => ch === ANNOTATIONS.Expression[0];
  const isBracketEnd = (ch) => ch === ANNOTATIONS.Expression[1];
  let state;
  const tokenStacks = [];

  let expressionStream;

  // handle expression
  const readExpressionState = () => {
    const result = expressionStream.next();
    if (expressionStream.eof()) {
      expressionStream = null;
      inputStream.next();
      state = readStringState;
      if (!inputStream.eof()) {
        // append + if stream is not end
        tokenStacks.push({
          type: TYPES.Operator,
          value: OPERATORS.Add,
        });
      }
      // append ) after expression
      tokenStacks.push({
        type: TYPES.Punctuation,
        value: PUNCTUATIONS.Parentheses[1],
      });
    }
    return result;
  };

  // handler string until reach {
  function readStringState() {
    if (inputStream.eof()) {
      return null;
    }
    let value = '';

    while (!inputStream.eof()) {
      // concat string cross empty expression
      value += utils.readWhileWithEscaped(inputStream, isBracketStart, true);
      if (!inputStream.eof()) {
        expressionStream = createExpressionTokenStream(
          inputStream,
          isBracketEnd,
        );
        if (expressionStream.eof()) {
          // ignore empty expression
          expressionStream = null;
          inputStream.next();
        } else {
          // switch to expression state
          state = readExpressionState;
          // expression should wrapped with + toString( expression )
          // prepend  to expression
          tokenStacks.push(
            {
              type: TYPES.Punctuation,
              value: PUNCTUATIONS.Parentheses[0],
            },
            {
              type: TYPES.Identifier,
              name: GLOBAL_FUNCTIONS.toString,
            },
            {
              type: TYPES.Operator,
              value: OPERATORS.Add,
            },
          );
          break;
        }
      }
    }

    return {
      type: TYPES.String,
      value,
    };
  }

  function readNext() {
    if (tokenStacks.length) {
      return tokenStacks.pop();
    }
    return state();
  }

  const { peek, next } = utils.createPeekAndNext(readNext);
  const eof = () => peek() === null;
  state = readStringState;

  return {
    ...inputStream,
    next,
    peek,
    eof,
  };
};

export default createTemplateTokenStream;
