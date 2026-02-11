
import {
  InlineLoadingScreen
} from "@/app/components/Loader/loader";
import ViewStatsCard from "@/app/components/viewstatscard/ViewStatsCard";
import { Artist } from "@/app/type";
import Select from "@/components/Select";
import { useGetArtistStats } from "@/util/customHooks/useQueries";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const ViewStats = ({
  artistToViewStats,
  setArtistToViewStats,
}: {
  artistToViewStats: Artist;
  setArtistToViewStats: React.Dispatch<React.SetStateAction<Artist | null>>;
}) => {
  const router = useRouter();
  const [artist, setArtist] = useState<string>(artistToViewStats.artistName);
  const { isLoading, data, isFetching, isPending, isRefetching, isError } =
    useGetArtistStats(artist);

  // if(isLoading || !data||isFetching||isPending||isRefetching)return <NormalLoadingScreen/>
  if (isError) {
    router.push("/dashboard?tab=Artists&section=manageArtist");
    return null;
  }
  // if (!data.artist) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-[80dvh]">
  //       <p className="text-red-500">Artist not found</p>
  //     </div>
  //   );
  // }
  return (
    <div className="bg-main-white max-sm:min-h-auto min-h-[90dvh] w-full flex flex-col px-10 max-w-[2400px] mx-auto lg:pl-[260px] ">
      {isLoading || !data || isFetching || isPending || isRefetching ? (
        <InlineLoadingScreen />
      ) : (
        <>
          <div className={"flex flex-col gap-10 px-5 pb-3 w-full"}>
            <div className="w-full">
              <button
                // disabled={isDeleteOpen}
                aria-label="go back"
                name={"go back to manage artist"}
                onClick={() => {
                  setArtistToViewStats(null);
                }}
                className="ml-auto bg-primary p-2 mt-1 rounded-lg text-white flex justify-center items-center"
              >
                <X />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-start max-xl:flex-col">
            <div className="flex flex-col bg-neutral-50 w-full rounded-[20px] max-w-[500px] max-h-[200px] h-full p-5 justify-around gap-5">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="artistImage"
                  className="flex items-center justify-start gap-3 w-full h-28 rounded-3xl"
                >
                  <div
                    className={
                      "relative max-w-[100px] max-h-[100px] w-full h-full flex items-center justify-center rounded-2xl text-white border border-neutral-100 "
                    }
                  >
                    <Image
                      src={data.artist.artistImage}
                      // width={0}
                      // height={100}
                      fill
                      alt="music note icon"
                      className={"  object-cover rounded-lg"}
                    />
                  </div>
                  <div className="">
                    {!data.artist.artistImage ? (
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                    ) : (
                      <h1 className="font-light text-2xl text-[#494949] line-clamp-3 leading-[30px] tracking-[-1px]">
                        {/* <span className="font-semibold"> */}
                        {data.artist.artistName}
                        {/* </span> */}
                      </h1>
                    )}
                  </div>
                  <input
                    id="artistImage"
                    name="artistImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    //   onChange={handleChange}
                    onChange={() => {}}
                    disabled={true}
                  />
                </label>
              </div>
              <p className="ml-auto font-bold text-[#18461C] text-xs leading-[18px] tracking-[0.5px]">
                Created At:{" "}
                {new Date(data.artist.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col max-w-100 w-full max-xl:mt-10">
              <p className="font-medium mb-2 sm:text-sm text-lg">Artists</p>

              <Select
                selected={artist}
                setSelected={(t) => {
                  setArtist(t);
                }}
                placeholder="Select Artist..."
                options={data.artists}
                name="artist"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-10 bg-neutral-50 w-full rounded-[20px] p-3 my-10">
            <ViewStatsCard />
            <ViewStatsCard />
            <ViewStatsCard />
            <ViewStatsCard />
            <ViewStatsCard />
            <ViewStatsCard />
            <ViewStatsCard />
            <ViewStatsCard />
            <ViewStatsCard />
          </div>
        </>
      )}
    </div>
  );
};

export default ViewStats;
