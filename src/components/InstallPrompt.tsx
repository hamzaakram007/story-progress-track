"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const safari = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean(safari.standalone)
  );
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [dismissed, setDismissed] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setIosHint(false);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    queueMicrotask(() => {
      if (cancelled) return;
      if (isStandalone()) {
        setInstalled(true);
      } else {
        const wasDismissed = window.sessionStorage.getItem(
          "harbor-install-dismissed"
        );
        if (wasDismissed) setDismissed(true);
        if (isIos()) setIosHint(true);
      }
      setBooted(true);
    });

    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!booted || installed || dismissed) return null;
  if (!deferred && !iosHint) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  function dismiss() {
    setDismissed(true);
    window.sessionStorage.setItem(
      "harbor-install-dismissed",
      String(Date.now())
    );
  }

  return (
    <aside
      className="mt-4 animate-rise rounded-2xl border border-[var(--teal)]/30 bg-[var(--panel)] px-4 py-3"
      aria-label="Install Harbor Check"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--foam)]">
            Install Harbor Check
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            {deferred
              ? "Add to your home screen for a full-screen checklist that works offline from cache."
              : "On iPhone: Share → Add to Home Screen. Opens like an app; progress stays on this device."}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-xs text-[var(--muted)] hover:text-[var(--foam)]"
          aria-label="Dismiss install tip"
        >
          Not now
        </button>
      </div>
      {deferred && (
        <button
          type="button"
          onClick={install}
          className="mt-3 w-full rounded-xl bg-[var(--teal)] px-3 py-2.5 text-sm font-semibold text-[#041018] transition hover:brightness-110"
        >
          Install app
        </button>
      )}
    </aside>
  );
}
