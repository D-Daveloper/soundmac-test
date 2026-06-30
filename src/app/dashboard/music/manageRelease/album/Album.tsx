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
    dashboardContext?.setHeader({
      title: "Manage Albums",
      showBackButton: false,
    });
  }, []);

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
    isFetching,
    isPending: isPendingAlbums,
    isRefetching: isRefetchingAlbums,
    refetch,
  } = usePaginatedAlbums({
    page,
    sort: filter,
    albumTitle,
    albumStatusFilter,
    artist,
  });

  const { mutateAsync, isPending: isDeletePending } = useDeleteAlbumMutation();
  const {
    mutateAsync: markAlbumCompletedAsync,
    isPending: isPendingMarkAlbumCompletedAsync,
  } = useMarkAlbumCompleteMutation();

  const { isLoading: isLoadingArtistNames, data: artistNames } =
    useGetUserArtistsNames();

  const albumOptions = [
    {
      name: "View Album",
      icon: <FileSearchIcon strokeWidth={1} />,
      iconFunction: () => setWantsToEdit(true),
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
      },
    },
    {
      name: "Mark Complete",
      icon: <CircleCheck strokeWidth={1} />,
      iconFunction: (release: albumFromApi) => handleMarkAlbumcomplete(release),
    },
    {
      name: "Delete",
      icon: <Trash2 strokeWidth={1} />,
      iconFunction: () => setShowDeletePopUp(true),
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

  const handleFilterChange = (selectedFilter: string) => {
    setFilter(selectedFilter);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleReleaseStatusFilterChange = (selectedFilter: string) => {
    setAlbumStatusFilter(selectedFilter);
    setPage(1);
  };

  const handleSearchQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
    setAlbumStatusFilter("all");
  };

  const handleDeleteAlbum = async (release: albumFromApi) => {
    try {
      if (release.releaseStatus === "approved") {
        return toast.info("Approved albums cannot be deleted");
      }
      await mutateAsync({ releaseTitle: release.releaseTitle });
      setShowDeletePopUp(false);
      setSelectedIndex(null);
      refetch();
    } catch (error) {
      console.error("error deleting album", error);
    }
  };

  const handleMarkAlbumcomplete = async (release: albumFromApi) => {
    try {
      if (release.releaseStatus !== "pending") {
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
      await markAlbumCompletedAsync({ releaseId: release._id });
      setSelectedIndex(null);
      release.releaseStatus = "completed";
    } catch (error) {
      console.error("error finalizing album", error);
    }
  };

  const hasNoData = !isLoading && (isError || !data || data.data.length === 0);
  const showGlobalLoader =
    isFetching ||
    isLoading ||
    isPendingAlbums ||
    isRefetchingAlbums ||
    isPendingMarkAlbumCompletedAsync;

  if (wantsToEdit && data?.data[selectedIndex!]) {
    return (
      <ManageAlbumForm
        albumFromApi={data.data[selectedIndex!]}
        goBack={() => setWantsToEdit(false)}
        refetch={refetch}
      />
    );
  }

  return (
    <div className="bg-main-white max-sm:min-h-[90dvh] min-h-[90dvh] h-full w-full flex flex-col pb-10 lg:pl-[280px] px-5">
      {/* Tab Selectors */}
      <div className="flex gap-3 mt-5">
        <button
          type="button"
          onClick={() => setParam("type", "single")}
          className={`px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm ${
            type === "single"
              ? "bg-primary text-white"
              : "bg-transparent border-2 border-text-disable text-text-disable"
          }`}
        >
          Songs
        </button>
        <button
          type="button"
          onClick={() => setParam("type", "album")}
          className={`px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm ${
            type === "album"
              ? "bg-primary text-white"
              : "bg-transparent border-2 border-text-disable text-text-disable"
          }`}
        >
          Albums
        </button>
      </div>

      {isLoadingArtistNames ? (
        <InlineLoadingScreen />
      ) : (
        <>
          {/* Global Filter Bar (Rendered Once) */}
          <div className="flex justify-between w-full mt-10 gap-2 max-[450px]:flex-col items-end relative">
            <div className="flex p-1 outline-1 rounded-lg w-full flex-1 [450px]:max-w-[40%] h-fit">
              <Image
                priority
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
              <div className="flex flex-col max-w-100 w-full">
                <p className="font-medium mb-2 sm:text-sm text-lg">Artists</p>
                <Select
                  selected={artist}
                  setSelected={setArtist}
                  placeholder="Select Artist..."
                  options={artistNames || []}
                  name="artist"
                />
              </div>

              <button
                aria-label="open filters button"
                className="outline-primary-500 outline-2 border-2 min-w-[50px] flex-1 max-w-[50px] h-[40px] rounded-lg flex flex-col justify-center items-center gap-1"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <div className="bg-primary w-[25px] h-[2px]"></div>
                <div className="bg-primary w-[15px] h-[2px]"></div>
                <div className="bg-primary w-[10px] h-[2px]"></div>
              </button>

              {isFilterOpen && (
                <div className="p-3 absolute mt-2 w-full max-w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 text-sm right-0 top-full flex flex-col gap-2">
                  {songFilterOptions.map((options, index) => (
                    <button
                      key={index}
                      onClick={() => handleFilterChange(options.value)}
                      className="flex items-center gap-2 text-left w-full"
                    >
                      <div
                        className={`w-2 h-2 rounded-full bg-primary ${filter !== options.value ? "opacity-0" : ""}`}
                      ></div>
                      {options.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Tabs (Rendered Once) */}
          <div className="mt-5 flex gap-2 flex-wrap">
            {songStatusFilterArray.map((item, index) => (
              <button
                key={index}
                onClick={() => handleReleaseStatusFilterChange(item)}
                className={`capitalize px-4 py-1.5 font-semibold rounded-xl text-center text-xs transition-all cursor-pointer ${
                  albumStatusFilter === item
                    ? "bg-primary text-white shadow-xs"
                    : "bg-white border border-neutral-200 text-text-body hover:bg-neutral-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Core Layout Conditional Handler */}
          {hasNoData ? (
            /* Empty State Container */
            <div className="flex flex-col justify-center items-center h-full gap-10 min-h-[50dvh] mt-10">
              <Image
                priority
                src="/manage_album_image.png"
                alt="Empty list"
                width={100}
                height={100}
              />
              <p className="text-text-body font-normal text-[16px] sm:max-w-[40%] text-center">
                You haven’t released any albums. Create and share a collection
                of songs with your fans.
              </p>
              <button
                onClick={() =>
                  router.push(
                    "/dashboard?tab=Music&section=uploadMusic&type=album",
                  )
                }
                className="font-bold text-sm rounded-lg px-4 py-2.5 text-white bg-primary hover:bg-primary/90"
              >
                Upload an Album
              </button>
            </div>
          ) : (
            /* Main Cards View Grid */
            <div
              className={
                showGlobalLoader
                  ? "flex justify-center items-center min-h-[400px] w-full"
                  : "my-15 grid grid-cols-2 gap-5 max-md:grid-cols-1"
              }
            >
              {showGlobalLoader ? (
                <InlineLoadingScreen />
              ) : (
                data?.data.map((song, index) => (
                  <div
                    key={index}
                    className="bg-white border border-neutral-100 hover:border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 h-fit relative shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Album Artwork Container */}
                    <div className="relative w-full h-48 sm:w-[100px] sm:h-[100px] flex-shrink-0 group overflow-hidden rounded-lg bg-neutral-50">
                      <Image
                        priority
                        src={
                          song.releaseImage && song.releaseImage !== "undefined"
                            ? song.releaseImage
                            : "/signinimage.png"
                        }
                        alt="Album art"
                        fill
                        className="object-fit transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Metadata Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3 sm:space-y-1 sm:pr-8">
                      <div>
                        <h1 className="text-base sm:text-lg font-semibold text-text-body line-clamp-2 sm:line-clamp-1 tracking-tight pr-8 sm:pr-0">
                          {song.releaseTitle}
                        </h1>
                        <p className="mt-1.5 sm:mt-1 text-xs sm:text-sm text-neutral-500 flex items-center gap-1.5">
                          <span className="text-neutral-400 font-medium">
                            Released:
                          </span>
                          <span className="font-normal text-neutral-700">
                            {new Date(song.releaseDate).toLocaleDateString(
                              undefined,
                              { dateStyle: "medium" },
                            )}
                          </span>
                        </p>
                      </div>

                      {/* Info & Status row */}
                      <div className="flex flex-row sm:items-center justify-between w-full gap-2 pt-1 sm:pt-2">
                        <p className="text-xs sm:text-sm truncate flex items-center gap-1 max-w-[65%]">
                          <span className="text-neutral-400 font-medium">
                            Label:
                          </span>
                          <span className="font-semibold text-neutral-700 truncate">
                            {song.user?.label || "—"}
                          </span>
                        </p>

                        <span
                          className={`font-bold text-[10px] sm:text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full border flex-shrink-0 ${
                            song.releaseStatus === "pending"
                              ? "text-warning-600 bg-warning-50 border-warning-100"
                              : song.releaseStatus === "approved"
                                ? "text-success-600 bg-success-50 border-success-100"
                                : song.releaseStatus === "draft"
                                  ? "text-primary-600 bg-primary-50 border-primary-100"
                                  : "text-error-600 bg-error-50 border-error-100"
                          }`}
                        >
                          {song.releaseStatus}
                        </span>
                      </div>
                    </div>

                    {/* Actions Popover Button */}
                    <button
                      onClick={() => handleArtistOptionChange(index)}
                      aria-label="Toggle options menu"
                      className={`absolute right-3 top-3 sm:static flex gap-0.5 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 rounded-lg h-8 w-8 items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                        selectedIndex === index
                          ? "bg-neutral-100 border-neutral-300"
                          : ""
                      }`}
                    >
                      <div className="w-1 h-1 bg-[#103958] rounded-full"></div>
                      <div className="w-1 h-1 bg-[#103958] rounded-full"></div>
                      <div className="w-1 h-1 bg-[#103958] rounded-full"></div>
                    </button>

                    {/* Popover Menu Context */}
                    {selectedIndex === index && (
                      <>
                        {/* Invisible backdrop layer */}
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => handleArtistOptionChange(index)}
                        />

                        <div className="absolute w-44 bg-white border border-neutral-200/80 rounded-xl shadow-xl z-30 text-sm right-3 top-12 sm:top-13 flex flex-col py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                          {albumOptions.map((options, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                options.iconFunction(song);
                                if (options.name !== "View Album") {
                                  handleArtistOptionChange(index);
                                }
                                // handleArtistOptionChange(index);
                              }}
                              className="flex items-center gap-2.5 hover:bg-neutral-50 px-3 py-2 text-neutral-700 hover:text-neutral-900 font-medium transition-colors duration-150 text-left w-full"
                            >
                              <span className="text-neutral-400 group-hover:text-neutral-600 w-4 h-4 flex items-center justify-center">
                                {options.icon}
                              </span>
                              <span className="text-xs sm:text-sm">
                                {options.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
          {/* Pagination Controls */}
          {!hasNoData && (
            <div className="mt-auto">
              <Pagination
                currentPage={page}
                totalPages={data ? data.totalPages : 0}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {/* Delete Popup Modal */}
      {showDeletePopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="max-w-[400px] p-5 bg-neutral-100 rounded-lg shadow-2xl flex flex-col items-center">
            <Trash2
              size={50}
              color="#103958"
              strokeWidth={1}
              className="my-3"
            />
            <h3 className="text-xl font-normal text-main-heading text-center mb-2">
              Delete This Release?
            </h3>
            <p className="text-sm text-text-body text-center mb-1">
              Your release will be removed permanently. This action is
              irreversible.
            </p>
            <p className="font-light italic text-warning-700 text-xs text-center mb-5">
              Note: Only pending and draft releases can be deleted.
            </p>
            <div className="flex gap-5">
              <button
                disabled={isDeletePending}
                onClick={() => setShowDeletePopUp(false)}
                className="font-bold text-sm rounded-lg px-4 py-2.5 text-primary-500 hover:bg-primary/10"
              >
                Cancel
              </button>
              <button
                disabled={isDeletePending}
                onClick={() => handleDeleteAlbum(data!.data[selectedIndex!])}
                className="font-bold text-sm rounded-lg px-4 py-2.5 text-white bg-error-500 hover:bg-error-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Info Modal Popup */}
      {showCannotAddTracks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="max-w-[400px] p-5 bg-neutral-100 rounded-lg shadow-2xl flex flex-col items-center">
            <BadgeAlert
              size={50}
              color="#103958"
              strokeWidth={1}
              className="my-3"
            />
            <h3 className="text-xl font-normal text-main-heading text-center mb-2">
              Unavailable
            </h3>
            <p className="text-sm text-text-body text-center mb-5">
              {infoPopUpText}
            </p>
            <button
              onClick={() => setShowCannotAddTracks(false)}
              className="font-bold text-sm rounded-lg px-6 py-2.5 text-white bg-primary hover:bg-primary/90"
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Album;
