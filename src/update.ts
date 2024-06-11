import * as ee from "equivalent-exchange";
import { lineColumnToIndex } from "line-and-column-to-string-index";
import get from "lodash/get";
import set from "lodash/set";
import type { Loc } from "./get-location";
import { validateConfig } from "./config";
import { getFile, queueFlushState } from "./ast-state";
import { CallStructure } from "./call-structure";

import makeDebug from "debug";
const debug = makeDebug("@suchipi/match-inline-snapshot:update");

const EMPTY = Symbol("EMPTY");

export function updateMatchSnapshotCall(
  loc: Loc,
  serializedReceived: string,
  forceUpdate: boolean,
) {
  debug("updating", loc);

  const config = validateConfig();

  debug("reading", loc.fileName);
  const file = getFile(loc.fileName);

  const locIndex = lineColumnToIndex(
    file.content,
    loc.lineNumber - 1,
    loc.columnNumber,
  );

  let cs: CallStructure;
  if (forceUpdate) {
    debug("using forceUpdate CallStructure");
    cs = config.callStructures.forceUpdate;
  } else {
    debug("using normal CallStructure");
    cs = config.callStructures.normal;
  }

  let found = false;
  debug("traversing AST...");
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

      debug("found CallStructure");
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
          [ee.types.templateElement({ raw: serializedReceived })],
          [],
        ),
      );
    },
  });

  if (!found) {
    debug("never found CallStructure...");
    throw new Error(
      `Could not find match inline snapshot call at ${JSON.stringify(loc)}. If you've wrapped matchInlineSnapshot with a helper function, make sure to increment matchInlineSnapshot.config.callStructure.stackOffset.`,
    );
  }

  if (config.updateScheduling === "auto") {
    debug("queueing state flush");
    queueFlushState();
  } else {
    debug("not queueing state flush (manual mode)");
  }
}
