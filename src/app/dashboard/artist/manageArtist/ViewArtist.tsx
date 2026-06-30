"use client";
import Input from "@/app/components/input/Input";
import { Artist } from "@/app/type";
import { useDeleteArtistMutation } from "@/util/customHooks/useMutations";
import { handleCopy } from "@/util/middleware/functions";
import { isAxiosError } from "axios";
import { Copy, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "react-toastify";

const ViewArtist = ({
  artist,
  setArtist,
}: {
  artist: Artist;
  setArtist: React.Dispatch<React.SetStateAction<Artist | null>>;
}) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const { mutateAsync, isPending } = useDeleteArtistMutation();

  const handleSubmit = async (form: Pick<Artist, "artistName">) => {
    if (!artist || !artist.artistName) {
      return toast.warn("Artist name is required");
    }
    console.log(form);
    try {
      await mutateAsync({ artist_name: artist.artistName });
      setArtist(null);
    } catch (error) {
      if (isAxiosError(error)) {
        return;
      }
      toast.error("something went wrong");
    }
  };

  return (
    <div className="bg-main-white max-sm:min-h-auto minh-[90dvh] w-full flex flex-col md:px-5 lg:pl-[280px]">
      <div
        className={
          "relative flex-3 overflow-auto flex flex-col gap-10 px-5 pb-3 h-full w-[full] overflow-x-hidden " +
          (isDeleteOpen && " blur-md overflow-x-hidden")
        }
      >
        <div className="w-full">
          <button
            disabled={isDeleteOpen}
            aria-label="go back"
            name={"go back to manage artist"}
            onClick={() => {
              setArtist(null);
            }}
            className="ml-auto bg-primary p-2 mt-1 rounded-lg text-white flex justify-center items-center"
          >
            <X />
          </button>
          <div className="flex items-center justify-center w-60">
            <div className="w-full flex flex-wrap justify-between gap-y-5 ">
              <div className="flex flex-col max-sm:w-full gap-2">
                <div className="flex gap-1">
                  <h3 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                    Profile Image
                  </h3>
                  {/* <Image
                    priority={false}
                    loading="lazy"
                    src="/required.svg"
                    alt="a star marking this field as required"
                    width={0}
                    height={0}
                    className="w-2 -mt-3 "
                  /> */}
                </div>
                <div className="flex items-center justify-center w-64 md:w-80">
                  <label
                    htmlFor="artistImage"
                    className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                  >
                    <div
                      className={
                        "relative max-w-[100px] max-h-[100px] w-full h-full flex items-center justify-center rounded-2xl  text-white border border-neutral-100" +
                        (!artist.artistImage && " bg-neutral-50 ")
                      }
                    >
                      <Image
                        src={artist.artistImage || ""}
                        fill
                        alt="music note icon"
                        className={
                          artist?.artistImage
                            ? " object-fit rounded-md "
                            : undefined
                        }
                      />
                    </div>
                    <div className="w-[50%]">
                      {!artist.artistImage ? (
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                      ) : (
                        <p className="font-bold text-[16px] text-[#494949] truncate">
                          <span className="font-semibold">
                            {artist?.artistName}
                          </span>
                        </p>
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
              </div>
            </div>
          </div>
          <div className="w-full flex flex-wrap justify-between gap-y-10 mt-5 ">
            <div className="flex flex-col w-[40%] max-sm:w-full">
              <Input
                value={artist.artistName || ""}
                title={"Artist Name"}
                type={"text"}
                name={"artist_name"}
                placeholder={artist.artistName}
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
          <div className="w-full flex flex-wrap justify-between gap-y-5 mb-20">
            <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
              <Input
                value={artist.appleId || ""}
                title={"Apple ID"}
                type={"text"}
                name={"apple_id"}
                placeholder={"Enter Apple ID"}
                updateValue={(e) => {}}
                // updateValue={handleChange}
                disabled={true}
                required={true}
              />
              <button
                disabled={artist.appleId == undefined}
                onClick={() => {
                  handleCopy(artist.appleId || "");
                }}
                className="px-3 py-1 border-2 rounded-lg border-primary w-fit text-primary font-light stroke-1 text-xs"
              >
                <Copy strokeWidth={1} width={15} />
              </button>
            </div>
            <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
              <Input
                value={artist.spotifyId || ""}
                title={"spotify id"}
                type={"text"}
                name={"spotify_id"}
                placeholder={"Enter spotify id"}
                updateValue={(e) => {}}
                // updateValue={handleChange}
                disabled={true}
                required={true}
              />
              <button
                disabled={artist.spotifyId == undefined}
                onClick={() => {
                  handleCopy(artist.spotifyId || "");
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
            aria-label="delete artist"
            disabled={isDeleteOpen}
            onClick={() => {
              setIsDeleteOpen(true);
            }}
            className={
              "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 flex text-white bg-error-500 "
            }
          >
            Delete
          </button>
        </div>
      </div>
      <div
        className={
          isDeleteOpen
            ? " fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm  "
            : " hidden"
        }
      >
        <div className="flex flex-col w-fit py-5 px-10 justify-center items-center bg-neutral-100  rounded-lg shadow-2xl">
          <button
            onClick={() => setIsDeleteOpen(false)}
            className="ml-auto bg-primary p-1 rounded-sm text-white flex justify-center items-center mb-5"
          >
            <X width={20} height={20} />
          </button>
          <div className="flex flex-col gap-2 mb-2">
            <h3 className="text-xl font-semibold  tracking-[-0.5px] text-main-heading">
              Delete Artist
            </h3>
            <p className="">
              Type <strong>Delete</strong> to Continue
            </p>
            <input
              type="text"
              required={true}
              className="border-2 border-primary rounded-lg outline-none px-2"
              onChange={(e) => {
                console.log(canDelete);
                console.log(e.target.value);
                
                if (
                  e.target.value.trim().toLocaleLowerCase() ==
                  "delete"
                ) {
                  setCanDelete(true);
                } else {
                  setCanDelete(false);
                }
              }}
            />
          </div>
          <div>
            <button
              aria-label="confirm delete artist"
              disabled={!canDelete}
              onClick={() => {
                console.log(artist);
                
                handleSubmit(artist);
              }}
              className={
                "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 flex text-white bg-error-500 "
              }
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewArtist;
