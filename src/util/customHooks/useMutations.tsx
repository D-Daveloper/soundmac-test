// src/hooks/useLoginMutation.ts
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "./UseAxios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { CreateArtistForm, OtpForm } from "@/app/type";
import { createArtist, DeleteArtist } from "../axios/axiosInstance";

export const useOtpMutation = () => {
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
        process.env.NEXT_PUBLIC_SESSION_EXPIRY_SECONDS || "7200"
      );
      const sessionExpiry = Date.now() + session * 1000;
      const redirect = localStorage.getItem("soundmacRedirectAfterOtp"); //incase their session ends and they get redirected to login page after  login pick up the redirect link
      localStorage.clear();
      localStorage.removeItem("soundmacotpExpiry");
      localStorage.setItem("soundMacAuthenticated", sessionExpiry.toString());
      router.push(redirect? redirect : "/dashboard?tab=dashboard");
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
      queryClient.invalidateQueries({ queryKey: ["artists"] });
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
      queryClient.invalidateQueries({ queryKey: ["artists"] });
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
