import { COMPATIBLE_SCHEMA_VERSION } from "./const";
export const hasKey = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key);

export const isVersionCompatible = version =>
  version >= COMPATIBLE_SCHEMA_VERSION[0] &&
  version <= COMPATIBLE_SCHEMA_VERSION[1];
