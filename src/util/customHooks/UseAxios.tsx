"use client";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useMemo } from "react";
import { subscriptionModalStore } from "../store/subscriptionModalStore";

const useAxios = () => {
  const router = useRouter();

  // Wrap the instance creation in useMemo so it only initializes once
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3000/api/",
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // 🧩 Response Interceptor
    instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Safe destructuring in case the error didn't come from a server response (e.g., network error)
        if (!error.response) {
          toast.error("Network error. Please check your connection.");
          return Promise.reject(error);
        }

        const { status, data } = error.response as AxiosResponse;
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };
        const message =
          (data as any)?.msg || "Something went wrong. Please try again.";

        // 🔥 Display toast depending on status code
        if (status === 401) {
          if (
            originalRequest?.url?.includes("/api/auth/refresh") ||
            originalRequest?._retry
          ) {
            if (typeof window != "undefined") {
              const origin = window.location.origin;
              const fullUrl = window.location.href;
              const redirect = fullUrl.split(origin)[1];

              toast.error("Session expired. Please login again.");
              router.replace(
                "/login" + (redirect ? `?redirect=${redirect}` : ""),
              );
            }

            // CRITICAL FIX: You must return here to break out of the interceptor!
            return Promise.reject(error);
          }

          if (originalRequest) {
            originalRequest._retry = true;
          }

          try {
            // 1. Hit the refresh token endpoint in the background.
            await axios.post(
              "/api/auth/refresh",
              {},
              { withCredentials: true },
            );

            // 2. Re-run the exact original request that just failed.
            return originalRequest
              ? instance(originalRequest)
              : Promise.reject(error);
          } catch (refreshError) {
            // 3. Catch block triggers if the refresh fails
            if (typeof window != "undefined") {
              const origin = window.location.origin;
              const fullUrl = window.location.href;
              const redirect = fullUrl.split(origin)[1];

              toast.error("Session expired. Please login again.");
              router.replace(
                "/login" + (redirect ? `?redirect=${redirect}` : ""),
              );
            }
            return Promise.reject(refreshError);
          }
        } else if (status === 400) {
          if (data.validationErrors) {
            data.validationErrors.forEach((i: string) => {
              toast.error(i);
            });
            return Promise.reject(error);
          }
          toast.error(message);
        } else if (status === 402) {
          subscriptionModalStore.show()
          // toast.error(message || "Payment is required.");
          router.push("/pricing");
        } else if (status === 403) {
          toast.error(message || "You are not authorized for this action.");
        } else if (status === 404) {
          toast.error(message || "Not Found.");
        } else if (status === 500) {
          toast.error(message || "Server error. Try again later.");
        } else {
          toast.error(message);
        }

        return Promise.reject(error);
      },
    );

    return instance;
  }, [router]); // The dependency array ensures it stays stable

  return api;
};

export default useAxios;
