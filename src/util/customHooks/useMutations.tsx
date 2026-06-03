// src/hooks/useLoginMutation.ts
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "./UseAxios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { CreateArtistForm, OtpForm } from "@/app/type";
import {
  createArtist,
  DeleteAlbum,
  DeleteArtist,
  DeleteSong,
  MarkAlbumComplete,
} from "../axios/axiosInstance";
import { SetStateAction } from "react";

export const useOtpMutation = (setisSuccessfulRegistration?: React.Dispatch<SetStateAction<boolean>>) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const api = useAxios();

  return useMutation({
    mutationFn: async (form: OtpForm) => {
      const res = await api.post("auth/otp", form);
      return res.data;
    },
    onSuccess: async (data) => {
      toast.success(data.msg);
      // await queryClient.invalidateQueries({ queryKey: ["authUser"] });//was to invalidate the user
      // Seed the authUser query with the returned user details
      queryClient.setQueryData(["authUser"], data.user);
      const session = parseInt(
        process.env.NEXT_PUBLIC_SESSION_EXPIRY_SECONDS || "7200",
      );
      const sessionExpiry = Date.now() + session * 1000;
      const redirect = localStorage.getItem("soundmacRedirectAfterOtp"); //incase their session ends and they get redirected to login page after  login pick up the redirect link
      localStorage.setItem("soundMacAuthenticated", sessionExpiry.toString());
      const isRegister = localStorage.getItem("soundmacRegistration");
      localStorage.clear();
      if (isRegister && setisSuccessfulRegistration) {
        setisSuccessfulRegistration(true);
        return;
      }

      router.push(
        redirect
          ? redirect
          : data.user.role === "user"
            ? "/dashboard"
            : "/dashboardAdmin",
      );
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error("otp verification failed.");
    },
  });
};

export const useLoginMutation = () => {
  const api = useAxios();

  return useMutation({
    mutationFn: async (form: { email: string; password: string }) => {
      const res = await api.post("auth/login", form);
      return res.data;
    },
    onSuccess: async (data, variables) => {
      toast.success(data.msg);
      localStorage.setItem("soundmacPendingEmail", variables.email);
      console.log(data);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error("otp verification failed.");
    },
  });
};

export const useCreatArtistMutation = () => {
  const queryClient = useQueryClient();
  const api = useAxios();

  return useMutation({
    mutationFn: async (form: CreateArtistForm) => createArtist(api, form),
    onSuccess: async (data) => {
      toast.success(data.msg);
      await queryClient.invalidateQueries({ queryKey: ["artists"] });
      localStorage.removeItem("artistForm");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error("Something went wrong, Please try again.");
    },
  });
};

export const useDeleteArtistMutation = () => {
  const queryClient = useQueryClient();
  const api = useAxios();

  return useMutation({
    mutationFn: async (form: { artist_name: string }) =>
      DeleteArtist(api, form),
    onSuccess: async (data) => {
      toast.success(data.msg);
      await queryClient.invalidateQueries({ queryKey: ["artists"] });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error("Something went wrong, Please try again.");
    },
  });
};
export const useDeleteSongMutation = () => {
  const queryClient = useQueryClient();
  const api = useAxios();

  return useMutation({
    mutationFn: async (form: { artist_name: string; releaseTitle: string }) =>
      DeleteSong(api, form),
    onSuccess: async (data, variables) => {
      toast.success(data.msg);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error(error.message || "Something went wrong, Please try again.");
    },
  });
};
export const useMarkAlbumCompleteMutation = () => {
  const api = useAxios();

  return useMutation({
    mutationFn: async (form: { releaseId: string }) =>
      MarkAlbumComplete(api, form),
    onSuccess: async (data, variables) => {
      toast.success(data.msg);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        // delay for a while before showing the second message
        setTimeout(() => {
          toast.error((error.response?.data as any)?.msg1);
        }, 2000);
        console.log(error);
        return;
      }
      toast.error(error.message || "Something went wrong, Please try again.");
    },
  });
};
export const useDeleteAlbumMutation = () => {
  const api = useAxios();

  return useMutation({
    mutationFn: async (form: { releaseTitle: string }) =>
      DeleteAlbum(api, form),
    onSuccess: async (data, variables) => {
      toast.success(data.msg);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error(error.message || "Something went wrong, Please try again.");
    },
  });
};
