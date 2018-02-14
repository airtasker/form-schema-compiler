import defaultTo from "lodash/defaultTo";
import noop from "lodash/noop";
import TextInput from "./textInput";
import RadioButton from "./radioButton";

/**
 * add type compiler here,
 * a type compiler will be called before and after component compiled.
 * Type compiler example:
 * () => {
 *    // for each component will create their own instance of type compiler
 *    // that's means every type compiler for every components is fully independent, shares no context
 *    return {
 *      before: (r) => r, // will be call before component get compile
 *      after: (r) => r, // will be call after compile
 *    }
 * }
 * @type {{TextInput: Function, TextArea: Function, RadioButton: Function}}
 */
const TYPE_COMPILERS = { TextInput, TextArea: TextInput, RadioButton };

// default dummy type compiler
const defaultTypeCompiler = {
  before: r => r,
  after: r => r
};

/**
 * Add specific type handle for components.
 * @param {string} type 
 * @param {object} customTypeCompilers 
 * @param {object} defaultTypeCompilers 
 */
const createTypeCompiler = (
  type,
  customTypeCompilers = {},
  defaultTypeCompilers = TYPE_COMPILERS,
) => ({
  // apply default compiler
  ...defaultTypeCompiler,
  ...defaultTo(
    defaultTo(customTypeCompilers[type], defaultTypeCompilers[type]),
    noop
  )()
});

export default createTypeCompiler;
