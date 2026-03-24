"use client";
import Input from "@/app/components/input/Input";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import UseAxios from "@/util/customHooks/UseAxios";
import { usePaginatedAdminArtistDetails } from "@/util/customHooks/useQueries";
import { handleCopy } from "@/util/middleware/functions";
import { isAxiosError } from "axios";
import { Copy } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const EditArtist = ({ id }: { id: string }) => {
  const api = UseAxios();
  const [isSubmitting, setisSubmitting] = useState(false);

  const [editArtistForm, seteditArtistForm] = useState({
    appleId: "",
    spotifyId: "",
  });
  const { isLoading: isLoadingAllReleases, data: artistDetails } =
    usePaginatedAdminArtistDetails({
      releaseStatusFilter: "all",
      page: 1,
      limit: "1",
      releaseTitle: "",
      id,
    });

  useEffect(() => {
    if (artistDetails?.artist) {
      seteditArtistForm({
        appleId: artistDetails.artist.appleId || "",
        spotifyId: artistDetails.artist.spotifyId || "",
      });
    }
  }, [artistDetails]);

  if (!artistDetails) {
    return <InlineLoadingScreen />;
  }

  const handleSubmit = async () => {
    if (!artistDetails || !artistDetails.artist) {
      return toast.warn("No Artist Details");
    }
    console.log(artistDetails.artist);

    try {
      setisSubmitting(true);
      const res = await api.patch(
        "admin/all-artists/" + artistDetails.artist._id,editArtistForm
      );
      toast.success(res.data.msg);
    } catch (error) {
      if (isAxiosError(error)) {
        return;
      }
      toast.error("something went wrong");
    } finally {
      setisSubmitting(false);
    }
  };

  return (
    <div className="w-full mt-10">
      {isLoadingAllReleases || !artistDetails ||isSubmitting? (
        <InlineLoadingScreen />
      ) : (
        <div
          className={
            " flex-3 overflow-auto flex flex-col gap-10 px-5 pb-3 h-full w-full overflow-x-hidden "
          }
        >
          <div className="w-full">
            <div className="flex items-center justify-center w-60">
              <div className="w-full flex flex-wrap justify-between gap-y-10 ">
                <div className="flex flex-col max-sm:w-full gap-2">
                  <div className="flex gap-1">
                    <h3 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Profile Image
                    </h3>
                    <Image
                      priority={false}
                      loading="lazy"
                      src="/required.svg"
                      alt="a star marking this field as required"
                      width={0}
                      height={0}
                      className="w-2 -mt-3 "
                    />
                  </div>
                  <div className="flex items-center justify-center w-60">
                    <label
                      htmlFor="artistImage"
                      className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                    >
                      <div
                        className={
                          "relative max-w-[100px] max-h-[100px] w-full h-full flex items-center justify-center rounded-2xl  text-white border border-neutral-100"
                        }
                      >
                        <Image
                          src={artistDetails.artist.artistImage}
                          fill
                          alt="music note icon"
                          className={
                            artistDetails.artist.artistImage
                              ? " object-cover rounded-md "
                              : undefined
                          }
                        />
                      </div>
                      <div className="w-[50%]">
                        <p className="font-bold text-[16px] text-[#494949] truncate">
                          <span className="font-semibold">
                            {artistDetails.artist.artistName}
                          </span>
                        </p>
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
                </div>
              </div>
            </div>
            <div className="w-full flex flex-wrap justify-between gap-y-10 mt-15 ">
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <Input
                  value={artistDetails.artist.artistName || ""}
                  title={"Artist Name"}
                  type={"text"}
                  name={"artist_name"}
                  placeholder={artistDetails.artist.artistName}
                  // updateValue={(e) => handleChange(e)}
                  updateValue={(e) => {}}
                  required={true}
                  disabled={true}
                />
                <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                  The title will appear on all streaming platforms.
                </p>
              </div>
            </div>
          </div>

          {/* border line */}
          <div className="border border-neutral-100"></div>
          {/* platform id  */}
          <div>
            <div className="w-full flex flex-wrap justify-between gap-y-10 mb-20">
              <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                <Input
                  value={editArtistForm.appleId}
                  title={"Apple ID"}
                  type={"text"}
                  name={"apple_id"}
                  placeholder={"Enter Apple ID"}
                  updateValue={(e) => {
                    seteditArtistForm((prev) => ({
                      ...prev,
                      appleId: e.target.value,
                    }));
                  }}
                  disabled={artistDetails.artist.appleId != ""}
                  required={true}
                />
                <button
                  disabled={artistDetails.artist.appleId == undefined}
                  onClick={() => {
                    handleCopy(editArtistForm.appleId);
                  }}
                  className="px-3 py-1 border-2 rounded-lg border-primary w-fit text-primary font-light stroke-1 text-xs"
                >
                  <Copy strokeWidth={1} width={15} />
                </button>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                <Input
                  value={editArtistForm.spotifyId}
                  title={"spotify id"}
                  type={"text"}
                  name={"spotify_id"}
                  placeholder={"Enter spotify id"}
                  updateValue={(e) => {
                    seteditArtistForm((prev) => ({
                      ...prev,
                      spotifyId: e.target.value,
                    }));
                  }}
                  disabled={artistDetails.artist.spotifyId != ""}
                  required={true}
                />
                <button
                  disabled={artistDetails.artist.spotifyId == undefined}
                  onClick={() => {
                    handleCopy(editArtistForm.spotifyId);
                  }}
                  className="px-3 py-1 border-2 rounded-lg border-primary w-fit text-primary font-light stroke-1 text-xs"
                >
                  <Copy strokeWidth={1} width={15} />
                </button>
              </div>
            </div>
          </div>
          <div className="bg-[#F0F0E7] border border-neutral-100 flex justify-end items-center gap-5 h-20 pr-10 fixed bottom-0 z-2 left-0 w-full">
            <button
              aria-label="save changes"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className={
                "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary-500/90 flex text-white bg-primary-500 "
              }
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditArtist;
