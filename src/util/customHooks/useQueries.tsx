"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import UseAxios from "./UseAxios";
import {
  getAdminDashboard,
  getAlbum,
  getAlbums,
  getAlbumTracks,
  getArtists,
  getArtistStats,
  getCurrentUser,
  getDashboard,
  getListOfBanksFromPaystack,
  getPromotionData,
  getSongs,
  getUserArtistsNames,
  getUserReleaseNames,
  getUserReleaseTrackNames,
  getWithdrawalHistory,
} from "../axios/axiosInstance";
import {
  adminDashboardType,
  albumFromApi,
  Artist,
  ArtistStat,
  PAGINATION,
  PayStackBankListResponse,
  songFromApi,
  WithdrawalResponse,
} from "@/app/type";
import { handleReactQueryApiCallError } from "../middleware/functions";
import { IPromotion } from "../models/promotionModel";

export const useAuthUser = () => {
  const api = UseAxios();
  return useQuery({
    queryKey: ["authUser"],
    queryFn: () => getCurrentUser(api),
    staleTime: 1000 * 60 * 60, // 60 mins
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
  });
};

export const useDashboard = () => {
  const api = UseAxios();
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(api),
    staleTime: 1000 * 60 * 15, // 15 minutes: consider data fresh
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
  });
};

export function usePaginatedArtists(params: {
  page: number;
  sort: string;
  artistName: string;
}) {
  const api = UseAxios();
  return useQuery<PAGINATION<Artist>, Error>({
    queryKey: ["artists", params.page, params.sort, params.artistName],
    queryFn: async () => getArtists(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGetArtistStats(artistName: string) {
  const api = UseAxios();
  return useQuery<ArtistStat, Error>({
    queryKey: ["artistStats", artistName],
    queryFn: async () => getArtistStats(api, artistName),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30, // 5 minutes
  });
}

export function useGetUserArtistsNames() {
  const api = UseAxios();
  return useQuery<string[], Error>({
    queryKey: ["userArtistsNames"],
    queryFn: async () => getUserArtistsNames(api),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30, // 5 minutes
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function usePaginatedSongs(params: {
  page: number;
  sort: string;
  songTitle: string;
  songStatusFilter: string;
  artist: string;
}) {
  const api = UseAxios();
  return useQuery<PAGINATION<songFromApi>, Error>({
    queryKey: [
      "mangeSongs",
      params.page,
      params.sort,
      params.songTitle,
      params.songStatusFilter,
      params.artist,
    ],
    queryFn: async () => getSongs(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePaginatedAlbums(params: {
  page: number;
  sort: string;
  albumTitle: string;
  albumStatusFilter: string;
  artist: string;
}) {
  const api = UseAxios();
  return useQuery<PAGINATION<albumFromApi>, Error>({
    queryKey: [
      "mangeAlbums",
      params.page,
      params.sort,
      params.albumTitle,
      params.albumStatusFilter,
      params.artist,
    ],
    queryFn: async () => getAlbums(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGetAlbums(params: { albumTitle: string }) {
  const api = UseAxios();
  return useQuery<PAGINATION<albumFromApi>, Error>({
    queryKey: ["getAlbum", params.albumTitle],
    queryFn: async () => getAlbum(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useGetAlbumTracks(params: { albumTitle: string }) {
  const api = UseAxios();
  return useQuery<any, Error>({
    queryKey: ["edit tracks", params.albumTitle],
    queryFn: async () => getAlbumTracks(api, params),
    // placeholderData: (prev) => prev, // avoids UI flicker
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
export function useGetBankList(options: { enabled?: boolean }) {
  return useQuery<PayStackBankListResponse, Error>({
    queryKey: ["getBankList"],
    queryFn: async () => getListOfBanksFromPaystack(),
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: options.enabled || false,
  });
}
export function useGetUserReleaseNames(
  params: {
    artist: string;
  },
  options: {
    enabled: boolean;
  },
) {
  const api = UseAxios();
  return useQuery<string[], Error>({
    queryKey: ["userReleaseNames", params.artist],
    queryFn: async () => getUserReleaseNames(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30, // 5 minutes
    enabled: options.enabled,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
export function useGetUserReleaseTrackNames(
  params: {
    release_title: string;
  },
  options: {
    enabled: boolean;
  },
) {
  const api = UseAxios();
  return useQuery<string[], Error>({
    queryKey: ["userReleaseTrackNames", params.release_title],
    queryFn: async () => getUserReleaseTrackNames(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30, // 5 minutes
    enabled: options.enabled,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useGetPromotionData(params: { page: number }) {
  const api = UseAxios();
  return useQuery<PAGINATION<IPromotion>, Error>({
    queryKey: ["promotionData", params.page],
    queryFn: async () => getPromotionData(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30,
  });
}

export const useWithdrawals = (params:{withdrawalStatusFilter:string,sort?:string,period:string}) => {
  const api = UseAxios();

  return useInfiniteQuery<WithdrawalResponse, Error>({
    queryKey: ["withdrawals",params.sort,params.withdrawalStatusFilter,params.period],
    queryFn: async ({ pageParam }) => getWithdrawalHistory(api, {...params,cursor:pageParam as string}),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useGetAdminDashboard = () => {
  const api = UseAxios();
  return useQuery<adminDashboardType,Error>({
    queryKey: ["Admindashboard"],
    queryFn: () => getAdminDashboard(api),
    staleTime: 1000 * 60 * 15, // 15 minutes: consider data fresh
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
  });
};
