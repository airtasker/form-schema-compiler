import { COMPATIBLE_SCHEMA_VERSION } from "./const";
export const hasKey = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key);

const semvarToArray = version => version.split(".").map(Number);

export const isVersionCompatible = version => {
  const versions = semvarToArray(version);
  if (versions.length !== 3) {
    throw new Error(`can't recognize your schema version: ${version}`);
  }

  const [min, max] = COMPATIBLE_SCHEMA_VERSION.map(semvarToArray);

  return versions.every((v, i) => v >= min[i] && v <= max[i]);
};
