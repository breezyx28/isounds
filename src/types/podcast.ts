export interface Podcast {
  id: number;
  name: string;
  description?: string | null;
  image?: string | null;
  duration?: string | null;
  video?: string | null;
  created_at?: string | null;
  views?: number;
  likes?: number;
  liked?: boolean;
  category_id?: number;
  category?: {
    id: number;
    name: string;
  } | null;
}

export type TopCriteria = "latest" | "liked" | "viewed";
