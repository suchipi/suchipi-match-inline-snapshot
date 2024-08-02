import * as t from "pheno";

export type Options = {
  tabSize: number;
  output: "tabs" | "spaces";
};

const t_Options = t.objectWithProperties({
  tabSize: t.integer,
  output: t.or(t.exactString("tabs"), t.exactString("spaces")),
}) satisfies t.TypeValidator<Options>;

export function normalizeIndentation(input: string, options: Options): string {
  t.assertType(input, t.string);
  t.assertType(options, t_Options);

  const lines = input.split("\n");

  const linesWithTabsConverted = lines.map((line) => {
    if (line.startsWith("\t")) {
      return line.replace(/^\t+/, (tabs) => {
        return " ".repeat(tabs.length * options.tabSize);
      });
    } else {
      return line;
    }
  });

  const nonEmptyLines = linesWithTabsConverted.filter((line) => line.trim());

  let shortestLeadingSpaces = Infinity;
  for (const line of nonEmptyLines) {
    const matches = line.match(/^ +/);
    if (matches) {
      const spacesCount = matches["0"].length;
      if (shortestLeadingSpaces > spacesCount) {
        shortestLeadingSpaces = spacesCount;
      }
    } else {
      shortestLeadingSpaces = 0;
      break;
    }
  }

  if (shortestLeadingSpaces === Infinity) {
    shortestLeadingSpaces = 0;
  }

  const linesWithIndentationTrimmed = linesWithTabsConverted.map((line) => {
    if (line.startsWith(" ")) {
      return line.slice(shortestLeadingSpaces);
    } else {
      return line;
    }
  });

  switch (options.output) {
    case "tabs": {
      return linesWithIndentationTrimmed
        .map((line) => {
          return line.replace(
            new RegExp(`^(?: {${options.tabSize}})+`),
            (match) => {
              return "\t".repeat(match.length / options.tabSize);
            },
          );
        })
        .join("\n");
    }
    case "spaces": {
      return linesWithIndentationTrimmed.join("\n");
    }
    default: {
      throw new Error("Unexpected options.output value: " + options.output);
    }
  }
}

/**
 * Returns number of space or tab characters (depending on `options`) that the
 * source is equivalent to. `source` must only contain tabs or spaces.
 */
export function measureIndentation(
  sourceIndent: string,
  options: Options,
): number {
  const asSpaces = sourceIndent.replace(/\t/g, " ".repeat(options.tabSize));
  const len = asSpaces.length;
  const extra = len % options.tabSize;
  const total = len - extra;
  return total;
}

// Prepend every line in `source` with `indent`.
export function addIndent(
  source: string,
  indent: string,
  skipFirst: boolean = false,
): string {
  return source
    .split("\n")
    .map((line, index) => {
      if (index === 0 && skipFirst) {
        return line;
      } else {
        return indent + line;
      }
    })
    .join("\n");
}
