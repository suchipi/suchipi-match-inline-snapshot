import { __configRaw, Config } from "./config";
import type { FsDelegate } from "./fs-delegate";
import type { CallStructure } from "./call-structure";
import { matchInlineSnapshotInternal } from "./match";
import { flushState } from "./ast-state";
export { installExpectIntegration } from "./expect-integration";

export type { Config, FsDelegate, CallStructure };

export const matchInlineSnapshot = Object.assign(
  function matchInlineSnapshot(received: any, snapshot?: string | undefined) {
    matchInlineSnapshotInternal(received, snapshot, false);
  },
  {
    /**
     * Updates the corresponding inline snapshot. Change `matchInlineSnapshot`
     * to `matchInlineSnapshot.u` in your editor to quickly update inline
     * snapshots.
     */
    u: function updateInlineSnapshot(
      received: any,
      snapshot?: string | undefined,
    ) {
      matchInlineSnapshotInternal(received, snapshot, true);
    },

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
  },
);
