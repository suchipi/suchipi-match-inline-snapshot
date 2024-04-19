matchInlineSnapshot.config.callStructure = {
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
  stackOffset: 1,
};

globalThis.expect = (actual) => {
  return {
    toMatchInlineSnapshot(snapshot) {
      matchInlineSnapshot(actual, snapshot);
    },
  };
};
