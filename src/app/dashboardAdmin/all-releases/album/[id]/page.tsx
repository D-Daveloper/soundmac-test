"use client";
import React, { use, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import {
  AdminAlbumDetails,
  AdminTrackDetails,
  albumFromApi,
  TrackFromApi,
} from "@/app/type";
import { Moon, Music, Sun } from "lucide-react";
import Link from "next/link";
import { useGetAdminAlbumDetails } from "@/util/customHooks/useQueries";
import { useRouter } from "next/navigation";
import UseAxios from "@/util/customHooks/UseAxios";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const api = UseAxios();
  const dashboardContext = useContext(DashboardContext);
  const [isSubmitting, setisSubmitting] = useState(false);
  const [isTrack, setisTrack] = useState(false);
  const [album, setalbum] = useState<AdminAlbumDetails | null>(null);
  const [selectedTrack, setselectedTrack] = useState<
    AdminTrackDetails | AdminTrackDetails | null
  >(null);
  const { id } = use(params);
  if (!id) {
    return <InlineLoadingScreen />;
  }
  const {
    isLoading: isLoadingAlbumDetails,
    data: albumDetails,
    isFetching,
    isPending,
    isRefetching,
    isError,
  } = useGetAdminAlbumDetails({ albumId: id });
  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Album Details");
  }, []);
  useEffect(() => {
    if (albumDetails?.release) {
      setalbum(albumDetails.release);
      setisTrack(false);
    }
  }, [albumDetails]);
  console.log(id);
  const handleSelectTrack = (track: AdminTrackDetails) => {
    setisTrack(true);
    setselectedTrack(track);
  };
  // const handleApproveRelease = async () => {
  //   try {
  //     setisSubmitting(true);
  //     const res = await api.post("admin/all-releases/singles", {
  //       songId: releaseDetails?._id,
  //       requestType: "approved",
  //     });
  //     console.log(res.data);
  //     toast.success(res.data.msg);
  //     await queryClient.invalidateQueries({ queryKey: ["allreleases"] });
  //     if (releaseDetails) {
  //       releaseDetails.releaseStatus = "approved";
  //     }
  //   } catch (error) {
  //     if (isAxiosError(error)) {
  //       console.log(error);
  //       return;
  //     }
  //     toast.error("Something went wrong!");
  //   } finally {
  //     setisSubmitting(false);
  //   }
  // };

  // const handleRejectRelease = async () => {
  //   try {
  //     setisSubmitting(true);
  //     if (!rejectReason) {
  //       return toast.warn("Please enter the reason for the rejected.");
  //     }
  //     const res = await api.post("admin/all-releases/singles", {
  //       songId: releaseDetails?._id,
  //       requestType: "rejected",
  //       message: rejectReason,
  //     });
  //     console.log(res.data);
  //     toast.success(res.data.msg);
  //     await queryClient.invalidateQueries({ queryKey: ["allreleases"] });
  //     if (releaseDetails) {
  //       releaseDetails.releaseStatus = "rejected";
  //     }
  //   } catch (error) {
  //     if (isAxiosError(error)) {
  //       console.log(error);
  //       return;
  //     }
  //     toast.error("Something went wrong!");
  //   } finally {
  //     setisSubmitting(false);
  //   }
  // };

  const handleDownloadSong = async () => {
    try {
      setisSubmitting(true);
      const res = await api.get("admin/all-releases/album/track", {
        params: { trackId: selectedTrack?._id },
      });
      console.log(res.data);
      // 2. Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = res.data.downloadUrl;
      link.download = res.data.fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      // Append to body (required for Firefox)
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);

      toast.success(res.data.msg);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error("Something went wrong!");
    } finally {
      setisSubmitting(false);
    }
  };

  return (
    <>
      {/* Main Modal */}
      <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-5">
        {isSubmitting || !albumDetails || isLoadingAlbumDetails ? (
          <InlineLoadingScreen />
        ) : (
          <>
            <button
              onClick={() => router.back()}
              aria-label="go back"
              className="bg-main-white/70 p-3 w-[48px] h-[48px] text-primary! text-2xl rounded-full shadow-2xl shadow-black my-2"
            >
              <Image
                src={"/arrow-left.svg"}
                height={32}
                width={32}
                alt="arrow left"
              />
            </button>
            <div className="flex mt-3">
              {/* Content */}
              <div className="p-3 flex-2 max-w-[70%] overflow-hidden">
                {isTrack && (
                  <div className="flex items-center gap-4 mb-10">
                    <button
                      onClick={handleDownloadSong}
                      aria-label="download music"
                      className="flex items-center gap-2 text-primary-500 font-bold hover:text-primary/90 transition-colors"
                    >
                      {/* Icon placeholder - add your music note icon here */}
                      <div className="w-fit h-fit p-2 rounded-lg bg-neutral-100">
                        <Music />
                      </div>
                      Download Audio file
                    </button>
                    <button className="w-fit h-fit px-4 py-2 bg-primary-500 rounded-lg flex items-center justify-center text-white hover:bg-primary-500/90 transition-colors">
                      {/* Icon */}
                      <Image
                        priority={false}
                        src={"/play-circle.svg"}
                        alt="play icon"
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>
                )}
                {/* Song Details Grid */}
                <div className="flex flex-col gap-x-12">
                  <div className="flex ">
                    {/* Song Name */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Album name
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {albumDetails.release.releaseTitle}
                      </p>
                    </div>

                    {/* Artist */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Artist
                      </p>
                      <div>
                        <p className="text-gray-900 text-lg font-medium mb-1">
                          {albumDetails.release.artistName}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            {/* Spotify icon placeholder */}
                            <Image
                              priority={false}
                              src={"/spotify.svg"}
                              alt="search icon"
                              width={20}
                              height={20}
                            />
                            <span className="text-sm text-gray-600">
                              {albumDetails.release.artist.spotifyId}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {/* Apple Music icon placeholder */}
                            <Image
                              priority={false}
                              src={"/applemusic.svg"}
                              alt="search icon"
                              width={20}
                              height={20}
                            />
                            <span className="text-sm text-gray-600">
                              {albumDetails.release.artist.appleId}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100 mb-6"></div>

                  <div className="flex">
                    {/* Genre */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Genre
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {albumDetails.release.genre}
                      </p>
                    </div>

                    {/* Release Date */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Release Date
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {new Date(
                          albumDetails.release?.releaseDate,
                        ).toDateString()}
                      </p>
                    </div>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100 mb-6"></div>

                  <div className="flex">
                    {/* upc */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        UPC
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {albumDetails.release.upc}
                      </p>
                    </div>

                    {/*catalog number */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Catalog Number
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {albumDetails.release.catalogNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedTrack && isTrack && (
                  <>
                    {/* border line */}
                    <div className="border border-neutral-100 mb-6"></div>
                    {/* Featured Artists */}
                    <div className="flex w-full gap-1">
                      <div className="flex-1 max-w-[50%]">
                        <p className="text-text-disable font-bold text-sm mb-1">
                          Featured Artists
                        </p>
                        <div className="flex w-full gap-2 overflow-x-auto max-w-[700px]">
                          {selectedTrack.featuredArtist.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-5 bg-neutral-100 px-2 rounded-md w-fit whitespace-nowrap"
                            >
                              <p className="text-gray-900 text-lg font-medium min-w-fit px-2">
                                {item.artistName} |
                              </p>
                              <div className="flex items-center gap-1.5 mr-2">
                                <Image
                                  priority={false}
                                  src={"/spotify.svg"}
                                  alt="search icon"
                                  width={20}
                                  height={20}
                                />
                                <span className="text-sm text-gray-600">
                                  {item.spotifyId}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Image
                                  priority={false}
                                  src={"/applemusic.svg"}
                                  alt="search icon"
                                  width={20}
                                  height={20}
                                />
                                <span className="text-sm text-gray-600 pr-5">
                                  {item.appleId}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 max-w-[50%]">
                        <div className="relative max-w-[350px]">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Producers
                          </p>
                          <div
                            className="text-gray-900 text-lg font-medium whitespace-nowrap overflow-x-auto"
                            style={{
                              scrollbarWidth: "none",
                              msOverflowStyle: "none",
                            }}
                          >
                            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                            {selectedTrack.producer
                              .map((item) => item.name)
                              .join(", ")}{" "}
                          </div>
                          {/* fade hint on the right */}
                          <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    {/* border line */}
                    <div className="border border-neutral-100 mb-6"></div>
                    {/* Songwriter and Producer */}
                    <div className="grid grid-cols-2">
                      <div className="relative max-w-[400px]">
                        <p className="text-text-disable font-bold text-sm mb-1">
                          Song Writers
                        </p>
                        <div
                          className="text-gray-900 text-lg font-medium whitespace-nowrap overflow-x-auto"
                          style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                          }}
                        >
                          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                          {selectedTrack.songWriter
                            .map((item) => item.first_name)
                            .join(", ")}
                        </div>
                        {/* fade hint on the right */}
                        <div className="absolute right-0 top-0 h-full w-4 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                      </div>
                      <div>
                        <div className="relative max-w-[400px]">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Producers
                          </p>
                          <div
                            className="text-gray-900 text-lg font-medium whitespace-nowrap overflow-x-auto"
                            style={{
                              scrollbarWidth: "none",
                              msOverflowStyle: "none",
                            }}
                          >
                            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                            {selectedTrack.producer
                              .map((item) => item.name)
                              .join(", ")}{" "}
                          </div>
                          {/* fade hint on the right */}
                          <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="border border-neutral-100 mb-6"></div>
                    {/* explicit content */}
                    <div className="">
                      <p className="text-text-body font-bold text-sm my-1">
                        Explicit Content
                      </p>
                      <input
                        type="checkbox"
                        checked={selectedTrack.explicitContent}
                        disabled
                        className="cursor-pointer w-5 h-5 accent-primary-500"
                      />
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                {albumDetails.release.releaseStatus === "pending" &&
                  !isTrack && (
                    <div className="flex items-center justify-end gap-4 pt-2 border-t border-gray-200">
                      <button className="px-6 py-2 bg-white border-2 border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition-colors">
                        Reject
                      </button>
                      <button
                        // onClick={handleApproveRelease}
                        className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  )}
              </div>

              {/* side bar */}
              <div className="flex-1 flex flex-col items-end!">
                <div className="bg-secondary-50 rounded-xl p-3 mb-2 flex items-center justify-between max-w-fit">
                  <div className="flex items-center gap-4">
                    {/* Album Art Placeholder */}
                    <div className=" relative overflow-hidden w-10 h-10">
                      <Image
                        priority={false}
                        src={
                          albumDetails.release.releaseImage ||
                          "/signinimage.png"
                        }
                        alt="release image"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <a
                      aria-label="download cover art"
                      download="releaseImage"
                      href={
                        albumDetails.release.releaseImage || "/signinimage.png"
                      }
                      target="_blank"
                      className="flex items-center gap-2 text-primary-500! font-bold hover:text-primary/90! transition-colors"
                    >
                      {/* Icon placeholder - add your download icon here */}
                      <Image
                        priority={false}
                        src={"/arrow-down.svg"}
                        alt="download cover icon"
                        width={20}
                        height={20}
                      />
                      Download Cover Art
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setisTrack(false);
                  }}
                  className={
                    "rounded-xl p-3 flex items-center justify-between max-w-65 w-full max-h-14 h-full font-bold text-sm text-center mt-10 mb-5 " +
                    (!isTrack
                      ? " bg-primary-500 text-white"
                      : " bg-neutral-50 text-text-disable")
                  }
                >
                  Album Info
                </button>
                <div className=" max-w-65 w-full max-h-100 overflow-y-auto ">
                  {albumDetails.tracks.map((track, index) => (
                    <button
                      onClick={() => {
                        handleSelectTrack(track);
                      }}
                      key={index}
                      className={
                        "rounded-xl p-3 flex items-center justify-between max-w-65 w-full max-h-14 h-full font-bold text-sm text-center my-5 " +
                        (isTrack &&
                        selectedTrack &&
                        "isrc" in selectedTrack &&
                        selectedTrack.isrc === track.isrc
                          ? " bg-primary-500 text-white"
                          : " bg-neutral-50 text-text-disable")
                      }
                    >
                      {track.releaseTitle + " " + track.trackNumber}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
