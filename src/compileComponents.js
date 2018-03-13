import curryRight from "lodash/curryRight";
import mapValues from "lodash/mapValues";
import mapKeys from "lodash/mapKeys";
import findKey from "lodash/findKey";
import flowRight from "lodash/flowRight";

import { ANNOTATION_TYPES, ANNOTATIONS, TYPES } from "./const";
import {
  parseExpressionString,
  parseTemplateString,
  parseDataBindingString
} from "./parsers";
import createTypeCompiler from "./typeCompiler";

/**
 * convert json value
 * "string" to  {type: string, value: "string"}
 * 1 to {type: numeric, value: 1}
 * true to {type: boolean, value: 1}
 * null to {type: Null, value: null}
 * other types to {type: Raw, value}
 * @param obj
 * @returns {*}
 */
const toValueObject = value => {
  if (value === null) {
    return {
      type: TYPES.Null,
      value
    };
  }
  switch (typeof value) {
    case "string":
      return {
        type: TYPES.String,
        value
      };
    case "number":
      return {
        type: TYPES.Numeric,
        value
      };
    case "boolean":
      return {
        type: TYPES.Boolean,
        value
      };
    default:
      return {
        type: TYPES.Raw,
        value
      };
  }
};

/**
 * get annotation
 * @param key string
 *
 * e.g.
 * '[value]' return '[]'
 * '<value>' return '<>'
 * '#value#' return '##'
 * '{value}' return '{}'
 * '(value)' return '()'
 */
const getAnnotationType = key =>
  findKey(ANNOTATIONS, { 0: key[0], 1: key[key.length - 1] });

/**
 * strip annotation
 * @param key string
 *
 * e.g.
 * '[value]' return 'value'
 * '<value>' return 'value'
 * '#value#' return 'value'
 * '{value}' return 'value'
 * '(value)' return 'value'
 */
const stripAnnotation = (value, key) => {
  const strippedKey = key.substring(1, key.length - 1);
  switch (getAnnotationType(key)) {
    case ANNOTATION_TYPES.DataBinding:
    case ANNOTATION_TYPES.Expression:
    case ANNOTATION_TYPES.Template:
    case ANNOTATION_TYPES.Component:
      // only strip annotation when there is one
      // convert [value] to value
      return strippedKey;
    case ANNOTATION_TYPES.Action:
      // convert (click) to onClick
      return `on${strippedKey[0].toUpperCase()}${strippedKey.substr(1)}`;
    default:
      return key;
  }
};

/**
 * compile value to ast expression,
 * examples see expression parsers and tests
 * @param value
 * @param key
 * @returns {*}
 */
const compileValue = (value, key) => {
  switch (getAnnotationType(key)) {
    case ANNOTATION_TYPES.Action:
    case ANNOTATION_TYPES.Expression:
      return parseExpressionString(value);
    case ANNOTATION_TYPES.DataBinding:
      return parseDataBindingString(value);
    case ANNOTATION_TYPES.Template:
      return parseTemplateString(value);
    case ANNOTATION_TYPES.Component:
      // recursively compile nested component
      // eslint-disable-next-line no-use-before-define
      return compileComponents(value);
    default:
      return toValueObject(value);
  }
};

/**
 * compile values but not keys, compile values to ast expression.
 * e.g.
 * {'{value}': 'expression'} return {'{value}': 'compiled expression'}
 */
const compileValues = curryRight(mapValues)(compileValue);

/**
 * compile keys but not value, compile keys to non-annotation key.
 * e.g.
 * {'{value}': 'expression', '<component>': 'expression' } return {'value': 'expression', 'component': 'expression'}
 */
const compileKeys = curryRight(mapKeys)(stripAnnotation);

/**
 * compile keys and values.
 */
export const compileProps = flowRight(compileKeys, compileValues);

/**
 * Take component schema return AST,
 * examples see expression parsers and tests
 * @param {*} componentSchema
 * @param {{typeCompilers: *}} options
 * @returns {{type: *}}
 */
const compileComponent = ({ type, ...props }, { typeCompilers }) => {
  const typeCompiler = createTypeCompiler(type, typeCompilers);
  const composed = flowRight(
    typeCompiler.after,
    compileProps,
    typeCompiler.before
  );
  return {
    type,
    ...composed(props)
  };
};

/**
 * compile components schema
 * @param {*} components if components is an object covert to [components]
 * @param {{typeCompilers: *}} options
 * @returns {{type: string, components: Array}}
 */
function compileComponents(components, options = {}) {
  const componentArray = Array.isArray(components) ? components : [components];
  return {
    type: TYPES.Components,
    components: componentArray.map(curryRight(compileComponent)(options))
  };
}

export default compileComponents;
