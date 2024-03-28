import { getLocation } from "./get-location";
import { updateMatchSnapshotCall } from "./update";
import { config } from "./config";

export function matchInlineSnapshot(
  actual: string,
  expected?: string | undefined,
): void {
  const callerLocation = getLocation(1);
  if (callerLocation == null) {
    throw new Error("Could not determine caller location");
  }

  let outcome: "new" | "pass" | "fail";
  if (typeof expected === "undefined") {
    outcome = "new";
  } else if (actual === expected) {
    outcome = "pass";
  } else {
    outcome = "fail";
  }

  switch (outcome) {
    case "new": {
      if (config.shouldCreateNew) {
        if (config.isAllowedToChangeSnapshots) {
          updateMatchSnapshotCall(callerLocation, actual);
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
        updateMatchSnapshotCall(callerLocation, actual);
      }
      break;
    }
    case "fail": {
      if (config.shouldUpdateOutdated) {
        if (config.isAllowedToChangeSnapshots) {
          updateMatchSnapshotCall(callerLocation, actual);
        }
      } else {
        const message = [
          "Snapshots didn't match.",
          "",
          "Expected:",
          expected,
          "",
          "Actual:",
          actual,
        ].join("\n");
        throw new Error(message);
      }
    }
  }
}
