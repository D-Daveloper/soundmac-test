// hooks/useAxios.ts
// Keep your existing imports for useRouter, useMemo, toast and subscriptionModalStore as they are.
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { subscriptionModalStore } from "../store/subscriptionModalStore";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

type RetryableConfig = AxiosRequestConfig & {
  _retry?: boolean;
  _startedAt?: number;
};

// ---- Shared across ALL instances/components (module scope) ----
let refreshPromise: Promise<void> | null = null;
let lastRefreshAt = 0;
let isRedirectingToLogin = false;

const refreshAccessToken = (): Promise<void> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(process.env.NEXT_PUBLIC_BACKEND_API_URL + "auth/refresh", {}, { withCredentials: true })
      .then(() => {
        lastRefreshAt = Date.now();
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const useAxios = () => {
  const router = useRouter();

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3000/api/",
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    const handleSessionExpired = () => {
      if (typeof window === "undefined" || isRedirectingToLogin) return;

      isRedirectingToLogin = true;
      const redirect = window.location.href.split(window.location.origin)[1];

      toast.error("Session expired. Please login again.");
      router.replace("/login" + (redirect ? `?redirect=${redirect}` : ""));

      // Allow future redirects once navigation has settled
      setTimeout(() => {
        isRedirectingToLogin = false;
      }, 2000);
    };

    // Stamp each request with its start time (used to catch the race described below)
    instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      (config as RetryableConfig)._startedAt = Date.now();
      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (!error.response) {
          toast.error("Network error. Please check your connection.");
          return Promise.reject(error);
        }

        const { status, data } = error.response as AxiosResponse;
        const originalRequest = error.config as RetryableConfig | undefined;
        const message =
          (data as any)?.msg || "Something went wrong. Please try again.";

        if (status === 401) {
          // Already retried once, or the refresh endpoint itself failed
          if (
            !originalRequest ||
            originalRequest._retry ||
            originalRequest.url?.includes("/api/auth/refresh")
          ) {
            handleSessionExpired();
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          // Race guard: this request was sent BEFORE a refresh that already finished,
          // so it failed with the old token. Just retry it, don't refresh again.
          const startedAt = originalRequest._startedAt ?? 0;
          if (lastRefreshAt > startedAt) {
            return instance(originalRequest);
          }

          try {
            // First 401 starts the refresh; every other 401 awaits the same promise
            await refreshAccessToken();
            return instance(originalRequest);
          } catch (refreshError) {
            handleSessionExpired();
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
          subscriptionModalStore.show();
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
  }, [router]);

  return api;
};

export default useAxios;