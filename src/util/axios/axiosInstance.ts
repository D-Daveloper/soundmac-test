// // lib/axiosInstance.ts

import { AdminAlbumDetailsResponse, adminDashboardType, AdminRelease, AdminSingleDetailsResponse, AdminUserDetailsResponse, AdminWithdrawalDetailsResponse, albumFromApi, AllArtistResponse, AllLabelResponse, AllSupportRequestsResponse, Artist, ArtistDetails, ArtistStat, CreateArtistForm, labelResponse, PAGINATION, PayStackBankListResponse, ReleaseRequestResponse, songFromApi, WithdrawalResponse, withdrawals } from "@/app/type";
import axios, { AxiosInstance } from "axios";
import { IUser } from "../models/userModel";
import { IPromotion } from "../models/promotionModel";

export async function getDashboard(api: AxiosInstance) {
  const res = await api.get("dashboard");
  return res.data;
}

export const getCurrentUser = async (api: AxiosInstance): Promise<IUser> => {
  const res = await api.get("users/user");
  return res.data?.user;
};

export const getArtists = async (
  api: AxiosInstance,
  params:{ page:number,sort:string,artistName:string }
): Promise<PAGINATION<Artist>> => {
  const res = await api.get<Promise<PAGINATION<Artist>>>("users/artist", {
    params:params,
  });
  return res.data;
};

export const getUserArtistsNames = async (
  api: AxiosInstance,
): Promise<string[]> => {
  const res = await api.get<Promise<string[]>>("song/artist");
  return res.data;
};

export const getArtistStats = async (
  api: AxiosInstance,
  artistName:string 
): Promise<ArtistStat> => {
  const res = await api.get<Promise<ArtistStat>>("users/artist/stats/"+artistName);
  return res.data;
};

