"use client";
import { useQuery } from "@tanstack/react-query";
import UseAxios from "./UseAxios";
import { getCurrentUser, getDashboard } from "../axios/axiosInstance";

export const useAuthUser = () => {
  const api = UseAxios();
  return useQuery({
    queryKey: ["authUser"],
    queryFn: () => getCurrentUser(api),
    staleTime: 1000 * 60 * 60, // 60 mins
    retry: false,
    retryOnMount:false,
    refetchOnWindowFocus:false,
    refetchOnMount:false,
  });
};

export const useDashboard = () => {
  const api = UseAxios();
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(api),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 15, // 15 minutes: consider data fresh
    retry:1,
  });
};
