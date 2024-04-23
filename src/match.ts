import { getLocation } from "./get-location";
import { updateMatchSnapshotCall } from "./update";
import { validateConfig } from "./config";
import { diff } from "./diff";
import { compare } from "./compare";

import makeDebug from "debug";
const debug = makeDebug("@suchipi/test-snapshot:match");

export function matchInlineSnapshotInternal(
  rawReceivedValue: any,
  snapshot: string | undefined,
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

  const { serializedReceived, outcome } = compare(rawReceivedValue, snapshot);

  switch (outcome) {
    case "new": {
      if (config.shouldCreateNew) {
        if (config.isAllowedToChangeSnapshots) {
          debug("creating new snapshot");
          updateMatchSnapshotCall(
            callerLocation,
            serializedReceived,
            forceUpdate,
          );
        }
      } else {
        throw new Error(
          "Attempting to create new snapshot, but config.shouldCreateNew was false.",
        );
      }
      break;
    }
    case "pass": {
      // Nothing to do
      break;
    }
    case "fail": {
      if (config.shouldUpdateOutdated || forceUpdate) {
        if (config.isAllowedToChangeSnapshots) {
          debug("updating failing snapshot");
          updateMatchSnapshotCall(
            callerLocation,
            serializedReceived,
            forceUpdate,
          );
        }
      } else {
        const message = [
          "Received value didn't match snapshot.",
          "",
          diff(String(serializedReceived), String(snapshot)),
          "",
        ].join("\n");

        throw new Error(message);
      }
    }
  }
}
