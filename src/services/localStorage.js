export const LocalStorage = {
  get: (key, defaultValue = null) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage`, error);
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage`, error);
    }
  },
  remove: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage`, error);
    }
  },
  clear: () => {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }
};
