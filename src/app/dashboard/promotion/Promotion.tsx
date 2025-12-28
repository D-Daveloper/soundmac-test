"use client";
import React, { useState } from "react";
import ExplorePromotion from "./ExplorePromotion";
import MyPromotion from "./MyPromotion";

const Promotion = () => {
  const [isExplorePage, setIsExplorePage] = useState(true);
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
    <div className="bg-main-white max-sm:min-h-auto min-h-[90.5dvh] h-full w-full flex flex-col px-10 ">
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => {
            setIsExplorePage(true);
          }}
          type="button"
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (isExplorePage
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Explore
        </button>
        <button
          onClick={() => {
            setIsExplorePage(false);
          }}
          type="button"
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm  " +
            (!isExplorePage
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          My Promotions
        </button>
      </div>

      <div className="mt-5 h-full w-full">
        {isExplorePage ? <ExplorePromotion /> : <MyPromotion setExplorePage={setIsExplorePage} />}
      </div>
    </div>  
  );
};

export default Promotion;
