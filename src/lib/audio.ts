import { API_BASE_URL } from "./constants";

export function getSoundUrl(podcastId: number, token: string): string {
  const auth = encodeURIComponent(`Bearer ${token}`);
  return `${API_BASE_URL}/podcast/${podcastId}/sound?Authorization=${auth}`;
}
