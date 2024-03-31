const { matchInlineSnapshot } = require("..");

matchInlineSnapshot.config.shouldUpdateOutdated = true;

const myThing = `   fjdkfjdsl blah bdjk fdfjklsdfj dsfsl
df


dsfjksdjsdkf jdsklfds lfjkdsl fsdjl fwhatever fd`;

matchInlineSnapshot(
  myThing,
  `
"   fjdkfjdsl blah bdjk fdfjklsdfj dsfsl
df


dsfjksdjsdkf jdsklfds lfjkdsl fsdjl fwhatever fd"
`,
);

{
  {
    {
      // different one
      matchInlineSnapshot("two", `"two"`);
    }
  }
}
