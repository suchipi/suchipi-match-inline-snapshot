import * as ee from "equivalent-exchange";
import { lineColumnToIndex } from "line-and-column-to-string-index";
import get from "lodash/get";
import set from "lodash/set";
import type { Loc } from "./get-location";
import { validateConfig } from "./config";
import { getFile, queueFlushState } from "./ast-state";

const EMPTY = Symbol("EMPTY");

export function updateMatchSnapshotCall(loc: Loc, actual: string) {
  const config = validateConfig();

  const file = getFile(loc.fileName);

  const locIndex = lineColumnToIndex(
    file.content,
    loc.lineNumber - 1,
    loc.columnNumber,
  );

  const cs = config.callStructure;

  let found = false;
  ee.traverse(file.ast, {
    enter(nodePath) {
      const node = nodePath.node;

      const nodeStart = node.loc?.start.index;
      const nodeEnd = node.loc?.end.index;

      if (
        nodeStart == null ||
        nodeEnd == null ||
        locIndex > nodeEnd ||
        locIndex < nodeStart
      ) {
        return;
      }

      if (!ee.hasShape(node, cs.astPattern)) {
        return;
      }

      found = true;

      const snapshotParentOrArray = get(
        node,
        cs.snapshotPath.slice(0, -1),
        EMPTY,
      );
      if (snapshotParentOrArray === EMPTY) {
        throw new Error(
          `Attempting to insert snapshot into AST at path ${cs.snapshotPath.join(".")}, but one or more of the intermediate objects along that path was null or undefined. Please verify that matchInlineSnapshot.config.callStructure is correct.`,
        );
      }

      set(
        node,
        cs.snapshotPath,
        ee.types.templateLiteral(
          [ee.types.templateElement({ raw: actual })],
          [],
        ),
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
