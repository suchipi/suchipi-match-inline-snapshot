import { Path } from "nice-path";

export const rootDir = new Path(__dirname, "..", "..");
export const fixturesDir = rootDir.concat("test-fixtures");
export const workDirs = rootDir.concat("test-workdirs");
