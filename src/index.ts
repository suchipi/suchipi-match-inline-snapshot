import { __configRaw, Config } from "./config";
import type { FsDelegate } from "./fs-delegate";
import { matchInlineSnapshot as match } from "./match";
import { flushState } from "./ast-state";
export { installExpectIntegration } from "./expect-integration";

export type { Config, FsDelegate };

export const matchInlineSnapshot = Object.assign(match, {
  /**
   * You may freely mutate this config object at any point during the lifetime
   * of your program. Changes will affect all subsequent calls to
   * `matchInlineSnapshot`.
   */
  config: __configRaw,
  /**
   * When `config.updateScheduling` is set to "manual", call this function to
   * write updates to disk.
   */
  flushUpdates() {
    flushState();
  },
});
