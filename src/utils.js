import { TYPES, COMPATIBLE_SCHEMA_VERSION } from "./const";

export const hasKey = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key);

const semvarToArray = version => version.split(".");
const normalizeVersion = versions => versions.map(version => version.padStart(4, '0')).join('');

export const isVersionCompatible = version => {
  const versions = semvarToArray(version);
  if (versions.length !== 3) {
    throw new Error(`can't recognize your schema version: ${version}`);
  }

  const [min, max] = COMPATIBLE_SCHEMA_VERSION.map(semvarToArray);
  const versionStr = normalizeVersion(versions);
  const minStr = normalizeVersion(min);
  const maxStr = normalizeVersion(max);

  return versionStr >= minStr && versionStr <= maxStr;
};

export const createCallExpression = (callee, ...args) => ({
  type: TYPES.CallExpression,
  callee,
  arguments: args
});

export const createValue = value => {
  if (value === null) {
    return {
      type: TYPES.Null,
      value: null
    };
  }

  const type = typeof value;
  switch (type) {
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
    case "object":
      if (value instanceof RegExp) {
        return {
          type: TYPES.RegExp,
          pattern: value.source,
          flags: value.flags
        };
      }
  }
  throw new Error("un recognizable value");
};

export const createIdentifier = name => ({
  type: TYPES.Identifier,
  name
});

export const createProgram = (body, isProgram = true) => ({
  type: isProgram ? TYPES.Program : TYPES.BlockStatement,
  body: Array.isArray(body) ? body : [body]
});
