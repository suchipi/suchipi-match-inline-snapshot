matchInlineSnapshot(
  { a: true },
  `
Object {
  "a": false,
}
`,
);

matchInlineSnapshot(
  { b: true },
  `
Object {}
`,
);
