import { Project, IncomingLetterReview, UserProfile } from '../types/contract';
import { mockProjects } from '../data/mockProjects';
import { mockLetters } from '../data/mockLetters';

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
 * Loads all projects from memory cache or persistent localStorage
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
 * Saves all projects to in-memory cache and persistent localStorage
 * Gracefully handles localStorage QuotaExceededError by keeping full fidelity in memory
 * and saving a clean payload to localStorage.
 */
export function saveProjects(projects: Project[]): boolean {
  inMemoryProjectsCache = projects;
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return true;
  } catch (err: any) {
    console.warn('LocalStorage quota exceeded or save error; applying compact persistence:', err);
    try {
      // Create a compact version for localStorage: keep clauses and page metadata, but cap rawText per document
      const compactProjects = projects.map(proj => ({
        ...proj,
        documents: proj.documents.map(doc => ({
          ...doc,
          rawText: doc.rawText && doc.rawText.length > 80000 
            ? doc.rawText.slice(0, 80000) + '... [Full text indexed in local memory]' 
            : doc.rawText,
          pages: doc.pages?.map(p => ({
            ...p,
            text: p.text.length > 15000 ? p.text.slice(0, 15000) + '...' : p.text
          }))
        }))
      }));

      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(compactProjects));
      return true;
    } catch (innerErr) {
      console.error('Failed even compact save to localStorage:', innerErr);
      return false;
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
 * Loads correspondence / letters from persistent localStorage
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
 * Saves correspondence / letters to persistent localStorage
 */
export function saveLetters(letters: IncomingLetterReview[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(letters));
    return true;
  } catch (err) {
    console.error('Failed to save letters to localStorage:', err);
    return false;
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
