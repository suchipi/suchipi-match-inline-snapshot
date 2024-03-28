import type { SourceMap } from "@suchipi/error-utils";
import type { matchInlineSnapshot } from "./match";
import { FsDelegate, defaultFsDelegate } from "./fs-delegate";

/** Global configuration for this library. */
export type Config = {
  /**
   * When snapshots don't match:
   * - If this value is `true`, then the snapshot will be changed to the
   *   provided data.
   * - Otherwise, {@link matchInlineSnapshot} will throw an error which
   *   describes the differences between the snapshot and the provided data.
   *
   * Defaults to **false**.
   *
   * Set this to `true` when you want to update your snapshots.
   */
  shouldUpdateOutdated: boolean;

  /**
   * When the second argument to matchSnapshot isn't present:
   * - If this value is `true`, the second argument will get filled in with the
   *   provided data.
   * - Otherwise, {@link matchInlineSnapshot} will throw an error.
   *
   * Defaults to **true**.
   *
   * You might want to set this to `false` in CI to disallow comitting empty
   * snapshots.
   */
  shouldCreateNew: boolean;

  /**
   * Whether {@link matchInlineSnapshot} is allowed to change snapshot content
   * at all, for any reason.
   *
   * Defaults to **true**.
   *
   * Setting this to `false` is kind of like a "dry run" mode.
   */
  isAllowedToChangeSnapshots: boolean;

  /**
   * An object whose methods will be called by {@link matchInlineSnapshot} in
   * order to read and write files on disk.
   *
   * The default implementation uses node's builtin module `fs`. You may swap it
   * for a different implementation as needed.
   */
  fsDelegate: FsDelegate;

  /**
   * Source maps which will be used to find the location of
   * `matchInlineSnapshot` calls.
   */
  sourceMaps: {
    [filename: string]: SourceMap;
  };
};

/**
 * Controls the behavior of {@link matchInlineSnapshot}. Change these properties
 * (ie. mutate this object) as needed.
 *
 * This config is global and can be changed on the fly.
 */
export const config: Config = {
  shouldUpdateOutdated: false,
  shouldCreateNew: true,
  isAllowedToChangeSnapshots: true,
  fsDelegate: defaultFsDelegate,
  sourceMaps: {},
};
