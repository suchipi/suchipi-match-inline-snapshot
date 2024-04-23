import * as ee from "equivalent-exchange";
import { Config, validateConfig } from "./config";

import makeDebug from "debug";
const debug = makeDebug("@suchipi/test-snapshot:ast-state");

type File = {
  path: string;
  ast: ee.AST;
  /** UTF-8 */
  content: string;
};

const state = new Map<string, File>();

export function getFile(fileName: string): File {
  debug("opening file", fileName);

  const config = validateConfig();

  if (state.has(fileName)) {
    return state.get(fileName)!;
  }

  const eeOptions = getTransmuteOptions(config);

  const content = config.fsDelegate.readFileAsUtf8(fileName);
  const ast = ee.codeToAst(content, { ...eeOptions, fileName });

  const file: File = {
    path: fileName,
    ast,
    content,
  };

  state.set(fileName, file);
  return file;
}

export function flushState() {
  debug("flushing state");

  const config = validateConfig();
  const eeOptions = getTransmuteOptions(config);

  for (const [fileName, file] of state) {
    debug("flushing state for", fileName);

    const result = ee.astToCode(file.ast, { ...eeOptions, fileName });
    const existingCode = config.fsDelegate.readFileAsUtf8(fileName);
    if (existingCode !== result.code) {
      config.fsDelegate.writeUtf8ToFile(fileName, result.code);
    }
    state.delete(fileName);
  }
}

let queuedFlushState: NodeJS.Timeout | null = null;

export function queueFlushState() {
  if (queuedFlushState == null) {
    debug("queueing state flush");
    queuedFlushState = setTimeout(() => {
      queuedFlushState = null;
      flushState();
    }, 0);
  } else {
    debug("state flush already queued; skipping");
  }
}

function getTransmuteOptions(config: Config): ee.TransmuteOptions {
  return {
    parseOptions: config.parserOptions,
    printOptions: {
      printMethod: "recast.print",
    },
  };
}
