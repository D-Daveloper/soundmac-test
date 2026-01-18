// // lib/axiosInstance.ts

import { Artist, ArtistStat, CreateArtistForm, PAGINATION, songFromApi } from "@/app/type";
import { AxiosInstance } from "axios";

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

// {
  /* <div className="capitalize ">
              <button onClick={()=>setMusic(!music)} className="w-full flex justify-between text-[16px] font-bold hover:cursor-pointer hover:bg-primary-500/90 py-2 px-4 rounded-lg focus:outline-none focus:bg-primary-500/90 ">
                Music
                  <Image
                    src="/arrow-down.png"
                    alt="arrow point up"
                    width={20}
                    height={20}
                    className=""
                  />
              </button>
              <div className="h-20">
                <div className={"transition-all duration-300 ml-7 mt-4 flex-col border-b-2 border-primary-500 "+ (music? " flex h-full pb-5" : "  h-0 pb-1")}>

                <button onClick={()=>setSection("upload")} disabled={!music} aria-hidden={!music} aria-disabled={!music} tabIndex={!music?-1:0} className={"transition-all duration-300 flex gap-5 font-extralight capitalize" +( music? " block opacity-100 focus:outline-none focus:text-primary-500/70 hover:cursor-pointer hover:text-primary-500/99" : " opacity-0")}>
                  <Image
                    src="/add.svg"
                    alt="add icon"
                    width={20}
                    height={20}
                    className=""
                  />
                  upload music
                </button>
                <button disabled={!music} aria-hidden={!music} aria-disabled={!music} tabIndex={!music?-1:0} className={"mt-6 transition-all duration-300 flex gap-5 font-extralight capitalize" +( music? " block opacity-100 focus:outline-none focus:text-primary-500/70 hover:cursor-pointer hover:text-primary-500/99" : " opacity-0")}>
                  <Image
                    src="/musiclibrary2.svg"
                    alt="an icon for a collection of songs"
                    width={20}
                    height={20}
                    className=""
                  />
                  manage release
                </button>
                </div>
              </div>
            </div>
              

            <div className="capitalize ">
              <button onClick={()=>setArtist(!artist)} className="w-full flex justify-between text-[16px] font-bold hover:cursor-pointer hover:bg-primary-500/90 py-2 px-4 rounded-lg focus:outline-none focus:bg-primary-500/90 ">
                Artists
                  <Image
                    src="/arrow-down.png"
                    alt="arrow point up"
                    width={20}
                    height={20}
                    className=""
                  />
              </button>
              <div className="h-30">
                <div className={"transition-all duration-300 ml-7 mt-4 flex-col border-b-2 border-primary-500 "+ (artist? " flex h-full pb-5" : "  h-0 pb-1")}>

                <button disabled={!artist} aria-hidden={!artist} aria-disabled={!artist} tabIndex={!artist?-1:0} className={"transition-all duration-300 flex gap-5 font-extralight capitalize" +( artist? " block opacity-100 focus:outline-none focus:text-primary-500/70 hover:cursor-pointer hover:text-primary-500/99" : " opacity-0")}>
                  <Image
                    src="/add.svg"
                    alt="add icon"
                    width={20}
                    height={20}
                    className=""
                  />
                  Create artist
                </button>
                <button disabled={!artist} aria-hidden={!artist} aria-disabled={!artist} tabIndex={!artist?-1:0} className={"mt-6 transition-all duration-300 flex gap-5 font-extralight capitalize" +( artist? " block opacity-100 focus:outline-none focus:text-primary-500/70 hover:cursor-pointer hover:text-primary-500/99" : " opacity-0")}>
                  <Image
                    src="/profile2user.svg"
                    alt="icon of a group of people"
                    width={20}
                    height={20}
                    className=""
                  />
                  manage artist
                </button>
                <button disabled={!artist} aria-hidden={!artist} aria-disabled={!artist} tabIndex={!artist?-1:0} className={"mt-6 transition-all duration-300 flex gap-5 font-extralight capitalize" +( artist? " block opacity-100 focus:outline-none focus:text-primary-500/70 hover:cursor-pointer hover:text-primary-500/99" : " opacity-0")}>
                  <Image
                    src="/likeshapes.svg"
                    alt="like icon"
                    width={20}
                    height={20}
                    className=""
                  />
                  collaborations
                </button>
                </div>
              </div>
            </div>
            <div className="capitalize ">
              <button onClick={()=>setInsight(!insight)} className="w-full flex justify-between text-[16px] font-bold hover:cursor-pointer hover:bg-primary-500/90 py-2 px-4 rounded-lg focus:outline-none focus:bg-primary-500/90 ">
                insights
                  <Image
                    src="/arrow-down.png"
                    alt="soundmac logo"
                    width={20}
                    height={20}
                    className=""
                  />
              </button>
              <div className="h-8">
                <div className={"transition-all duration-300 ml-7 mt-4 flex-col border-b-2 border-primary-500 "+ (insight? " flex h-full pb-5" : "  h-0 pb-1")}>

                <button disabled={!insight} aria-hidden={!insight} aria-disabled={!insight} tabIndex={!insight?-1:0} className={"transition-all duration-300 flex gap-5 font-extralight capitalize" +( insight? " block opacity-100 focus:outline-none focus:text-primary-500/70 hover:cursor-pointer hover:text-primary-500/99" : " opacity-0")}>
                  <Image
                    src="/musicplay.svg"
                    alt="headphones icon"
                    width={20}
                    height={20}
                    className=""
                  />
                  song performance
                </button>
                </div>
              </div>
            </div> */
// }

export async function getDashboard(api: AxiosInstance) {
  const res = await api.get("dashboard");
  return res.data;
}

export const getCurrentUser = async (api: AxiosInstance): Promise<any> => {
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