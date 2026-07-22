"use client";
import React, { use, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { CircleCheck, Music, X } from "lucide-react";
import { useGetPromotionDetails } from "@/util/customHooks/useQueries";
import UseAxios from "@/util/customHooks/UseAxios";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { IPromotion } from "@/util/models/promotionModel";
import { genreList } from "@/app/utils/constants";
import Select from "@/components/Select";
import { promotionCategory } from "@/app/constant";

export default function Page({
  params,
}: {
  params: Promise<{ promotionId: string }>;
}) {
  const queryClient = useQueryClient();
  const api = UseAxios();
  const dashboardContext = useContext(DashboardContext);
  const [isSubmitting, setisSubmitting] = useState(false);
  const [showRejectModal, setshowRejectModal] = useState(false);
  const [rejectForm, setrejectForm] = useState({
    rejectReason: "",
    rejectMessage: "",
  });
  const [showConfirmApproveSong, setshowConfirmApproveSong] = useState(false);

  const { promotionId } = use(params);
  if (!promotionId) {
    return <InlineLoadingScreen />;
  }
  const {
    isLoading: isLoadingSingleDetails,
    data: promotionDetails,
    isFetching,
    isPending,
    isRefetching,
    isError,
  } = useGetPromotionDetails({ promotionId });

  useEffect(() => {
    dashboardContext?.setHeader({title:"Song Info", showBackButton:true});
  }, []);

  console.log(promotionId);

  const handleApprovePromotion = async () => {
    try {
      setisSubmitting(true);
      const res = await api.post("admin/more/promotions/" + promotionId, {
        requestType: "approved",
      });
      console.log(res.data);
      toast.success(res.data.msg);
      if (promotionDetails) {
        promotionDetails.promotionStatus = "approved";
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
  const handleCompletePromotion = async () => {
    try {
      setisSubmitting(true);
      const res = await api.post("admin/more/promotions/" + promotionId, {
        requestType: "completed",
      });
      console.log(res.data);
      toast.success(res.data.msg);
      if (promotionDetails) {
        promotionDetails.promotionStatus = "completed";
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

  const handleRejectPromotion = async () => {
    try {
      setisSubmitting(true);
      if (
        !rejectForm ||
        !rejectForm.rejectMessage.trim() ||
        !rejectForm.rejectReason.trim()
      ) {
        return toast.warn("Please fill the form.");
      }
      const res = await api.post("admin/more/promotions/" + promotionId, {
        requestType: "rejected",
        ...rejectForm,
      });
      console.log(res.data);
      toast.success(res.data.msg);
      if (promotionDetails) {
        promotionDetails.promotionStatus = "pending";
      }
      setrejectForm({
        rejectReason: "",
        rejectMessage: "",
      });
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

  // const handleDownloadSong = async () => {
  //   try {
  //     setisSubmitting(true);
  //     const res = await api.get("admin/music/all-releases/singles", {
  //       params: { songId: promotionDetails?.release?._id },
  //     });
  //     console.log(res.data);
  //     // 2. Create temporary link and trigger download
  //     const link = document.createElement("a");
  //     link.href = res.data.downloadUrl;
  //     link.download = res.data.fileName;
  //     link.target = "_blank";
  //     link.rel = "noopener noreferrer";

  //     // Append to body (required for Firefox)
  //     document.body.appendChild(link);
  //     link.click();

  //     // Cleanup
  //     document.body.removeChild(link);

  //     toast.success(res.data.msg);
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

  const getStatusBadge = (status: IPromotion["promotionStatus"]) => {
    const styles = {
      approved: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      completed: "bg-[#2D68C4] text-white border-[#2D68C4]",
      draft: "bg-gray-100 text-gray-700 border-gray-200",
      rejected: "bg-error-500 text-white border-gray-200",
    };

    const icons = {
      approved: "/tick-circle.svg",
      pending: "/info-circle.svg",
      completed: "/info-circle.svg",
      draft: "/info-circle.svg",
      rejected: "/info-circle.svg",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
      >
        <Image
          priority={false}
          src={icons[status]}
          alt="search icon"
          width={10}
          height={10}
          className="text-white!"
        />
        {status}
      </span>
    );
  };
  return (
    <>
      {/* Main Modal */}
      <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-5">
        <div className="flex justify-between items-center mt-5 ">
          {/* <Link
            href={"/dashboardAdmin/more/promotions?promotionStatus=all"}
            aria-label="go back"
            className="bg-main-white/70 p-3 w-[48px] h-[48px] text-primary! text-2xl rounded-full shadow-2xl shadow-black my-2"
          >
            <Image
              src={"/arrow-left.svg"}
              height={32}
              width={32}
              alt="arrow left"
            />
          </Link> */}
          <div>
            {getStatusBadge(promotionDetails?.promotionStatus || "pending")}
          </div>
        </div>
        {isSubmitting || !promotionDetails || isLoadingSingleDetails ? (
          <InlineLoadingScreen />
        ) : (
          <>
            <div className="flex mt-3 mb-50">
              {/* Content */}
              <div className="p-3 flex-2 md:w-[80%] overflow-hidden">
                {/* Song Details Grid */}
                <div className="flex flex-col gap-x-12">
                  <div className="flex ">
                    {/* Song Name */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Promo Type
                      </p>
                      <p className="text-gray-900 text-base font-medium">
                        {promotionDetails.category}
                      </p>
                    </div>

                    {/* Artist */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Package
                      </p>
                      <div>
                        <p className="text-gray-900 text-base font-medium mb-1">
                          {promotionDetails.packageName}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100 mb-6"></div>
                  <div className="flex ">
                    {/* Song Name */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Song name
                      </p>
                      <p className="text-gray-900 text-base font-medium">
                        {promotionDetails.releaseTitle}
                      </p>
                    </div>

                    {/* Artist */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Artist
                      </p>
                      <div className="flex flex-col md:flex-row gap-x-3 items-center">
                        <p className="text-gray-900 text-base font-medium mb-1">
                          {promotionDetails.artist.artistName}
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
                              {promotionDetails.artist?.spotifyId || 'N/A'}
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
                              {promotionDetails.artist?.appleId || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* pitch play list */}
                  {promotionDetails.category ===
                    promotionCategory.playlistPitch && (
                    <div>
                      <div className="border border-neutral-100 mb-6"></div>
                      <div className="flex ">
                        {/* Song Name */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Label
                          </p>
                          <p className="text-gray-900 text-base font-medium">
                            {promotionDetails.pitchPlayListDetails.label}
                          </p>
                        </div>

                        {/* Artist */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            UPC
                          </p>
                          <div>
                            <p className="text-gray-900 text-base font-medium mb-1">
                              {promotionDetails.pitchPlayListDetails.upc}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-neutral-100 mb-6"></div>
                      <div className="flex ">
                        {/* Song Name */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Artist Gender
                          </p>
                          <p className="text-gray-900 text-base font-medium">
                            {promotionDetails.pitchPlayListDetails.artistGender}
                          </p>
                        </div>

                        {/* Artist */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Track Langauge
                          </p>
                          <div>
                            <p className="text-gray-900 text-base font-medium mb-1">
                              {
                                promotionDetails.pitchPlayListDetails
                                  .trackLanguage
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-neutral-100 mb-6"></div>
                      <div className="flex ">
                        {/* Song Name */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Country
                          </p>
                          <p className="text-gray-900 text-base font-medium">
                            {promotionDetails.pitchPlayListDetails.country || "-"}
                          </p>
                        </div>

                        {/* Artist */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Location
                          </p>
                          <div>
                            <p className="text-gray-900 text-base font-medium mb-1">
                              {promotionDetails.pitchPlayListDetails.location}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-neutral-100 mb-6"></div>
                      <div className="flex ">
                        {/* Song Name */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Release Date
                          </p>
                          <p className="text-gray-900 text-base font-medium">
                            {new Date(
                              promotionDetails.pitchPlayListDetails.releaseDate,
                            ).toDateString()}
                          </p>
                        </div>

                        {/* Artist */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Release Time
                          </p>
                          <div>
                            <p className="text-gray-900 text-base font-medium mb-1">
                              {
                                promotionDetails.pitchPlayListDetails
                                  .releaseTime
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-neutral-100 mb-6"></div>
                      <div className="flex ">
                        {/* Song Name */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Priority
                          </p>
                          <p className="text-gray-900 text-base font-medium">
                            {promotionDetails.pitchPlayListDetails.priority}
                          </p>
                        </div>

                        {/* Artist */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Configuration
                          </p>
                          <div>
                            <p className="text-gray-900 text-base font-medium mb-1">
                              {
                                promotionDetails.pitchPlayListDetails
                                  .configuration
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-neutral-100 mb-6"></div>
                      <div className="flex ">
                        {/* Song Name */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Type Of Release
                          </p>
                          <p className="text-gray-900 text-base font-medium">
                            {
                              promotionDetails.pitchPlayListDetails
                                .typeOfRelease
                            }
                          </p>
                        </div>

                        {/* Artist */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Focus Track
                          </p>
                          <div>
                            <p className="text-gray-900 text-base font-medium mb-1">
                              {promotionDetails.pitchPlayListDetails.focusTrack}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-neutral-100 mb-6"></div>
                      <div className="flex ">
                        {/* Song Name */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Focus Track ISRC
                          </p>
                          <p className="text-gray-900 text-base font-medium">
                            {
                              promotionDetails.pitchPlayListDetails
                                .focusTrackIsrc
                            }
                          </p>
                        </div>

                        {/* Artist */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Genre
                          </p>
                          <div>
                            <p className="text-gray-900 text-base font-medium mb-1">
                              {promotionDetails.pitchPlayListDetails.genre}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-neutral-100 mb-6"></div>
                      <div className="flex ">
                        {/* Song Name */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            SubGenre
                          </p>
                          <p className="text-gray-900 text-base font-medium">
                            {promotionDetails.pitchPlayListDetails.subgenres.join(
                              ", ",
                            )}
                          </p>
                        </div>

                        {/* Artist */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Mood
                          </p>
                          <div>
                            <p className="text-gray-900 text-base font-medium mb-1">
                              {promotionDetails.pitchPlayListDetails.mood}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-neutral-100 mb-6"></div>
                      <div className="flex ">
                        {/* Song Name */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Editorial Teams
                          </p>
                          <p className="text-gray-900 text-base font-medium">
                            {
                              promotionDetails.pitchPlayListDetails
                                .editorialTeams
                            }
                          </p>
                        </div>

                        {/* Artist */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Facebook Profile Link
                          </p>
                          <div>
                            <p className="text-gray-900 text-base font-medium mb-1">
                              {
                                promotionDetails.pitchPlayListDetails
                                  .facebookProfileLink
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-neutral-100 mb-6"></div>
                      <div className="flex ">
                        {/* Song Name */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Instagram Profile Link
                          </p>
                          <p className="text-gray-900 text-base font-medium">
                            {
                              promotionDetails.pitchPlayListDetails
                                .instagramProfileLink
                            }
                          </p>
                        </div>

                        {/* Artist */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Twitter Profile Link
                          </p>
                          <div>
                            <p className="text-gray-900 text-base font-medium mb-1">
                              {
                                promotionDetails.pitchPlayListDetails
                                  .twitterProfileLink
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-neutral-100 mb-6"></div>
                      <div className="flex ">
                        {/* Song Name */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Youtube Profile Link
                          </p>
                          <p className="text-gray-900 text-base font-medium">
                            {
                              promotionDetails.pitchPlayListDetails
                                .youtubeProfileLink
                            }
                          </p>
                        </div>

                        {/* Artist */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Tik Tok
                          </p>
                          <div>
                            <p className="text-gray-900 text-base font-medium mb-1">
                              {
                                promotionDetails.pitchPlayListDetails
                                  .tiktokProfileLink
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-neutral-100 mb-6"></div>
                      <div className="flex flex-col gap-5">
                        {/* Song Name */}
                        <div className="flex-1">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Comment
                          </p>
                          <p className="text-gray-900 text-base font-medium">
                            {promotionDetails.pitchPlayListDetails.comment}
                          </p>
                        </div>

                        {/* Song Name */}
                        <div className="min-h-60 bg-neutral-50 rounded-lg p-4 border border-neutral-100 mb-5">
                          <p className="text-text-disable font-bold text-sm mb-1">
                            Market Detail
                          </p>
                          <p className="text-text-body text-base font-normal text-wrap break-all">
                            {
                              promotionDetails.pitchPlayListDetails
                                .marketingDetail
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* border line */}
                  <div className="border border-neutral-100 mb-6"></div>

                  {/* Song Name */}
                  {promotionDetails.category !==
                    promotionCategory.playlistPitch && (
                    <div className="min-h-60 bg-neutral-50 rounded-lg p-4 border border-neutral-100">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Release Description
                      </p>
                      <p className="text-text-body text-base font-normal ">
                        {promotionDetails.releaseDescription}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row gap-x-10">
                    {/* cover art */}

                    <div className="flex items-center justify-center w-60">
                      <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                        <div className="flex flex-col max-sm:w-full gap-2">
                          <h4 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                            Artwork File
                          </h4>
                          <div className="flex items-center justify-center w-60">
                            <label
                              htmlFor="music_image"
                              className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                            >
                              <div
                                className={
                                  "w-[50%] flex items-center justify-center p-3 rounded-2xl  text-white border border-neutral-100"
                                }
                              >
                                <Image
                                  src={promotionDetails.artist.artistImage}
                                  width={60}
                                  height={60}
                                  alt="music note icon"
                                  className={
                                    promotionDetails.artist.artistImage
                                      ? " w-full object-cover min-w-15 h-15"
                                      : undefined
                                  }
                                />
                              </div>
                              <div className="w-[50%]">
                                {!promotionDetails.artist.artistImage ? (
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-bold text-text-body">
                                      Supported Files:
                                    </span>{" "}
                                    JPG, PNG
                                    <br />
                                    3000 x 3000px minimum
                                  </p>
                                ) : (
                                  <p className="font-bold text-[16px] text-[#494949] truncate">
                                    <span className="font-semibold">
                                      {promotionDetails.artist.artistName}
                                    </span>
                                    <a
                                      aria-label="download address image"
                                      href={promotionDetails.artist.artistImage}
                                      target="_blank"
                                      className="flex items-center gap-2 text-primary-500! font-bold hover:text-primary/90! transition-colors"
                                    >
                                      view
                                    </a>
                                  </p>
                                )}
                              </div>
                              <input
                                id="music_image"
                                name="music_image"
                                type="file"
                                accept="image/png,image/jpeg"
                                className="hidden"
                                readOnly
                                disabled={true}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* cover art */}

                    {promotionDetails.category ===
                      promotionCategory.playlistPitch &&
                      promotionDetails.promotionImage && (
                        <div className="flex items-center justify-center w-60">
                          <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                            <div className="flex flex-col max-sm:w-full gap-2">
                              <h4 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                                PlayList Pitch Image
                              </h4>
                              <div className="flex items-center justify-center w-60">
                                <label
                                  htmlFor="music_image"
                                  className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                                >
                                  <div
                                    className={
                                      "w-[50%] flex items-center justify-center p-3 rounded-2xl  text-white border border-neutral-100"
                                    }
                                  >
                                    <Image
                                      src={promotionDetails.promotionImage}
                                      width={60}
                                      height={60}
                                      alt="music note icon"
                                      className={
                                        " w-full object-cover min-w-15 h-15"
                                      }
                                    />
                                  </div>
                                  <div className="w-[50%]">
                                    <p className="font-bold text-[16px] text-[#494949] truncate">
                                      <a
                                        aria-label="download address image"
                                        href={promotionDetails.promotionImage}
                                        target="_blank"
                                        className="flex items-center gap-2 text-primary-500! font-bold hover:text-primary/90! transition-colors"
                                      >
                                        view
                                      </a>
                                    </p>
                                  </div>
                                  <input
                                    id="music_image"
                                    name="music_image"
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    className="hidden"
                                    readOnly
                                    disabled={true}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    {promotionDetails.category ===
                      promotionCategory.onlinePress && (
                      <div className="flex items-center justify-center w-60">
                        <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                          <div className="flex flex-col max-sm:w-full gap-2">
                            <h4 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                              Online Press Image
                            </h4>
                            <div className="flex items-center justify-center w-60">
                              <label
                                htmlFor="music_image"
                                className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                              >
                                <div
                                  className={
                                    "w-[50%] flex items-center justify-center p-3 rounded-2xl  text-white border border-neutral-100"
                                  }
                                >
                                  <Image
                                    src={promotionDetails.promotionImage}
                                    width={60}
                                    height={60}
                                    alt="music note icon"
                                    className={
                                      " w-full object-cover min-w-15 h-15"
                                    }
                                  />
                                </div>
                                <div className="w-[50%]">
                                  <p className="font-bold text-[16px] text-[#494949] truncate">
                                    <a
                                      aria-label="download address image"
                                      href={promotionDetails.promotionImage}
                                      target="_blank"
                                      className="flex items-center gap-2 text-primary-500! font-bold hover:text-primary/90! transition-colors"
                                    >
                                      view
                                    </a>
                                  </p>
                                </div>
                                <input
                                  id="music_image"
                                  name="music_image"
                                  type="file"
                                  accept="image/png,image/jpeg"
                                  className="hidden"
                                  readOnly
                                  disabled={true}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#F0F0E7] border border-neutral-100 flex justify-end items-center gap-5 h-20 pr-10 fixed bottom-0 z-2 left-0 w-full">
              {promotionDetails.promotionStatus === "pending" && (
                <>
                  <button
                    onClick={() => {
                      setshowRejectModal(true);
                    }}
                    className={
                      "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-error-500/80 border-3 border-error-500 flex bg-error-500 text-white"
                    }
                  >
                    {" "}
                    Reject
                  </button>
                  <button
                    onClick={handleApprovePromotion}
                    className={
                      "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/80 border-3 border-primary flex text-white bg-primary-500 "
                    }
                  >
                    Go Live
                  </button>
                </>
              )}
              {promotionDetails.promotionStatus === "approved" && (
                <button
                  onClick={handleCompletePromotion}
                  className={
                    "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-white bg-primary-500 "
                  }
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </>
        )}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm  bg-opacity-60 flex items-center justify-center z-[60]">
            {isSubmitting ? (
              <InlineLoadingScreen />
            ) : (
              <div className="bg-white rounded-2xl w-[700px] shadow-2xl h-fit">
                {/* Reject Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Reject Promotion
                  </h3>
                  <button
                    onClick={() => {
                      setshowRejectModal(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Reject Modal Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Please select a reason for rejecting this promotion
                    and add any additional details to help the artist make
                    corrections.
                  </p>
                  <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <div className="flex gap-1">
                        <p className="font-medium mb-2 sm:text-sm text-lg">
                          Select Deactivation Option
                        </p>
                        <Image
                          priority={false}
                          loading="lazy"
                          src="/required.svg"
                          alt="a star marking this field as required"
                          width={0}
                          height={0}
                          className="w-2 -mt-5"
                        />
                      </div>
                      <div className="w-full">
                        <Select
                          selected={rejectForm.rejectReason}
                          setSelected={(t) =>
                            setrejectForm((prev) => ({
                              ...prev,
                              rejectReason: t,
                            }))
                          }
                          placeholder="Select"
                          options={genreList}
                          name="rejectOption"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex gap-1 sm:text-sm text-lg mt-10">
                      <p className=" capitalize font-medium">
                        Additional Notes{" "}
                      </p>{" "}
                      <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-5"
                      />
                    </div>

                    <textarea
                      value={rejectForm.rejectMessage}
                      onChange={(e) =>
                        setrejectForm((prev) => ({
                          ...prev,
                          rejectMessage: e.target.value,
                        }))
                      }
                      className="w-full min-h-50 border-2 rounded-2xl p-4 mt-1"
                      placeholder="Add more details that will be shared in the notification email…"
                    ></textarea>
                  </div>

                  {/* Reject Modal Buttons */}
                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setshowRejectModal(false);
                      }}
                      className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectPromotion}
                      disabled={
                        !rejectForm.rejectMessage || !rejectForm.rejectReason
                      }
                      className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Reject Request
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
