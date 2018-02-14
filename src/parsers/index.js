import parseExpressionTokenStream from './parseExpressionTokenStream';
import {
  createTemplateTokenStream,
  createExpressionTokenStream,
  createInputStream,
} from '../tokenizers';
import { TYPES } from '../const';

/**
 * parse template string
 * @param templateString:string
 */
export const parseTemplateString = (templateString) =>
  parseExpressionTokenStream(
    createTemplateTokenStream(createInputStream(templateString)),
  );

/**
 * parse expression string
 * @param expressionString:string
 */
export const parseExpressionString = (expressionString) =>
  parseExpressionTokenStream(
    createExpressionTokenStream(createInputStream(expressionString)),
  );

/**
 * parse data binding string
 * Will throw error if dataBinding string is not a identifier.
 * @param expressionString
 */
export const parseDataBindingString = (expressionString) => {
  const parsed = parseExpressionTokenStream(
    createExpressionTokenStream(createInputStream(expressionString)),
  );

  if (parsed.type !== TYPES.Identifier) {
    throw new Error(
      `data binding type have to be Identifier instead of ${
        parsed.type
      }(${expressionString})`,
    );
  }

  return parsed;
};
