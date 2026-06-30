"use client";

import {
  InlineLoadingScreen,
} from "@/app/components/Loader/loader";
import Pagination from "@/app/components/pagination/Pagination";
import useDebounce from "@/app/components/searchBox/searchBox";
import { filterOptions } from "@/app/constant";
import { Artist } from "@/app/type";
import { usePaginatedArtists } from "@/util/customHooks/useQueries";
import { FileSearchIcon, ChartNoAxesCombined } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import ViewArtist from "./ViewArtist";
import ViewStats from "./ViewStats";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";

const artistOptions = [
  { name: "View", icon: <FileSearchIcon strokeWidth={1} /> },
  { name: "Stats", icon: <ChartNoAxesCombined strokeWidth={1} /> },
];

const Page = () => {
  const router = useRouter();
  const dashboardContext = useContext(DashboardContext);

  const [currentView, setCurrentView] = useState<"list" | "view" | "stats">("list");
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null);
  const [filter, setFilter] = useState("-createdAt");
  const [query, setQuery] = useState("");

  const artistName = useDebounce<string>(query, 500);

  const { data, isLoading, isError, error, isFetching } = usePaginatedArtists({
    page,
    sort: filter,
    artistName: artistName,
  });

  // Restore selected artist from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("selectedArtist");
    if (saved) {
      setSelectedArtist(JSON.parse(saved));
      // Optionally restore view if needed
    }
  }, []);

  // Update header based on current view
  useEffect(() => {
    if (currentView === "view" && selectedArtist) {
      dashboardContext?.setHeader({
        title: selectedArtist.artistName || "View Artist",
        showBackButton: true,
        onBack: handleGoBack,
      });
    } else if (currentView === "stats" && selectedArtist) {
      dashboardContext?.setHeader({
        title: "Artist Stats",
        showBackButton: true,
        onBack: handleGoBack,
      });
    } else {
      dashboardContext?.setHeader({
        title: "Manage Artists",
        showBackButton: false,
      });
    }
  }, [currentView, selectedArtist]);

  const handleGoBack = () => {
    setSelectedArtist(null);
    setCurrentView("list");
    sessionStorage.removeItem("selectedArtist");
  };

  const handleSelectArtist = (artist: Artist, view: "view" | "stats") => {
    setSelectedArtist(artist);
    sessionStorage.setItem("selectedArtist", JSON.stringify(artist));
    setCurrentView(view);
    setSelectedIndex(null);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleArtistOptionChange = (index: number) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  // Reset filter dropdown when query or page changes
  useEffect(() => {
    setIsFilterOpen(false);
    setSelectedIndex(null);
  }, [query, page]);

  // Show ViewArtist component
  if (currentView === "view" && selectedArtist) {
    return (
      <ViewArtist
        artist={selectedArtist}
        setArtist={handleGoBack}
      />
    );
  }

  // Show ViewStats component
  if (currentView === "stats" && selectedArtist) {
    return (
      <ViewStats
        artistToViewStats={selectedArtist}
        setArtistToViewStats={handleGoBack}
      />
    );
  }

  // Main Artist List View
  return (
    <div className="bg-main-white min-h-[90dvh] w-full flex flex-col px-2 lg:px-0 lg:pl-[280px]">
      {isLoading ? (
        <InlineLoadingScreen />
      ) : isError || !data || data.data.length === 0 ? (
        <div className="flex flex-col justify-center items-center min-h-[90dvh] gap-15">
          <Image
            priority={true}
            src="/manage_artist_image.png"
            alt="no artist"
            width={200}
            height={200}
          />
          <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%] text-center">
            No Artist Profile Yet. Create your first artist profile to start releasing and managing music.
          </p>
          <button
            onClick={() => router.push("/dashboard/artist/createArtist")}
            className="font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/90 border-3 border-primary flex text-white bg-primary-500"
          >
            + Create Artist
          </button>
        </div>
      ) : (
        <div className="min-h-full px-2 lg:px-0">
          <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-[16px] sm:max-w-[40%] mt-5">
            View and manage all your artist profiles. Edit details, link streaming platforms, and track performance.
          </p>

          {/* Search + Filter */}
          <div className="flex justify-between w-full mt-5 items-center">
            <div className="flex p-2 outline-1 m-2 rounded-lg mb-5 max-w-[60%] w-full">
              <Image src="/search-normal.svg" alt="search" width={20} height={20} />
              <input
                type="search"
                className="w-full p-1 text-[16px] sm:text-sm outline-0"
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
              />
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="border-2 w-[50px] h-[50px] rounded-lg flex flex-col justify-center items-center gap-1 md:mr-5"
              >
                <div className="bg-primary w-[25px] h-[2px]"></div>
                <div className="bg-primary w-[15px] h-[2px]"></div>
                <div className="bg-primary w-[10px] h-[2px]"></div>
              </button>

              {isFilterOpen && (
                <div className="absolute mt-2 right-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange(option.value)}
                      className="flex items-center gap-2 px-3 py-2 w-full hover:bg-neutral-50"
                    >
                      <div className={`w-2 h-2 rounded-full bg-primary ${filter !== option.value && "opacity-0"}`} />
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Artists Grid */}
          <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1 px-3">
            {data.data.map((artist, index) => (
              <div key={index} className="bg-neutral-50 border-2 border-neutral-100 rounded-lg p-2 flex gap-5 relative">
                <div className="relative w-[100px] h-[100px]">
                  <Image
                    src={artist.artistImage}
                    alt={artist.artistName}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1">
                  <h1 className="text-xl font-normal leading-[24px] tracking-[-0.5px] text-text-body line-clamp-2">
                    {artist.artistName}
                  </h1>
                </div>

                <button
                  onClick={() => handleArtistOptionChange(index)}
                  className="border-2 border-neutral-200 rounded-lg w-8 h-8 flex items-center justify-center"
                >
                  ⋮
                </button>

                {/* Options Dropdown */}
                {selectedIndex === index && (
                  <div className="absolute right-4 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 w-32">
                    {artistOptions.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectArtist(artist, option.name.toLowerCase() as "view" | "stats")}
                        className="flex items-center gap-2 px-4 py-2 w-full hover:bg-neutral-50 text-left"
                      >
                        {option.icon}
                        {option.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={data?.totalPages || 0}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default Page;