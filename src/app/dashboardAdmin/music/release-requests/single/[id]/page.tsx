"use client";
import React, { use, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { CircleCheck, FileSearch, Music, X } from "lucide-react";
import { useGetAdminSingleDetails } from "@/util/customHooks/useQueries";
import UseAxios from "@/util/customHooks/UseAxios";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const queryClient = useQueryClient();
  const api = UseAxios();
  const dashboardContext = useContext(DashboardContext);
  const [isSubmitting, setisSubmitting] = useState(false);
  const [showRejectModal, setshowRejectModal] = useState(false);
  const [rejectReason, setrejectReason] = useState("");
  const [showConfirmApproveSong, setshowConfirmApproveSong] = useState(false);

  const { id } = use(params);
  if (!id) {
    return <InlineLoadingScreen />;
  }
  const {
    isLoading: isLoadingSingleDetails,
    data: singleDetails,
    isFetching,
    isPending,
    isRefetching,
    isError,
  } = useGetAdminSingleDetails({ songId: id });
  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Song Info");
  }, []);

  console.log(id);
  const handleRejectSubmit = () => {
    if (rejectReason.trim()) {
      handleRejectRelease();
      setshowRejectModal(false);
      setrejectReason("");
    }
  };
  const handleApproveRelease = async () => {
    try {
      setisSubmitting(true);
      const res = await api.post(
        "admin/music/request-release/single/" + singleDetails?.release?._id,
        {
          requestType: "approved",
        },
      );
      console.log(res.data);
      toast.success(res.data.msg);
      await queryClient.invalidateQueries({ queryKey: ["release-request"] });
      if (singleDetails?.release) {
        singleDetails.release.releaseStatus = "approved";
      }
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

  const handleRejectRelease = async () => {
    try {
      setisSubmitting(true);
      if (!rejectReason) {
        return toast.warn("Please enter the reason for the rejected.");
      }
      const res = await api.post(
        "admin/music/request-release/single/" + singleDetails?.release?._id,
        {
          requestType: "rejected",
          message: rejectReason,
        },
      );
      console.log(res.data);
      toast.success(res.data.msg);
      await queryClient.invalidateQueries({ queryKey: ["release-request"] });
      if (singleDetails?.release) {
        singleDetails.release.releaseStatus = "rejected";
      }
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

  const handleDownloadSong = async () => {
    try {
      setisSubmitting(true);
      const res = await api.get("admin/music/all-releases/singles", {
        params: { songId: singleDetails?.release?._id },
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

  const handleViewCoverLincense = () => {
    if (singleDetails?.release.license) {
      const url = singleDetails?.release.license;
      window.open(url, "_blank");
    }
  };

  return (
    <>
      {/* Main Modal */}
      <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-5">
        <Link
          href={"/dashboardAdmin/music/release-requests/single"}
          aria-label="go back"
          className="bg-main-white/70 p-3 w-[48px] h-[48px] text-primary! text-2xl rounded-full shadow-2xl shadow-black my-2"
        >
          <Image
            src={"/arrow-left.svg"}
            height={32}
            width={32}
            alt="arrow left"
          />
        </Link>
        {isSubmitting || !singleDetails || isLoadingSingleDetails ? (
          <InlineLoadingScreen />
        ) : (
          <>
            <div className="flex mt-3">
              {/* Content */}
              <div className="p-3 flex-2 max-w-[70%] w-full overflow-hidden">
                <div className="flex gap-5">
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
                  <div className=" items-center gap-4 mb-10">
                    <button
                      onClick={() => handleViewCoverLincense()}
                      disabled={!singleDetails?.release.license}
                      aria-label="view cover lincense"
                      className={
                        "flex items-center gap-2 font-bold w-full transition-colors not-disabled:text-primary-500 not-disabled:hover:text-primary/90 disabled:text-gray-500"
                      }
                    >
                      {/* Icon placeholder - add your music note icon here */}
                      <div className="w-fit h-fit p-2 rounded-lg bg-neutral-100">
                        <FileSearch />
                      </div>
                      View Cover License
                    </button>
                  </div>
                </div>

                {/* Song Details Grid */}
                <div className="flex flex-col gap-x-12">
                  {/* Song Name */}
                  <div className="flex-1">
                    <p className="text-text-disable font-bold text-sm mb-1">
                      Email
                    </p>
                    <p className="text-gray-900 text-lg font-medium">
                      {singleDetails.release.user.email}
                    </p>
                  </div>
                  <div className="border border-neutral-100 mb-6"></div>

                  <div className="flex ">
                    {/* Song Name */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Song name
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {singleDetails.release.releaseTitle}
                      </p>
                    </div>

                    {/* Artist */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Artist
                      </p>
                      <div>
                        <p className="text-gray-900 text-lg font-medium mb-1">
                          {singleDetails.release.artistName}
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
                              {singleDetails.release.artist.spotifyId}
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
                              {singleDetails.release.artist.appleId}
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
                        {singleDetails.release.genre}
                      </p>
                    </div>

                    {/* Release Date */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Release Date
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {new Date(
                          singleDetails.release?.releaseDate,
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
                        {singleDetails.release.upc}
                      </p>
                    </div>
                    {/* isrc */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        ISRC
                      </p>
                      <p className="text-gray-900 text-lg font-medium">
                        {singleDetails.release.isrc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* border line */}
                <div className="border border-neutral-100 mb-6"></div>
                {/* Featured Artists */}
                <div className="flex w-full gap-1">
                  <div className="flex-1 max-w-[50%]">
                    <p className="text-text-disable font-bold text-sm mb-1">
                      Featured Artists
                    </p>
                    <div className="flex w-full gap-2 overflow-x-auto max-w-[700px]">
                      {singleDetails.release.featuredArtist.map(
                        (item, index) => (
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
                        ),
                      )}
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
                        {singleDetails.release.producer
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
                      {singleDetails.release.songWriter
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
                        {singleDetails.release.producer
                          .map((item) => item.name)
                          .join(", ")}{" "}
                      </div>
                      {/* fade hint on the right */}
                      <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="border border-neutral-100 mb-6"></div>

                <div className="flex">
                  {/* copy right holder */}
                  <div className="flex-1">
                    <p className="text-text-disable font-bold text-sm mb-1">
                      CopyRightHolder
                    </p>
                    <p className="text-gray-900 text-lg font-medium">
                      {singleDetails.release.copyRightHolder}
                    </p>
                  </div>
                  {/* copy right year */}
                  <div className="flex-1">
                    <p className="text-text-disable font-bold text-sm mb-1">
                      CopyRightYear
                    </p>
                    <p className="text-gray-900 text-lg font-medium">
                      {singleDetails.release.copyRightYear}
                    </p>
                  </div>
                </div>

                <div className="border border-neutral-100 mb-6"></div>

                <div className="flex">
                  {/*catalog number */}
                  <div className="flex-1">
                    <p className="text-text-disable font-bold text-sm mb-1">
                      Catalog Number
                    </p>
                    <p className="text-gray-900 text-lg font-medium">
                      {singleDetails.release.catalogNumber}
                    </p>
                  </div>
                  {/* explicit content */}
                  <div className="flex-1">
                    <p className="text-text-body font-bold text-sm my-1">
                      Explicit Content
                    </p>
                    <input
                      type="checkbox"
                      checked={singleDetails.release.explicitContent}
                      disabled
                      className="cursor-pointer w-5 h-5 accent-primary-500"
                    />
                  </div>
                </div>
                <div className="border border-neutral-100 mb-6"></div>
                {/*Lyrics */}
                <div className="flex-1">
                  <p className="text-text-disable font-bold text-sm mb-1">
                    Lyrics
                  </p>
                  <p className="text-gray-900 text-lg font-medium whitespace-pre-wrap max-h-[500] h-full overflow-y-auto">
                    {singleDetails.release?.lyrics}
                  </p>
                </div>

                {/* Action Buttons */}
                {singleDetails.release.releaseStatus === "pending" && (
                  <div className="bg-[#F0F0E7] border border-neutral-100 text-white flex justify-end items-center gap-5 h-20 pr-10 fixed bottom-0 z-2 left-0 w-full">
                    <button
                      onClick={() => setshowRejectModal(true)}
                      className="px-6 py-2 bg-error-500 border-2 border-red-500 font-semibold rounded-lg hover:bg-error-400 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setshowConfirmApproveSong(true)}
                      className="px-6 py-2 bg-primary-500  font-semibold rounded-lg hover:bg-primary-500/90 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>

              {/* side bar */}
              <div className="flex-1 flex flex-col items-end! gap-5">
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <div className=" relative overflow-hidden w-50 h-50">
                    <Image
                      priority={false}
                      src={
                        singleDetails.release.releaseImage || "/signinimage.png"
                      }
                      alt="release image"
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl capitalize font-normal leading-[30px] tracking-tighter text-main-heading">
                      {singleDetails.release.releaseTitle}
                    </h1>
                    <p className="text-md capitalize font-light leading-[20px] tracking-tighter text-main-heading">
                      {singleDetails.release.artistName}
                    </p>
                  </div>
                </div>
                <div className="bg-secondary-50 rounded-xl p-3 mb-2 flex items-center justify-between max-w-fit">
                  <div className="flex items-center gap-4">
                    {/* Album Art Placeholder */}
                    <a
                      aria-label="download cover art"
                      download="releaseImage"
                      href={
                        singleDetails.release.releaseImage || "/signinimage.png"
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
              </div>
            </div>
            {/* Reject Reason Modal */}
            {showRejectModal && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm  bg-opacity-60 flex items-center justify-center z-[60]">
                <div className="bg-white rounded-2xl w-[500px] shadow-2xl">
                  {/* Reject Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Reject Release
                    </h3>
                    <button
                      onClick={() => {
                        setshowRejectModal(false);
                        setrejectReason("");
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Reject Modal Content */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">
                      Please provide a reason for rejecting this release:
                    </p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setrejectReason(e.target.value)}
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      placeholder="Enter rejection reason..."
                    />

                    {/* Reject Modal Buttons */}
                    <div className="flex items-center justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setshowRejectModal(false);
                          setrejectReason("");
                        }}
                        className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRejectSubmit}
                        disabled={!rejectReason.trim()}
                        className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Submit Rejection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/*info pop up */}
            <div
              className={
                showConfirmApproveSong
                  ? " fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl  "
                  : " hidden"
              }
            >
              <div className="max-w-[400px] h-[400px]">
                <div className="flex flex-col w-fit py-5 px-10 justify-center items-center bg-neutral-100  rounded-lg shadow-2xl">
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="flex justify-center my-5">
                      <CircleCheck size={50} color="#103958" strokeWidth={1} />
                    </div>
                    <h3 className="text-xl font-normal leading-[30px] tracking-[-1px] text-main-heading text-center">
                      Approve Release
                    </h3>
                    <p className="text-body-two-regular text-text-body text-center">
                      You&apos;re about to approve this single for distribution.
                      Once approved, it will be sent to selected platforms and
                      cannot be edited.
                    </p>
                  </div>
                  <div className="flex gap-5 mt-5">
                    <button
                      aria-label="cancel"
                      disabled={false}
                      onClick={() => {
                        setshowConfirmApproveSong(false);
                      }}
                      className={
                        "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/20 flex text-primary-500 outline-2 outline-primary-500 "
                      }
                    >
                      Cancel
                    </button>
                    <button
                      aria-label="approve release"
                      disabled={isSubmitting}
                      onClick={() => {
                        setshowConfirmApproveSong(false);
                        handleApproveRelease();
                      }}
                      className={
                        "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/20 flex text-primary-500 outline-2 outline-primary-500 "
                      }
                    >
                      Approve Release
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
