const PALETTE = [
  "#7E22CE",
  "#A855F7",
  "#EC4899",
  "#6366F1",
  "#0EA5E9",
  "#14B8A6",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
];

export function getCategoryColor(categoryId: number): string {
  return PALETTE[categoryId % PALETTE.length] ?? PALETTE[0]!;
}
