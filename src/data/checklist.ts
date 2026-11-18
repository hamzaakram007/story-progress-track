export type ChecklistItem = {
  id: string;
  label: string;
  /** Higher = more story-sensitive; used for spoiler blur */
  spoilerTier: 1 | 2 | 3;
};

export type ChecklistCategory = {
  id: string;
  name: string;
  description: string;
  items: ChecklistItem[];
};

/** Placeholder labels only — no real mission/collectible spoilers. */
export const CATEGORIES: ChecklistCategory[] = [
  {
    id: "story",
    name: "Story missions",
    description: "Main path beats — fill titles as you play.",
    items: Array.from({ length: 12 }, (_, i) => ({
      id: `story-${i + 1}`,
      label: `Mission set A — item ${i + 1}`,
      spoilerTier: (i < 4 ? 1 : i < 8 ? 2 : 3) as 1 | 2 | 3,
    })),
  },
  {
    id: "collectibles",
    name: "Collectibles",
    description: "Blank slots for objects you find in the world.",
    items: Array.from({ length: 10 }, (_, i) => ({
      id: `col-${i + 1}`,
      label: `Collectible set B — item ${i + 1}`,
      spoilerTier: (i < 5 ? 1 : 2) as 1 | 2 | 3,
    })),
  },
  {
    id: "side",
    name: "Side activities",
    description: "Optional jobs, races, and distractions.",
    items: Array.from({ length: 8 }, (_, i) => ({
      id: `side-${i + 1}`,
      label: `Side activity set C — item ${i + 1}`,
      spoilerTier: (i < 3 ? 1 : 2) as 1 | 2 | 3,
    })),
  },
  {
    id: "vehicles",
    name: "Vehicles kept",
    description: "Rides you decided to keep around.",
    items: Array.from({ length: 6 }, (_, i) => ({
      id: `veh-${i + 1}`,
      label: `Vehicle slot D — item ${i + 1}`,
      spoilerTier: 1,
    })),
  },
  {
    id: "places",
    name: "Places visited",
    description: "Shops, fences, landmarks — your notes only.",
    items: Array.from({ length: 8 }, (_, i) => ({
      id: `place-${i + 1}`,
      label: `Location set E — item ${i + 1}`,
      spoilerTier: (i < 4 ? 1 : 2) as 1 | 2 | 3,
    })),
  },
];

export const ALL_ITEM_IDS = CATEGORIES.flatMap((c) => c.items.map((i) => i.id));
