import * as ee from "equivalent-exchange";
import { config } from "./config";

type File = {
  path: string;
  ast: ee.AST;
  /** UTF-8 */
  content: string;
};

const state = new Map<string, File>();

const eeOptions: ee.TransmuteOptions = {
  parseOptions: config.parserOptions,
  printOptions: {
    printMethod: "recast.print",
  },
};

export function getFile(fileName: string): File {
  if (state.has(fileName)) {
    return state.get(fileName)!;
  }

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
