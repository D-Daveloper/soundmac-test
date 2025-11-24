// src/hooks/useLoginMutation.ts
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "./UseAxios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { OtpForm } from "@/app/type";

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
      localStorage.clear();
      localStorage.setItem("soundMacAuthenticated", sessionExpiry.toString());
      const redirect = localStorage.getItem("soundmacRedirectAfterOtp"); //incase their session ends and they get redirected to login page after  login pick up the redirect link
      router.push(redirect || "/dashboard?tab=dashboard");
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
