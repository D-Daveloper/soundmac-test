"use client";
import { useQuery } from "@tanstack/react-query";
import UseAxios from "./UseAxios";
import {
  getAlbums,
  getArtists,
  getArtistStats,
  getCurrentUser,
  getDashboard,
  getSongs,
  getUserArtistsNames,
} from "../axios/axiosInstance";
import {
  albumFromApi,
  Artist,
  ArtistStat,
  PAGINATION,
  songFromApi,
} from "@/app/type";

export const useAuthUser = () => {
  const api = UseAxios();
  return useQuery({
    queryKey: ["authUser"],
    queryFn: () => getCurrentUser(api),
    staleTime: 1000 * 60 * 60, // 60 mins
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useDashboard = () => {
  const api = UseAxios();
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(api),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 15, // 15 minutes: consider data fresh
    retry: 1,
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
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
export function useGetArtistStats(artistName: string) {
  const api = UseAxios();
  return useQuery<ArtistStat, Error>({
    queryKey: ["artistStats", artistName],
    queryFn: async () => getArtistStats(api, artistName),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: 1,
    staleTime: 1000 * 60 * 30, // 5 minutes
  });
}
export function useGetUserArtistsNames() {
  const api = UseAxios();
  return useQuery<string[], Error>({
    queryKey: ["userArtistsNames"],
    queryFn: async () => getUserArtistsNames(api),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: 1,
    staleTime: 1000 * 60 * 30, // 5 minutes
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
    retry: 1,
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
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
