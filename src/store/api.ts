import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, PORTAL_ID } from "@/lib/constants";
import type { Category } from "@/types/category";
import type { Podcast, TopCriteria } from "@/types/podcast";
import type { RootState } from "./store";

export const zoalcastApi = createApi({
  reducerPath: "zoalcastApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.user?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Podcast", "Category", "Likes"],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => `/portal/${PORTAL_ID}/categories`,
      transformResponse: (response: { data: Category[] }) => response.data ?? [],
      keepUnusedDataFor: 60 * 60 * 24,
      providesTags: ["Category"],
    }),
    getTopPodcasts: builder.query<
      Podcast[],
      { criteria: TopCriteria; categoryId?: number; limit?: number }
    >({
      query: ({ criteria, categoryId }) => {
        const params = new URLSearchParams({ criteria });
        if (categoryId) params.set("category_id", String(categoryId));
        return `/podcast/${PORTAL_ID}/top?${params.toString()}`;
      },
      transformResponse: (response: { data: Podcast[] }) => response.data ?? [],
      providesTags: ["Podcast"],
    }),
    getCategoryPodcasts: builder.query<
      {
        podcasts: Podcast[];
        currentPage: number;
        lastPage: number;
        totalPodcasts?: number;
      },
      { categoryId: number; page?: number }
    >({
      query: ({ categoryId, page = 1 }) =>
        `/category/${categoryId}/podcasts?page=${page}`,
      transformResponse: (response: {
        data: Podcast[];
        meta?: { current_page?: number; last_page?: number };
        total_podcasts?: number;
      }) => ({
        podcasts: response.data ?? [],
        currentPage: response.meta?.current_page ?? 1,
        lastPage: response.meta?.last_page ?? 1,
        totalPodcasts: response.total_podcasts,
      }),
      providesTags: ["Podcast"],
    }),
    getPodcastDetail: builder.query<Podcast, number>({
      query: (id) => `/podcast/${id}`,
      transformResponse: (response: { data: Podcast }) => response.data,
      providesTags: (_r, _e, id) => [{ type: "Podcast", id }],
    }),
    searchPodcasts: builder.query<
      { podcasts: Podcast[]; currentPage: number; lastPage: number; total: number },
      { q: string; page?: number }
    >({
      query: ({ q, page = 1 }) =>
        `/podcast/${PORTAL_ID}/search?q=${encodeURIComponent(q)}&page=${page}`,
      transformResponse: (response: {
        data?: Podcast[];
        current_page?: number;
        last_page?: number;
        total?: number;
      }) => ({
        podcasts: response.data ?? [],
        currentPage: response.current_page ?? 1,
        lastPage: response.last_page ?? 1,
        total: response.total ?? (response.data?.length ?? 0),
      }),
      providesTags: ["Podcast"],
    }),
    getLikedPodcasts: builder.query<
      { podcasts: Podcast[]; currentPage: number; lastPage: number; total: number },
      number | void
    >({
      query: (page = 1) => `/podcast/user/likes?page=${page}`,
      transformResponse: (response: {
        data?: Podcast[];
        current_page?: number;
        last_page?: number;
        total?: number;
      }) => ({
        podcasts: response.data ?? [],
        currentPage: response.current_page ?? 1,
        lastPage: response.last_page ?? 1,
        total: response.total ?? (response.data?.length ?? 0),
      }),
      providesTags: ["Likes"],
    }),
    likePodcast: builder.mutation<{ success: boolean }, number>({
      query: (podcastId) => ({
        url: "/podcast/like",
        method: "POST",
        body: { podcast_id: podcastId },
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: (_result, _error, podcastId) => [
        "Likes",
        { type: "Podcast", id: podcastId },
      ],
    }),
    unlikePodcast: builder.mutation<{ success: boolean }, number>({
      query: (podcastId) => ({
        url: "/podcast/dislike",
        method: "POST",
        body: { podcast_id: podcastId },
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: (_result, _error, podcastId) => [
        "Likes",
        { type: "Podcast", id: podcastId },
      ],
    }),
    checkLike: builder.query<boolean, number>({
      query: (podcastId) => ({
        url: "/podcast/like",
        method: "POST",
        body: { podcast_id: podcastId },
      }),
      transformResponse: (response: unknown) => {
        if (typeof response === "boolean") return response;
        if (typeof response === "object" && response !== null) {
          const candidate = response as { liked?: boolean; data?: { liked?: boolean } };
          return Boolean(candidate.liked ?? candidate.data?.liked);
        }
        return false;
      },
      providesTags: ["Likes"],
    }),
    incrementViews: builder.mutation<{ success: boolean }, number>({
      query: (podcastId) => ({
        url: `/podcast/${PORTAL_ID}/increment_views`,
        method: "POST",
        body: { podcast_id: podcastId },
      }),
      transformResponse: () => ({ success: true }),
    }),
    checkSubscription: builder.query<unknown, string>({
      query: (msisdn) => `/isounds/check_subscription/${encodeURIComponent(msisdn)}`,
    }),
    loginUser: builder.mutation<
      { token?: string; msisdn?: string } | Record<string, unknown>,
      { msisdn?: string; phone?: string; [key: string]: unknown }
    >({
      query: (body) => ({
        url: "/user/login",
        method: "POST",
        body,
      }),
    }),
    unsubscribeUser: builder.mutation<unknown, { msisdn?: string } | void>({
      query: (body) => ({
        url: "/isounds/unsubscribe",
        method: "POST",
        body: body ?? {},
      }),
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetTopPodcastsQuery,
  useGetCategoryPodcastsQuery,
  useGetPodcastDetailQuery,
  useSearchPodcastsQuery,
  useGetLikedPodcastsQuery,
  useLikePodcastMutation,
  useUnlikePodcastMutation,
  useCheckLikeQuery,
  useIncrementViewsMutation,
  useCheckSubscriptionQuery,
  useLazyCheckSubscriptionQuery,
  useLoginUserMutation,
  useUnsubscribeUserMutation,
} = zoalcastApi;
