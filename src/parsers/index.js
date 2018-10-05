import parseExpressionTokenStream from "./parseExpressionTokenStream";
import { createExpressionTokenStream, createInputStream } from "../tokenizers";
import flowRight from "lodash/flowRight";
import { TYPES } from "../const";

const parse = flowRight(
  parseExpressionTokenStream,
  createExpressionTokenStream,
  createInputStream
);

/**
 * parse template string
 * @param templateString:string
 */
export const parseTemplateString = templateString => {
  return parse(`\`${templateString}\``);
}

/**
 * parse expression string
 * @param expressionString:string
 */
export const parseExpressionString = parse;

/**
 * parse two way binding string
 * Will throw error if TwoWayBinding is not a identifier.
 * @param expressionString
 */
export const parseTwoWayBindingString = expressionString => {
  const parsed = parse(expressionString);

  if (parsed.type !== TYPES.Identifier) {
    throw new Error(
      `data binding type have to be Identifier instead of ${
        parsed.type
      }(${expressionString})`
    );
  }

  return parsed;
};
