// new
matchInlineSnapshot({ a: true });

// outdated
matchInlineSnapshot(
  { b: true },
  `
Object {}
`,
);

// up-to-date
matchInlineSnapshot(
  { c: false },
  `
Object {
  c: false,
}
`,
);
