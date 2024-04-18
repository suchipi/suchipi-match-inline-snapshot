matchInlineSnapshot.config.callStructure = {
  astPattern: {
    type: "CallExpression",
    callee: {
      type: "MemberExpression",
      object: {
        type: "Identifier",
        name: "stuff",
      },
      property: {
        type: "Identifier",
        name: "match",
      },
    },
  },
  snapshotPath: ["arguments", 0],
  stackOffset: 1,
};
