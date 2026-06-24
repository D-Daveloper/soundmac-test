"use client";
import Image from "next/image";
import React, { useContext, useEffect } from "react";
import type { SongForm } from "@/app/type";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { useRouter } from "next/navigation";

interface SongPreviewProps {
  songForm: SongForm;
  image: string | null;
  onEdit: () => void  
}

const SongPreview: React.FC<SongPreviewProps> = ({ songForm, image , onEdit}) => {
      const router = useRouter()
      const dashboardContext = useContext(DashboardContext);
    
// useEffect(() => {
//     if (preview) {
//         dashboardContext?.setHeader({
//             title: "preview",
//             showBackButton: true,
//             onBack: () => router.back(), // pops ?step=preview → back to form
//         });
//     } else {
//         dashboardContext?.setHeader({
//             title: "upload single",
//             showBackButton: true,
//             onBack: () => router.push("/dashboard/music/uploadMusic?type=single"),
//         });
//     }
// }, [preview]); // ← re-runs when preview changes
    //  useEffect(() => {
    //     dashboardContext?.setHeader({
    //       title: "preview",
    //       showBackButton: true,
    //       onBack: () => router.push("/dashboard/music/uploadMusic?type=single")
    //     });
    //   }, []);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-10 px-4 pb-6 h-[64dvh] custom-scrollbar">
      <div>
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4">

        <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading border-b border-neutral-100 pb-4">
          Song Summary
        </h1>
        <button 
          onClick={onEdit}
          className="text-sm font-semibold text-primary hover:underline transition-all"
        >
          Edit Details
        </button>
        </div>
        {/* image */}
        <div className="w-full flex flex-col gap-y-3 mt-6">
          <p className="font-bold text-[#000000] text-sm leading-[18px] tracking-[0.5px]">
            Artwork File
          </p>
          <div className="max-w-md flex gap-4 items-center p-4 rounded-2xl border border-neutral-200 bg-white">
            {image ? (
              <>
                <div className="w-20 h-20 relative shrink-0 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <Image
                    src={image}
                    fill
                    alt="music note icon"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-body font-bold text-sm truncate">
                    {songForm.music_image?.name}
                  </p>
                </div>
              </>
            ) : (
                <div className="flex items-center gap-3 py-2 px-1">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
                        ⚠️
                    </div>
                    <p className="text-text-disable font-medium text-sm">
                        No image selected
                    </p>
            </div>

            )}
          </div>
        </div>
      </div>

      {/* Metadata Fields Grid */}
      <div className="text-[#103958] font-bold text-sm leading-[18px] tracking-[0.5px] grid grid-cols-2 gap-x-8 gap-y-6 max-xs:grid-cols-1">
        
        {/* Song Title */}
        <div className="flex flex-col gap-y-1 w-full">
          <h2>Song Title</h2>
          <div className="pb-1">
            <p className="truncate text-text-body font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.title}
            </p>
            <div className="border border-neutral-100 mt-1"></div>
          </div>
        </div>

        {/* Language */}
        <div className="flex flex-col gap-y-1 w-full">
          <h2>Language</h2>
          <div className="pb-1">
            <p className="truncate text-text-body font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.language}
            </p>
            <div className="border border-neutral-100 mt-1"></div>
          </div>
        </div>

        {/* Main Artist */}
        <div className="flex flex-col gap-y-1 w-full">
          <h2>Main Artist</h2>
          <div className="pb-1">
            <p className="truncate text-text-body font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.artist}
            </p>
            <div className="border border-neutral-100 mt-1"></div>
          </div>
        </div>

        {/* Featured Artists */}
        <div className="flex flex-col gap-y-1 w-full">
          <h2>Featured Artists</h2>
          <div className="pb-1">
            <p className="truncate text-text-body font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.featured_artist.map((item) => item.artistName).join(", ")}
            </p>
            <div className="border border-neutral-100 mt-1"></div>
          </div>
        </div>

        {/* Performers */}
        <div className="flex flex-col gap-y-1 w-full">
          <h2>Performers</h2>
          <div className="pb-1">
            <p className="truncate text-text-body font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.performer.map((item) => item.name).join(", ")}
            </p>
            <div className="border border-neutral-100 mt-1"></div>
          </div>
        </div>

        {/* Songwriter */}
        <div className="flex flex-col gap-y-1 w-full">
          <h2>Songwriter</h2>
          <div className="pb-1">
            <p className="truncate text-text-body font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.song_writer.map((item) => item.first_name).join(", ")}
            </p>
            <div className="border border-neutral-100 mt-1"></div>
          </div>
        </div>

        {/* Producer */}
        <div className="flex flex-col gap-y-1 w-full">
          <h2>Producer</h2>
          <div className="pb-1">
            <p className="truncate text-text-body font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.producer.map((item) => item.name).join(", ")}
            </p>
            <div className="border border-neutral-100 mt-1"></div>
          </div>
        </div>

        {/* Territories */}
        <div className="flex flex-col gap-y-1 w-full">
          <h2>Territories</h2>
          <div className="pb-1">
            <p className="truncate text-text-body font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.territories.join(", ")}
            </p>
            <div className="border border-neutral-100 mt-1"></div>
          </div>
        </div>

        {/* UPC */}
        <div className="flex flex-col gap-y-1 w-full">
          <h2>UPC</h2>
          <div className="pb-1">
            <p className="truncate text-text-body font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.upc}
            </p>
            <div className="border border-neutral-100 mt-1"></div>
          </div>
        </div>

        {/* ISRC */}
        <div className="flex flex-col gap-y-1 w-full">
          <h2>ISRC</h2>
          <div className="pb-1">
            <p className="truncate text-text-body font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.isrc}
            </p>
            <div className="border border-neutral-100 mt-1"></div>
          </div>
        </div>

        {/* Release date */}
        <div className="flex flex-col gap-y-1 w-full">
          <h2>Release date</h2>
          <div className="pb-1">
            <p className="truncate text-text-body font-normal leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.release_date?.toLocaleDateString() || ""}
            </p>
            <div className="border border-neutral-100 mt-1"></div>
          </div>
        </div>

        {/* Preorder Start date */}
        <div className="flex flex-col gap-y-1 w-full">
          <h2>Preorder Start date</h2>
          <div className="pb-1">
            <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px] min-h-[30px]">
              {songForm.preOrderDate?.toLocaleDateString() || ""}
            </p>
            <div className="border border-neutral-100 mt-1"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SongPreview;