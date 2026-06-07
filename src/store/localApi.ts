import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getOrCreateSessionId, getSubscriberMsisdn, isSubscribed } from "@/lib/localIdentity";
import type { RootState } from "./store";

export const localApi = createApi({
  reducerPath: "localApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/local",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const msisdn = getSubscriberMsisdn(state);
      if (msisdn) headers.set("X-ISounds-Msisdn", msisdn);
      if (isSubscribed(state)) headers.set("X-ISounds-Subscribed", "1");
      return headers;
    },
  }),
  tagTypes: [
    "Preferences",
    "SearchHistory",
    "ListeningHistory",
    "Ratings",
    "Complaints",
    "PwaEvents",
    "Bookmarks",
    "Personalization",
    "Push",
  ],
  endpoints: (builder) => ({
    exchangeSession: builder.mutation<
      { ok: boolean; msisdn: string; subscribed: boolean },
      { token: string; msisdn: string }
    >({
      query: (body) => ({
        url: "/auth/session",
        method: "POST",
        body,
      }),
    }),
    clearSession: builder.mutation<{ ok: boolean }, void>({
      query: () => ({
        url: "/auth/session",
        method: "DELETE",
      }),
    }),
    getPreferences: builder.query<Record<string, string>, void>({
      query: () => "/preferences",
    }),
    savePreferences: builder.mutation<void, Record<string, string>>({
      query: (body) => ({
        url: "/preferences",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Preferences"],
    }),
    savePreference: builder.mutation<void, { key: string; value: string }>({
      query: (body) => ({
        url: "/preferences",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Preferences"],
    }),
    getBookmarks: builder.query<Array<{ podcast_id: number; created_at: number }>, void>({
      query: () => "/bookmarks",
      providesTags: ["Bookmarks"],
    }),
    addBookmark: builder.mutation<{ ok: boolean }, number>({
      query: (podcastId) => ({
        url: "/bookmarks",
        method: "POST",
        body: { podcast_id: podcastId },
      }),
      invalidatesTags: ["Bookmarks"],
    }),
    addBookmarksBulk: builder.mutation<{ ok: boolean }, number[]>({
      query: (podcastIds) => ({
        url: "/bookmarks",
        method: "POST",
        body: { podcast_ids: podcastIds },
      }),
      invalidatesTags: ["Bookmarks"],
    }),
    removeBookmark: builder.mutation<{ ok: boolean }, number>({
      query: (podcastId) => ({
        url: `/bookmarks/${podcastId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bookmarks"],
    }),
    sessionHeartbeat: builder.mutation<
      { ok: boolean },
      { session_id: string; user_agent?: string; referrer?: string }
    >({
      query: (body) => ({
        url: "/sessions/heartbeat",
        method: "POST",
        body,
      }),
    }),
    recordVisit: builder.mutation<
      { ok: boolean },
      {
        session_id: string;
        path: string;
        category_id?: number;
        podcast_id?: number;
        event_type?: string;
      }
    >({
      query: (body) => ({
        url: "/visits",
        method: "POST",
        body,
      }),
    }),
    getListeningPosition: builder.query<
      {
        podcast_id: number;
        position_seconds: number;
        duration_seconds: number;
        updated_at: number;
      } | null,
      number
    >({
      query: (podcastId) => `/listening-history/${podcastId}`,
      providesTags: (_result, _error, podcastId) => [
        { type: "ListeningHistory", id: podcastId },
      ],
    }),
    saveListeningPosition: builder.mutation<
      { ok: boolean },
      { podcast_id: number; position_seconds: number; duration_seconds: number }
    >({
      query: (body) => ({
        url: "/listening-history",
        method: "POST",
        body: { ...body, session_id: getOrCreateSessionId() },
      }),
      invalidatesTags: (_result, _error, args) => [
        { type: "ListeningHistory", id: args.podcast_id },
      ],
    }),
    getListeningHistory: builder.query<
      Array<{
        podcast_id: number;
        position_seconds: number;
        duration_seconds: number;
        updated_at: number;
      }>,
      void
    >({
      query: () => "/listening-history",
      providesTags: ["ListeningHistory"],
    }),
    getSearchHistory: builder.query<
      Array<{ id: number; query: string; created_at: number }>,
      void
    >({
      query: () => "/search-history",
      providesTags: ["SearchHistory"],
    }),
    addSearchHistory: builder.mutation<{ ok: boolean }, { query: string }>({
      query: (body) => ({
        url: "/search-history",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SearchHistory"],
    }),
    deleteSearchHistory: builder.mutation<{ ok: boolean }, number>({
      query: (id) => ({
        url: `/search-history/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SearchHistory"],
    }),
    clearSearchHistory: builder.mutation<{ ok: boolean }, void>({
      query: () => ({
        url: "/search-history",
        method: "DELETE",
      }),
      invalidatesTags: ["SearchHistory"],
    }),
    submitRating: builder.mutation<
      { ok: boolean; average?: number; count?: number },
      { podcast_id: number; rating: number }
    >({
      query: (body) => ({
        url: "/ratings",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, args) => [{ type: "Ratings", id: args.podcast_id }],
    }),
    getRating: builder.query<
      {
        ownRating: number | null;
        average: number;
        count: number;
        distribution: Array<{ star: number; pct: number }>;
      },
      number
    >({
      query: (podcastId) => `/ratings/${podcastId}`,
      providesTags: (_result, _error, id) => [{ type: "Ratings", id }],
    }),
    submitComplaint: builder.mutation<
      { ok: boolean },
      { podcast_id?: number; type: string; description: string; phone?: string; name?: string }
    >({
      query: (body) => ({
        url: "/complaints",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Complaints"],
    }),
    getComplaints: builder.query<
      Array<{
        id: number;
        podcast_id: number | null;
        type: string;
        description: string;
        phone?: string;
        created_at: number;
      }>,
      void
    >({
      query: () => "/complaints",
      providesTags: ["Complaints"],
    }),
    recordPwaEvent: builder.mutation<
      { ok: boolean },
      { event: "prompt_shown" | "accepted" | "dismissed" }
    >({
      query: (body) => ({
        url: "/pwa-events",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PwaEvents"],
    }),
    getPersonalizationProfile: builder.query<
      {
        affinities: Array<{ category_id: number; score: number; signals: Record<string, number> }>;
        settings: Array<{
          category_id: number;
          pinned: boolean;
          hidden: boolean;
          push_enabled: boolean;
        }>;
        push_subscribed: boolean;
        event_count: number;
        last_updated: number;
        push_threshold: number;
      },
      void
    >({
      query: () => "/personalization/profile",
      providesTags: ["Personalization"],
      keepUnusedDataFor: 60,
    }),
    recomputePersonalization: builder.mutation<
      { ok: boolean; profile: unknown },
      void
    >({
      query: () => ({
        url: "/personalization/recompute",
        method: "POST",
      }),
      invalidatesTags: ["Personalization"],
    }),
    updateCategorySettings: builder.mutation<
      { ok: boolean },
      {
        category_id: number;
        pinned?: boolean;
        hidden?: boolean;
        push_enabled?: boolean;
      }
    >({
      query: (body) => ({
        url: "/personalization/category-settings",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Personalization"],
    }),
    resetPersonalizationSettings: builder.mutation<{ ok: boolean }, void>({
      query: () => ({
        url: "/personalization/reset-settings",
        method: "POST",
      }),
      invalidatesTags: ["Personalization"],
    }),
    getVapidPublicKey: builder.query<
      { configured: boolean; publicKey: string },
      void
    >({
      query: () => "/push/vapid-public-key",
    }),
    getPushStatus: builder.query<
      {
        subscribed: boolean;
        push_configured: boolean;
        categories_enabled: number[];
      },
      void
    >({
      query: () => "/push/status",
      providesTags: ["Push"],
    }),
    subscribePush: builder.mutation<
      { ok: boolean },
      {
        endpoint: string;
        keys: { p256dh: string; auth: string };
        user_agent?: string;
      }
    >({
      query: (body) => ({
        url: "/push/subscribe",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Push", "Personalization"],
    }),
    unsubscribePush: builder.mutation<
      { ok: boolean },
      { endpoint?: string } | void
    >({
      query: (body) => ({
        url: "/push/subscribe",
        method: "DELETE",
        body: body ?? {},
      }),
      invalidatesTags: ["Push", "Personalization"],
    }),
  }),
});

export const {
  useGetPreferencesQuery,
  useSavePreferencesMutation,
  useExchangeSessionMutation,
  useClearSessionMutation,
  useSavePreferenceMutation,
  useGetBookmarksQuery,
  useAddBookmarkMutation,
  useAddBookmarksBulkMutation,
  useRemoveBookmarkMutation,
  useSessionHeartbeatMutation,
  useRecordVisitMutation,
  useGetListeningPositionQuery,
  useSaveListeningPositionMutation,
  useGetListeningHistoryQuery,
  useGetSearchHistoryQuery,
  useAddSearchHistoryMutation,
  useDeleteSearchHistoryMutation,
  useClearSearchHistoryMutation,
  useSubmitRatingMutation,
  useGetRatingQuery,
  useSubmitComplaintMutation,
  useGetComplaintsQuery,
  useRecordPwaEventMutation,
  useGetPersonalizationProfileQuery,
  useRecomputePersonalizationMutation,
  useUpdateCategorySettingsMutation,
  useResetPersonalizationSettingsMutation,
  useGetVapidPublicKeyQuery,
  useGetPushStatusQuery,
  useSubscribePushMutation,
  useUnsubscribePushMutation,
} = localApi;
