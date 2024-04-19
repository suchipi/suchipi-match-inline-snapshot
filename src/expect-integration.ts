import type { CallStructure } from "./call-structure";

// Integration with jest's "expect" package

const expectCallStructure: CallStructure = {
  astPattern: {
    type: "CallExpression",
    callee: {
      type: "MemberExpression",
      object: {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: "expect",
        },
      },
      property: {
        type: "Identifier",
        name: "toMatchInlineSnapshot",
      },
    },
  },
  snapshotPath: ["arguments", 0],
  // Note: offset may vary depending on version of `expect` package...
  stackOffset: 3,
};

export function installExpectIntegration(
  expect: typeof import("expect").expect,
  matchInlineSnapshot: typeof import(".").matchInlineSnapshot,
) {
  matchInlineSnapshot.config.callStructure = expectCallStructure;

  expect.extend({
    toMatchInlineSnapshot(actual, snapshot) {
      try {
        matchInlineSnapshot(actual, snapshot);
      } catch (err: any) {
        return {
          message: () => err.message,
          pass: false,
        };
      }
      return { message: () => "Snapshot matched", pass: true };
    },
  });

  (expect as any).addSnapshotSerializer = () => {
    throw new Error(
      "Modify matchInlineSnapshot.config.serializers instead of calling expect.addSnapshotSerializer",
    );
  };
}
