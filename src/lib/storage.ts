const STORAGE_KEY = "harbor-check-progress-v1";
const SETTINGS_KEY = "harbor-check-settings-v1";
const META_KEY = "harbor-check-meta-v1";

export type ProgressMap = Record<string, boolean>;

export type AppSettings = {
  spoilerBlur: boolean;
  spoilerMaxTierVisible: 1 | 2 | 3;
  /** Per-item temporary peeks while blur is on */
  peekedIds: string[];
  lastCategoryId: string | null;
  hideCompleted: boolean;
};

export type StorageFailReason = "unavailable" | "quota" | "unknown";

export type StorageWriteResult =
  | { ok: true }
  | { ok: false; reason: StorageFailReason };

export type StorageHealth = {
  available: boolean;
  lastError: StorageFailReason | null;
  lastSavedAt: string | null;
};

export const DEFAULT_SETTINGS: AppSettings = {
  spoilerBlur: true,
  spoilerMaxTierVisible: 1,
  peekedIds: [],
  lastCategoryId: null,
  hideCompleted: false,
};

function canUseStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "__harbor_check_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function writeJson(key: string, value: unknown): StorageWriteResult {
  if (!canUseStorage()) return { ok: false, reason: "unavailable" };
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.localStorage.setItem(
      META_KEY,
      JSON.stringify({ lastSavedAt: new Date().toISOString() })
    );
    return { ok: true };
  } catch (error) {
    const quota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        error.code === 22);
    return { ok: false, reason: quota ? "quota" : "unknown" };
  }
}

function readMeta(): { lastSavedAt: string | null } {
  if (!canUseStorage()) return { lastSavedAt: null };
  try {
    const raw = window.localStorage.getItem(META_KEY);
    if (!raw) return { lastSavedAt: null };
    const parsed = JSON.parse(raw) as { lastSavedAt?: string };
    return {
      lastSavedAt:
        typeof parsed.lastSavedAt === "string" ? parsed.lastSavedAt : null,
    };
  } catch {
    return { lastSavedAt: null };
  }
}

export function getStorageHealth(
  lastError: StorageFailReason | null = null
): StorageHealth {
  return {
    available: canUseStorage(),
    lastError,
    lastSavedAt: readMeta().lastSavedAt,
  };
}

export function loadProgress(): ProgressMap {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressMap;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const cleaned: ProgressMap = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (typeof value === "boolean") cleaned[id] = value;
    }
    return cleaned;
  } catch {
    return {};
  }
}

export function saveProgress(progress: ProgressMap): StorageWriteResult {
  return writeJson(STORAGE_KEY, progress);
}

export function loadSettings(): AppSettings {
  if (!canUseStorage()) return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const peekedIds = Array.isArray(parsed.peekedIds)
      ? parsed.peekedIds.filter((id): id is string => typeof id === "string")
      : DEFAULT_SETTINGS.peekedIds;
    return {
      spoilerBlur:
        typeof parsed.spoilerBlur === "boolean"
          ? parsed.spoilerBlur
          : DEFAULT_SETTINGS.spoilerBlur,
      spoilerMaxTierVisible:
        parsed.spoilerMaxTierVisible === 1 ||
        parsed.spoilerMaxTierVisible === 2 ||
        parsed.spoilerMaxTierVisible === 3
          ? parsed.spoilerMaxTierVisible
          : DEFAULT_SETTINGS.spoilerMaxTierVisible,
      peekedIds,
      lastCategoryId:
        typeof parsed.lastCategoryId === "string" || parsed.lastCategoryId === null
          ? parsed.lastCategoryId ?? null
          : DEFAULT_SETTINGS.lastCategoryId,
      hideCompleted:
        typeof parsed.hideCompleted === "boolean"
          ? parsed.hideCompleted
          : DEFAULT_SETTINGS.hideCompleted,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): StorageWriteResult {
  return writeJson(SETTINGS_KEY, settings);
}

export type BackupPayload = {
  version: 1;
  exportedAt: string;
  progress: ProgressMap;
  settings: AppSettings;
};

export function exportBackup(
  progress: ProgressMap,
  settings: AppSettings
): BackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    progress,
    settings,
  };
}

export function parseBackup(raw: string): BackupPayload | null {
  try {
    const parsed = JSON.parse(raw) as Partial<BackupPayload>;
    if (parsed.version !== 1 || !parsed.progress || !parsed.settings) return null;
    const progress = loadProgressFromUnknown(parsed.progress);
    const settings = {
      ...DEFAULT_SETTINGS,
      ...loadSettingsFromUnknown(parsed.settings),
    };
    return {
      version: 1,
      exportedAt:
        typeof parsed.exportedAt === "string"
          ? parsed.exportedAt
          : new Date().toISOString(),
      progress,
      settings,
    };
  } catch {
    return null;
  }
}

function loadProgressFromUnknown(value: unknown): ProgressMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const cleaned: ProgressMap = {};
  for (const [id, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === "boolean") cleaned[id] = entry;
  }
  return cleaned;
}

function loadSettingsFromUnknown(value: unknown): Partial<AppSettings> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Partial<AppSettings>;
}
