matchInlineSnapshot.config.callStructures.normal = {
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

globalThis.stuff = {
  match(snapshot, options, value = 5) {
    matchInlineSnapshot(value, snapshot);
  },
};
