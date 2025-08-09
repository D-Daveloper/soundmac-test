"use client";
// import UserRoute from "@/app/protectedRoute/protectedRoute";
import { Calendar22 } from "@/components/datePicker";
import { SelectOption } from "@/components/SelectOption";
import { useParams } from "next/navigation";
import React from "react";
const packagesListFormatted = [
  // Category 1
  [
    {
      value:
        "Bronze package (5 B-tier playlist + Push Notifications 2m+ Impressions) | N300,000",
      label:
        "Bronze package (5 B-tier playlist + Push Notifications 2m+ Impressions) | N300,000",
    },
    {
      value:
        "Silver package (10 A-tier playlist + Push Notifications 5m+ Impressions) | N500,000",
      label:
        "Silver package (10 A-tier playlist + Push Notifications 5m+ Impressions) | N500,000",
    },
    {
      value:
        "Gold package (15 A-tier playlist + Push Notifications 10m+ Impressions) | N700,000",
      label:
        "Gold package (15 A-tier playlist + Push Notifications 10m+ Impressions) | N700,000",
    },
    {
      value:
        "Platinum package (20 A-tier playlist + Push Notifications 15m+ Impressions) | N1,000,000",
      label:
        "Platinum package (20 A-tier playlist + Push Notifications 15m+ Impressions) | N1,000,000",
    },
  ],

  // Category 2
  [
    {
      value: "Deezer Top 100 song chart | N400,000",
      label: "Deezer Top 100 song chart | N400,000",
    },
    {
      value: "Deezer Top 50 song chart | N450,000",
      label: "Deezer Top 50 song chart | N450,000",
    },
    {
      value: "Deezer Top 10 song chart | N500,000",
      label: "Deezer Top 10 song chart | N500,000",
    },
    {
      value: "Deezer Top 1 - 10 song chart | N650,000",
      label: "Deezer Top 1 - 10 song chart | N650,000",
    },
  ],

  // Category 3
  [
    {
      value: "Shazam top 100 songs chart | N700,000",
      label: "Shazam top 100 songs chart | N700,000",
    },
    {
      value: "Shazam top 50 songs chart | N900,000",
      label: "Shazam top 50 songs chart | N900,000",
    },
    {
      value: "Shazam top 20 songs chart | N1,300,000",
      label: "Shazam top 20 songs chart | N1,300,000",
    },
    {
      value: "Shazam top 10 songs chart | N2,500,000",
      label: "Shazam top 10 songs chart | N2,500,000",
    },
  ],

  // Category 4
  [
    {
      value: "Max fm | N150,000",
      label: "Max fm | N150,000",
    },
    {
      value: "Mainland Fm | N150,000",
      label: "Mainland Fm | N150,000",
    },
    {
      value: "Hot fm | N150,000",
      label: "Hot fm | N150,000",
    },
    {
      value: "City fm | N180,000",
      label: "City fm | N180,000",
    },
    {
      value: "Rhythm fm | N200,000",
      label: "Rhythm fm | N200,000",
    },
    {
      value: "Naija fm | N200,000",
      label: "Naija fm | N200,000",
    },
    {
      value: "Naija fm | N200,000",
      label: "Naija fm | N200,000",
    },
    {
      value: "Wazobia fm | N250,000",
      label: "Wazobia fm | N250,000",
    },
    {
      value: "Beat Fm | N400,000",
      label: "Beat Fm | N400,000",
    },
    {
      value: "Soundcity Radio | N550,000",
      label: "Soundcity Radio | N550,000",
    },
  ],

  // Category 5
  [
    {
      value: "This day | N70,000",
      label: "This day | N70,000",
    },
    {
      value: "Guardian | N70,000",
      label: "Guardian | N70,000",
    },
    {
      value: "Independent | N70,000",
      label: "Independent | N70,000",
    },
    {
      value: "The nation | N70,000",
      label: "The nation | N70,000",
    },
    {
      value: "Daily Trust | N100,000",
      label: "Daily Trust | N100,000",
    },
    {
      value: "Vanguard | N100,000",
      label: "Vanguard | N100,000",
    },
    {
      value: "Blueprint | N100,000",
      label: "Blueprint | N100,000",
    },
  ],
];
const PromotionCard = () => {
  const [promotionForm, setPromotionForm] = React.useState({
    date: "" as unknown as Date | undefined,
    package: "",
    country: "",
    article: "",
    artist: "",
    song: "",
  });
  const { category } = useParams();
  let PromotionPackage = [];
  switch (category) {
    case "Boomplay":
      PromotionPackage = packagesListFormatted[0];
      break;
    case "Deezer":
      PromotionPackage = packagesListFormatted[1];
      break;
    case "Shazam":
      PromotionPackage = packagesListFormatted[2];
      break;
    case "Radio-Promotion":
      PromotionPackage = packagesListFormatted[3];
      break;
    case "Playlist-Pitch":
      PromotionPackage = packagesListFormatted[4];
      break;
    case "Online-Press":
      PromotionPackage = packagesListFormatted[4];
      break;
    default:
      PromotionPackage = [
        { label: "No packages available for this category", value: "" },
      ];
      break;
  }
  return (
    // <UserRoute>
      <div className="flex flex-col gap-2 p-5 w-[60%] mx-auto">
        <div className="mt-10 mb-20 text-center">
          <h1 className="font-bold text-xl">
            Welcome to SOUNDMAC Promotion Form
          </h1>
          <p className="text-[#5E5E5E]">
            Please note that all promotions are subject to review and approval.
          </p>
        </div>
        <div className="flex gap-5 flex-wrap ">
          <div>
            <p className="text-[#999999]">Select Date for your Promotion</p>
            <Calendar22
              setDate={(val) =>
                setPromotionForm((prev) => ({ ...prev, date: val }))
              }
              value={promotionForm.date}
            />
          </div>
          <div>
            <p className="text-[#999999]">Select a Artist</p>
            <SelectOption
            placeholder="Select Artist"
              promotionPackage={PromotionPackage}
              setValue={(val) =>
                setPromotionForm((prev) => ({ ...prev, artist: val }))
              }
              value={promotionForm.artist}
            />
          </div>
          <div>
            <p className="text-[#999999]">Select a Song or Album </p>
            <SelectOption
              placeholder="Select Song or Album"
              promotionPackage={PromotionPackage}
              setValue={(val) =>
                setPromotionForm((prev) => ({ ...prev, song: val }))
              }
              value={promotionForm.song}
            />
          </div>
          <div>
            <p className="text-[#999999]">Select a Promotion Package</p>
            <SelectOption
              placeholder="Select Package"
              promotionPackage={PromotionPackage}
              setValue={(val) =>
                setPromotionForm((prev) => ({ ...prev, package: val }))
              }
              value={promotionForm.package}
            />
          </div>
        </div>
        <label htmlFor="text" className="text-[#999999]">
          Country
        </label>
        <input
          name="country"
          value={promotionForm.country}
          type="text"
          className="bg-[#D9D9D9] h-8 rounded-md p-5"
          onChange={(e) =>
            setPromotionForm((prev) => ({ ...prev, country: e.target.value }))
          }
        />
        <label htmlFor="article" className="text-[#999999]">
          Article
        </label>
        <textarea
          placeholder="Write your article here..."
          name="article"
          rows={4}
          className="bg-[#D9D9D9] h-8 rounded-md p-5 min-h-[200px]"
          onChange={(e) =>
            setPromotionForm((prev) => ({ ...prev, article: e.target.value }))
          }
        ></textarea>
        <button
          onClick={() => {
            console.log(promotionForm);
          }}
          className="bg-[#11456B] text-white rounded-sm max-md:w-full w-[20%]"
        >
          click to submit
        </button>
      </div>
    // </UserRoute>
  );
};

export default PromotionCard;
