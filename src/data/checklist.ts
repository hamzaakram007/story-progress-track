export type ChecklistItem = {
  id: string;
  label: string;
  /** Higher = more story-sensitive; used for spoiler blur */
  spoilerTier: 1 | 2 | 3;
};

export type ChecklistCategory = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  /** Accent used in category chrome — coastal palette only */
  accent: "teal" | "sand" | "foam" | "lagoon" | "dusk" | "reef";
  items: ChecklistItem[];
};

function slots(
  prefix: string,
  setLabel: string,
  count: number,
  tierForIndex: (i: number) => 1 | 2 | 3
): ChecklistItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    label: `${setLabel} — item ${i + 1}`,
    spoilerTier: tierForIndex(i),
  }));
}

/** Placeholder labels only — no real mission/collectible spoilers. */
export const CATEGORIES: ChecklistCategory[] = [
  {
    id: "story",
    name: "Story missions",
    shortName: "Story",
    description: "Main path beats — fill titles as you play.",
    accent: "teal",
    items: slots("story", "Mission set A", 12, (i) =>
      i < 4 ? 1 : i < 8 ? 2 : 3
    ),
  },
  {
    id: "collectibles",
    name: "Collectibles",
    shortName: "Collect",
    description: "Blank slots for objects you find in the world.",
    accent: "sand",
    items: slots("col", "Collectible set B", 10, (i) => (i < 5 ? 1 : 2)),
  },
  {
    id: "side",
    name: "Side activities",
    shortName: "Side",
    description: "Optional jobs, races, and distractions.",
    accent: "lagoon",
    items: slots("side", "Side activity set C", 8, (i) => (i < 3 ? 1 : 2)),
  },
  {
    id: "vehicles",
    name: "Vehicles kept",
    shortName: "Rides",
    description: "Rides you decided to keep around.",
    accent: "foam",
    items: slots("veh", "Vehicle slot D", 6, () => 1),
  },
  {
    id: "places",
    name: "Places visited",
    shortName: "Places",
    description: "Shops, fences, landmarks — your notes only.",
    accent: "dusk",
    items: slots("place", "Location set E", 8, (i) => (i < 4 ? 1 : 2)),
  },
  {
    id: "strangers",
    name: "Strangers & favors",
    shortName: "Favors",
    description: "Random encounters and favor chains — labels stay blank until you write them.",
    accent: "reef",
    items: slots("favor", "Favor set F", 6, (i) => (i < 2 ? 1 : i < 4 ? 2 : 3)),
  },
];

export const ALL_ITEM_IDS = CATEGORIES.flatMap((c) => c.items.map((i) => i.id));

export const TIER_LABELS: Record<1 | 2 | 3, string> = {
  1: "Early",
  2: "Mid",
  3: "Late",
};

export const ACCENT_CLASS: Record<ChecklistCategory["accent"], string> = {
  teal: "text-[var(--teal)] border-[var(--teal)]/40",
  sand: "text-[var(--sand)] border-[var(--sand)]/40",
  foam: "text-[var(--foam)] border-[var(--foam)]/30",
  lagoon: "text-[#5fd4c8] border-[#5fd4c8]/35",
  dusk: "text-[#9ec4d4] border-[#9ec4d4]/35",
  reef: "text-[#7ad1a8] border-[#7ad1a8]/35",
};
