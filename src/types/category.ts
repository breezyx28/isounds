export interface Category {
  id: number;
  name: string;
  image?: string | null;
  color?: string | null;
  total_podcasts?: number;
  total_muinutes?: number;
  description?: string | null;
}
