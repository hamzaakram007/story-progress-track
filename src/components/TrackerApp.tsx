"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ACCENT_CLASS,
  CATEGORIES,
  TIER_LABELS,
  type ChecklistItem,
} from "@/data/checklist";
import {
  DEFAULT_SETTINGS,
  exportBackup,
  getStorageHealth,
  loadProgress,
  loadSettings,
  parseBackup,
  saveProgress,
  saveSettings,
  type AppSettings,
  type ProgressMap,
  type StorageFailReason,
  type StorageHealth,
  type StorageWriteResult,
} from "@/lib/storage";
import { InstallPrompt } from "./InstallPrompt";
import { ProPaywall } from "./ProPaywall";

function shouldHideLabel(
  item: ChecklistItem,
  done: boolean,
  settings: AppSettings
): boolean {
  if (!settings.spoilerBlur || done) return false;
  if (settings.peekedIds.includes(item.id)) return false;
  return item.spoilerTier > settings.spoilerMaxTierVisible;
}

function noticeForReason(reason: StorageFailReason): string {
  if (reason === "unavailable") {
    return "Browser storage is blocked. Progress won’t persist after refresh — allow site data or export a backup.";
  }
  if (reason === "quota") {
    return "Storage is full. Export a backup, then clear space or reset old data.";
  }
  return "Couldn’t save to this device. Try exporting a backup JSON.";
}

