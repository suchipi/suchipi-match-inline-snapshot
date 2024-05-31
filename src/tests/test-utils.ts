import { Path } from "nice-path";
import { diffStringsUnified } from "jest-diff";

export const rootDir = new Path(__dirname, "..", "..").normalize();
export const fixturesDir = rootDir.concat("test-fixtures");
export const workDirs = rootDir.concat("test-workdirs");

const identity = <T>(val: T) => val;

export function diffStrings(namedStrings: { [key: string]: string }) {
  const names: Array<string> = [];
  const values: Array<string> = [];

  let i = 0;
  for (const key in namedStrings) {
    if (Object.hasOwn(namedStrings, key)) {
      if (i < 2) {
        names.push(key);
        values.push(namedStrings[key]);
        i++;
      } else {
        break;
      }
    }
  }

  return diffStringsUnified(values[0], values[1], {
    aAnnotation: names[0],
    bAnnotation: names[1],
    aColor: identity,
    bColor: identity,
    changeColor: identity,
    commonColor: identity,
    changeLineTrailingSpaceColor: identity,
    commonLineTrailingSpaceColor: identity,
    patchColor: identity,
  });
}
