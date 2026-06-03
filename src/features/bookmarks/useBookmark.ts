import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import {
  useAddBookmarkMutation,
  useGetBookmarksQuery,
  useRemoveBookmarkMutation,
} from "@/store/localApi";

export function useBookmark(podcastId: number) {
  const { t } = useTranslation("player");
  const navigate = useNavigate();
  const authStatus = useAppSelector((s) => s.auth.status);
  const isSubscribed = authStatus === "subscribed";

  const { data: bookmarks = [] } = useGetBookmarksQuery(undefined, {
    skip: !isSubscribed,
  });
  const [addBookmark] = useAddBookmarkMutation();
  const [removeBookmark] = useRemoveBookmarkMutation();

  const bookmarked = useMemo(
    () => bookmarks.some((item) => item.podcast_id === podcastId),
    [bookmarks, podcastId],
  );

  const toggleBookmark = useCallback(async () => {
    if (!isSubscribed) {
      navigate("/subscribe?reason=subscription_required");
      return;
    }
    try {
      if (bookmarked) {
        await removeBookmark(podcastId).unwrap();
        toast.success(t("bookmarkRemoved"));
      } else {
        await addBookmark(podcastId).unwrap();
        toast.success(t("bookmarked"));
      }
    } catch {
      toast.error(t("bookmarkError", { defaultValue: "Could not update bookmark." }));
    }
  }, [addBookmark, bookmarked, isSubscribed, navigate, podcastId, removeBookmark, t]);

  return { bookmarked, toggleBookmark, isSubscribed };
}
