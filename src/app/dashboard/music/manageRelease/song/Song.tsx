"use client";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { songFilterOptions, songStatusFilterArray } from "@/app/constant";
import Select from "@/components/Select";
import { Trash2, Music } from "lucide-react";
import {
  useGetUserArtistsNames,
  usePaginatedSongs,
} from "@/util/customHooks/useQueries";
import useDebounce from "@/app/components/searchBox/searchBox";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import Pagination from "@/app/components/pagination/Pagination";
import { useDeleteSongMutation } from "@/util/customHooks/useMutations";
import { songFromApi } from "@/app/type";
import { toast } from "react-toastify";
import SongForm from "./ManageSongForm";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";

const Song = () => {
  const { setParam, getParam } = useTabQuery();
  const type = getParam("type");
  const dashboardContext = useContext(DashboardContext);

  useEffect(() => {
    dashboardContext?.setHeader({
      title: "Manage Songs",
      showBackButton: false,
    });
  }, []);

  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showDeletePopUp, setShowDeletePopUp] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("-createdAt");
  const [songStatusFilter, setSongStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState("");
  const songTitle = useDebounce<string>(query, 500);
  const { mutateAsync, isPending: isDeletePending } = useDeleteSongMutation();
  const [wantsToEdit, setWantsToEdit] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    isPending: isPendingSongs,
    isRefetching: isRefetchingSongs,
    refetch,
  } = usePaginatedSongs({
    page,
    sort: filter,
    songTitle: songTitle,
    songStatusFilter,
    artist,
  });

  const {
    isLoading: isLoadingArtistNames,
    data: artistNames,
    isPending,
    isRefetching,
  } = useGetUserArtistsNames();

  const songOptions = [
    {
      name: "View Single",
      icon: <Music strokeWidth={1} size={18} />,
      iconFunction: () => {
        setWantsToEdit(true);
      },
    },
    {
      name: "Delete",
      icon: <Trash2 strokeWidth={1} size={18} />,
      iconFunction: () => {
        handleShowDeletePopup();
      },
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
    setSongStatusFilter(filter);
    setPage(1);
  };

  const handleSearchQueryChange = (filter: string) => {
    setQuery(filter);
    setPage(1);
    setSongStatusFilter("all");
  };

  const handleShowDeletePopup = () => {
    setShowDeletePopUp(true);
  };

  const handleDeleteSong = async (release: songFromApi) => {
    try {
      if (release.releaseStatus !== "draft") {
        return toast.info("Only draft Songs can be deleted");
      }

      await mutateAsync({
        artist_name: release.artistName,
        releaseTitle: release.releaseTitle,
      });
      setShowDeletePopUp(false);
      setSelectedIndex(null);
      refetch();
    } catch (error) {
      console.log("error deleting song", error);
    }
  };

  const isDataLoading =
    isFetching || isLoading || isPendingSongs || isRefetchingSongs;
  const isDataEmpty =
    !isDataLoading && (isError || !data || data.data.length === 0);

  return !wantsToEdit ? (
    <div className="bg-main-white min-h-[90dvh] w-full flex flex-col pb-10 lg:pl-[320px] px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Content Type Tabs */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={() => setParam("type", "single")}
          className={`px-5 py-2 font-bold rounded-xl text-center text-sm transition-all cursor-pointer ${
            type === "single"
              ? "bg-primary text-white shadow-xs"
              : "bg-transparent border-2 border-text-disable text-text-disable hover:bg-neutral-50"
          }`}
        >
          Songs
        </button>
        <button
          type="button"
          onClick={() => setParam("type", "album")}
          className={`px-5 py-2 font-bold rounded-xl text-center text-sm transition-all cursor-pointer ${
            type === "album"
              ? "bg-primary text-white shadow-xs"
              : "bg-transparent border-2 border-text-disable text-text-disable hover:bg-neutral-50"
          }`}
        >
          Albums
        </button>
      </div>

      {isLoadingArtistNames ? (
        <div className="flex-1 flex justify-center items-center min-h-[400px]">
          <InlineLoadingScreen />
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          {/* Unified Controls Panel */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end w-full mt-8 gap-4 relative">
            {/* Search Input Container */}
            <div className="flex items-center p-2 border border-neutral-200 rounded-xl w-full md:max-w-[35%] h-11 bg-white focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500/20 transition-all">
              <Image
                priority
                src="/search-normal.svg"
                alt="search icon"
                width={18}
                height={18}
                className="ml-1 shrink-0 opacity-60"
              />
              <input
                name="search"
                value={query}
                type="search"
                className="w-full px-2 text-sm outline-hidden text-text-body placeholder-text-disable bg-transparent"
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                placeholder="Search releases..."
              />
            </div>

            {/* Select & Dropdown Filter Elements */}
            <div className="flex items-end justify-end gap-3 w-full md:w-auto flex-1">
              <div className="flex flex-col w-full md:w-64">
                <p className="font-semibold mb-1.5 text-xs text-main-heading tracking-wide uppercase">
                  Artists
                </p>
                <Select
                  selected={artist}
                  setSelected={(t) => setArtist(t)}
                  placeholder="Select Artist..."
                  options={artistNames || []}
                  name="artist"
                />
              </div>

              {/* Advanced Filter Toggle Trigger Button */}
              <div className="relative">
                <button
                  type="button"
                  aria-label="open filters button"
                  className={`border border-neutral-200 w-11 h-11 rounded-xl flex flex-col justify-center items-center gap-1.5 transition-all bg-white shadow-2xs hover:bg-neutral-50 ${
                    isFilterOpen ? "ring-2 ring-primary border-transparent" : ""
                  }`}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <div className="bg-primary w-5 h-0.5 rounded-full"></div>
                  <div className="bg-primary w-3.5 h-0.5 rounded-full"></div>
                  <div className="bg-primary w-2 h-0.5 rounded-full"></div>
                </button>

                {/* Dropdown Options List */}
                {isFilterOpen && (
                  <div className="p-1.5 absolute right-0 mt-2 w-44 bg-white border border-neutral-200 rounded-xl shadow-xl z-30 transition-all text-sm flex flex-col gap-0.5">
                    {songFilterOptions.map((options, index) => (
                      <button
                        key={index}
                        onClick={() => handleFilterChange(options.value)}
                        name={options.label}
                        aria-label={options.label}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50 text-text-body font-medium transition-colors"
                      >
                        <div
                          className={`w-2 h-2 rounded-full bg-primary shrink-0 transition-opacity ${
                            filter !== options.value
                              ? "opacity-0"
                              : "opacity-100"
                          }`}
                        />
                        {options.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Release Status Array Pill Filters */}
          <div className="mt-5 flex gap-2 flex-wrap">
            {songStatusFilterArray.map((item, index) => (
              <button
                key={index}
                onClick={() => handleReleaseStatusFilterChange(item)}
                className={`capitalize px-4 py-1.5 font-semibold rounded-xl text-center text-xs transition-all cursor-pointer ${
                  songStatusFilter === item
                    ? "bg-primary text-white shadow-xs"
                    : "bg-white border border-neutral-200 text-text-body hover:bg-neutral-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Conditional Inner Body Content Block */}
          {isDataLoading ? (
            <div className="flex-1 flex justify-center items-center min-h-[350px]">
              <InlineLoadingScreen />
            </div>
          ) : isDataEmpty ? (
            /* Empty State Segment Placeholder layout view */
            <div className="flex-1 flex flex-col justify-center items-center gap-6 py-16 text-center max-w-sm mx-auto min-h-[400px]">
              <div className="relative w-28 h-28 mix-blend-multiply opacity-90">
                <Image
                  priority
                  src="/manage_song_image.png"
                  alt="No releases found illustrations"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-text-body font-medium text-sm sm:text-base leading-relaxed">
                You haven’t released any singles. Upload your first track to get
                started.
              </p>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard?tab=Music&section=uploadMusic&type=single",
                  )
                }
                className="font-bold text-sm rounded-xl px-5 py-3 text-white bg-primary hover:bg-primary/90 shadow-sm transition-colors cursor-pointer"
              >
                Upload a Single
              </button>
            </div>
          ) : (
            /* Main Releases Grid Stream view mapping */
            <div className="flex flex-col flex-1 justify-between min-h-[60dvh]">
              <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.data.map((song, index) => (
                  <div
                    key={index}
                    className="bg-white border border-neutral-100 hover:border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm hover:shadow-md transition-all duration-200 relative min-w-0"
                  >
                    {/* Artwork Container frame block */}
                    <div className="relative w-full h-40 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-neutral-50 border border-neutral-100 group">
                      <Image
                        priority
                        src={song?.releaseImage || "/signinimage.png"}
                        alt="song release artwork cover"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Metadata Content area parameters */}
                    <div className="flex-1 min-w-0 pr-0 sm:pr-8 w-full flex flex-col justify-between space-y-2 sm:space-y-1">
                      <div>
                        <h1
                          className="text-base sm:text-lg font-bold text-main-heading truncate pr-8 sm:pr-0 tracking-tight"
                          title={song.releaseTitle}
                        >
                          {song.releaseTitle}
                        </h1>

                        {song.featuredArtist?.length > 0 && (
                          <p className="text-neutral-400 font-medium text-xs sm:text-sm truncate mt-0.5">
                            feat.{" "}
                            {song.featuredArtist
                              .map((item) => item.artistName.split(" ")[0])
                              .join(", ")}
                          </p>
                        )}
                      </div>

                      {/* Release & Label fields */}
                      <div className="text-xs space-y-1 pt-1 border-t border-neutral-50 sm:border-0">
                        <p className="text-neutral-600 flex items-center gap-1.5">
                          <span className="text-neutral-400 font-medium">
                            Release Date:
                          </span>
                          <span className="font-semibold text-neutral-700">
                            {song.releaseDate
                              ? new Date(song.releaseDate).toLocaleDateString(
                                  undefined,
                                  { dateStyle: "medium" },
                                )
                              : "—"}
                          </span>
                        </p>
                        <p className="text-neutral-600 truncate flex items-center gap-1.5 max-w-[90%]">
                          <span className="text-neutral-400 font-medium">
                            Label:
                          </span>
                          <span className="font-semibold text-neutral-700 truncate">
                            {song.user?.label || "—"}
                          </span>
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="pt-2 sm:pt-1">
                        <span
                          className={`font-bold text-[10px] sm:text-[11px] uppercase tracking-wider px-2.5 py-0.5 sm:py-1 rounded-full border inline-block ${
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

                    {/* Quick Context Settings Action Toggle Menu Button */}
                    <button
                      type="button"
                      onClick={() => handleArtistOptionChange(index)}
                      aria-label={`${song.releaseTitle} option context popover trigger menu`}
                      className={`absolute right-3 top-3 sm:top-1/2 sm:-translate-y-1/2 border border-neutral-200 rounded-lg w-8 h-8 flex items-center justify-center gap-0.5 hover:bg-neutral-50 transition-colors cursor-pointer ${
                        selectedIndex === index
                          ? "bg-neutral-100 ring-1 ring-neutral-300"
                          : "bg-white"
                      }`}
                    >
                      <div className="w-1 h-1 bg-[#103958] rounded-full"></div>
                      <div className="w-1 h-1 bg-[#103958] rounded-full"></div>
                      <div className="w-1 h-1 bg-[#103958] rounded-full"></div>
                    </button>

                    {/* Action Dialog Popover Overlay Context */}
                    {selectedIndex === index && (
                      <>
                        {/* Click-away overlay to dismiss menu */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => handleArtistOptionChange(index)}
                        />

                        <div className="absolute right-3 top-12 sm:top-auto sm:bottom-12 w-44 bg-white border border-neutral-200 rounded-xl shadow-xl z-20 flex flex-col py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                          {songOptions.map((options, optIdx) => (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                options.iconFunction();
                                setIsFilterOpen(false);
                                setSelectedIndex(index);
                                // handleArtistOptionChange(index); // auto-close
                              }}
                              className={`flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                                options.name === "Delete"
                                  ? "text-error-600 hover:bg-error-50"
                                  : "text-text-body hover:bg-neutral-50"
                              }`}
                            >
                              <span className="text-neutral-400 w-4 h-4 flex items-center justify-center">
                                {options.icon}
                              </span>
                              <span>{options.name}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination Section Bar block */}
              <div className="mt-auto border-t border-neutral-100 pt-5 pb-2">
                <Pagination
                  currentPage={page}
                  totalPages={data ? data.totalPages : 0}
                  onChange={(p) => setPage(p)}
                />
              </div>
            </div>
          )}

          {/* Delete Prompt Modal Overlay Confirmation backdrop */}
          {showDeletePopUp && data && data.data.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
              <div className="bg-white border border-neutral-200 max-w-md w-full rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-error-50 border border-error-100 rounded-full flex items-center justify-center text-error-600">
                  <Trash2 size={28} strokeWidth={1.5} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-main-heading">
                    Delete This Release?
                  </h3>
                  <p className="text-sm text-text-body leading-relaxed">
                    Your release will be permanently removed. This action is
                    irreversible. Are you sure you want to continue?
                  </p>
                  <p className="font-semibold text-xs text-warning-600 bg-warning-50 border border-warning-100 px-3 py-1.5 rounded-lg inline-block">
                    Note: Only pending and draft releases can be deleted.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
                  <button
                    type="button"
                    aria-label="cancel delete song"
                    onClick={() => setShowDeletePopUp(false)}
                    className="w-full sm:order-1 px-4 py-2.5 font-bold rounded-xl text-sm border-2 border-neutral-200 text-text-body bg-transparent hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    aria-label="confirm delete song"
                    disabled={isDeletePending}
                    onClick={() => {
                      if (
                        data &&
                        data.data.length > 0 &&
                        selectedIndex !== null
                      ) {
                        handleDeleteSong(data.data[selectedIndex]);
                      }
                    }}
                    className="w-full sm:order-2 px-4 py-2.5 font-bold rounded-xl text-sm text-white bg-error-500 hover:bg-error-600 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isDeletePending ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  ) : (
    data?.data[selectedIndex!] && (
      <SongForm
        songFormFromApi={data.data[selectedIndex!]}
        goBack={() => setWantsToEdit(false)}
        refetch={refetch}
      />
    )
  );
};

export default Song;
