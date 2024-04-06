import type { SourceMap } from "@suchipi/error-utils";

const storage = new Map<string, SourceMap>();

export const changeMaps = {
  get(fileName: string): SourceMap | null {
    console.log("changeMaps.get", { fileName });
    return storage.get(fileName) || null;
  },

  insert(fileName: string, map: SourceMap) {
    console.log("changeMaps.insert", { fileName, map });
    storage.set(fileName, map);
  },

  clearAll() {
    storage.clear();
  },
};
