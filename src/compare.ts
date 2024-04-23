import dedent from "dedent";
import { Config, validateConfig } from "./config";
import { detectEOL } from "./detect-eol";

import makeDebug from "debug";
const debug = makeDebug("@suchipi/test-snapshot:compare");

export type Outcome = "new" | "pass" | "fail";

export function compare(
  rawReceivedValue: any,
  snapshot: string | undefined,
): { serializedReceived: string; outcome: Outcome } {
  debug("compare called");

  const config = validateConfig();

  debug("running snapshot serializers");
  let serializedReceived = config.serializers.reduce(
    (prev, serializer) => serializer(prev),
    rawReceivedValue,
  );
  if (typeof serializedReceived !== "string") {
    serializedReceived = String(serializedReceived);
  }

  let receivedToCompare = serializedReceived;
  let snapshotToCompare = snapshot || "";

  if (config.allowDifferingIndentation) {
    debug(
      "dedenting values before comparison (see matchInlineSnapshot.config.allowDifferingIndentation)",
    );
    receivedToCompare = normalizeIdentation(receivedToCompare);
    snapshotToCompare = normalizeIdentation(snapshotToCompare);
  }

  debug("comparing snapshot");
  let outcome: Outcome;
  if (typeof snapshot === "undefined") {
    outcome = "new";
  } else if (receivedToCompare === snapshotToCompare) {
    outcome = "pass";
  } else {
    outcome = "fail";
  }

  debug("comparison result:", outcome);

  return { serializedReceived, outcome };
}

function normalizeIdentation(serialized: string) {
  const eol = detectEOL(serialized);
  if (eol == null) {
    // If there was only one line, then indentation isn't relevant
    return serialized;
  }

  const hadLeadingEmptyLine = serialized.startsWith(eol);
  const hadTrailingEmptyLine = serialized.endsWith(eol);

  let valueToPassToDedent = serialized;
  if (!hadLeadingEmptyLine) {
    valueToPassToDedent = eol + valueToPassToDedent;
  }
  if (!hadTrailingEmptyLine) {
    valueToPassToDedent = valueToPassToDedent + eol;
  }

  return dedent(valueToPassToDedent);
}
