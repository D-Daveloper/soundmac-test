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
  markAsAccepted: () => void
}

const PopUp = ({ type, onClose, onContinue, markAsAccepted}:PopUpProps) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[85vh] overflow-auto remove-scrollbar rounded-2xl bg-[#1A1A1E] text-white p-6 shadow-2xl border border-neutral-800 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300">
              <FiUpload size={18} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Before you upload
            </h2>
          </div>
          <p className="text-sm text-neutral-400 font-normal leading-relaxed">
            Please take a moment to review these important points before submitting
            your release.
          </p>
        </div>

        <div className="space-y-3">
          {info.map((item) => (
            <div
              key={item.number}
              className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#232328] border border-neutral-800/80"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold mt-0.5">
                {item.number}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-neutral-100">
                  {item.heading}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {item.details}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <IoIosWarning size={22} className="shrink-0 text-amber-400 mt-0.5" />
          <p className="text-xs leading-relaxed text-amber-200/90 font-medium">
            Releases that do not meet these requirements may be rejected or
            delayed. You are responsible for ensuring your content complies with
            platform guidelines.
          </p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group py-1">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-neutral-900 cursor-pointer accent-primary-500"
          />
          <span className="text-xs text-neutral-300 font-medium group-hover:text-white transition-colors">
            I confirm that I have read and understood these requirements.
          </span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!accepted}
            onClick={() => {
                markAsAccepted();
                onContinue()
            }}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 disabled:opacity-40 disabled:hover:bg-primary-600 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopUp;