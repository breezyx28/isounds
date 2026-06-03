import type { ComponentType } from "react";
import {
  Book,
  Category,
  Cup,
  Global,
  Headphone,
  Heart,
  Microphone2,
  Music,
  Notification,
  People,
  VideoCircle,
} from "iconsax-react";
import type { Category as CategoryType } from "@/types/category";

type IconsaxIcon = ComponentType<{
  size?: number | string;
  color?: string;
  variant?: "Linear" | "Outline" | "Broken" | "Bold" | "Bulk" | "TwoTone";
  className?: string;
}>;

const NAME_ICON_RULES: { test: RegExp; Icon: IconsaxIcon }[] = [
  { test: /news|أخبار|اخبار|naba/i, Icon: Notification },
  { test: /sport|رياضة|رياضه/i, Icon: Cup },
  { test: /music|موسيق|اغاني|أغاني/i, Icon: Music },
  { test: /culture|ثقاف|تراث|heritage/i, Icon: Book },
  { test: /relig|دين|إسلام|اسلام|spiritual/i, Icon: Heart },
  { test: /tech|تكنولوج|technology/i, Icon: Global },
  { test: /video|فيديو|visual/i, Icon: VideoCircle },
  { test: /story|قصص|حكا|podcast|بودكاست/i, Icon: Microphone2 },
  { test: /kids|أطفال|اطفال|family|عائلة/i, Icon: People },
  { test: /health|صحة|طب|wellness/i, Icon: Heart },
  { test: /business|اقتصاد|مال|money/i, Icon: Category },
];

const FALLBACK_ICONS: IconsaxIcon[] = [
  Microphone2,
  Music,
  Book,
  Headphone,
  VideoCircle,
];

export function getCategoryIconComponent(
  category: CategoryType,
  index: number,
): IconsaxIcon {
  const name = category.name.normalize("NFC").toLowerCase();

  for (const { test, Icon } of NAME_ICON_RULES) {
    if (test.test(name)) return Icon;
  }

  return FALLBACK_ICONS[index % FALLBACK_ICONS.length] ?? Category;
}

export function formatPodcastCountPlus(count: number | undefined | null): string | null {
  if (count == null || Number.isNaN(count)) return null;
  return `${count}+`;
}
