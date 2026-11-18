"use client";

import { useEffect, useId, useRef } from "react";

type ProPaywallProps = {
  open: boolean;
  feature: "sync" | "pdf";
  onClose: () => void;
};

const COPY = {
  sync: {
    title: "Cloud sync (coming later)",
    body: "Pro will keep Harbor Check progress in the cloud across phones and tablets. Today this screen is a stub only — nothing is charged and nothing leaves this device.",
  },
  pdf: {
    title: "PDF export (coming later)",
    body: "Pro will unlock a printable PDF of your checklist. Today this is a pricing mock only — you stay on free local mode with no payment request.",
  },
} as const;

export function ProPaywall({ open, feature, onClose }: ProPaywallProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;
  const copy = COPY[feature];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[var(--line)] bg-[linear-gradient(135deg,#0a2230,#0d3a3a)] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--teal)]">
              Harbor Check Pro
            </p>
            <span className="rounded-md border border-[var(--sand)]/40 bg-[var(--sand)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--sand)]">
              Stub · not charged
            </span>
          </div>
          <h2
            id={titleId}
            className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--foam)]"
          >
            {copy.title}
          </h2>
        </div>
        <div className="space-y-4 px-5 py-5">
          <p className="rounded-xl border border-[var(--sand)]/25 bg-[var(--sand)]/8 px-3 py-2 text-xs leading-relaxed text-[var(--sand)]">
            Demo paywall only. No Lemon Squeezy / Stripe checkout is connected. Free local
            tracking and spoiler blur stay available forever on this device.
          </p>
          <p className="text-sm leading-relaxed text-[var(--muted)]">{copy.body}</p>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Free now
            </p>
            <ul className="mt-2 space-y-2 text-sm text-[var(--foam)]">
              <li className="flex gap-2">
                <span className="text-[var(--teal)]">✓</span> Local checklist + categories
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--teal)]">✓</span> Spoiler blur / peek / JSON backup
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Planned Pro (not live)
            </p>
            <ul className="mt-2 space-y-2 text-sm text-[var(--foam)]">
              <li className="flex gap-2">
                <span className="text-[var(--muted)]">○</span> Cloud sync across devices
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--muted)]">○</span> PDF / CSV export
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--muted)]">○</span> Multiple profiles (two saves)
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel-2)] px-4 py-3 text-center">
            <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
              $4.99
              <span className="ml-1 text-sm font-sans font-normal text-[var(--muted)]">
                planned one-time
              </span>
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Price is illustrative. Tapping Unlock shows an alert — no card form opens.
            </p>
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-[var(--teal)] px-4 py-3 text-sm font-semibold text-[#041018] transition hover:brightness-110"
            onClick={() =>
              alert(
                "Pro checkout stub only.\n\nNo payment was taken. Connect Lemon Squeezy or Stripe later. Local progress stays free on this device."
              )
            }
          >
            Preview Unlock Pro (no charge)
          </button>
          <button
            ref={closeRef}
            type="button"
            className="w-full rounded-xl px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foam)]"
            onClick={onClose}
          >
            Keep using free local mode
          </button>
        </div>
      </div>
    </div>
  );
}
