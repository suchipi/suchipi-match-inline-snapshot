const { matchInlineSnapshot } = require("..");

matchInlineSnapshot(
  { a: true },
  `
Object {
  "a": false,
}
`,
);
