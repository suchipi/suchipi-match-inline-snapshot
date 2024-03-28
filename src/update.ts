import * as fs from "node:fs";
import * as ee from "equivalent-exchange";
import { lineColumnToIndex } from "line-and-column-to-string-index";
import type { Loc } from "./get-location";

const ACCEPTABLE_ARGUMENT_LENGTHS = new Set([1, 2]);

export function update(loc: Loc, actual: string) {
  const code = fs.readFileSync(loc.fileName, "utf-8");
  const locIndex = lineColumnToIndex(
    code,
    loc.lineNumber - 1,
    loc.columnNumber - 1,
  );

  const ast = ee.codeToAst(code);
  let found = false;

  ee.traverse(ast, {
    CallExpression(nodePath) {
      const node = nodePath.node;

      const nodeStart = node.loc!.start.index;
      const nodeEnd = node.loc!.end.index;

      if (locIndex > nodeEnd) {
        return;
      }

      if (locIndex < nodeStart) {
        return;
      }

      if (
        ee.hasShape(node, {
          callee: {
            type: "Identifier",
            name: "match",
          },
        })
      ) {
        if (!ACCEPTABLE_ARGUMENT_LENGTHS.has(node.arguments.length)) {
          return;
        }
      }

      found = true;
      node.arguments[1] = ee.types.templateLiteral(
        [ee.types.templateElement({ raw: actual })],
        [],
      );
    },
  });

  if (!found) {
    throw new Error(`Could not find 'match' call at ${JSON.stringify(loc)}`);
  }

  const newCode = ee.astToCode(ast).code;

  if (code !== newCode) {
    fs.writeFileSync(loc.fileName, newCode);
  }
}