export const createArtist = async (
  api: AxiosInstance,
  form: CreateArtistForm
) => {
  const res = await api.post("users/artist", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const DeleteArtist = async (
  api: AxiosInstance,
  form: {artist_name:string}
) => {
  const res = await api.delete("users/artist", {
    data: form,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const getSongs = async (
  api: AxiosInstance,
  params:{ page:number,sort:string,songTitle:string,songStatusFilter:string,artist:string }
): Promise<PAGINATION<songFromApi>> => {
  const res = await api.get<Promise<PAGINATION<songFromApi>>>("song", {
    params:params,
  });
  return res.data;
};
export const DeleteSong = async (
  api: AxiosInstance,
  form: {artist_name:string,releaseTitle:string}
) => {
  const res = await api.delete("song", {
    data: form,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const getAlbums = async (
  api: AxiosInstance,
  params:{ page:number,sort:string,albumTitle:string,albumStatusFilter:string,artist:string }
): Promise<PAGINATION<albumFromApi>> => {
  const res = await api.get<Promise<PAGINATION<albumFromApi>>>("album", {
    params:params,
  });
  return res.data;
};

export const getAlbum = async (
  api: AxiosInstance,
  params:{ albumTitle:string }
): Promise<PAGINATION<albumFromApi>> => {
  const res = await api.get<Promise<PAGINATION<albumFromApi>>>("album", {
    params:params,
  });
  return res.data;
};

export const getAlbumTracks = async (
  api: AxiosInstance,
  params:{ albumTitle:string }
): Promise<any> => {
  const res = await api.get<Promise<any>>("album/track", {
    params:params,
  });
  return res.data;
};

export const MarkAlbumComplete = async (
  api: AxiosInstance,
  form: {releaseTitle:string}
) => {
  const res = await api.patch("album", {
    ...form,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const DeleteAlbum = async (
  api: AxiosInstance,
  form: {releaseTitle:string}
) => {
  const res = await api.delete("album", {
    data: form,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const getListOfBanksFromPaystack = async (
): Promise<PayStackBankListResponse> => {
  const res = await axios.get<Promise<PayStackBankListResponse>>("https://api.paystack.co/bank?country=nigeria");
  return res.data;
};

export const getUserReleaseNames = async (
  api: AxiosInstance,
  params:{ artist:string }
): Promise<string[]> => {
  const res = await api.get<Promise<string[]>>("promotions/getreleasetitle",{
    params
  });
  return res.data;
};
export const getUserReleaseTrackNames = async (
  api: AxiosInstance,
  params:{ release_title:string }
): Promise<string[]> => {
  const res = await api.get<Promise<string[]>>("album/track/getusertracknames",{
    params
  });
  return res.data;
};
export const getPromotionData = async (
  api: AxiosInstance,
    params:{ page:number }

): Promise<PAGINATION<IPromotion>> => {
  const res = await api.get<Promise<PAGINATION<IPromotion>>>("promotions",{params});
  return res.data;
};
export const getWithdrawalHistory = async (
  api: AxiosInstance,
    params:{ cursor:string }

): Promise<WithdrawalResponse> => {
  const res = await api.get<Promise<WithdrawalResponse>>("users/withdrawal/history",{params});
  return res.data;
};

export async function getAdminDashboard(api: AxiosInstance):Promise<adminDashboardType> {
  const res = await api.get("admin/dashboard");
  return res.data;
}

export const getAllReleases = async (
  api: AxiosInstance,
  params:{ page:number,sort:string,releaseTitle:string,releaseStatusFilter:string,artist:string,limit:string,releaseType?:string }
): Promise<PAGINATION<AdminRelease>> => {
  const res = await api.get<Promise<PAGINATION<AdminRelease>>>("admin/music/all-releases", {
    params:params,
  });
  return res.data;
};


export const getAdminArtistsNames = async (
  api: AxiosInstance,
): Promise<string[]> => {
  const res = await api.get<Promise<string[]>>("admin/artist");
  return res.data;
};
export const getAdminAlbumDetails = async (
  api: AxiosInstance,
  params:{albumId:string}
): Promise<AdminAlbumDetailsResponse> => {
  const res = await api.get<Promise<AdminAlbumDetailsResponse>>("admin/music/all-releases/album",{params});
  return res.data;
};
export const getAdminSingleDetails = async (
  api: AxiosInstance,
  params:{songId:string}
): Promise<AdminSingleDetailsResponse> => {
  const res = await api.get<Promise<AdminSingleDetailsResponse>>("admin/music/request-release/single/"+params.songId,);
  return res.data;
};
export const getReleaseRequest = async (
  api: AxiosInstance,
    params:{ cursor:string,releaseTitle:string ,limit:string,releaseType:string}

): Promise<ReleaseRequestResponse> => {
  const res = await api.get<Promise<ReleaseRequestResponse>>("admin/music/request-release",{params});
  return res.data;
};
export const getAllArtists = async (
  api: AxiosInstance,
    params:{ cursor:string,artistName:string ,limit:string,artistStatus:string}

): Promise<AllArtistResponse> => {
  const res = await api.get<Promise<AllArtistResponse>>("admin/artist/all-artists",{params});
  return res.data;
};

export const getArtistDetails = async (
  api: AxiosInstance,
  params:{ page:number,releaseTitle:string,releaseStatusFilter:string,limit:string,id:string }
): Promise<ArtistDetails> => {
  const res = await api.get<Promise<ArtistDetails>>("admin/artist/all-artists/"+params.id, {
    params:params,
  });
  return res.data;
};
export const getAllUsers = async (
  api: AxiosInstance,
  params:{ 
  page: number;
  sort: string;
  name: string;
  limit: string;
  accountType: string; 
  userStatus:string
}
): Promise<PAGINATION<IUser>> => {
  const res = await api.get<Promise<PAGINATION<IUser>>>("admin/users/manage-users", {
    params:params,
  });
  return res.data;
};
export const getAdminUserDetails = async (
  api: AxiosInstance,
  params:{userId:string}
): Promise<AdminUserDetailsResponse> => {
  const res = await api.get<Promise<AdminUserDetailsResponse>>("admin/users/manage-users/"+params.userId,);
  return res.data;
};

export const getUserWithdrawalHistory = async (
  api: AxiosInstance,
  params:{ cursor:string,userId:string }

): Promise<WithdrawalResponse> => {
  const res = await api.get<Promise<WithdrawalResponse>>("admin/users/manage-users/" + params.userId +"/history",{params});
  return res.data;
};

export const getAllVerificationRequests = async (
  api: AxiosInstance,
  params:{ 
  page: number;
  sort: string;
  limit: string;
}
): Promise<PAGINATION<IUser>> => {
  const res = await api.get<Promise<PAGINATION<IUser>>>("admin/users/verification-requests", {
    params:params,
  });
  return res.data;
};

export const getAllWithdrawalRequests = async (
  api: AxiosInstance,
  params:{ 
  page: number;
  sort: string;
  limit: string;
  withdrawalStatus:string;
  email:string;
}
): Promise<PAGINATION<withdrawals>> => {
  const res = await api.get<Promise<PAGINATION<withdrawals>>>("admin/finance/withdrawal-requests", {
    params:params,
  });
  return res.data;
};

export const getAdminWithdrawalDetails = async (
  api: AxiosInstance,
  params:{withdrawalId:string}
): Promise<AdminWithdrawalDetailsResponse> => {
  const res = await api.get<Promise<AdminWithdrawalDetailsResponse>>("admin/finance/withdrawal-requests/"+params.withdrawalId,{params});
  return res.data;
};

export const getAllSupportRequests = async (
  api: AxiosInstance,
    params:{ cursor:string,limit:string,supportStatus:string}

): Promise<AllSupportRequestsResponse> => {
  const res = await api.get<Promise<AllSupportRequestsResponse>>("admin/users/support-requests",{params});
  return res.data;
};

export const getAllPromotions = async (
  api: AxiosInstance,
  params:{ page:number,sort:string,releaseTitle:string,limit:string,promotionType:string,promotionStatus:string }
): Promise<PAGINATION<IPromotion>> => {
  const res = await api.get<Promise<PAGINATION<IPromotion>>>("admin/more/promotions", {
    params:params,
  });
  return res.data;
};

export const getPromotionDetails = async (
  api: AxiosInstance,
  params:{promotionId:string}
): Promise<IPromotion> => {
  const res = await api.get<Promise<IPromotion>>("admin/more/promotions/"+params.promotionId,);
  return res.data;
};
export const getAlllabels = async (
  api: AxiosInstance,
    params:{ cursor:string,labelName:string,limit:string,labelStatus:string}

): Promise<AllLabelResponse> => {
  const res = await api.get<Promise<AllLabelResponse>>("admin/artist/all-labels",{params});
  return res.data;
};

export const getlabel = async (
  api: AxiosInstance,
  params:{labelId:string }

): Promise<labelResponse> => {
  const res = await api.get<Promise<labelResponse>>("admin/artist/all-labels/" + params.labelId);
  return res.data;
};