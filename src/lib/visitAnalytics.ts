export type VisitMetadata = {
  category_id?: number;
  podcast_id?: number;
  event_type: string;
};

export function parseRouteVisit(pathname: string, search: string): VisitMetadata {
  const params = new URLSearchParams(search);

  const categoryMatch = pathname.match(/^\/categories\/(\d+)/);
  if (categoryMatch) {
    return {
      category_id: Number(categoryMatch[1]),
      event_type: "category_view",
    };
  }

  const podcastMatch = pathname.match(/^\/podcasts\/(\d+)/);
  if (podcastMatch) {
    return {
      podcast_id: Number(podcastMatch[1]),
      event_type: "podcast_view",
    };
  }

  if (pathname === "/explore") {
    const category = params.get("category");
    if (category && Number.isFinite(Number(category))) {
      return {
        category_id: Number(category),
        event_type: "explore_filter",
      };
    }
  }

  return { event_type: "page_view" };
}
