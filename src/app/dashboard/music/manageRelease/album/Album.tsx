"use client";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { songFilterOptions, songStatusFilterArray } from "@/app/constant";
import Select from "@/components/Select";
import {
  Trash2,
  Music,
  BadgeAlert,
  FileSearchIcon,
  CircleCheck,
  Eye,
} from "lucide-react";
import {
  useGetUserArtistsNames,
  usePaginatedAlbums,
} from "@/util/customHooks/useQueries";
import useDebounce from "@/app/components/searchBox/searchBox";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import Pagination from "@/app/components/pagination/Pagination";
import { albumFromApi } from "@/app/type";
import { toast } from "react-toastify";
import {
  useDeleteAlbumMutation,
  useMarkAlbumCompleteMutation,
} from "@/util/customHooks/useMutations";
import ManageAlbumForm from "./ManageAlbumForm";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";

const Album = () => {
  const { setParam, getParam } = useTabQuery();
  const type = getParam("type");
  const dashboardContext = useContext(DashboardContext);
  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Manage Albums");
  }, [type]);
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showDeletePopUp, setShowDeletePopUp] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("-createdAt");
  const [albumStatusFilter, setAlbumStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState("");
  const albumTitle = useDebounce<string>(query, 500);
  const [wantsToEdit, setWantsToEdit] = useState(false);
  const [showCannotAddTracks, setShowCannotAddTracks] = useState(false);
  const [infoPopUpText, setinfoPopUpText] = useState(
    "Draft Albums can not add tracks, please complete your album to be able to add tracks.",
  );

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    isPending: isPendingAlbums,
    isRefetching: isRefetchingAlbums,
    refetch,
  } = usePaginatedAlbums({
    page,
    sort: filter,
    albumTitle: albumTitle,
    albumStatusFilter,
    artist,
  });
  const { mutateAsync, isPending: isDeletePending } = useDeleteAlbumMutation();
  const {
    mutateAsync: markAlbumCompletedAsync,
    isPending: isPendingMarkAlbumCompletedAsync,
  } = useMarkAlbumCompleteMutation();

  const {
    isLoading: isLoadingArtistNames,
    data: artistNames,
    isPending,
    isRefetching,
  } = useGetUserArtistsNames();

  const albumOptions = [
    {
      name: "View Album",
      icon: <FileSearchIcon strokeWidth={1} />,
      iconFunction: () => {
        setWantsToEdit(true);
      },
    },
    {
      name: "Upload Track",
      icon: <Music strokeWidth={1} />,
      iconFunction: (release: albumFromApi) => {
        if (release.releaseStatus === "draft") {
          setinfoPopUpText(
            "Draft Albums can not add tracks, please complete your album to be able to add tracks.",
          );
          setShowCannotAddTracks(true);
          return;
        }
        router.push(
          `/dashboard/music/manageRelease/${release.releaseTitle.trim().replaceAll(" ", "-")}`,
        );
        return;
      },
    },
    {
      name: "View Track",
      icon: <Eye strokeWidth={1} />,
      iconFunction: (release: albumFromApi) => {
        if (release.releaseStatus === "draft") {
          setinfoPopUpText(
            "Draft Albums can not View tracks, please complete your album to be able to View tracks.",
          );
          setShowCannotAddTracks(true);
          return;
        }
        router.push(
          `/dashboard/music/manageRelease/${release.releaseTitle.trim().replaceAll(" ", "-")}/edit`,
        );
        return;
      },
    },
    {
      name: "Mark Complete",
      icon: <CircleCheck strokeWidth={1} />,
      iconFunction: (release: albumFromApi) => {
        handleMarkAlbumcomplete(release);
      },
    },
    {
      name: "Delete",
      icon: <Trash2 strokeWidth={1} />,
      iconFunction: () => handleShowDeletePopup(),
    },
  ];

  const handleArtistOptionChange = (index: number) => {
    setIsFilterOpen(false);
    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }
    setSelectedIndex(index);
  };

  const handleFilterChange = (filter: string) => {
    setFilter(filter);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleReleaseStatusFilterChange = (filter: string) => {
    setAlbumStatusFilter(filter);
    setPage(1);
    // setIsFilterOpen(false);
  };

  const handleSearchQueryChange = (filter: string) => {
    setQuery(filter);
    setPage(1);
    setAlbumStatusFilter("all");
  };
  const handleShowDeletePopup = () => {
    setShowDeletePopUp(true);
  };
  const handleDeleteAlbum = async (release: albumFromApi) => {
    try {
      if (release.releaseStatus! === "approved") {
        return toast.info("Approved alvums cannot be deleted");
      }
      await mutateAsync({
        releaseTitle: release.releaseTitle,
      });
      setShowDeletePopUp(false);
      setSelectedIndex(null);
      refetch();
    } catch (error) {
      console.log("error deleting album", error);
    }
  };

  const handleMarkAlbumcomplete = async (release: albumFromApi) => {
    try {
      if (release.releaseStatus! !== "pending") {
        setinfoPopUpText("Only Pending Albums can be marked as completed.");
        setShowCannotAddTracks(true);
        return;
      }
      if (release.unassignedNumbers.length > 0) {
        setinfoPopUpText(
          "Please assign all track numbers to mark as complete.",
        );
        setShowCannotAddTracks(true);
        return;
      }
      await markAlbumCompletedAsync({
        releaseId: release._id,
      });
      setSelectedIndex(null);
      release.releaseStatus = "completed";
      // setShowDeletePopUp(false);
      // refetch();
    } catch (error) {
      console.log("error deleting album", error);
    }
  };

  return !wantsToEdit ? (
    <div className="bg-main-white  max-sm:min-h-[90dvh] min-h-[90dvh] h-full w-full flex flex-col pb-10 lg:pl-[300px] px-5">
      <div className="flex gap-3 mt-5">
        <button
          type="button"
          onClick={() => setParam("type", "single")}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (type === "single"
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
            (type === "album"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Albums
        </button>
      </div>
      {isLoadingArtistNames ? (
        <InlineLoadingScreen />
      ) : !isLoading &&
        (isError || data === undefined || data.data.length === 0) ? (
        <>
          {/* you might see that the first two divs are duplicated the reason is a ui issue if theres no songs or albums if this condition above is true it should still show them search bar, select artist and also all the filter buttons like all ,pending,etc. */}
          <div className="flex justify-between w-full mt-10 gap-2 max-[450px]:flex-col items-end">
            <div className="flex p-1 outline-1 rounded-lg w-full flex-1 [450px]:max-w-[40%] h-fit ">
              <Image
                priority={true}
                src="/search-normal.svg"
                alt="search icon"
                width={20}
                height={20}
              />
              <input
                value={query}
                name="search"
                type="search"
                className="w-full p-1 text-[16px] sm:text-sm outline-0"
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                placeholder="Search"
              />
            </div>
            <div className="flex-1 flex gap-10 items-end justify-end w-full">
              <div className="flex flex-col max-w-100 w-full ">
                <p className="font-medium mb-2 sm:text-sm text-lg">Artists</p>

                <Select
                  selected={artist}
                  setSelected={(t) => {
                    setArtist(t);
                  }}
                  placeholder="Select Artist..."
                  options={artistNames || []}
                  name="artist"
                />
              </div>
              <button
                disabled={false}
                aria-label="open filters button"
                className={
                  "outline-primary-500 outline-2 border-2 min-w-[50px] flex-1 max-w-[50px] h-[40px] rounded-lg flex flex-col justify-center items-center gap-1 relative " +
                  (false && " hover:!cursor-not-allowed ")
                }
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  // setSelectedIndex(null);
                }}
              >
                <div className="bg-primary w-[25px] h-[2px]"></div>
                <div className="bg-primary w-[15px] h-[2px]"></div>
                <div className="bg-primary w-[10px] h-[2px]"></div>
              </button>
              {isFilterOpen && (
                <div className="p-3 absolute mt-2 w-full max-w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 ease-in-out max-h-fit text-sm right-10 top-40 flex flex-col gap-2">
                  {songFilterOptions.map((options, index) => (
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
          </div>
          <div className="mt-5 flex gap-3 flex-wrap">
            {songStatusFilterArray.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  handleReleaseStatusFilterChange(item);
                }}
                className={
                  " capitalize px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
                  (albumStatusFilter === item
                    ? " bg-primary hover:bg-primary/90 text-white"
                    : " bg-transparent border-2 border-text-disable text-text-disable")
                }
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex flex-col justify-center items-center h-full gap-15 min-h-[90dvh]">
            <div>
              <Image
                priority={true}
                src={"/manage_album_image.png"}
                alt="an image depicting no artist profile"
                width={100}
                height={100}
              />
            </div>
            <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%] text-center">
              You haven’t released any albums. Create and share a collection of
              songs with your fans.
            </p>
            <button
              onClick={() => {
                router.push(
                  "/dashboard?tab=Music&section=uploadMusic&type=album",
                );
              }}
              className={
                "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white bg-primary-500 "
              }
            >
              Upload a Album
            </button>
          </div>
        </>
      ) : (
        <div>
          <div className="flex justify-between w-full mt-10 gap-2 max-[450px]:flex-col items-end">
            <div className="flex p-1 outline-1 rounded-lg w-full flex-1 [450px]:max-w-[40%] h-fit ">
              <Image
                priority={true}
                src="/search-normal.svg"
                alt="search icon"
                width={20}
                height={20}
              />
              <input
                value={query}
                name="search"
                type="search"
                className="w-full p-1 text-[16px] sm:text-sm outline-0"
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                placeholder="Search"
              />
            </div>
            <div className="flex-1 flex gap-10 items-end justify-end w-full">
              <div className="flex flex-col max-w-100 w-full ">
                <p className="font-medium mb-2 sm:text-sm text-lg">Artists</p>

                <Select
                  selected={artist}
                  setSelected={(t) => {
                    setArtist(t);
                  }}
                  placeholder="Select Artist..."
                  options={artistNames || []}
                  name="artist"
                />
              </div>
              <button
                disabled={false}
                aria-label="open filters button"
                className={
                  "outline-primary-500 outline-2 border-2 min-w-[50px] flex-1 max-w-[50px] h-[40px] rounded-lg flex flex-col justify-center items-center gap-1 relative " +
                  (false && " hover:!cursor-not-allowed ")
                }
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  // setSelectedIndex(null);
                }}
              >
                <div className="bg-primary w-[25px] h-[2px]"></div>
                <div className="bg-primary w-[15px] h-[2px]"></div>
                <div className="bg-primary w-[10px] h-[2px]"></div>
              </button>
              {isFilterOpen && (
                <div className="p-3 absolute mt-2 w-full max-w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 ease-in-out max-h-fit text-sm right-10 top-40 flex flex-col gap-2">
                  {songFilterOptions.map((options, index) => (
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
          </div>
          {/* buttons e.g all, pending */}
          <div className="mt-5 flex gap-3 flex-wrap">
            {songStatusFilterArray.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  handleReleaseStatusFilterChange(item);
                }}
                className={
                  " capitalize px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
                  (albumStatusFilter === item
                    ? " bg-primary hover:bg-primary/90 text-white"
                    : " bg-transparent border-2 border-text-disable text-text-disable")
                }
              >
                {item}
              </button>
            ))}
          </div>
          {/* main body */}
          <div
            className={
              isFetching ||
              isLoading ||
              isPendingAlbums ||
              isRefetchingAlbums ||
              isPendingMarkAlbumCompletedAsync
                ? "flex justify-center items-center md:max-h-[400px] w-full"
                : "my-15 grid grid-rows-2 grid-cols-2 gap-5 max-md:grid-cols-1 "
            }
          >
            {isFetching ||
            isLoading ||
            isPendingAlbums ||
            isRefetchingAlbums ||
            isPendingMarkAlbumCompletedAsync ? (
              <InlineLoadingScreen />
            ) : (
              // song card
              data?.data &&
              data?.data.map((song, index) => (
                <div
                  key={index}
                  className="bg-neutral-50 border-2 border-neutral-100 rounded-lg p-2 flex gap-3 row-span-1 col-span-1 h-fit relative "
                >
                  <div className="relative max-w-[100px] max-h-[100px] w-[100px] h-[100px] flex-2">
                    <Image
                      priority={true}
                      src={
                        song.releaseImage && song.releaseImage != "undefined"
                          ? song.releaseImage
                          : "/signinimage.png"
                      }
                      alt="an image depicting the song image"
                      fill
                      className="object-cover rounded-lg shadow-md max-h-[80px] "
                    />
                  </div>
                  <div className="flex flex-col flex-2">
                    <h1 className="text-lg font-normal leading-[24px] tracking-[-0.5px] text-text-body w-full line-clamp-1">
                      {song.releaseTitle}
                    </h1>
                    <p className="my-2">
                      <span className="text-primary-500 font-bold leading-[18px] tracking-tighter text-sm">
                        Release Date:{" "}
                      </span>
                      {new Date(song.releaseDate).toLocaleDateString()}
                    </p>
                    <div className="flex items-end">
                      <p className="">
                        <span className="text-primary-500 font-bold leading-[18px] tracking-tighter text-sm">
                          Label:{" "}
                        </span>
                        {song.user.label}
                      </p>
                      <p
                        className={
                          "ml-auto font-bold leading-[18px] tracking-tighter text-xs capitalize w-fit px-4 py-1 rounded-full h-fit " +
                          (song.releaseStatus === "pending"
                            ? " text-warning-500 bg-warning-100"
                            : song.releaseStatus === "approved"
                              ? " text-success-500 bg-success-100"
                              : song.releaseStatus === "draft"
                                ? " text-primary-500 bg-primary-50"
                                : " text-error-500 bg-error-100")
                        }
                      >
                        {song.releaseStatus}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleArtistOptionChange(index)}
                    aria-label={song.artistName + " options"}
                    className="flex-1 flex gap-1 border-2 border-neutral-200 rounded-lg max-h-[30px] min-h-[32px] max-w-[32px] min-w-[32px] items-center justify-center ml-auto"
                  >
                    <div className="w-1 h-1 border-[1px] border-[#103958] rounded-full"></div>
                    <div className="w-1 h-1 border-[1px] border-[#103958] rounded-full"></div>
                    <div className="w-1 h-1 border-[1px] border-[#103958] rounded-full"></div>
                  </button>
                  {/* this is for the viewArtist button options */}
                  <div
                    className={
                      "divide-y divide-zinc-200 absolute w-full max-w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 ease-in-out max-h-fit text-sm right-10 top-0 flex-col" +
                      (selectedIndex === index ? " flex" : " hidden")
                    }
                  >
                    {albumOptions.map((options, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          options.iconFunction(song);
                        }}
                        name={options.name}
                        aria-label={options.name}
                        className=" flex items-center gap-2 hover:bg-gray-300 p-2 transition-colors duration-300"
                      >
                        {" "}
                        {options.icon}
                        {options.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <div>
            <Pagination
              currentPage={page}
              totalPages={data ? data.totalPages : 0}
              onChange={(page) => setPage(page)}
            />
          </div>

          {/* pop up */}
          <div
            className={
              showDeletePopUp
                ? " fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl  "
                : " hidden"
            }
          >
            <div className="max-w-[400px] h-[400px]">
              <div className="flex flex-col w-fit py-5 px-10 justify-center items-center bg-neutral-100  rounded-lg shadow-2xl">
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex justify-center my-5">
                    <Trash2 size={50} color="#103958" strokeWidth={1} />
                  </div>
                  <h3 className="text-xl font-normal leading-[30px] tracking-[-1px] text-main-heading text-center">
                    Delete This Release?
                  </h3>
                  <p className="text-body-two-regular text-text-body">
                    Your release will be removed, this is not reversable. Are
                    you sure you want to continue?
                  </p>
                  <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                    Note: Only pending and draft releases can be deleted.
                  </p>
                </div>
                <div className="flex gap-5 mt-5">
                  <button
                    aria-label="cancel delete album"
                    disabled={isDeletePending}
                    onClick={() => {
                      setShowDeletePopUp(false);
                    }}
                    className={
                      "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/20 flex text-primary-500 outline-2 outline-primary-500 "
                    }
                  >
                    Cancel
                  </button>
                  <button
                    aria-label="confirm delete album"
                    disabled={isDeletePending}
                    onClick={() => {
                      handleDeleteAlbum(data!.data[selectedIndex!]);
                    }}
                    className={
                      "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-error-500/80 flex text-white bg-error-500 "
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/*info pop up */}
          <div
            className={
              showCannotAddTracks
                ? " fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl  "
                : " hidden"
            }
          >
            <div className="max-w-[400px] h-[400px]">
              <div className="flex flex-col w-fit py-5 px-10 justify-center items-center bg-neutral-100  rounded-lg shadow-2xl">
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex justify-center my-5">
                    <BadgeAlert size={50} color="#103958" strokeWidth={1} />
                  </div>
                  <h3 className="text-xl font-normal leading-[30px] tracking-[-1px] text-main-heading text-center">
                    Unavaliable
                  </h3>
                  <p className="text-body-two-regular text-text-body text-center">
                    {infoPopUpText}
                  </p>
                  {/* <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                    Note: Only pending and draft releases can be deleted.
                  </p> */}
                </div>
                <div className="flex gap-5 mt-5">
                  <button
                    aria-label="okay"
                    disabled={false}
                    onClick={() => {
                      setShowCannotAddTracks(false);
                    }}
                    className={
                      "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/20 flex text-primary-500 outline-2 outline-primary-500 "
                    }
                  >
                    Ok
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    data?.data[selectedIndex!] && (
      <ManageAlbumForm
        albumFromApi={data.data[selectedIndex!]}
        goBack={() => {
          setWantsToEdit(false);
        }}
        refetch={refetch}
      />
    )
  );
};

export default Album;
