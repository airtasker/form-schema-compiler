import { TYPES, ANNOTATION_TYPES } from "./const";
import { isVersionCompatible } from "./utils";
import { COMPATIBLE_SCHEMA_VERSION } from "./const";

describe("utils", () => {
  it("Should compare version correctly", () => {
    COMPATIBLE_SCHEMA_VERSION[0] = '3.2.1';
    COMPATIBLE_SCHEMA_VERSION[1] = '3.14.5';
    expect(isVersionCompatible('3.2.1')).toBeTruthy();
    expect(isVersionCompatible('3.3.99')).toBeTruthy();
    expect(isVersionCompatible('3.14.5')).toBeTruthy();
    expect(isVersionCompatible('3.13.3')).toBeTruthy();
    expect(isVersionCompatible('3.2.0')).toBeFalsy();
    expect(isVersionCompatible('3.14.6')).toBeFalsy();
    expect(isVersionCompatible('3.15.3')).toBeFalsy();
    expect(isVersionCompatible('3.1.3')).toBeFalsy();
    expect(isVersionCompatible('4.3.3')).toBeFalsy();
    expect(isVersionCompatible('2.3.3')).toBeFalsy();
  });
});
