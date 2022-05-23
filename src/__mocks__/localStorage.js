export const localStorageMock = (function () {
  let store = {};
  return {
    getItem(key) {
      return JSON.stringify(store[key]);
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
    removeItem(key) {
      delete store[key];
    },
  };
})();
