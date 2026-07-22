"use client";
import React, { use, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { CircleCheck, Music } from "lucide-react";
import {
  useGetAdminChartDetails,
} from "@/util/customHooks/useQueries";
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
  const [showMarkChartAsRegistered, setshowMarkChartAsRegistered] = useState(false);

  const { id } = use(params);
  if (!id) {
    return <InlineLoadingScreen />;
  }
  const {
    isLoading: isLoadingSingleDetails,
    data: chartDetails,
    isFetching,
    isPending,
    isRefetching,
    isError,
  } = useGetAdminChartDetails({ chartId: id });
  useEffect(() => {
    dashboardContext?.setHeader({title:"Song Info", showBackButton:true});
  }, []);

  const handleMarkChartAsRegistered = async () => {
    try {
      setisSubmitting(true);
      const res = await api.post(
        "admin/more/chart-registrations/" + chartDetails?._id,
        {
          requestType: "approved",
        },
      );
      console.log(res.data);
      toast.success(res.data.msg);
      await queryClient.invalidateQueries({ queryKey: ["allcharts"] });
      if (chartDetails) {
        chartDetails.chartStatus = "approved";
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
        params: { chartId: chartDetails?.releaseId?._id },
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
      <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-2 md:px-5">
        {/* <Link
          href={"/dashboardAdmin/more/chart-registrations?chartStatus=all"}
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
        {isSubmitting || !chartDetails || isLoadingSingleDetails ? (
          <InlineLoadingScreen />
        ) : (
          <>
            <div className="flex flex-col md:flex-row mt-3">
              {/* Content */}
              <div className="p-3 flex-2 md:w-[80%] overflow-hidden">
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

                {/* Song Details Grid */}
                <div className="flex flex-col gap-x-12">
                  <div className="flex ">
                    {/* Song Name */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Song name
                      </p>
                      <p className="text-gray-900 text-base font-medium">
                        {chartDetails.releaseId.releaseTitle}
                      </p>
                    </div>

                    {/* Artist */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Artist
                      </p>
                      <div className="flex flex-col md:flex-row items-center gap-x-3">
                        <p className="text-gray-900 text-base font-medium mb-1">
                          {chartDetails.artist.artistName}
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
                              {chartDetails.artist?.spotifyId || 'N/A'}
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
                              {chartDetails.artist?.appleId || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100 mb-6"></div>

                  <div className="flex">
                    {/*catalog number */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        ISRC
                      </p>
                      <p className="text-gray-900 text-base font-medium">
                        {chartDetails.releaseId.isrc}
                      </p>
                    </div>
                    {/* upc */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        UPC
                      </p>
                      <p className="text-gray-900 text-base font-medium">
                        {chartDetails.releaseId.upc}
                      </p>
                    </div>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100 mb-6"></div>

                  <div className="flex">
                    {/* Genre */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Chart Name
                      </p>
                      <p className="text-gray-900 text-base font-medium tracking-tighter">
                        {chartDetails.chartName}
                      </p>
                    </div>

                    {/* Release Date */}
                    <div className="flex-1">
                      <p className="text-text-disable font-bold text-sm mb-1">
                        Date Submitted
                      </p>
                      <p className="text-gray-900 text-base font-medium">
                        {new Date(chartDetails.createdAt).toDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* border line */}
                <div className="border border-neutral-100 mb-6"></div>

                {/* Action Buttons */}
                {chartDetails.chartStatus === "pending" && (
                  <div className="bg-[#F0F0E7] border border-neutral-100 text-white flex justify-end items-center gap-5 h-20 pr-10 fixed bottom-0 z-2 left-0 w-full">
                    <button
                      onClick={() => setshowMarkChartAsRegistered(true)}
                      className="px-6 py-2 bg-primary-500  font-semibold rounded-lg hover:bg-primary-500/90 transition-colors"
                    >
                      Mark as Registered
                    </button>
                  </div>
                )}
              </div>

              {/* side bar */}
              <div className="flex-1 flex flex-col md:items-end! gap-5">
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <div className=" relative overflow-hidden w-50 h-50">
                    <Image
                      priority={false}
                      src={
                        chartDetails.releaseId.releaseImage ||
                        "/signinimage.png"
                      }
                      alt="releaseId image"
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl capitalize font-normal leading-[30px] tracking-tighter text-main-heading">
                      {chartDetails.releaseId.releaseTitle}
                    </h1>
                    <p className="text-md capitalize font-light leading-[20px] tracking-tighter text-main-heading">
                      {chartDetails.artist.artistName}
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
                        chartDetails.releaseId.releaseImage ||
                        "/signinimage.png"
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

            {/*info pop up */}
            <div
              className={
                showMarkChartAsRegistered
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
                      Mark as Registered?
                    </h3>
                    <p className="text-body-two-regular text-text-body text-center">
                      Confirm that this release has been successfully registered
                      for chart tracking. This will update the request status
                      and notify the user.
                    </p>
                  </div>
                  <div className="flex gap-5 mt-5">
                    <button
                      aria-label="cancel"
                      disabled={false}
                      onClick={() => {
                        setshowMarkChartAsRegistered(false);
                      }}
                      className={
                        "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/20 flex text-primary-500 outline-2 outline-primary-500 "
                      }
                    >
                      Cancel
                    </button>
                    <button
                      aria-label="approve releaseId"
                      disabled={isSubmitting}
                      onClick={() => {
                        setshowMarkChartAsRegistered(false);
                        handleMarkChartAsRegistered();
                      }}
                      className={
                        "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/20 flex text-white bg-primary-500 outline-2 outline-primary-500 "
                      }
                    >
                      Confirm
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
