const STORAGE_KEY = "harbor-check-progress-v1";
const SETTINGS_KEY = "harbor-check-settings-v1";
const LABELS_KEY = "harbor-check-labels-v1";
const META_KEY = "harbor-check-meta-v1";

export type ProgressMap = Record<string, boolean>;
export type CustomLabelsMap = Record<string, string>;

export type AppSettings = {
  spoilerBlur: boolean;
  spoilerMaxTierVisible: 1 | 2 | 3;
  /** Per-item temporary peeks while blur is on */
  peekedIds: string[];
  lastCategoryId: string | null;
  hideCompleted: boolean;
  /** Dismissed first-run tip */
  tipDismissed: boolean;
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
  tipDismissed: false,
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

export function loadCustomLabels(): CustomLabelsMap {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(LABELS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CustomLabelsMap;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const cleaned: CustomLabelsMap = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (typeof value === "string") {
        const trimmed = value.trim().slice(0, 120);
        if (trimmed) cleaned[id] = trimmed;
      }
    }
    return cleaned;
  } catch {
    return {};
  }
}

export function saveCustomLabels(labels: CustomLabelsMap): StorageWriteResult {
  return writeJson(LABELS_KEY, labels);
}

export function loadSettings(): AppSettings {
  if (!canUseStorage()) return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...normalizeSettings(parsed),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): StorageWriteResult {
  return writeJson(SETTINGS_KEY, settings);
}

export type BackupPayload = {
  version: 1 | 2;
  exportedAt: string;
  progress: ProgressMap;
  settings: AppSettings;
  customLabels: CustomLabelsMap;
};

export function exportBackup(
  progress: ProgressMap,
  settings: AppSettings,
  customLabels: CustomLabelsMap
): BackupPayload {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    progress,
    settings,
    customLabels,
  };
}

export function exportCsv(
  rows: Array<{ category: string; id: string; label: string; done: boolean; tier: string }>
): string {
  const header = "category,id,label,done,tier";
  const lines = rows.map((row) =>
    [
      csvEscape(row.category),
      csvEscape(row.id),
      csvEscape(row.label),
      row.done ? "yes" : "no",
      csvEscape(row.tier),
    ].join(",")
  );
  return [header, ...lines].join("\n");
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function parseBackup(raw: string): BackupPayload | null {
  try {
    const parsed = JSON.parse(raw) as Partial<BackupPayload>;
    if (
      (parsed.version !== 1 && parsed.version !== 2) ||
      !parsed.progress ||
      !parsed.settings
    ) {
      return null;
    }
    const progress = loadProgressFromUnknown(parsed.progress);
    const settings = {
      ...DEFAULT_SETTINGS,
      ...normalizeSettings(parsed.settings),
    };
    const customLabels = loadLabelsFromUnknown(parsed.customLabels);
    return {
      version: parsed.version === 2 ? 2 : 1,
      exportedAt:
        typeof parsed.exportedAt === "string"
          ? parsed.exportedAt
          : new Date().toISOString(),
      progress,
      settings,
      customLabels,
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

function loadLabelsFromUnknown(value: unknown): CustomLabelsMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const cleaned: CustomLabelsMap = {};
  for (const [id, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === "string") {
      const trimmed = entry.trim().slice(0, 120);
      if (trimmed) cleaned[id] = trimmed;
    }
  }
  return cleaned;
}

function normalizeSettings(value: unknown): Partial<AppSettings> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const parsed = value as Partial<AppSettings>;
  const peekedIds = Array.isArray(parsed.peekedIds)
    ? parsed.peekedIds.filter((id): id is string => typeof id === "string")
    : undefined;
  return {
    spoilerBlur:
      typeof parsed.spoilerBlur === "boolean" ? parsed.spoilerBlur : undefined,
    spoilerMaxTierVisible:
      parsed.spoilerMaxTierVisible === 1 ||
      parsed.spoilerMaxTierVisible === 2 ||
      parsed.spoilerMaxTierVisible === 3
        ? parsed.spoilerMaxTierVisible
        : undefined,
    peekedIds,
    lastCategoryId:
      typeof parsed.lastCategoryId === "string" || parsed.lastCategoryId === null
        ? parsed.lastCategoryId ?? null
        : undefined,
    hideCompleted:
      typeof parsed.hideCompleted === "boolean"
        ? parsed.hideCompleted
        : undefined,
    tipDismissed:
      typeof parsed.tipDismissed === "boolean" ? parsed.tipDismissed : undefined,
  };
}
