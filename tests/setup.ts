import "@testing-library/jest-dom";

// jsdom's localStorage is present but incompatible with Zustand persist.
// Replace it with a plain in-memory implementation for all tests.
const makeStorage = () => {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => { map.set(key, value); },
    removeItem: (key: string) => { map.delete(key); },
    clear: () => { map.clear(); },
    get length() { return map.size; },
    key: (index: number) => [...map.keys()][index] ?? null,
  };
};
Object.defineProperty(globalThis, "localStorage", { value: makeStorage(), writable: true });
