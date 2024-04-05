import type { SourceMap } from "@suchipi/error-utils";

const storage = new Map<string, SourceMap>();

export const changeMaps = {
  get(filename: string): SourceMap | null {
    return storage.get(filename) || null;
  },

  insert(filename: string, map: SourceMap) {
    storage.set(filename, map);
  },

  clearAll() {
    storage.clear();
  },
};
