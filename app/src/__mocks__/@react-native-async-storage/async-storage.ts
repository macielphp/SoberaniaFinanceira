/**
 * Mock para @react-native-async-storage/async-storage
 */

const storage = new Map<string, string>();

export const getItem = jest.fn((key: string): Promise<string | null> => {
  return Promise.resolve(storage.get(key) || null);
});

export const setItem = jest.fn((key: string, value: string): Promise<void> => {
  storage.set(key, value);
  return Promise.resolve();
});

export const removeItem = jest.fn((key: string): Promise<void> => {
  storage.delete(key);
  return Promise.resolve();
});

export const clear = jest.fn((): Promise<void> => {
  storage.clear();
  return Promise.resolve();
});

export const getAllKeys = jest.fn((): Promise<string[]> => {
  return Promise.resolve(Array.from(storage.keys()));
});

export const multiGet = jest.fn((keys: string[]): Promise<[string, string | null][]> => {
  return Promise.resolve(keys.map(key => [key, storage.get(key) || null]));
});

export const multiSet = jest.fn((keyValuePairs: [string, string][]): Promise<void> => {
  keyValuePairs.forEach(([key, value]) => storage.set(key, value));
  return Promise.resolve();
});

export const multiRemove = jest.fn((keys: string[]): Promise<void> => {
  keys.forEach(key => storage.delete(key));
  return Promise.resolve();
});

export default {
  getItem,
  setItem,
  removeItem,
  clear,
  getAllKeys,
  multiGet,
  multiSet,
  multiRemove,
};
