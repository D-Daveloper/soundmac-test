"use client";
import axios, { AxiosError, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const UseAxios = () => {

  const router = useRouter();

  const api = axios.create({
    baseURL:
      process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3000/api/",
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true, // set to true if you use cookies for auth
  });

  // // 🧩 Request Interceptor
  // api.interceptors.request.use(
  //   (config) => {
  //     // Example: attach auth token from localStorage
  //     if (typeof window != 'undefined') {
  //       const token = localStorage.getItem("soundmacToken");
  //       if (token) {
  //         config.headers = config.headers || {};
  //         config.headers.Authorization = `Bearer ${token}`;
  //       }
  //     }
  //     return config;
  //   },
  //   (error) => Promise.reject(error)
  // );

  // 🧩 Response Interceptor
  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const { status, data } = error.response as AxiosResponse;

      const message =
        (error.response?.data as any)?.msg ||
        "Something went wrong. Please try again.";

      // 🔥 Display toast depending on status code
      if (status === 401) {
        if (typeof window != "undefined") {
          const origin = window.location.origin;
          const fullUrl = window.location.href;
          const redirect = fullUrl.split(origin)[1];
          console.log(redirect);
          
          toast.error("Session expired. Please login again.");
          router.push("/login" + (redirect ? `?redirect=${redirect}` : ""));
        }
      }else if (status === 400) {
        if (data.validationErrors) {
          const modelStateErrors: string[] = [];
          data.validationErrors.forEach((i: string) => {
            modelStateErrors.push(i);
            toast.error(i);
          });
          return;
        }
        // throw modelStateErrors.flat();

        toast.error(message);
      } else if (status === 403)
        toast.error("You are not authorized for this action.");
        else if (status === 404) toast.error(message || "Not Found.");
        else if (status === 500) toast.error(message || "Server error. Try again later.");
        else toast.error(message);

      return Promise.reject(error);
    }
  );

  return api;
};

export default UseAxios;
