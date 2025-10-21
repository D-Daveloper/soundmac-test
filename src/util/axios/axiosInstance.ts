// // lib/axiosInstance.ts

// import axios, { AxiosError } from "axios";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// const router = useRouter();

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_APP_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: false, // set to true if you use cookies for auth
// });

// // 🧩 Request Interceptor
// api.interceptors.request.use(
//   (config) => {
//     // Example: attach auth token from localStorage
//     if (typeof window != undefined) {
//       const token = localStorage.getItem("tatum_token");
//       if (token) {
//         config.headers = config.headers || {};
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // 🧩 Response Interceptor
// api.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError) => {
//     const status = error.response?.status;
//     const message =
//       (error.response?.data as any)?.msg ||
//       "Something went wrong. Please try again.";

//     // 🔥 Display toast depending on status code
//     if (status === 401) {toast.error("Session expired. Please login again."); router.push("/login");}
//     else if (status === 403) toast.error("You are not authorized for this action.");
//     else if (status === 500) toast.error("Server error. Try again later.");
//     else toast.error(message);

//     return Promise.reject(error);
//   }
// );

// export default api;
