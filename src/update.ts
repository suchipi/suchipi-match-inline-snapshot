import * as ee from "equivalent-exchange";
import { lineColumnToIndex } from "line-and-column-to-string-index";
import type { Loc } from "./get-location";
import { config } from "./config";
import { getFile, queueFlushState } from "./ast-state";

export function updateMatchSnapshotCall(loc: Loc, actual: string) {
  const cs = config.callStructure;

  const file = getFile(loc.fileName);

  const locIndex = lineColumnToIndex(
    file.content,
    loc.lineNumber - 1,
    loc.columnNumber,
  );

  let found = false;

  ee.traverse(file.ast, {
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
        !ee.hasShape(node, {
          callee: cs.callee,
        })
      ) {
        return;
      }

      if (
        node.arguments.length > cs.arguments.length.max ||
        node.arguments.length < cs.arguments.length.min
      ) {
        throw new Error(
          `Found match inline snapshot call with unexpected number of arguments. There must be between ${cs.arguments.length.min} and ${cs.arguments.length.max} arguments, but there were ${node.arguments.length} at the callsite`,
        );
      }

      found = true;
      node.arguments[cs.arguments.snapshotIndex] = ee.types.templateLiteral(
        [ee.types.templateElement({ raw: actual })],
        [],
      );
    },
  });

  if (!found) {
    throw new Error(
      `Could not find match inline snapshot call at ${JSON.stringify(loc)}. If you've wrapped matchInlineSnapshot with a helper function, make sure to increment matchInlineSnapshot.config.callStructure.stackOffset.`,
    );
  }

  if (config.updateScheduling === "auto") {
    queueFlushState();
  }
}
