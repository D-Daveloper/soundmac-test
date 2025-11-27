// "use client";
// import UserRoute from "@/app/protectedRoute/protectedRoute";
// import classes from "./manage-artist.module.css";
// import { useContext, useState, useEffect } from "react";
// import axios, { AxiosError, AxiosResponse } from "axios";
// import UserContext from "@/app/context/userContext/userContext";
// import InformationContext from "@/app/context/informationContext/informationContext";
// import LoadMore from "@/app/components/loadMore/loadMoare";
// import { SearchIcon } from "lucide-react";
// import useDebounce from "@/app/components/searchBox/searchBox";
// import Image from "next/image";
// import UseAxios from "@/util/customHooks/UseAxios";
// import { toast } from "react-toastify";
// import { Artist, ARTIST_TABLE, PAGINATION } from "@/app/type";

// const url = process.env.NEXT_PUBLIC_APP_URL_VERSION_2;

// export default function ManageArtist() {
//   const userContext = useContext(UserContext);
//   const api = UseAxios();
//   const informationContext = useContext(InformationContext);
//   const [fetchingArtist, setFetchingArtist] = useState(false);
//   const [artist, setArtist] = useState<Artist[]>([]);
//   const [pagination, setPagination] = useState<PAGINATION<Artist | null>(null);
//   const [page, setPage] = useState(1);
//   const [rows, setRows] = useState<ARTIST_TABLE[]>([]);
//   const [sortBy, setSortBy] = useState("created_at");
//   const [search, setSearch] = useState("");
//   const debouncedSearch = useDebounce(search, 1000);

//   // const fetchArtist = async (pageNum = 1) => {
//   //   const token = localStorage.getItem("token");
//   //   const config = {
//   //     headers: {
//   //       "Content-Type": "application/json",
//   //       Authorization: `Bearer ${token}`,
//   //     },
//   //   };

//   //   setFetchingArtist(true);
//   //   try {
//   //     const { data } = await axios.get(
//   //       `${url}/api/users/artist?page=${pageNum}&sort=${sortBy}`,
//   //       config
//   //     );

//   //     if (!pageNum || pageNum === 1) {
//   //       setArtist(data?.data?.artists);
//   //     } else {
//   //       setArtist((prev) => [...prev, ...data.data?.artists]);
//   //     }
//   //     setPagination(data?.data?.pagination);
//   //     informationContext?.addToast("success", "Success!", data.msg);
//   //   } catch (error) {
//   //     userContext?.handleAPIError(error);
//   //   } finally {
//   //     setFetchingArtist(false);
//   //   }
//   // };

//   const fetchArtist = async (pageNum = 1) => {
//     setFetchingArtist(true);
//     try {
//       let response: AxiosResponse;

//       if (debouncedSearch && debouncedSearch.trim() !== "") {
//         // 🔎 User is searching
//         response = await api.get(
//           `users/artist?page=${pageNum}&sort=${sortBy}&artistName=${debouncedSearch}`
//         );
//         setArtist(response.data?.data?.artists || []);
//       } else {
//         // 📋 Search is cleared or empty, fetch normally
//         response = await api.get(
//           `users/artist?page=${pageNum}&sort=${sortBy}`
//         );
//         // setArtist((prev) => [...prev, ...(response.data?.data?.artists ?? [])]);
//         if (!pageNum || pageNum === 1) {
//           setArtist(response?.data?.data?.artists);
//         } else {
//           setArtist((prev) => [...prev, ...response?.data.data?.artists]);
//         }
//       }
//       // setArtist((prev) => [...prev, ...response.data.data?.artists] || []);
//       setPagination(response.data?.data?.pagination || null);
//       informationContext?.addToast("success", "Success!", response.data.msg);
//     } catch (error) {
//       if (error instanceof AxiosError) {
//         console.log(error);
//         return;
//       }
//       toast.error(error as string);
//     } finally {
//       setFetchingArtist(false);
//     }
//   };

//   useEffect(() => {
//     setPage(1);
//     fetchArtist(1);
//   }, [sortBy, debouncedSearch]);

//   const handleDelete = async (artistId: string) => {
//     if (!confirm("Are you sure you want to delete this artist?")) return;

//     const token = localStorage.getItem("token");
//     const config = {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     };

//     try {
//       await axios.delete(`${url}/artists/${artistId}`, config);
//       setArtist((prev) => prev.filter((a) => a._id !== artistId));
//       informationContext?.addToast(
//         "success",
//         "Success!",
//         "Artist deleted successfully"
//       );
//     } catch (error) {
//       userContext?.handleAPIError(error);
//     }
//   };