export function TrackerApp() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [paywall, setPaywall] = useState<"sync" | "pdf" | null>(null);
  const [storageHealth, setStorageHealth] = useState<StorageHealth>({
    available: true,
    lastError: null,
    lastSavedAt: null,
  });
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skipNextPersist = useRef(true);

  function applyWriteResult(result: StorageWriteResult) {
    if (result.ok) {
      setStorageHealth(getStorageHealth(null));
      setSaveNotice(null);
      return;
    }
    setStorageHealth(getStorageHealth(result.reason));
    setSaveNotice(noticeForReason(result.reason));
  }

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const loadedSettings = loadSettings();
      setProgress(loadProgress());
      setSettings(loadedSettings);
      const match = CATEGORIES.find(
        (c) => c.id === loadedSettings.lastCategoryId
      );
      if (match) setActiveCategory(match.id);
      setStorageHealth(getStorageHealth());
      skipNextPersist.current = true;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    const result = saveProgress(progress);
    queueMicrotask(() => applyWriteResult(result));
  }, [progress, ready]);

  useEffect(() => {
    if (!ready) return;
    const next = { ...settings, lastCategoryId: activeCategory };
    const result = saveSettings(next);
    queueMicrotask(() => applyWriteResult(result));
  }, [settings, activeCategory, ready]);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === "harbor-check-progress-v1" && event.newValue) {
        try {
          setProgress(JSON.parse(event.newValue) as ProgressMap);
        } catch {
          /* ignore */
        }
      }
      if (event.key === "harbor-check-settings-v1" && event.newValue) {
        setSettings(loadSettings());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const totals = useMemo(() => {
    let done = 0;
    let total = 0;
    for (const cat of CATEGORIES) {
      for (const item of cat.items) {
        total += 1;
        if (progress[item.id]) done += 1;
      }
    }
    return {
      done,
      total,
      pct: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  }, [progress]);

  const category =
    CATEGORIES.find((c) => c.id === activeCategory) ?? CATEGORIES[0];
  const visibleItems = category.items.filter((item) =>
    settings.hideCompleted ? !progress[item.id] : true
  );
  const categoryDone = category.items.filter((i) => progress[i.id]).length;

  function toggleItem(id: string) {
    setProgress((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function peekItem(id: string) {
    setSettings((s) =>
      s.peekedIds.includes(id) ? s : { ...s, peekedIds: [...s.peekedIds, id] }
    );
  }

  function clearPeeks() {
    setSettings((s) => ({ ...s, peekedIds: [] }));
  }

  function resetProgress() {
    if (!confirm("Clear all checked items on this device?")) return;
    setProgress({});
  }

  function downloadBackup() {
    const payload = exportBackup(progress, {
      ...settings,
      lastCategoryId: activeCategory,
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `harbor-check-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function onImportFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const backup = parseBackup(text);
      if (!backup) {
        alert("That file isn’t a valid Harbor Check backup.");
        return;
      }
      if (
        !confirm(
          "Replace progress and settings on this device with the backup?"
        )
      ) {
        return;
      }
      setProgress(backup.progress);
      setSettings(backup.settings);
      const match = CATEGORIES.find(
        (c) => c.id === backup.settings.lastCategoryId
      );
      if (match) setActiveCategory(match.id);
    };
    reader.readAsText(file);
  }

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-lg items-center justify-center px-4 py-20 text-sm text-[var(--muted)]">
        Loading local progress…
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 pb-10 pt-6 sm:px-6">
      <header className="animate-glow relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] px-5 py-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 10% 0%, rgba(46,230,214,0.18), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 100%, rgba(242,193,78,0.12), transparent 50%), linear-gradient(160deg, #071821 0%, #0a2a32 45%, #061018 100%)",
          }}
        />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--teal)]">
            Harbor Check by NeonGulf
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-[2.15rem] leading-[1.05] tracking-tight text-[var(--foam)]">
            Spoiler-safe progress
          </h1>
          <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-[var(--muted)]">
            Check off mission and collectible slots with generic, spoiler-safe labels.
            Hidden tiers stay masked until you peek or raise the reveal line.
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-end justify-between gap-3">
              <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
                {totals.pct}%
              </span>
              <span className="text-xs text-[var(--muted)]">
                {totals.done} / {totals.total} done
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-[var(--panel-2)]"
              role="progressbar"
              aria-valuenow={totals.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall checklist completion"
            >
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--teal),var(--sand))] transition-all duration-500"
                style={{ width: `${totals.pct}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <InstallPrompt />

      {(saveNotice || !storageHealth.available) && (
        <div
          className="mt-4 rounded-2xl border border-[var(--sand)]/35 bg-[var(--sand)]/10 px-4 py-3 text-xs leading-relaxed text-[var(--sand)]"
          role="status"
        >
          {saveNotice ||
            "Browser storage unavailable. Use Export backup before you leave."}
        </div>
      )}

      <section className="mt-5 space-y-3" aria-label="Spoiler controls">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-xl border px-3 py-2 text-sm transition ${
              settings.spoilerBlur
                ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
                : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]"
            }`}
            onClick={() =>
              setSettings((s) => ({
                ...s,
                spoilerBlur: !s.spoilerBlur,
                peekedIds: !s.spoilerBlur ? [] : s.peekedIds,
              }))
            }
            aria-pressed={settings.spoilerBlur}
          >
            Spoiler mask {settings.spoilerBlur ? "on" : "off"}
          </button>
          <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--muted)]">
            Reveal through
            <select
              className="rounded-md border border-[var(--line)] bg-[var(--panel-2)] px-2 py-1 text-[var(--foam)]"
              value={settings.spoilerMaxTierVisible}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  spoilerMaxTierVisible: Number(e.target.value) as 1 | 2 | 3,
                  peekedIds: [],
                }))
              }
              disabled={!settings.spoilerBlur}
            >
              <option value={1}>Early</option>
              <option value={2}>Mid</option>
              <option value={3}>Late</option>
            </select>
          </label>
          <button
            type="button"
            className={`rounded-xl border px-3 py-2 text-sm transition ${
              settings.hideCompleted
                ? "border-[var(--sand)]/40 bg-[var(--sand)]/10 text-[var(--sand)]"
                : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]"
            }`}
            onClick={() =>
              setSettings((s) => ({ ...s, hideCompleted: !s.hideCompleted }))
            }
            aria-pressed={settings.hideCompleted}
          >
            Hide done
          </button>
        </div>
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          Masked slots show a neutral label only — checklist text stays out of the DOM
          until you peek. Checked items always stay readable.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foam)] hover:border-[var(--teal)]/40"
            onClick={() => setPaywall("sync")}
          >
            Sync Pro
            <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--sand)]">
              soon
            </span>
          </button>
          <button
            type="button"
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foam)] hover:border-[var(--sand)]/40"
            onClick={() => setPaywall("pdf")}
          >
            PDF export
            <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--sand)]">
              soon
            </span>
          </button>
          {settings.peekedIds.length > 0 && (
            <button
              type="button"
              className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foam)]"
              onClick={clearPeeks}
            >
              Re-mask peeks ({settings.peekedIds.length})
            </button>
          )}
        </div>
      </section>

      <section className="mt-5" aria-label="Category overview">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Categories
          </h2>
          <p className="text-[11px] text-[var(--muted)]">
            {CATEGORIES.length} lists · spoiler-safe labels
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const done = cat.items.filter((i) => progress[i.id]).length;
            const pct =
              cat.items.length === 0
                ? 0
                : Math.round((done / cat.items.length) * 100);
            const active = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-2xl border px-3 py-3 text-left transition ${
                  active
                    ? `bg-[var(--panel)] shadow-[0_0_0_1px_rgba(46,230,214,0.12)] ${ACCENT_CLASS[cat.accent]}`
                    : "border-[var(--line)] bg-[var(--panel)]/70 text-[var(--muted)] hover:border-[var(--teal)]/25"
                }`}
              >
                <span
                  className={`block text-sm font-medium ${
                    active ? "" : "text-[var(--foam)]"
                  }`}
                >
                  {cat.shortName}
                </span>
                <span className="mt-1 block text-[11px] opacity-75">
                  {done}/{cat.items.length} · {pct}%
                </span>
                <span className="mt-2 block h-1 overflow-hidden rounded-full bg-[var(--panel-2)]">
                  <span
                    className="block h-full rounded-full bg-[var(--teal)]/80 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <nav
        className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        aria-label="Jump to category"
      >
        {CATEGORIES.map((cat) => {
          const active = cat.id === activeCategory;
          return (
            <button
              key={`chip-${cat.id}`}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
                active
                  ? "border-[var(--teal)]/50 bg-[var(--teal)]/15 text-[var(--teal)]"
                  : "border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              {cat.shortName}
            </button>
          );
        })}
      </nav>

      <section className="mt-4 flex-1 rounded-3xl border border-[var(--line)] bg-[var(--panel)]/80">
        <div className="border-b border-[var(--line)] px-4 py-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--foam)]">
            {category.name}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {category.description}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wider text-[var(--sand)]">
            {categoryDone} of {category.items.length} checked
            {settings.hideCompleted ? " · hiding completed" : ""}
          </p>
        </div>

        <ul className="divide-y divide-[var(--line)]">
          {visibleItems.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-[var(--muted)]">
              Everything in this category is checked. Turn off “Hide done” to review.
            </li>
          )}
          {visibleItems.map((item) => {
            const done = !!progress[item.id];
            const hidden = shouldHideLabel(item, done, settings);
            const tier = TIER_LABELS[item.spoilerTier];
            return (
              <li key={item.id} className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.03]"
                  aria-pressed={done}
                  aria-label={
                    hidden
                      ? `Toggle ${tier} tier slot ${item.id}, label hidden`
                      : `Toggle ${item.label}`
                  }
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs transition ${
                      done
                        ? "border-[var(--teal)] bg-[var(--teal)] text-[#041018]"
                        : "border-[var(--line)] bg-[var(--panel-2)] text-transparent"
                    }`}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span className="min-w-0 flex-1">
                    {hidden ? (
                      <>
                        <span className="spoiler-mask block text-sm text-[var(--foam)]">
                          Hidden {tier.toLowerCase()} slot
                        </span>
                        <span className="mt-0.5 block text-[11px] text-[var(--muted)]">
                          Label withheld — peek to reveal this slot
                        </span>
                      </>
                    ) : (
                      <span
                        className={`block text-sm transition ${
                          done
                            ? "text-[var(--muted)] line-through"
                            : "text-[var(--foam)]"
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                    {tier}
                  </span>
                </button>
                {hidden && (
                  <button
                    type="button"
                    className="shrink-0 border-l border-[var(--line)] px-3 text-xs font-medium text-[var(--teal)] hover:bg-white/[0.03]"
                    onClick={() => peekItem(item.id)}
                  >
                    Peek
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-4">
        <h2 className="text-sm font-medium text-[var(--foam)]">
          Device backup
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
          Free JSON export/import for when localStorage is cleared or full. Last save:{" "}
          {storageHealth.lastSavedAt
            ? new Date(storageHealth.lastSavedAt).toLocaleString()
            : "not yet"}
          .
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadBackup}
            className="rounded-xl border border-[var(--teal)]/35 bg-[var(--teal)]/10 px-3 py-2 text-sm text-[var(--teal)]"
          >
            Export backup
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-[var(--line)] bg-[var(--panel-2)] px-3 py-2 text-sm text-[var(--foam)]"
          >
            Import backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              onImportFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <footer className="mt-6 space-y-3 text-center text-xs leading-relaxed text-[var(--muted)]">
        <button
          type="button"
          onClick={resetProgress}
          className="text-[var(--muted)] underline-offset-2 hover:text-[var(--foam)] hover:underline"
        >
          Reset local progress
        </button>
        <p>
          Progress saves on this device via localStorage with quota checks and backup
          export. Generic checklist labels — spoiler-safe by design. Harbor Check by
          NeonGulf — independent product, original checklist UI.
        </p>
        <p>
          Gear picks may earn affiliate commissions.{" "}
          <span className="text-[var(--sand)]">Disclosure:</span> we may earn from
          qualifying purchases.
        </p>
      </footer>

      <ProPaywall
        open={paywall !== null}
        feature={paywall ?? "sync"}
        onClose={() => setPaywall(null)}
      />
    </div>
  );
}
