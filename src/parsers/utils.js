import { TYPES } from "../const";

const returnTokenWhen = (token, type, propKey, propValue) => {
  if (
    token &&
    token.type === type &&
    (!propKey || !propValue || token[propKey] === propValue)
  ) {
    return token;
  }
  return null;
};

export const isPunctuation = (token, paren = undefined) =>
  returnTokenWhen(token, TYPES.Punctuation, "value", paren);

export const isOperator = (token, operator = undefined) =>
  returnTokenWhen(token, TYPES.Operator, "value", operator);

export const isKeyword = (token, keyword = undefined) =>
  returnTokenWhen(token, TYPES.Keyword, "value", keyword);
