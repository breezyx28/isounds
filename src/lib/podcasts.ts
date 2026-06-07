import type { Podcast } from "@/types/podcast";

/** Normalize RTK/API payloads that may be a bare array or `{ data: [] }`. */
export function asPodcastList(value: unknown): Podcast[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && "data" in value) {
    const nested = (value as { data?: unknown }).data;
    if (Array.isArray(nested)) return nested;
  }
  return [];
}
