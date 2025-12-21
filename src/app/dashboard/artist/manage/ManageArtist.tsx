"use client";
import Input from "@/app/components/input/Input";
import { NormalLoadingScreen } from "@/app/components/Loader/loader";
import Pagination from "@/app/components/pagination/Pagination";
import useDebounce from "@/app/components/searchBox/searchBox";
import { artistOptions, filterOptions } from "@/app/constant";
import { Artist } from "@/app/type";
import { useDeleteArtistMutation } from "@/util/customHooks/useMutations";
import { usePaginatedArtists } from "@/util/customHooks/useQueries";
import { handleCopy } from "@/util/middleware/functions";
import { isAxiosError } from "axios";
import { Copy, X, FileSearchIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";

const ManageArtist = () => {
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null);
  const [edit, setEdit] = useState<null | Artist>(null);
  const [formData, setFormData] = useState<{
    artist_name: string;
    artist_image: File | null;
  }>({
    artist_name: "",
    artist_image: null,
  });
  const [filter, setFilter] = useState("createdAt");
  const [query, setQuery] = useState("");
  const artistNam = useDebounce<string>(query, 500);
  const { data, isLoading, isError, error, isFetching } = usePaginatedArtists({
    page,
    sort: filter,
    artistName: artistNam,
  });
  const { mutateAsync, isPending } = useDeleteArtistMutation();
  const router = useRouter();
  const handleFilterChange = (filter: string) => {
    setFilter(filter);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleArtistOptionChange = (index: number) => {
    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }
    setSelectedIndex(index);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files, type } = e.target;
    if (type === "file" && files && files[0]) {
      setFormData((prev) => ({ ...prev, artist_image: files[0] }));
      const url = URL.createObjectURL(files[0]);
      setEdit((prev) => {
        if (!prev) return prev;
        return { ...(prev as any), [name]: url } as Artist;
      });
    } else {
      setFormData((prev) => ({ ...prev, artist_name: value }));
    }
    // setFormData((prev) => {
    //   if (!prev) return prev;
    //   if (type === "file" && files && files[0]) {
    //     { ...prev, art: url }
    //     const url = URL.createObjectURL(files[0]);
    //     setFormData((prev => ({...prev,artist_image:files[0]})))
    //     return { ...(prev as any), [name]: url } as Artist;
    //   }
    //   return { ...(prev as any), [name]: value } as Artist;
    // });
  };

  const handleSubmit = async (form: typeof formData) => {
    if (!edit || !edit.artistName) {
      return toast.warn("Artist name is required");
    }
    console.log(form);
    try {
      await mutateAsync({ artist_name: edit.artistName });
      setEdit(null);
    } catch (error) {
      if (isAxiosError(error)) {
        return;
      }
      toast.error("something went wrong");
    }
  };
  if (isLoading) {
    return <NormalLoadingScreen />;
  }
  // if (
  //   !isLoading &&
  //   !isError &&
  //   data != undefined &&
  //   data.totalCount === 0 &&
  //   query.trim() !== ""
  // ) {
  //   toast.info("No artist profiles found matching your search.");
  // }
  return (
    <div className="bg-main-white  max-sm:min-h-auto h-[90dvh] w-full flex flex-col px-10 ">
      {!edit ? (
        !isLoading && (isError || data === undefined) ? (
          <div className="flex flex-col justify-center items-center h-full gap-15">
            <div>
              <Image
                priority={true}
                src={"/manage_artistImage.png"}
                alt="an image depicting no artist profile"
                width={200}
                height={200}
              />
            </div>
            <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%] text-center">
              No Artist Profile Yet. Create your first artist profile to start
              releasing and managing music.
            </p>
            <button
              onClick={() => {
                router.push("/dashboard?tab=Artists&section=createArtist");
              }}
              className={
                "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white bg-primary-500 "
              }
            >
              + Create Artist
            </button>
          </div>
        ) : (
          <div className="min-h-full">
            <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%]  mt-10">
              View and manage all your artist profiles. Edit details, link
              streaming platforms, and track performance.
            </p>
            <div className="flex justify-between w-full mt-10 items-center">
              <div className="flex p-2 outline-1 m-2 rounded-lg mb-5 max-w-[60%] w-full">
                <Image
                  priority={true}
                  src="/search-normal.svg"
                  alt="search icon"
                  width={20}
                  height={20}
                />
                <input
                  type="search"
                  className="w-full p-1 text-[16px] sm:text-sm outline-0"
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                />
              </div>
              <button
                disabled={isLoading || isFetching}
                aria-label="open filters button"
                className={
                  "border-2 w-[50px]  h-[50px] rounded-lg flex flex-col justify-center items-center gap-1 relative " +
                  (isFetching && " hover:!cursor-not-allowed ")
                }
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <div className="bg-primary w-[25px] h-[2px]"></div>
                <div className="bg-primary w-[15px] h-[2px]"></div>
                <div className="bg-primary w-[10px] h-[2px]"></div>
              </button>
              {isFilterOpen && (
                <div className="p-3 absolute mt-2 w-full max-w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 ease-in-out max-h-fit text-sm right-10 top-40 flex flex-col gap-2">
                  {filterOptions.map((options, index) => (
                    <button
                      key={index}
                      onClick={() => handleFilterChange(options.value)}
                      name={options.label}
                      aria-label={options.label}
                      className=" flex items-center gap-2"
                    >
                      {" "}
                      <div
                        className={
                          "w-2 h-2 rounded-full bg-primary " +
                          (filter != options.value && " opacity-0")
                        }
                      ></div>
                      {options.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-rows-2 grid-cols-2 gap-5 max-md:grid-cols-1 md:max-h-[400px]">
              {
                // artistCard
                data &&
                  data.data.map((artist, index) => (
                    <div
                      key={index}
                      className="bg-neutral-50 border-2 border-neutral-100 rounded-lg p-2 flex gap-5 row-span-1 col-span-1 min-h-[100px] max-h-[110px] relative "
                    >
                      <div>
                        <Image
                          priority={true}
                          src={artist.artistImage}
                          alt="an image depicting no artist profile"
                          width={150}
                          height={50}
                          className="object-contain rounded-lg shadow-md p-2 "
                        />
                      </div>
                      <h1 className="text-xl font-normal leading-[24px] tracking-[-0.5px] text-text-body w-full line-clamp-2">
                        {artist.artistName}
                      </h1>
                      <button
                        onClick={() => handleArtistOptionChange(index)}
                        aria-label={artist.artistName + " options"}
                        className="flex gap-1 border-2 border-neutral-200 rounded-lg max-h-[30px] min-h-[32px] max-w-[32px] min-w-[32px] items-center justify-center ml-auto"
                      >
                        <div className="w-1 h-1 border-[1px] border-[#103958] rounded-full"></div>
                        <div className="w-1 h-1 border-[1px] border-[#103958] rounded-full"></div>
                        <div className="w-1 h-1 border-[1px] border-[#103958] rounded-full"></div>
                      </button>
                      {/* this is for the edit button options */}
                      <div
                        className={
                          "p-3 absolute mt-2 w-full max-w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 ease-in-out max-h-fit text-sm right-10 top-0 flex-col gap-2" +
                          (selectedIndex === index ? " flex" : " hidden")
                        }
                      >
                        {artistOptions.map((options, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setEdit(artist);
                              setSelectedIndex(null);
                            }}
                            name={options}
                            aria-label={options}
                            className=" flex items-center gap-2"
                          >
                            {" "}
                            <FileSearchIcon strokeWidth={1} />
                            {options}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
              }
            </div>
            <div>
              <Pagination
                currentPage={page}
                totalPages={data ? data.totalPages : 0}
                onChange={(page) => setPage(page)}
              />
            </div>
          </div>
        )
      ) : (
        <div>
          {edit && (
            <>
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
                      setEdit(null);
                    }}
                    className="ml-auto bg-primary p-2 mt-1 rounded-lg text-white flex justify-center items-center"
                  >
                    <X />
                  </button>
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
                                "w-[50%] flex items-center justify-center p-3 rounded-2xl  text-white border border-neutral-100" +
                                (!edit.artistImage && " bg-neutral-50 ")
                              }
                            >
                              <Image
                                src={edit.artistImage || ""}
                                width={60}
                                height={60}
                                alt="music note icon"
                                className={
                                  edit?.artistImage
                                    ? " w-full object-cover"
                                    : undefined
                                }
                              />
                            </div>
                            <div className="w-[50%]">
                              {!edit.artistImage ? (
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                              ) : (
                                <p className="font-bold text-[16px] text-[#494949] truncate">
                                  <span className="font-semibold">
                                    {edit?.artistName}
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
                              onChange={handleChange}
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
                        value={edit.artistName || ""}
                        title={"Artist Name"}
                        type={"text"}
                        name={"artist_name"}
                        placeholder={edit.artistName}
                        updateValue={(e) => handleChange(e)}
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
                  <div className="w-full flex flex-wrap justify-between gap-y-10">
                    <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                      <Input
                        value={edit.appleId || ""}
                        title={"Apple ID"}
                        type={"text"}
                        name={"apple_id"}
                        placeholder={"Enter Apple ID"}
                        updateValue={handleChange}
                        disabled={true}
                        required={true}
                      />
                      <button
                        disabled={edit.appleId == undefined}
                        onClick={() => {
                          handleCopy(edit.appleId || "");
                        }}
                        className="px-3 py-1 border-2 rounded-lg border-primary w-fit text-primary font-light stroke-1 text-xs"
                      >
                        <Copy strokeWidth={1} width={15} />
                      </button>
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                      <Input
                        value={edit.spotifyId || ""}
                        title={"spotify id"}
                        type={"text"}
                        name={"spotify_id"}
                        placeholder={"Enter spotify id"}
                        updateValue={handleChange}
                        disabled={true}
                        required={true}
                      />
                      <button
                        disabled={edit.spotifyId == undefined}
                        onClick={() => {
                          handleCopy(edit.spotifyId || "");
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
                      Type <strong>Delete [artist name]</strong> to Continue
                    </p>
                    <input
                      type="text"
                      required={true}
                      className="border-2 border-primary rounded-lg outline-none px-2"
                      onChange={(e) => {
                        if (
                          e.target.value.trim().toLocaleLowerCase() ===
                          "delete" + " " + edit?.artistName
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
                      disabled={isPending || !canDelete}
                      onClick={() => {
                        handleSubmit(formData);
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageArtist;
