import * as ee from "equivalent-exchange";
import { lineColumnToIndex } from "line-and-column-to-string-index";
import type { Loc } from "./get-location";
import { config } from "./config";

const MATCH_SNAPSHOT_FUNCTION_NAME = "matchInlineSnapshot";
const ACCEPTABLE_ARGUMENT_LENGTHS = new Set([1, 2]);
const ACTUAL_ARG_INDEX = 0;
const EXPECTED_ARG_INDEX = 1;

export function updateMatchSnapshotCall(loc: Loc, actual: string) {
  const code = config.fsDelegate.readFileAsUtf8(loc.fileName);
  const locIndex = lineColumnToIndex(
    code,
    loc.lineNumber - 1,
    loc.columnNumber,
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
            name: MATCH_SNAPSHOT_FUNCTION_NAME,
          },
        })
      ) {
        if (!ACCEPTABLE_ARGUMENT_LENGTHS.has(node.arguments.length)) {
          throw new Error(
            `Found 'match' call with unexpected number of arguments. Acceptable arguments lengths are: ${Array.from(ACCEPTABLE_ARGUMENT_LENGTHS.values()).join(", ")}`,
          );
        }
      }

      found = true;
      node.arguments[EXPECTED_ARG_INDEX] = ee.types.templateLiteral(
        [ee.types.templateElement({ raw: actual })],
        [],
      );
    },
  });

  if (!found) {
    throw new Error(
      `Could not find ${JSON.stringify(MATCH_SNAPSHOT_FUNCTION_NAME)} call at ${JSON.stringify(loc)}`,
    );
  }

  const newCode = ee.astToCode(ast).code;

  if (code !== newCode) {
    config.fsDelegate.writeUtf8ToFile(loc.fileName, newCode);
  }
}
