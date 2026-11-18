"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, type ChecklistItem } from "@/data/checklist";
import {
  DEFAULT_SETTINGS,
  loadProgress,
  loadSettings,
  saveProgress,
  saveSettings,
  type AppSettings,
  type ProgressMap,
} from "@/lib/storage";
import { ProPaywall } from "./ProPaywall";

function shouldBlur(
  item: ChecklistItem,
  done: boolean,
  settings: AppSettings
): boolean {
  if (!settings.spoilerBlur || done) return false;
  return item.spoilerTier > settings.spoilerMaxTierVisible;
}

export function TrackerApp() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [paywall, setPaywall] = useState<"sync" | "pdf" | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
    setSettings(loadSettings());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveProgress(progress);
  }, [progress, ready]);

  useEffect(() => {
    if (!ready) return;
    saveSettings(settings);
  }, [settings, ready]);

  const totals = useMemo(() => {
    let done = 0;
    let total = 0;
    for (const cat of CATEGORIES) {
      for (const item of cat.items) {
        total += 1;
        if (progress[item.id]) done += 1;
      }
    }
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  }, [progress]);

  const category = CATEGORIES.find((c) => c.id === activeCategory) ?? CATEGORIES[0];
  const categoryDone = category.items.filter((i) => progress[i.id]).length;

  function toggleItem(id: string) {
    setProgress((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function resetProgress() {
    if (!confirm("Clear all checked items on this device?")) return;
    setProgress({});
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 pb-10 pt-6 sm:px-6">
      <header className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] px-5 py-6">
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
            Harbor Check
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-[2.15rem] leading-[1.05] tracking-tight text-[var(--foam)]">
            Spoiler-safe progress
          </h1>
          <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-[var(--muted)]">
            Check off placeholder mission and collectible slots. Titles stay blurred until you
            want them.
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
            <div className="h-2 overflow-hidden rounded-full bg-[var(--panel-2)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--teal),var(--sand))] transition-all duration-500"
                style={{ width: `${totals.pct}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <section className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-xl border px-3 py-2 text-sm transition ${
            settings.spoilerBlur
              ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
              : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]"
          }`}
          onClick={() =>
            setSettings((s) => ({ ...s, spoilerBlur: !s.spoilerBlur }))
          }
          aria-pressed={settings.spoilerBlur}
        >
          Spoiler blur {settings.spoilerBlur ? "on" : "off"}
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
              }))
            }
            disabled={!settings.spoilerBlur}
          >
            <option value={1}>early</option>
            <option value={2}>mid</option>
            <option value={3}>late</option>
          </select>
        </label>
        <button
          type="button"
          className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foam)] hover:border-[var(--teal)]/40"
          onClick={() => setPaywall("sync")}
        >
          Sync Pro
        </button>
        <button
          type="button"
          className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foam)] hover:border-[var(--sand)]/40"
          onClick={() => setPaywall("pdf")}
        >
          PDF export
        </button>
      </section>

      <nav
        className="mt-5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        aria-label="Categories"
      >
        {CATEGORIES.map((cat) => {
          const done = cat.items.filter((i) => progress[i.id]).length;
          const active = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-2xl border px-3.5 py-2.5 text-left transition ${
                active
                  ? "border-[var(--teal)]/50 bg-[var(--panel)] text-[var(--foam)] shadow-[0_0_0_1px_rgba(46,230,214,0.15)]"
                  : "border-transparent bg-transparent text-[var(--muted)] hover:bg-[var(--panel)]/60"
              }`}
            >
              <span className="block text-sm font-medium">{cat.name}</span>
              <span className="mt-0.5 block text-[11px] opacity-70">
                {done}/{cat.items.length}
              </span>
            </button>
          );
        })}
      </nav>

      <section className="mt-4 flex-1 rounded-3xl border border-[var(--line)] bg-[var(--panel)]/80">
        <div className="border-b border-[var(--line)] px-4 py-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--foam)]">
            {category.name}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{category.description}</p>
          <p className="mt-2 text-xs uppercase tracking-wider text-[var(--sand)]">
            {categoryDone} of {category.items.length} checked
          </p>
        </div>

        <ul className="divide-y divide-[var(--line)]">
          {category.items.map((item) => {
            const done = !!progress[item.id];
            const blurred = shouldBlur(item, done, settings);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.03]"
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
                    <span
                      className={`block text-sm transition ${
                        done ? "text-[var(--muted)] line-through" : "text-[var(--foam)]"
                      } ${blurred ? "spoiler-blur select-none" : ""}`}
                    >
                      {item.label}
                    </span>
                    {blurred && (
                      <span className="mt-0.5 block text-[11px] text-[var(--muted)]">
                        Hidden until you raise reveal tier or turn blur off
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                    T{item.spoilerTier}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
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
          Progress saves on this device via localStorage. No Rockstar maps or assets —
          placeholder labels only. Independent fan utility; not affiliated with Take-Two or
          Rockstar.
        </p>
        <p>
          Gear picks may earn affiliate commissions.{" "}
          <span className="text-[var(--sand)]">Disclosure:</span> we may earn from qualifying
          purchases.
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
