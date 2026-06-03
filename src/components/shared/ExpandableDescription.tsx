import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ExpandableDescriptionProps {
  description?: string | null;
  showHeading?: boolean;
  variant?: "card" | "flat";
}

export function ExpandableDescription({
  description,
  showHeading = true,
  variant = "card",
}: ExpandableDescriptionProps) {
  const { t } = useTranslation("player");
  const [expanded, setExpanded] = useState(false);
  const isFlat = variant === "flat";

  if (!description) return null;

  return (
    <section className={isFlat ? "py-6" : undefined}>
      {showHeading && (
        <p className="mb-2 text-label font-semibold uppercase tracking-widest text-text-muted">
          {t("aboutEpisode")}
        </p>
      )}
      <div className={isFlat ? undefined : "is-card is-card--raised"}>
        <p
          className={`text-body-lg leading-relaxed text-text-muted ${expanded ? "" : "line-clamp-3"}`}
        >
          {description}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 text-body-md font-medium text-primary active:opacity-80"
        >
          {expanded ? t("showLess") : t("showMore")}
        </button>
      </div>
    </section>
  );
}
