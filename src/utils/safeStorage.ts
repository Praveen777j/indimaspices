/**
 * Safe wrapper around browser localStorage.
 * Prevents SecurityError / DOMException crashes in restricted environments
 * such as sandboxed iframes (e.g. Google AI Studio preview, cross-origin embeds, private browsing).
 */

const memoryStorage = new Map<string, string>();

function getLocalStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') {
      return null;
    }
    // Accessing window.localStorage in a sandboxed iframe may throw SecurityError / DOMException
    const storage = window.localStorage;
    if (!storage) {
      return null;
    }
    // Verification probe
    const probeKey = '__indima_safe_storage_probe__';
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return null;
  }
}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      const storage = getLocalStorage();
      if (storage) {
        const val = storage.getItem(key);
        if (val !== null) return val;
      }
    } catch {
      // Storage unavailable or blocked
    }
    return memoryStorage.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    try {
      const storage = getLocalStorage();
      if (storage) {
        storage.setItem(key, value);
      }
    } catch {
      // Silently fall back to memory
    }
    try {
      memoryStorage.set(key, value);
    } catch {
      // Ignore
    }
  },

  removeItem(key: string): void {
    try {
      const storage = getLocalStorage();
      if (storage) {
        storage.removeItem(key);
      }
    } catch {
      // Storage unavailable
    }
    try {
      memoryStorage.delete(key);
    } catch {
      // Ignore
    }
  },

  clear(): void {
    try {
      const storage = getLocalStorage();
      if (storage) {
        storage.clear();
      }
    } catch {
      // Storage unavailable
    }
    try {
      memoryStorage.clear();
    } catch {
      // Ignore
    }
  }
};
