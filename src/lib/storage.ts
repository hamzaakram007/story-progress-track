const STORAGE_KEY = "harbor-check-progress-v1";
const SETTINGS_KEY = "harbor-check-settings-v1";

export type ProgressMap = Record<string, boolean>;

export type AppSettings = {
  spoilerBlur: boolean;
  spoilerMaxTierVisible: 1 | 2 | 3;
};

export const DEFAULT_SETTINGS: AppSettings = {
  spoilerBlur: true,
  spoilerMaxTierVisible: 1,
};

export function loadProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: ProgressMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
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
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
