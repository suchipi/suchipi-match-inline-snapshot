import { Path } from "nice-path";

export const rootDir = new Path(__dirname, "..", "..");
export const fixturesDir = rootDir.concat("test-fixtures");

const workDir = rootDir.concat("tests-workdir");
export function workDirForFile(filename: string) {
  return workDir.concat(new Path(filename).relativeTo(rootDir));
}
