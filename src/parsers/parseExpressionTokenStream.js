/* eslint-disable no-use-before-define */
import { OPERATORS, PRECEDENCE, PUNCTUATIONS, TYPES } from "../const";
import * as utils from "./utils";

/**
 * transpiling token stream to abstract syntax tree
 * abstract syntax tree https://en.wikipedia.org/wiki/Abstract_syntax_tree
 * a recursive descent parser https://en.wikipedia.org/wiki/Recursive_descent_parser
 * There are a lot of ways to write parser, like LL parser LR parser.
 * recursive descent parser is the easiest way to write, but not the most effective way.
 * Because we are building a very simple parser, we chosen using recursive descent way to write.
 *
 * e.g.
 * [{type: operator, value: '-'}, {type: numeric, value: 1}]
 * to
 * {type: UnaryExpression, operator: '-', argument: {type: numeric, value: 1}}
 * @param tokenStream
 */
const parseExpressionTokenStream = tokenStream => {
  const isPunctuation = paren => utils.isPunctuation(tokenStream.peek(), paren);

  const isOperator = operator => utils.isOperator(tokenStream.peek(), operator);

  const isUnary = () =>
    isOperator(OPERATORS.Not) ||
    isOperator(OPERATORS.Add) ||
    isOperator(OPERATORS.Subtract);

  const atomTokenTypes = [
    TYPES.Identifier,
    TYPES.Numeric,
    TYPES.Null,
    TYPES.String,
    TYPES.RegExp,
    TYPES.Boolean
  ];

  /**
   * skip next punctuation, if next char is not punctuation, throw error
   * @param ch
   */
  const skipPunctuation = ch => {
    if (!isPunctuation(ch)) {
      tokenStream.croak(`Expecting punctuation: "${ch}"`);
    }
    tokenStream.next();
  };

  /**
   * delimited
   * parse tokens between start, stop, end.
   * if char is not match start, stop or end, throw an error.
   * @param start start char, throw exception when not match
   * @param stop stop char, throw exception when not match
   * @param separator parser separator throw exception when not match
   * @param parser parser
   * @returns {Array}
   */
  const delimited = (start, stop, separator, parser) => {
    const args = [];
    let first = true;
    skipPunctuation(start);
    while (!tokenStream.eof()) {
      if (isPunctuation(stop)) {
        break;
      }
      if (first) {
        first = false;
      } else {
        skipPunctuation(separator);
      }
      if (isPunctuation(stop)) {
        break;
      }
      args.push(parser());
    }
    skipPunctuation(stop);
    return args;
  };

  /**
   * return a call expression if next token is (
   * @param expr
   * @returns {*}
   */
  function maybeCall(expr) {
    const callee = expr();
    if (isPunctuation(PUNCTUATIONS.Parentheses[0])) {
      return parseCall(callee);
    }
    return callee;
  }

  /**
   * return an unary expression if current token is -+!
   * @param expr
   * @returns {*}
   */
  function maybeUnary(expr) {
    const token = isUnary();
    if (token) {
      tokenStream.next();
      return {
        type: TYPES.UnaryExpression,
        operator: token.value,
        argument: expr()
      };
    }
    return expr();
  }

  /**
   * return binary expression if next token is an operator
   * @param left
   * @param leftOpPrec
   * @returns {*}
   */
  function maybeBinary(left, leftOpPrec = 0) {
    const token = isOperator();
    if (token) {
      const rightOpPrec = PRECEDENCE[token.value];
      if (rightOpPrec > leftOpPrec) {
        tokenStream.next();
        const right = maybeBinary(parseAtom(), rightOpPrec);
        const binary = {
          type: TYPES.BinaryExpression,
          operator: token.value,
          left,
          right
        };
        return maybeBinary(binary, leftOpPrec);
      }
    }
    return left;
  }

  /**
   * parse call with arguments
   * @param callee
   * @returns {{type: 'CallExpression', callee: callee, arguments: [...]}}
   */
  function parseCall(callee) {
    return {
      type: TYPES.CallExpression,
      callee,
      arguments: delimited(
        PUNCTUATIONS.Parentheses[0],
        PUNCTUATIONS.Parentheses[1],
        PUNCTUATIONS.Separator,
        parseExpression
      )
    };
  }

  /**
   * parse next expression
   * @returns {Expression}
   */
  function parseExpression() {
    return maybeCall(() => maybeBinary(parseAtom(), 0));
  }

  /**
   * parse single expression, could be a call expression, an unary expression, an identifier or an expression inside a parentheses
   * @returns {Expression}
   */
  function parseAtom() {
    return maybeUnary(() =>
      maybeCall(
        // eslint-disable-next-line consistent-return
        () => {
          if (isPunctuation(PUNCTUATIONS.Parentheses[0])) {
            // if read parentheses, then will parse the expression inside the parentheses
            tokenStream.next();
            const exp = parseExpression();
            skipPunctuation(PUNCTUATIONS.Parentheses[1]);
            return exp;
          }

          const token = tokenStream.next();
          if (atomTokenTypes.includes(token.type)) {
            return token;
          }

          unexpected(token);
        }
      )
    );
  }

  function unexpected(token = undefined) {
    tokenStream.croak(
      `Unexpected token: ${JSON.stringify(token || tokenStream.peek())}`
    );
  }

  return parseExpression();
};

export default parseExpressionTokenStream;
