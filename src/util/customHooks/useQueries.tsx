"use client";
import { useQuery } from "@tanstack/react-query";
import UseAxios from "./UseAxios";
import {
  getArtists,
  getCurrentUser,
  getDashboard,
} from "../axios/axiosInstance";
import { Artist, PAGINATION } from "@/app/type";

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

export function usePaginatedArtists(params:{ page:number,sort:string,artistName:string }) {
  const api = UseAxios();
  return useQuery<PAGINATION<Artist>, Error>({
    queryKey: ["artists", params.page,params.sort,params.artistName],
    queryFn: async () => getArtists(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry:1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
