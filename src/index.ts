import { config, Config } from "./config";
import type { FsDelegate } from "./fs-delegate";
import { matchInlineSnapshot as match } from "./match";

export type { Config, FsDelegate };

export const matchInlineSnapshot = Object.assign(match, {
  config,
});
