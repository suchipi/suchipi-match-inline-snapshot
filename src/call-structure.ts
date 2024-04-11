import ee, { types as t } from "equivalent-exchange";

export type CallStructure = {
  /**
   * The AST structure which gets called (ie, the part of the code before the
   * call parens).
   *
   * By default, this is `{ type: "Identifier", name: "matchInlineSnapshot" }`.
   *
   * You can change this to make the snapshot update system target a different
   * code pattern.
   */
  callee: ee.types.Node;

  /**
   * Configuration options relating to the arguments passed to the match
   * snapshot call.
   */
  arguments: {
    /**
     * Constraints on the allowed number of arguments.
     */
    length: {
      /**
       * There must be at least this many arguments in the call.
       *
       * Defaults to `1`.
       */
      min: number;
      /**
       * There may be no more than this many arguments in the call.
       *
       * Defaults to `2`.
       */
      max: number;
    };

    /**
     * 0-based index of which argument contains the snapshot string that gets
     * programmatically updated.
     *
     * Defaults to `1` (ie the second argument).
     */
    snapshotIndex: number;
  };

  /**
   * How many call stack frames away the call-structure-to-update is from the
   * actual library `matchInlineSnapshot` call.
   *
   * If you wrap `matchInlineSnapshot` in a helper method, you'll need to
   * increase this number.
   *
   * Defaults to `0` (ie. the call-to-update is the same as the call to the library).
   */
  stackOffset: number;
};

export const defaultCallStructure: CallStructure = {
  callee: t.identifier("matchInlineSnapshot"),
  arguments: {
    length: { min: 1, max: 2 },
    snapshotIndex: 1,
  },
  stackOffset: 0,
};
