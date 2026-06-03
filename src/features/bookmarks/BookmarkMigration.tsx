import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  useAddBookmarksBulkMutation,
  useGetBookmarksQuery,
} from "@/store/localApi";
import {
  clearLegacyBookmarks,
  readLegacyBookmarkIds,
} from "@/lib/localIdentity";

export function BookmarkMigration() {
  const authStatus = useAppSelector((s) => s.auth.status);
  const migratedRef = useRef(false);
  const { data: bookmarks } = useGetBookmarksQuery(undefined, {
    skip: authStatus !== "subscribed",
  });
  const [addBulk] = useAddBookmarksBulkMutation();

  useEffect(() => {
    if (authStatus !== "subscribed" || migratedRef.current) return;
    if (bookmarks === undefined) return;

    const legacy = readLegacyBookmarkIds();
    if (legacy.length === 0) {
      migratedRef.current = true;
      return;
    }

    const existing = new Set(bookmarks.map((b) => b.podcast_id));
    const toMigrate = legacy.filter((id) => !existing.has(id));
    migratedRef.current = true;

    if (toMigrate.length === 0) {
      clearLegacyBookmarks();
      return;
    }

    void addBulk(toMigrate)
      .unwrap()
      .then(() => clearLegacyBookmarks())
      .catch(() => {
        migratedRef.current = false;
      });
  }, [authStatus, bookmarks, addBulk]);

  return null;
}
