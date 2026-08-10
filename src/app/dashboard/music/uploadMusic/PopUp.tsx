"use client";

import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";
import { IoIosWarning } from "react-icons/io";

interface InfoType {
  number: number;
  heading: string;
  details: string;
}

const info: InfoType[] = [
  {
    number: 1,
    heading: "Licensed beats only",
    details:
      "Releases containing YouTube beats or unlicensed instrumentals will be rejected by streaming platforms. Make sure you hold a valid commercial licence for every beat used.",
  },
  {
    number: 2,
    heading: "No AI-generated content",
    details:
      "SoundMac does not currently support AI-generated music. Releases identified as fully or partially AI-generated will not be accepted for distribution.",
  },
  {
    number: 3,
    heading: "Set your release date at least 2 weeks ahead",
    details:
      "This is a recommendation, not a requirement. Giving our delivery partners enough lead time ensures your music goes live on all stores without delays.",
  },
  {
    number: 4,
    heading: "Double-check your metadata",
    details:
      "Incorrect artist names, misspelled titles, or wrong ISRC codes are a leading cause of release delays. Review all details carefully before submitting.",
  },
];

interface PopUpProps {
  type: "single" | "album" | null;
  onClose: () => void;
  onContinue: () => void;
  // markAsAccepted: () => void
}

const PopUp = ({ type, onClose, onContinue }: PopUpProps) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-xs">
      <div className="w-full max-w-lg  max-h-[85vh] overflow-auto md:max-h-full rounded-2xl bg-white text-gray-900 p-4 sm:p-5 shadow-xl border border-gray-100 space-y-3 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Icon and Title */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 border border-primary-100 text-primary-500 shrink-0">
              <FiUpload size={16} />
            </div>
            <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
              Before you upload
            </h2>
          </div>
          <p className="text-xs text-gray-500 font-normal leading-tight">
            Please take a moment to review these important points before submitting your release.
          </p>
        </div>

        {/* Single Parent Container with Mapped Items */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 divide-y divide-gray-200/60">
          {info.map((item) => (
            <div key={item.number} className="flex items-start gap-2.5 py-2 first:pt-0 last:pb-0">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white text-[10px] font-bold mt-0.5">
                {item.number}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-gray-900 leading-none">
                  {item.heading}
                </h3>
                <p className="text-[11px] text-gray-600 leading-tight font-medium">
                  {item.details}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Compact Warning Box */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800">
          <IoIosWarning size={18} className="shrink-0 text-amber-500 mt-0.5" />
          <p className="text-[11px] leading-tight font-medium">
            Releases that do not meet these requirements may be rejected or delayed. You are responsible for ensuring your content complies with platform guidelines.
          </p>
        </div>

        {/* Checkbox Confirmation */}
        <label className="flex items-start gap-2.5 cursor-pointer group py-0.5">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="h-3.5 w-3.5 mt-0.5 rounded border-gray-300 bg-white text-primary-500 focus:ring-primary-500 cursor-pointer accent-primary-500 shrink-0"
          />
          <span className="text-[11px] text-gray-600 font-medium group-hover:text-gray-900 transition-colors leading-tight">
            I confirm I have all necessary rights to distribute this release, that my information is accurate, and that I agree to the Soundmac Distribution Agreement and Terms of Service.
          </span>
        </label>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!accepted}
            onClick={() => {
              // markAsAccepted();
              onContinue();
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:hover:bg-primary-500 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopUp;