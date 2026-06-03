import type { Category } from "@/types/category";

export type BentoCategoryItem = {
  kind: "category";
  category: Category;
  categoryIndex: number;
};

export type BentoPosterItem = {
  kind: "poster";
  posterKey: string;
};

export type BentoGridItem = BentoCategoryItem | BentoPosterItem;

const GRID_CELL_COUNT = 9;

/**
 * Interleave poster tiles after every 2 categories (C1, C2, poster, C3, C4, poster, C5…),
 * then add filler posters until the 3×3 grid is full.
 */
export function buildBentoGridItems(categories: Category[]): BentoGridItem[] {
  const items: BentoGridItem[] = [];
  let interleavePosterIndex = 0;
  let fillerPosterIndex = 0;

  categories.forEach((category, index) => {
    items.push({ kind: "category", category, categoryIndex: index });

    const isPairEnd = (index + 1) % 2 === 0;
    const hasMoreCategories = index < categories.length - 1;
    if (isPairEnd && hasMoreCategories) {
      items.push({
        kind: "poster",
        posterKey: `interleave-${interleavePosterIndex++}`,
      });
    }
  });

  while (items.length < GRID_CELL_COUNT) {
    items.push({
      kind: "poster",
      posterKey: `fill-${fillerPosterIndex++}`,
    });
  }

  return items.slice(0, GRID_CELL_COUNT);
}

export function sumCategoryPodcasts(categories: Category[]): number {
  return categories.reduce((sum, cat) => sum + (cat.total_podcasts ?? 0), 0);
}
