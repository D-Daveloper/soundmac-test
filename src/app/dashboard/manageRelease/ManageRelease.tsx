import React, { useState } from "react";
import Song from "./Song";
import Album from "./Album";

const ManageRelease = () => {
  const [isViewingSong, setIsViewingSong] = useState(true);
  return (
    <div className="bg-main-white  max-sm:min-h-auto min-h-[90dvh] h-full w-full flex flex-col px-10 ">
      {" "}
      <div className="flex gap-3 mt-5">
        <button
          type="button"
          onClick={() => setIsViewingSong(true)}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (isViewingSong
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Songs
        </button>
        <button
          type="button"
          onClick={() => setIsViewingSong(false)}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm  " +
            (!isViewingSong
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Albums
        </button>
      </div>
      {
        isViewingSong? 
        <Song/> 
        :
        <Album/>
      }
    </div>
  );
};

export default ManageRelease;
