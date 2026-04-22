"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import UseAxios from "./UseAxios";
import {
  getAdminAlbumDetails,
  getAdminArtistsNames,
  getAdminDashboard,
  getAdminSalesReportDashboardDetails,
  getAdminSingleDetails,
  getAdminUserDetails,
  getAdminUserEarnings,
  getAdminWithdrawalDetails,
  getAlbum,
  getAlbums,
  getAlbumTracks,
  getAllArtists,
  getAlllabels,
  getAllPromotions,
  getAllReleases,
  getAllSupportRequests,
  getAllUnmatchedSalesreport,
  getAllUsers,
  getAllVerificationRequests,
  getAllWithdrawalRequests,
  getArtistDetails,
  getArtists,
  getArtistStats,
  getCurrentUser,
  getDashboard,
  getDPMDsp,
  getlabel,
  getListOfBanksFromPaystack,
  getPromotionData,
  getPromotionDetails,
  getReleaseRequest,
  getSongs,
  getUserArtistsNames,
  getUserNotification,
  getUserReleaseNames,
  getUserReleaseTrackNames,
  getUserSalesReportDashboardDetails,
  getUserWithdrawalHistory,
  getWithdrawalHistory,
} from "../axios/axiosInstance";
import {
  AdminAlbumDetailsResponse,
  adminDashboardType,
  AdminRelease,
  AdminSingleDetailsResponse,
  AdminUserDetailsResponse,
  AdminWithdrawalDetailsResponse,
  albumFromApi,
  AllArtistResponse,
  AllLabelResponse,
  AllSupportRequestsResponse,
  Artist,
  ArtistDetails,
  ArtistStat,
  DPMDsp,
  labelResponse,
  PAGINATION,
  PayStackBankListResponse,
  ReleaseRequestResponse,
  salesReportDashboardResponse,
  songFromApi,
  WithdrawalResponse,
  withdrawals,
} from "@/app/type";
import { handleReactQueryApiCallError } from "../middleware/functions";
import { IPromotion } from "../models/promotionModel";
import { IUser } from "../models/userModel";
import { ISalesReport } from "../models/salesReportModel";

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

export const useWithdrawals = (params: {
  withdrawalStatusFilter: string;
  sort?: string;
  period: string;
}) => {
  const api = UseAxios();

  return useInfiniteQuery<WithdrawalResponse, Error>({
    queryKey: [
      "withdrawals",
      params.sort,
      params.withdrawalStatusFilter,
      params.period,
    ],
    queryFn: async ({ pageParam }) =>
      getWithdrawalHistory(api, { ...params, cursor: pageParam as string }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useGetAdminDashboard = () => {
  const api = UseAxios();
  return useQuery<adminDashboardType, Error>({
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

export function usePaginatedAdminReleases(params: {
  page: number;
  sort: string;
  releaseTitle: string;
  releaseStatusFilter: string;
  artist: string;
  limit: string;
  releaseType: string;
}) {
  const api = UseAxios();
  return useQuery<PAGINATION<AdminRelease>, Error>({
    queryKey: [
      "allreleases",
      params.page,
      params.sort,
      params.releaseTitle,
      params.releaseStatusFilter,
      params.artist,
      params.releaseType,
    ],
    queryFn: async () => getAllReleases(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGetAdminArtistsNames() {
  const api = UseAxios();
  return useQuery<string[], Error>({
    queryKey: ["adminArtistsNames"],
    queryFn: async () => getAdminArtistsNames(api),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30, // 5 minutes
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
export function useGetAdminAlbumDetails(params: { albumId: string }) {
  const api = UseAxios();
  return useQuery<AdminAlbumDetailsResponse, Error>({
    queryKey: ["adminAlbumDetails", params.albumId],
    queryFn: async () => getAdminAlbumDetails(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30, // 5 minutes
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
export function useGetAdminSingleDetails(params: { songId: string }) {
  const api = UseAxios();
  return useQuery<AdminSingleDetailsResponse, Error>({
    queryKey: ["adminSingleDetails", params.songId],
    queryFn: async () => getAdminSingleDetails(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30, // 5 minutes
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export const useReleaseRequests = (params: { releaseTitle: string,limit:string,releaseType:string }) => {
  const api = UseAxios();

  return useInfiniteQuery<ReleaseRequestResponse, Error>({
    queryKey: ["release-request", params.releaseTitle,params.releaseType],
    queryFn: async ({ pageParam }) =>
      getReleaseRequest(api, { ...params, cursor: pageParam as string }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
export const useGetAllArtists = (params: { artistName: string,limit:string,artistStatus:string }) => {
  const api = UseAxios();

  return useInfiniteQuery<AllArtistResponse, Error>({
    queryKey: ["admin-all-artists", params.artistName,params.artistStatus],
    queryFn: async ({ pageParam }) =>
      getAllArtists(api, { ...params, cursor: pageParam as string }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
export function usePaginatedAdminArtistDetails(params: {
  page: number;
  releaseTitle: string;
  releaseStatusFilter: string;
  limit: string;
  id: string;
}) {
  const api = UseAxios();
  return useQuery<ArtistDetails, Error>({
    queryKey: [
      "artistDetail",
      params.page,
      params.releaseStatusFilter,
      params.id,
      params.releaseTitle
    ],
    queryFn: async () => getArtistDetails(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePaginatedAdminAllUsers(params: {
  page: number;
  sort: string;
  name: string;
  limit: string;
  accountType: string;
  userStatus:string
}) {
  const api = UseAxios();
  return useQuery<PAGINATION<IUser>, Error>({
    queryKey: [
      "allUsers",
      params.page,
      params.sort,
      params.name,
      params.accountType,
      params.userStatus,
    ],
    queryFn: async () => getAllUsers(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGetAdminUserDetails(params: { userId: string }) {
  const api = UseAxios();
  return useQuery<AdminUserDetailsResponse, Error>({
    queryKey: ["adminUserDetails", params.userId],
    queryFn: async () => getAdminUserDetails(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30, // 5 minutes
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useGetAdminUserEarnings(params: { userId: string,page:number,limit:string ,upc:string}) {
  const api = UseAxios();
  return useQuery<AdminUserDetailsResponse, Error>({
    queryKey: ["adminUserEarnings", params.userId,params.page,params.limit,params.upc],
    queryFn: async () => getAdminUserEarnings(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30, // 5 minutes
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
export const useGetUserWithdrawals = (params: {
  userId: string;
}) => {
  const api = UseAxios();

  return useInfiniteQuery<WithdrawalResponse, Error>({
    queryKey: [
      "userWithdrawals",
      params.userId
    ],
    queryFn: async ({ pageParam }) =>
      getUserWithdrawalHistory(api, { ...params, cursor: pageParam as string }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export function usePaginatedAdminAllVerificationRequests(params: {
  page: number;
  sort: string;
  limit: string;
}) {
  const api = UseAxios();
  return useQuery<PAGINATION<IUser>, Error>({
    queryKey: [
      "allVerificationRequests",
      params.page,
      params.sort,
    ],
    queryFn: async () => getAllVerificationRequests(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePaginatedAdminAllWithdrawalRequests(params: {
  page: number;
  withdrawalStatus:string
  sort: string;
  limit: string;
  email:string;
}) {
  const api = UseAxios();
  return useQuery<PAGINATION<withdrawals>, Error>({
    queryKey: [
      "allWithdrawalRequests",
      params.page,
      params.sort,
      params.withdrawalStatus,
      params.email,
    ],
    queryFn: async () => getAllWithdrawalRequests(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGetAdminWithdrawaldetails(params: { withdrawalId: string }) {
  const api = UseAxios();
  return useQuery<AdminWithdrawalDetailsResponse, Error>({
    queryKey: ["adminWithdrawalDetails", params.withdrawalId],
    queryFn: async () => getAdminWithdrawalDetails(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30, // 5 minutes
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export const useGetAllSupportRequests = (params: { limit:string,supportStatus:string }) => {
  const api = UseAxios();

  return useInfiniteQuery<AllSupportRequestsResponse, Error>({
    queryKey: ["admin-all-support-requests",params.supportStatus],
    queryFn: async ({ pageParam }) =>
      getAllSupportRequests(api, { ...params, cursor: pageParam as string }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export function useGetPaginatedPromotions(params: { page:number,sort:string,releaseTitle:string,limit:string,promotionType:string,promotionStatus:string }) {
  const api = UseAxios();
  return useQuery<PAGINATION<IPromotion>, Error>({
    queryKey: [
      "allpromotions",
      params.page,
      params.sort,
      params.releaseTitle,
      params.promotionType,
      params.promotionStatus,
    ],
    queryFn: async () => getAllPromotions(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
export function useGetPromotionDetails(params: { promotionId: string }) {
  const api = UseAxios();
  return useQuery<IPromotion, Error>({
    queryKey: ["promotionDetails", params.promotionId],
    queryFn: async () => getPromotionDetails(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30, // 5 minutes
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export const useGetAllLabels = (params: { labelName: string,limit:string,labelStatus:string }) => {
  const api = UseAxios();

  return useInfiniteQuery<AllLabelResponse, Error>({
    queryKey: ["admin-all-labels", params.labelName,params.labelStatus],
    queryFn: async ({ pageParam }) =>
      getAlllabels(api, { ...params, cursor: pageParam as string }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
export function useGetLabelDetails(params: { labelId: string }) {
  const api = UseAxios();
  return useQuery<labelResponse, Error>({
    queryKey: ["labelDetails", params.labelId],
    queryFn: async () => getlabel(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30, // 5 minutes
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
export function useGetUserSalesReportDashboardDetailsNames() {
  const api = UseAxios();
  return useQuery<salesReportDashboardResponse, Error>({
    queryKey: ["salesReportDashboard"],
    queryFn: async () => getUserSalesReportDashboardDetails(api),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30, // 5 minutes
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
export function useGetAdminSalesReportDashboardDetails() {
  const api = UseAxios();
  return useQuery<salesReportDashboardResponse, Error>({
    queryKey: ["salesReportDashboard"],
    queryFn: async () => getAdminSalesReportDashboardDetails(api),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 30, // 5 minutes
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useGetPaginatedUnmatchedSalesReport(params: { page:number,releaseTitle:string,limit:string,productType:string,}) {
  const api = UseAxios();
  return useQuery<PAGINATION<ISalesReport>, Error>({
    queryKey: [
      "unmatchedSalesReport",
      params.page,
      // params.sort,
      params.releaseTitle,
      params.productType,
      // params.promotionStatus,
    ],
    queryFn: async () => getAllUnmatchedSalesreport(api, params),
    placeholderData: (prev) => prev, // avoids UI flicker
    retry: (failedCount, error) =>
      handleReactQueryApiCallError(failedCount, error),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export const useGetUserNotifications = () => {
  const api = UseAxios();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => getUserNotification(api),
    staleTime: 1000 * 60 * 5, // 15 minutes: consider data fresh
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });
};

export const useGetDPMDsp = () => {
  return useQuery<DPMDsp, Error>({
    queryKey: ["dpm-dsp"],
    queryFn: () => getDPMDsp(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours: consider data fresh
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });
};