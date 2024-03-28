const { match, matchConfig } = require("..");

matchConfig.isCI = false;
matchConfig.shouldUpdate = true;

const myThing = `   fjdkfjdsl blah bdjk fjsdkf jdsklfds lfjkdsl fsdjl fwhatever fd`;

match(
  myThing,
  `   fjdkfjdsl blah bdjk fjsdkf jdsklfds lfjkdsl fsdjl fwhatever fd`,
);

// different one
match("two", `two`);
