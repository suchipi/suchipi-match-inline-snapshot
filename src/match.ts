import { getLocation } from "./get-location";
import { updateMatchSnapshotCall } from "./update";
import { validateConfig } from "./config";
import { diff } from "./diff";

import makeDebug from "debug";
const debug = makeDebug("@suchipi/test-snapshot:match");

export function matchInlineSnapshotInternal(
  actual: any,
  expected: string | undefined,
  forceUpdate: boolean,
): void {
  debug("matchInlineSnapshotInternal called");

  const config = validateConfig();

  const stackOffset = forceUpdate
    ? config.callStructures.forceUpdate.stackOffset
    : config.callStructures.normal.stackOffset;

  // We add `2` here because `matchInlineSnapshotInternal` gets called by `matchInlineSnapshot`.
  const callerLocation = getLocation(2 + stackOffset);
  if (callerLocation == null) {
    throw new Error(
      "Could not determine caller location for matchInlineSnapshot",
    );
  }

  debug("running snapshot serializers");
  actual = config.serializers.reduce(
    (prev, serializer) => serializer(prev),
    actual,
  );
  if (typeof actual !== "string") {
    actual = String(actual);
  }

  debug("comparing snapshot");
  let outcome: "new" | "pass" | "fail";
  if (typeof expected === "undefined") {
    outcome = "new";
  } else if (actual === expected) {
    outcome = "pass";
  } else {
    outcome = "fail";
  }

  debug("comparison result:", outcome);

  switch (outcome) {
    case "new": {
      if (config.shouldCreateNew) {
        if (config.isAllowedToChangeSnapshots) {
          debug("creating new snapshot");
          updateMatchSnapshotCall(callerLocation, actual, forceUpdate);
        }
      } else {
        throw new Error(
          "Attempting to create new snapshot, but config.shouldCreateNew was false.",
        );
      }
      break;
    }
    case "pass": {
      // It's equivalent, but we still call update in order to, for example,
      // change the second arg from a string literal to a template literal.
      if (config.isAllowedToChangeSnapshots) {
        debug("updating passing snapshot (in case that affects output)");
        updateMatchSnapshotCall(callerLocation, actual, forceUpdate);
      }
      break;
    }
    case "fail": {
      if (config.shouldUpdateOutdated || forceUpdate) {
        if (config.isAllowedToChangeSnapshots) {
          debug("updating failing snapshot");
          updateMatchSnapshotCall(callerLocation, actual, forceUpdate);
        }
      } else {
        const message = [
          "Received value didn't match snapshot.",
          "",
          diff(String(actual), String(expected)),
          "",
        ].join("\n");

        throw new Error(message);
      }
    }
  }
}