//   if (!fetchingArtist && artist.length <= 0) {
//     return (
//       <div className={classes.emptyState}>
//         <svg
//           className={classes.emptyIcon}
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
//           />
//         </svg>
//         <h3 className={classes.emptyTitle}>No Artists Found</h3>
//         <p className={classes.emptyText}>Start by creating your first artist</p>
//       </div>
//     );
//   }

//   return (
//     <UserRoute>
//       <div>
//         <div className={classes.container + " ml-auto mr-10"}>
//           {/* Empty State */}
//           {/* Artists Grid */}
//           {/* <div className={classes.artistsGrid}>
//                     {artist.map((artistItem, index) => (
//                         <div key={index} className={classes.artistCard}>
//                             <div className={classes.artistImageContainer}>
//                                 {artistItem.artistImage ? (
//                                     <img
//                                         src={artistItem.artistImage}
//                                         alt={artistItem.artistName}
//                                         className={classes.artistImage}
//                                     />
//                                 ) : (
//                                     <div className={classes.noImage}>
//                                         <svg
//                                             className={classes.noImageIcon}
//                                             fill="none"
//                                             stroke="currentColor"
//                                             viewBox="0 0 24 24"
//                                         >
//                                             <path
//                                                 strokeLinecap="round"
//                                                 strokeLinejoin="round"
//                                                 strokeWidth={2}
//                                                 d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                                             />
//                                         </svg>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className={classes.artistInfo}>
//                                 <h3 className={classes.artistName}>{artistItem.artistName}</h3>
//                                 <p className={classes.artistMeta}>
//                                     Created: {new Date(artistItem.createdAt).toLocaleDateString()}
//                                 </p>
//                             </div>

//                             <div className={classes.artistActions}>
//                                 <button className={classes.editBtn}>
//                                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                                         <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//                                         <path d="m18.5 2.5 3 3L12 15l-4 1 1-4z" />
//                                     </svg>
//                                     Edit
//                                 </button>
//                                 <button
//                                     className={classes.deleteBtn}
//                                     onClick={() => handleDelete(artistItem._id)}
//                                 >
//                                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                                         <polyline points="3,6 5,6 21,6" />
//                                         <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
//                                     </svg>
//                                     Delete
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
//                 </div> */}

//           <div className=" w-[70%] mb-2">
//             <div className="flex justify-between items-center w-full gap-5 mt-5 flex-wrap">
//               <div className="text-[#717171]">
//                 Artist Found: {artist.length}
//               </div>
//               <div className="flex gap-5">
//                 <div className="p-2 flex bg-[#cfcfcf] rounded-2xl h-13 justify-center items-center ">
//                   <input
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     type="text"
//                     name="search"
//                     placeholder="Search"
//                     className="w-full h-full focus:outline-0"
//                   />
//                   <SearchIcon className="w-10" />
//                 </div>
//                 {/* Header Section */}
//                 <div className={classes.controls}>
//                   <select
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                     className={classes.sortSelect}
//                   >
//                     <option value="createdAt">Sort by Date</option>
//                     <option value="artistName">Sort by Name</option>
//                     <option value="updatedAt">Sort by Last Updated</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-[#d9d9d9] my-12 h-1"></div>
//             {/*divider*/}
//             <div className="flex flex-col gap-2 overflow-auto h-[250px] w-full py-10">
//               {artist.length > 0 &&
//                 artist?.map((artistItem, index) => (
//                   <div
//                     key={index}
//                     className={
//                       "flex w-full bg-[#d9d9d9] justify-center hover:cursor-pointer"
//                     }
//                     onClick={() => {
//                       const newRows: ARTIST_TABLE[] = [
//                         {
//                           ...artistItem,
//                           lastRoyalty: 0,
//                           totalRoyalty: 0,
//                           totalTracks: 0,
//                           totalReleases: 0,
//                         },
//                       ];
//                       setRows(newRows);
//                     }}
//                   >
//                     <div className="w-20 bg-[#d9d9d9] p-1">
//                       {artistItem.artistImage ? (
//                         <Image
//                           src={artistItem.artistImage}
//                           alt={artistItem.artistName}
//                           className={classes.artistImage + " rounded-full"}
//                           width={40}
//                           height={40}
//                         />
//                       ) : (
//                         <div className={classes.noImage + " rounded-full"}>
//                           <svg
//                             className={classes.noImageIcon}
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                             />
//                           </svg>
//                         </div>
//                       )}
//                     </div>
//                     <div className="w-1 bg-white h-full "></div>
//                     <div className={classes.artistInfo + " flex-1 my-auto p-1"}>
//                       <h3 className={classes.artistName}>
//                         {artistItem.artistName}
//                       </h3>
//                       <p className={classes.artistMeta}>
//                         Created:
//                         {new Date(artistItem.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>

