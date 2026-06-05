import { cn } from "@/lib/utils";
import type { Language } from "@/store/slices/uiSlice";

const FLAG_SRC: Record<Language, string> = {
  ar: "/flags/sa.svg",
  en: "/flags/us.svg",
};

const FLAG_LABELS: Record<Language, string> = {
  ar: "Saudi Arabia",
  en: "United States",
};

export function LanguageFlagIcon({
  language,
  className,
}: {
  language: Language;
  className?: string;
}) {
  return (
    <img
      src={FLAG_SRC[language]}
      alt=""
      width={21}
      height={14}
      className={cn(
        "h-[14px] w-[21px] shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/10",
        className,
      )}
      draggable={false}
    />
  );
}

export function getLanguageFlagLabel(language: Language): string {
  return FLAG_LABELS[language];
}
