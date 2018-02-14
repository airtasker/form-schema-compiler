import omit from "lodash/omit";

/**
 * convert json value to expression text
 * 1 to 1
 * 'str' to 'str'
 * true to true
 * @param obj
 * @returns {*}
 */
const toExpression = obj => {
  if (typeof obj === "string") {
    return `'${obj.replace(/'/gm, "\\'")}'`;
  }
  if (typeof obj === "number" || typeof obj === "boolean") {
    return `${obj}`;
  }
  // we don't support object in expression
  return null;
};

/**
 * radio button compiler
 * {
 *  type: 'RadioButton',
 *  '[value]': 'isFoo',
 *  selectedValue: true
 * }
 * transpiling to
 * {
 *  type: 'RadioButton',
 *  '{isChecked}': 'isFoo is true',
 *  '(click)': 'set('isFoo', true)'
 * }
 */
export default () => ({
  before: props => {
    const value = props["[value]"];
    const selectedValueExpression = props.selectedValue
      ? props["{selectedValue}"]
      : toExpression(props.selectedValue);

    // omit values that don't need after compile
    const omittedProps = omit(props, [
      "[value]",
      "selectedValue",
      "{selectedValue}"
    ]);

    if (!value || !selectedValueExpression) {
      return omittedProps;
    }
    return {
      ...omittedProps,
      "{isChecked}": `${value} is ${selectedValueExpression}`,
      "(click)": `set('${value}', ${selectedValueExpression})`
    };
  }
});
