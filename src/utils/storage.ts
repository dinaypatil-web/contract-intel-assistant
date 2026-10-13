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

/**
 * Loads all projects from persistent localStorage
 */
export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load projects from localStorage:', err);
  }
  return mockProjects;
}

/**
 * Saves all projects to persistent localStorage
 */
export function saveProjects(projects: Project[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return true;
  } catch (err) {
    console.error('Failed to save projects to localStorage:', err);
    return false;
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
