import * as ee from "equivalent-exchange";
import { validateConfig } from "./config";

type File = {
  path: string;
  ast: ee.AST;
  /** UTF-8 */
  content: string;
};

const state = new Map<string, File>();

export function getFile(fileName: string): File {
  const config = validateConfig();

  if (state.has(fileName)) {
    return state.get(fileName)!;
  }

  const eeOptions: ee.TransmuteOptions = {
    parseOptions: config.parserOptions,
    printOptions: {
      printMethod: "recast.print",
    },
  };

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
  const config = validateConfig();

  const eeOptions: ee.TransmuteOptions = {
    parseOptions: config.parserOptions,
    printOptions: {
      printMethod: "recast.print",
    },
  };

  for (const [fileName, file] of state) {
    const result = ee.astToCode(file.ast, { ...eeOptions, fileName });
    config.fsDelegate.writeUtf8ToFile(fileName, result.code);
    state.delete(fileName);
  }
}

let queuedFlushState: NodeJS.Timeout | null = null;

export function queueFlushState() {
  if (queuedFlushState == null) {
    queuedFlushState = setTimeout(() => {
      queuedFlushState = null;
      flushState();
    }, 0);
  }
}
