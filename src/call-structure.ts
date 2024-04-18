export type CallStructure = {
  /**
   * The AST pattern which represents a match-inline-snapshot call.
   *
   * By default, this is:
   *
   * ```json
   * {
   *   type: "CallExpression",
   *   callee: {
   *     type: "Identifier",
   *     name: "matchInlineSnapshot"
   *   }
   * }
   * ```
   *
   * You can change this to make the snapshot update system target a different
   * code pattern.
   */
  astPattern: { [key: string]: any };

  /**
   * The property path to the snapshot node, starting from the
   * configured `astPattern`.
   *
   * By default, this is `["arguments", 1]`.
   *
   * This controls where the snapshot template literal string gets placed.
   */
  snapshotPath: Array<string | number>;

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
  astPattern: {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: "matchInlineSnapshot",
    },
  },
  snapshotPath: ["arguments", 1],
  stackOffset: 0,
};
