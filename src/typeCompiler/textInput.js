/**
 * text input compiler
 *
 * {
 *  type: 'TextInput',
 *  '[value]': 'foo'
 * }
 * transpiling to
 * {
 *  type: 'TextInput',
 *  '[value]': 'foo',
 *  '(change)': 'set('foo', eventValue)'
 * }
 */
export default () => ({
  before: (props) => {
    const value = props['[value]'];
    if (value) {
      // add change handle if there is a data binding value
      return {
        ...props,
        '(change)': `set('${value}', eventValue)`,
      };
    }
    return props;
  },
});
