/* eslint-disable no-use-before-define */
import flow from "lodash/flow";
import { OPERATORS, PRECEDENCE, PUNCTUATIONS, TYPES } from "../const";
import * as utils from "./utils";

/**
 * transpiling token stream to abstract syntax tree
 * abstract syntax tree https://en.wikipedia.org/wiki/Abstract_syntax_tree
 * a recursive descent parser https://en.wikipedia.org/wiki/Recursive_descent_parser
 * There are a lot of ways to write parser, like LL parser LR parser.
 * recursive descent parser is the easiest way to write.
 * Because we are building a very simple parser, and need it run in browser, so we chosen using recursive descent way to write.
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

  const maybeCallOrMember = flow(
    maybeCall,
    maybeMember
  );
  /**
   * return a call expression if next token is '('
   * @param callee
   * @returns {*}
   */
  function maybeCall(callee) {
    if (isPunctuation(PUNCTUATIONS.Parentheses[0])) {
      return maybeCallOrMember(parseCall(callee));
    }
    return callee;
  }

  /**
   *  return a member expression if next token is '['
   * @param object
   */
  function maybeMember(object) {
    if (isPunctuation(PUNCTUATIONS.SquareBrackets[0])) {
      return maybeCallOrMember(parseMember(object));
    }
    return object;
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
        argument: maybeUnary(expr)
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
      const isAssign = token.value === OPERATORS.Assign;
      if (rightOpPrec > leftOpPrec) {
        if (isAssign && left.type !== TYPES.Identifier) {
          tokenStream.croak(
            `You can only assign to an identifier "${JSON.stringify(left)}"`
          );
        }
        tokenStream.next();
        const right = maybeBinary(parseAtom(), rightOpPrec);
        const binary = {
          type: isAssign ? TYPES.AssignExpression : TYPES.BinaryExpression,
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
        PUNCTUATIONS.Parentheses[0], // (
        PUNCTUATIONS.Parentheses[1], // )
        PUNCTUATIONS.Separator, // ,
        parseExpression
      )
    };
  }

  /**
   * parse object
   * @returns {{type: 'ObjectExpression', properties: [...]}}
   */
  function parseObject() {
    return {
      type: TYPES.ObjectExpression,
      properties: delimited(
        PUNCTUATIONS.Braces[0], // {
        PUNCTUATIONS.Braces[1], // }
        PUNCTUATIONS.Separator, // ,
        parseObjectProperty // should have property key : value
      )
    };
  }

  function parseObjectProperty() {
    const key = parseAtom();

    if (![TYPES.Identifier, TYPES.String, TYPES.Numeric].includes(key.type)) {
      tokenStream.croak(
        `Object key should only be identifier, string or number, instead of "${
          key.value
        }:${key.type}"`
      );
    }

    skipPunctuation(PUNCTUATIONS.Colon);

    return {
      key,
      value: parseExpression()
    };
  }

  /**
   * parse array
   * @returns {{type: 'ArrayExpression', elements: [...]}}
   */
  function parseArray() {
    return {
      type: TYPES.ArrayExpression,
      elements: delimited(
        PUNCTUATIONS.SquareBrackets[0], // [
        PUNCTUATIONS.SquareBrackets[1], // ]
        PUNCTUATIONS.Separator, // ,
        parseExpression // should have property key : value
      )
    };
  }

  function parseMember(object) {
    skipPunctuation(PUNCTUATIONS.SquareBrackets[0]);
    const property = parseExpression();
    skipPunctuation(PUNCTUATIONS.SquareBrackets[1]);

    return {
      type: TYPES.MemberExpression,
      object,
      property
    };
  }

  function checkIfNeedAddDummyQuasis(expressions, quasis) {
    if (quasis.length <= expressions.length) {
      quasis.push({
        type: TYPES.String,
        value: ""
      });
    }
  }

  function parseTemplateLiteral() {
    skipPunctuation(PUNCTUATIONS.BackQuote);
    const expressions = [];
    const quasis = [];

    while (!isPunctuation(PUNCTUATIONS.BackQuote)) {
      if (isPunctuation(PUNCTUATIONS.Braces[0])) {
        skipPunctuation(PUNCTUATIONS.Braces[0]);
        checkIfNeedAddDummyQuasis(expressions, quasis);
        expressions.push(parseExpression());
        skipPunctuation(PUNCTUATIONS.Braces[1]);
      } else {
        quasis.push(tokenStream.next());
      }
    }
    checkIfNeedAddDummyQuasis(expressions, quasis);
    skipPunctuation(PUNCTUATIONS.BackQuote);
    return {
      type: TYPES.TemplateLiteral,
      expressions,
      quasis
    };
  }

  /**
   * parse next expression
   * @returns {Expression}
   */
  function parseExpression() {
    return maybeBinary(parseAtom(), 0);
  }

  /**
   * parse single expression, could be a call expression, an unary expression, an identifier or an expression inside a parentheses
   * @returns {Expression}
   */
  function parseAtom(skipUnaryCheck = false) {
    return maybeUnary(() => maybeCallOrMember(parseSimpleAtom()));
  }

  /**
   * parse a simple atom, e.g identifier, number, string, object, array, boolean, etc
   * @returns {Expression}
   */
  function parseSimpleAtom() {
    if (isPunctuation(PUNCTUATIONS.Parentheses[0])) {
      // if it reads parentheses, then will parse the expression inside the parentheses
      tokenStream.next();
      const exp = parseExpression();
      skipPunctuation(PUNCTUATIONS.Parentheses[1]);
      return exp;
    }

    if (isPunctuation(PUNCTUATIONS.Braces[0])) {
      // if it reads braces start, then it's an Object
      return parseObject();
    }

    if (isPunctuation(PUNCTUATIONS.SquareBrackets[0])) {
      // if it reads square brackets start, then it's an Array
      return parseArray();
    }

    if (isPunctuation(PUNCTUATIONS.BackQuote)) {
      // if it reads back quote, then it's a Template Literal
      return parseTemplateLiteral();
    }

    const token = tokenStream.next();
    if (atomTokenTypes.includes(token.type)) {
      return token;
    }

    unexpected(token);
  }

  function unexpected(token = undefined) {
    tokenStream.croak(
      `Unexpected token: ${JSON.stringify(token || tokenStream.peek())}`
    );
  }

  return parseExpression();
};

export default parseExpressionTokenStream;
