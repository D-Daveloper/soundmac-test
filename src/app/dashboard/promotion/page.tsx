"use client";
import React, { useContext, useEffect } from "react";
import ExplorePromotion from "./ExplorePromotion";
import MyPromotion from "./MyPromotion";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";

const Page = () => {
  const { setParam, getParam } = useTabQuery();
  const page = getParam("page");
  const promotionType = getParam("promotionType");
  const dashboardContext = useContext(DashboardContext);

  useEffect(() => {
    switch (promotionType) {
      case "boomplay":
        dashboardContext?.setLayoutHeaderMessage("Boomplay Editorial playlist");

        break;
      case "onlinepress":
        dashboardContext?.setLayoutHeaderMessage("Online Press");

        break;
      case "radio":
        dashboardContext?.setLayoutHeaderMessage("Radio Promotion");

        break;
      case "pitchplay":
        dashboardContext?.setLayoutHeaderMessage("Playlist Pitching");

        break;

      default:
        dashboardContext?.setLayoutHeaderMessage("Promotions");

        break;
    }
    console.log(promotionType);
  }, [promotionType]);
  //   const { data, isLoading, isError, error, isFetching } = usePaginatedArtists({
  //     page,
  //     sort: filter,
  //     artistName: artistNam,
  //   });
  // if (isLoading) {
  //   return <NormalLoadingScreen />;
  // }
  // if (
  //   !isLoading &&
  //   !isError &&
  //   data != undefined &&
  //   data.totalCount === 0 &&
  //   query.trim() !== ""
  // ) {
  //   toast.info("No artist profiles found matching your search.");
  // }
  //   if (viewArtist) {
  //     return <ViewArtist artist={viewArtist} setArtist={setViewArtist} />;
  //   } else if (viewStats) {
  //     return <ViewStats artistToViewStats={viewStats} setArtistToViewStats={setViewStats}/>;
  //   }
  return (
    <div className="lg:pl-[260px] bg-main-white max-sm:min-h-auto min-h-[90.5dvh] h-full w-full flex flex-col px-10 ">
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => {
            setParam("page", "explore");
          }}
          type="button"
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (page === "explore" || page === undefined || page != "myPromotions"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Explore
        </button>
        <button
          onClick={() => {
            setParam("page", "myPromotions");
          }}
          type="button"
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm  " +
            (page === "myPromotions"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          My Promotions
        </button>
      </div>

      <div className="mt-5 h-full w-full">
        {page === "explore" || page === undefined || page != "myPromotions" ? (
          <ExplorePromotion />
        ) : (
          <MyPromotion />
        )}
      </div>
    </div>
  );
};

export default Page;
