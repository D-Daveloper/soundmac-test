"use client";
import Image from "next/image";
import React from "react";
import type { AlbumForm } from "@/app/type";

interface AlbumPreviewProps {
  albumForm: AlbumForm;
  image: string | null;
  onEdit: () => void;
}

const AlbumPreview: React.FC<AlbumPreviewProps> = ({
  albumForm,
  image,
  onEdit,
}) => {
  return (
    <div className="flex-3 overflow-y-auto px-4 flex flex-col gap-5 pb-20 lg:pb-5 lg:h-[68dvh] custom-scrollbar">
      {/* Header Section with Action */}
      <div className="flex items-center justify-between border-b md:border-none border-neutral-100 pb-4">
        <h1 className="text-base font-bold tracking-tight text-main-heading">
          Album Summary
        </h1>
        <button
          onClick={onEdit}
          className="text-sm font-semibold text-primary hover:underline transition-all mr-2"
        >
          Edit Details
        </button>
      </div>

      {/* Artwork Section */}
      <div className="space-y-3">
        <p className="font-bold text-neutral-800 text-sm tracking-wide uppercase">
          Artwork File
        </p>
        <div className="max-w-md flex gap-4 items-center p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs">
          {image ? (
            <>
              <div className="w-20 h-20 relative shrink-0 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                <Image
                  src={image}
                  fill
                  alt="Album artwork preview"
                  className="object-fit"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-body font-semibold text-sm truncate">
                  {albumForm.music_image?.name || "Uploaded Image"}
                </p>
                <p className="text-xs text-text-disable mt-0.5">
                  Ready for distribution
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

      {/* Album Metadata Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 px-2 text-sm">
        {/* Album Title */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Album Title
          </h2>
          <div className=" border-b border-neutral-100/80">
            <p className="truncate text-text-body font-medium text-xs py-1 min-h-[32px]">
              {albumForm.title}
            </p>
          </div>
        </div>

        {/* Genre */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Genre
          </h2>
          <div className="border-b border-neutral-100/80">
            <p className="truncate text-text-body font-medium text-xs min-h-[32px]">
              {albumForm.genre}
            </p>
          </div>
        </div>

        {/* Language */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Language
          </h2>
          <div className="border-b border-neutral-100/80">
            <p className="truncate text-text-body font-medium text-xs py-1 min-h-[32px]">
              {albumForm.language}
            </p>
          </div>
        </div>

        {/* Main Artist */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Main Artist
          </h2>
          <div className="border-b border-neutral-100/80">
            <p className="truncate text-text-body font-medium text-xs py-1 min-h-[32px]">
              {albumForm.artist}
            </p>
          </div>
        </div>

        {/* Territories */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Territories
          </h2>
          <div className=" border-b border-neutral-100/80">
            <p
              className="truncate text-text-body font-medium text-xs py-1 min-h-[32px]"
              title={albumForm.territories?.join(", ")}
            >
              {albumForm.territories?.length > 0
                ? albumForm.territories.join(", ")
                : ""}
            </p>
          </div>
        </div>

        {/* UPC */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            UPC Barcode
          </h2>
          <div className="border-b border-neutral-100/80">
            <p className="truncate text-text-body font-mono font-medium text-xs py-1 min-h-[32px]">
              {albumForm.upc}
            </p>
          </div>
        </div>

        {/* Release date */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Release Date
          </h2>
          <div className="border-b border-neutral-100/80">
            <p className="truncate text-text-body font-medium text-xs py-1 min-h-[32px]">
              {albumForm.release_date
                ? new Date(albumForm.release_date).toLocaleDateString(
                    undefined,
                    { dateStyle: "medium" },
                  )
                : ""}
            </p>
          </div>
        </div>

        {/* Preorder Start date */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-tight text-[#103958] capitalize">
            Preorder Start Date
          </h2>
          <div className="border-b border-neutral-100/80">
            <p className="truncate text-text-body font-medium text-xs py-1 min-h-[32px]">
              {albumForm.preOrderDate
                ? new Date(albumForm.preOrderDate).toLocaleDateString(
                    undefined,
                    { dateStyle: "medium" },
                  )
                : ""}
            </p>
          </div>
        </div>

        {/* Copyright Holder */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Copyright Holder
          </h2>
          <div className="border-b border-neutral-100/80">
            <p className="truncate text-text-body font-medium text-xs py-1 min-h-[32px]">
              {albumForm.copyRightHolder}
            </p>
          </div>
        </div>

        {/* Copyright Year */}
        <div className="flex flex-col w-full">
          <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
            Copyright Year
          </h2>
          <div className="border-b border-neutral-100/80">
            <p className="truncate text-text-body font-medium text-xs py-1 min-h-[32px]">
              {albumForm.copyRightYear}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumPreview;
