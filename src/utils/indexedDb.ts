import { Project, IncomingLetterReview, UserProfile } from '../types/contract';

const DB_NAME = 'ContractMind_Storage_v1';
const DB_VERSION = 1;

const STORES = {
  PROJECTS: 'projects',
  LETTERS: 'letters',
  METADATA: 'metadata'
} as const;

/**
 * Opens or initializes the native browser IndexedDB database.
 * IndexedDB provides gigabytes of persistent client-side storage,
 * completely eliminating the 5MB localStorage QuotaExceededError.
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.LETTERS)) {
        db.createObjectStore(STORES.LETTERS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Persists all projects (including full text, pages, and parsed clauses) to IndexedDB.
 */
export async function saveProjectsToDb(projects: Project[]): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.PROJECTS, 'readwrite');
      const store = tx.objectStore(STORES.PROJECTS);

      // Clear existing records and write current projects
      store.clear();
      for (const proj of projects) {
        store.put(proj);
      }

      tx.oncomplete = () => {
        resolve(true);
      };

      tx.onerror = () => {
        console.error('IndexedDB transaction error saving projects:', tx.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.error('saveProjectsToDb failed:', err);
    return false;
  }
}

/**
 * Loads all projects with full fidelity from IndexedDB.
 */
export async function loadProjectsFromDb(): Promise<Project[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.PROJECTS, 'readonly');
      const store = tx.objectStore(STORES.PROJECTS);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        resolve(Array.isArray(results) ? results : []);
      };

      request.onerror = () => {
        console.error('IndexedDB read error for projects:', request.error);
        resolve([]);
      };
    });
  } catch (err) {
    console.error('loadProjectsFromDb failed:', err);
    return [];
  }
}

/**
 * Persists letters / correspondence to IndexedDB.
 */
export async function saveLettersToDb(letters: IncomingLetterReview[]): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.LETTERS, 'readwrite');
      const store = tx.objectStore(STORES.LETTERS);

      store.clear();
      for (const letter of letters) {
        store.put(letter);
      }

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => {
        console.error('IndexedDB transaction error saving letters:', tx.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.error('saveLettersToDb failed:', err);
    return false;
  }
}

/**
 * Loads letters / correspondence from IndexedDB.
 */
export async function loadLettersFromDb(): Promise<IncomingLetterReview[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.LETTERS, 'readonly');
      const store = tx.objectStore(STORES.LETTERS);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        resolve(Array.isArray(results) ? results : []);
      };

      request.onerror = () => {
        console.error('IndexedDB read error for letters:', request.error);
        resolve([]);
      };
    });
  } catch (err) {
    console.error('loadLettersFromDb failed:', err);
    return [];
  }
}

/**
 * Saves arbitrary metadata (user profile, theme, etc.) into IndexedDB.
 */
export async function saveMetaToDb(key: string, value: any): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.METADATA, 'readwrite');
      const store = tx.objectStore(STORES.METADATA);
      store.put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Loads arbitrary metadata from IndexedDB.
 */
export async function loadMetaFromDb<T = any>(key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.METADATA, 'readonly');
      const store = tx.objectStore(STORES.METADATA);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