//                     <div className={classes.artistActions + " p-2"}>
//                       <button className={classes.editBtn}>
//                         <svg
//                           width="16"
//                           height="16"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                         >
//                           <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//                           <path d="m18.5 2.5 3 3L12 15l-4 1 1-4z" />
//                         </svg>
//                         Edit
//                       </button>
//                       <button
//                         className={classes.deleteBtn}
//                         onClick={() => handleDelete(artistItem._id)}
//                       >
//                         <svg
//                           width="16"
//                           height="16"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                         >
//                           <polyline points="3,6 5,6 21,6" />
//                           <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
//                         </svg>
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           </div>

//           {/* Load More */}
//           <LoadMore
//             loading={fetchingArtist}
//             hasNextPage={pagination?.hasNextPage || false}
//             page={page}
//             setPage={(newPage: number) => {
//               setPage(newPage);
//               fetchArtist(newPage);
//             }}
//           />
//         </div>
//         <section className="w-full bg-zinc-100">
//           <div className=" w-full max-w-6xl px-4 py-6 ml-auto mr-25">
//             <h2 className="text-lg font-semibold text-zinc-800">
//               Artist’s Report
//             </h2>

//             <div className="mt-3 overflow-x-auto">
//               {/* Table wrapper for rounded corners & border */}
//               <div className="min-w-[800px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
//                 <table className="w-full table-fixed border-collapse">
//                   <colgroup>
//                     <col className="w-[18%]" />
//                     <col className="w-[12%]" />
//                     <col className="w-[12%]" />
//                     <col className="w-[23%]" />
//                     <col className="w-[23%]" />
//                     <col className="w-[12%]" />
//                     <col className="w-[12%]" />
//                   </colgroup>

//                   <thead className="bg-zinc-800 text-zinc-100">
//                     <tr className="divide-x divide-zinc-700">
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-left text-sm font-medium"
//                       >
//                         Artiste name
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-center text-sm font-medium"
//                       >
//                         Total Releases
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-center text-sm font-medium"
//                       >
//                         Total Tracks
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-left text-sm font-medium"
//                       >
//                         Apple ID
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-left text-sm font-medium"
//                       >
//                         Spotify ID
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-right text-sm font-medium"
//                       >
//                         Last Royalty
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-right text-sm font-medium"
//                       >
//                         Total Royalty
//                       </th>
//                     </tr>
//                   </thead>

//                   <tbody className="divide-y divide-zinc-200">
//                     {rows.map((r, idx) => (
//                       <tr
//                         key={idx}
//                         className="divide-x divide-zinc-200 hover:bg-zinc-50"
//                       >
//                         <td className="px-4 py-4 text-sm font-medium text-zinc-800">
//                           {r.artistName}
//                         </td>
//                         <td className="px-4 py-4 text-center text-sm text-zinc-700">
//                           {r.totalReleases}
//                         </td>
//                         <td className="px-4 py-4 text-center text-sm text-zinc-700">
//                           {r.totalTracks}
//                         </td>
//                         <td className="px-4 py-4 text-sm text-zinc-500">
//                           <a
//                             href={r.appleId}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="block max-w-full truncate underline-offset-2 hover:underline"
//                             title={r.appleId}
//                           >
//                             {r.appleId}
//                           </a>
//                         </td>
//                         <td className="px-4 py-4 text-sm text-zinc-500">
//                           <span
//                             className="block max-w-full truncate"
//                             title={r.spotifyId}
//                           >
//                             {r.spotifyId}
//                           </span>
//                         </td>
//                         <td className="px-4 py-4 text-right text-sm font-medium text-zinc-800">
//                           {r.lastRoyalty}
//                         </td>
//                         <td className="px-4 py-4 text-right text-sm font-semibold text-zinc-800">
//                           {r.totalRoyalty}
//                         </td>
//                       </tr>
//                     ))}
//                     {rows.length === 0 && (
//                       <tr>
//                         <td
//                           colSpan={7}
//                           className="px-4 py-10 text-center text-sm text-zinc-500"
//                         >
//                           No artists found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </section>
//       </div>
//     </UserRoute>
//   );
// }
