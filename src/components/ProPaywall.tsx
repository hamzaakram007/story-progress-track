"use client";

type ProPaywallProps = {
  open: boolean;
  feature: "sync" | "pdf";
  onClose: () => void;
};

const COPY = {
  sync: {
    title: "Sync across devices",
    body: "Pro keeps your Harbor Check progress in the cloud so your phone and tablet stay aligned. Local tracking stays free forever.",
  },
  pdf: {
    title: "Export PDF checklist",
    body: "Pro unlocks a clean printable PDF of your progress — great for couch sessions without unlocking spoilers on screen.",
  },
} as const;

export function ProPaywall({ open, feature, onClose }: ProPaywallProps) {
  if (!open) return null;
  const copy = COPY[feature];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[var(--line)] bg-[linear-gradient(135deg,#0a2230,#0d3a3a)] px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--teal)]">
            Harbor Check Pro
          </p>
          <h2 id="pro-title" className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--foam)]">
            {copy.title}
          </h2>
        </div>
        <div className="space-y-4 px-5 py-5">
          <p className="text-sm leading-relaxed text-[var(--muted)]">{copy.body}</p>
          <ul className="space-y-2 text-sm text-[var(--foam)]">
            <li className="flex gap-2">
              <span className="text-[var(--teal)]">✓</span> Cloud sync across devices
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--teal)]">✓</span> PDF / CSV export
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--teal)]">✓</span> Multiple profiles (two saves)
            </li>
          </ul>
          <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel-2)] px-4 py-3 text-center">
            <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
              $4.99
              <span className="ml-1 text-sm font-sans font-normal text-[var(--muted)]">
                one-time stub
              </span>
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Payment not wired yet — this is an MVP paywall placeholder.
            </p>
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-[var(--teal)] px-4 py-3 text-sm font-semibold text-[#041018] transition hover:brightness-110"
            onClick={() =>
              alert(
                "Pro checkout stub: connect Lemon Squeezy or Stripe here. Local progress stays free."
              )
            }
          >
            Unlock Pro (stub)
          </button>
          <button
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
