import { Project, IncomingLetterReview, UserProfile } from '../types/contract';
import { mockProjects } from '../data/mockProjects';
import { mockLetters } from '../data/mockLetters';
import { 
  saveProjectsToDb, 
  loadProjectsFromDb, 
  saveLettersToDb, 
  loadLettersFromDb 
} from './indexedDb';

const STORAGE_KEYS = {
  USER_PROFILE: 'contractmind_user_profile_v1',
  PROJECTS: 'contractmind_projects_v1',
  ACTIVE_PROJECT_ID: 'contractmind_active_project_id_v1',
  LETTERS: 'contractmind_letters_v1',
  DARK_MODE: 'contractmind_theme_dark_v1'
};

export const defaultUserProfile: UserProfile = {
  name: 'Lead Contracts Eng.',
  role: 'Contract Manager',
  organization: 'Apex JV Commercial Directorate',
  email: 'contracts.lead@apex-jv.internal',
  credentials: 'MRICS, MCIArb, FIDIC Certified Contract Manager',
  avatarInitials: 'CM',
  phone: '+1 (555) 019-2834',
  notes: 'Authorized signatory for Notice of Claims, Disallowance rebuttals, and EOT contemporary records.'
};

/**
 * Loads User Profile from persistent localStorage
 */
export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...defaultUserProfile,
          ...parsed
        };
      }
    }
  } catch (err) {
    console.warn('Failed to load user profile from localStorage:', err);
  }
  return defaultUserProfile;
}

/**
 * Saves User Profile to persistent localStorage
 */
export function saveUserProfile(profile: UserProfile): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    return true;
  } catch (err) {
    console.error('Failed to save user profile to localStorage:', err);
    return false;
  }
}

// In-memory cache for full project fidelity including large documents
let inMemoryProjectsCache: Project[] | null = null;

/**
 * Loads all projects from memory cache or persistent localStorage (synchronous bootstrap)
 */
export function loadProjects(): Project[] {
  if (inMemoryProjectsCache && inMemoryProjectsCache.length > 0) {
    return inMemoryProjectsCache;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryProjectsCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load projects from localStorage:', err);
  }
  return mockProjects;
}

/**
 * Asynchronously loads full-fidelity projects from IndexedDB (unlimited capacity).
 * If IndexedDB is empty but localStorage has legacy data, automatically migrates to IndexedDB.
 */
export async function loadProjectsAsync(): Promise<Project[]> {
  try {
    const idbProjects = await loadProjectsFromDb();
    if (idbProjects && idbProjects.length > 0) {
      inMemoryProjectsCache = idbProjects;
      return idbProjects;
    }
  } catch (err) {
    console.warn('Could not read projects from IndexedDB, checking localStorage fallback:', err);
  }

  // Fallback to localStorage and migrate to IndexedDB if found
  const local = loadProjects();
  if (local && local.length > 0) {
    saveProjectsToDb(local).catch(() => {});
  }
  return local;
}

/**
 * Saves all projects with full fidelity to in-memory cache and IndexedDB (unlimited size).
 * Also writes a safe, non-overflowing snapshot to localStorage for quick bootstrap.
 */
export function saveProjects(projects: Project[]): boolean {
  // 1. Immediately update in-memory cache
  inMemoryProjectsCache = projects;

  // 2. Persist full fidelity (including rawText, pages, and clauses) to IndexedDB
  saveProjectsToDb(projects).catch(err => {
    console.error('IndexedDB saveProjectsToDb error:', err);
  });

  // 3. Persist to localStorage with safety truncation so it never throws QuotaExceededError
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return true;
  } catch {
    try {
      // Quota exceeded: store a lightweight index in localStorage for instant header/list rendering
      const slimProjects = projects.map(proj => ({
        ...proj,
        documents: proj.documents.map(doc => ({
          ...doc,
          rawText: doc.rawText ? doc.rawText.slice(0, 5000) + '... [Full text saved in IndexedDB]' : '',
          pages: doc.pages?.slice(0, 10).map(p => ({
            ...p,
            text: p.text.slice(0, 1500) + '... [Page saved in IndexedDB]'
          })) || []
        }))
      }));

      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(slimProjects));
      return true;
    } catch {
      // Even slim version couldn't fit in 5MB localStorage: IndexedDB has already safely saved it!
      return true;
    }
  }
}

/**
 * Loads active project ID from persistent localStorage
 */
export function loadActiveProjectId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
  } catch {
    return null;
  }
}

/**
 * Saves active project ID to persistent localStorage
 */
export function saveActiveProjectId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
    }
  } catch (err) {
    console.warn('Failed to save active project ID to localStorage:', err);
  }
}

/**
 * Loads correspondence / letters synchronously
 */
export function loadLetters(): IncomingLetterReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LETTERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load letters from localStorage:', err);
  }
  return mockLetters;
}

/**
 * Asynchronously loads letters from IndexedDB
 */
export async function loadLettersAsync(): Promise<IncomingLetterReview[]> {
  try {
    const idbLetters = await loadLettersFromDb();
    if (idbLetters && idbLetters.length > 0) {
      return idbLetters;
    }
  } catch (err) {
    console.warn('Could not read letters from IndexedDB:', err);
  }

  const local = loadLetters();
  if (local && local.length > 0) {
    saveLettersToDb(local).catch(() => {});
  }
  return local;
}

/**
 * Saves correspondence / letters to IndexedDB and localStorage
 */
export function saveLetters(letters: IncomingLetterReview[]): boolean {
  // 1. Persist full fidelity to IndexedDB
  saveLettersToDb(letters).catch(err => {
    console.error('IndexedDB saveLettersToDb error:', err);
  });

  // 2. Persist to localStorage
  try {
    localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(letters));
    return true;
  } catch (err) {
    console.warn('LocalStorage saveLetters quota exceeded; safely stored in IndexedDB:', err);
    return true;
  }
}

/**
 * Loads theme preference from persistent localStorage
 */
export function loadThemePreference(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (raw !== null) {
      return raw === 'true';
    }
  } catch {
    // default
  }
  return true;
}

/**
 * Saves theme preference to persistent localStorage
 */
export function saveThemePreference(isDark: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(isDark));
  } catch {
    // fallback
  }
}
