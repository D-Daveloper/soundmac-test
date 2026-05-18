'use client'
import Song from "./song/Song";
import Album from "./album/Album";
import { useTabQuery } from "@/util/customHooks/useTabQuery";

const Page = () => {
  const { setParam, getParam } = useTabQuery();
  const type = getParam("type");
  if (type == "single") {
    return <Song />;
  } else if (type === "album") {
    return <Album />;
  } else {
    return (
      <div className="bg-main-white  max-sm:min-h-auto min-h-[90dvh] h-full w-full flex flex-col px-10 lg:pl-[300px]">
        {" "}
        
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={() => setParam("type", "single")}
            className={
              "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
              (type === 'single'
                ? " bg-primary hover:bg-primary/90 text-white"
                : " bg-transparent border-2 border-text-disable text-text-disable")
            }
          >
            Songs
          </button>
          <button
            type="button"
            onClick={() => setParam("type", "album")}
            className={
              "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm  " +
              (type === 'album'
                ? " bg-primary hover:bg-primary/90 text-white"
                : " bg-transparent border-2 border-text-disable text-text-disable")
            }
          >
            Albums
          </button>
        </div>
        {/* {
        isViewingSong? 
        <Song/> 
        :
        <Album/>
      } */}
      </div>
    );
  }
};

export default Page;
