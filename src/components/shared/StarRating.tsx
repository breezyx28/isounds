import { useCallback, useEffect, useState } from "react";
import { Star } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { useGetRatingQuery, useSubmitRatingMutation } from "@/store/localApi";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  podcastId: number;
  readOnly?: boolean;
  variant?: "card" | "flat";
}

const DEFAULT_DISTRIBUTION = [5, 4, 3, 2, 1].map((star) => ({ star, pct: 0 }));

export function StarRating({
  podcastId,
  readOnly = false,
  variant = "card",
}: StarRatingProps) {
  const { t } = useTranslation(["library", "player", "common"]);
  const navigate = useNavigate();
  const isSubscribed = useAppSelector((s) => s.auth.status === "subscribed");
  const { data } = useGetRatingQuery(podcastId);
  const [submitRating, { isLoading: isSubmitting }] = useSubmitRatingMutation();
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const isFlat = variant === "flat";

  const ownFromApi = data?.ownRating ?? 0;
  const own = selectedRating || ownFromApi;

  useEffect(() => {
    if (data?.ownRating) {
      setSelectedRating(data.ownRating);
    }
  }, [data?.ownRating]);

  const distribution = data?.distribution ?? DEFAULT_DISTRIBUTION;
  const displayRating = hoverRating || own;

  const handleRate = useCallback(
    async (value: number) => {
      if (readOnly) return;

      if (!isSubscribed) {
        toast.error(t("common:auth.ratingRequiresSubscription"), {
          action: {
            label: t("common:auth.subscribeNow"),
            onClick: () =>
              navigate("/subscribe?reason=rating_requires_subscription"),
          },
        });
        return;
      }

      const previous = selectedRating || ownFromApi;
      setSelectedRating(value);
      try {
        await submitRating({ podcast_id: podcastId, rating: value }).unwrap();
      } catch {
        setSelectedRating(previous);
        toast.error(t("common:errors.loadFailed"));
      }
    },
    [
      isSubscribed,
      navigate,
      ownFromApi,
      podcastId,
      readOnly,
      selectedRating,
      submitRating,
      t,
    ],
  );

  return (
    <section
      className={cn("w-full", isFlat ? "py-6" : "is-card is-card--raised")}
    >
      <p className="mb-3 text-label font-semibold uppercase tracking-widest text-text-muted">
        {t("library:ratingTitle")}
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-1">
        {Array.from({ length: 5 }, (_, idx) => idx + 1).map((value) => {
          const isFilled = value <= displayRating;
          return (
            <button
              key={value}
              type="button"
              disabled={readOnly || isSubmitting}
              aria-label={t("library:rating.aria.star", { value })}
              aria-pressed={value === own}
              onMouseEnter={() => !readOnly && setHoverRating(value)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              onFocus={() => !readOnly && setHoverRating(value)}
              onBlur={() => !readOnly && setHoverRating(0)}
              onClick={() => void handleRate(value)}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-md active:scale-95",
                !readOnly && "cursor-pointer transition-transform hover:scale-110",
                (readOnly || isSubmitting) && "cursor-default opacity-60",
              )}
            >
              <Star
                weight={isFilled ? "fill" : "regular"}
                className={cn(
                  "h-7 w-7 transition-colors",
                  isFilled ? "text-amber-400" : "text-text-disabled",
                )}
              />
            </button>
          );
        })}
        <span className="ms-2 text-label text-text-muted">
          {own > 0
            ? t(`player:rateLabels.${own}`)
            : t("player:tapToRate")}
        </span>
      </div>

      <div className="flex items-start gap-5">
        <div className="shrink-0">
          <div className="text-4xl font-semibold tabular-nums text-text">
            {Number(data?.average ?? 0).toFixed(1)}
          </div>
          <div className="mt-0.5 text-label text-text-muted">
            {t("player:ratingsCount", { count: data?.count ?? 0 })}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          {distribution.map(({ star, pct }) => (
            <div key={star} className="flex items-center gap-2 text-label text-text-muted">
              <span className="w-3 text-end">{star}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-7 text-end tabular-nums">{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
