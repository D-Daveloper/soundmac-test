"use client";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import Dashboard from "./Dashboard";
import UploadMusic from "./uploadMusic/UploadMusic";
import CreateArtistForm from "./artist/create/CreateArtistForm";
import ManageArtist from "./artist/manage/ManageArtist";
import Promotion from "./promotion/Promotion";
import RadioPromotionForm from "./promotion/RadioPromotionForm";
import BoomPlayForm from "./promotion/BoomPlayForm";
import PitchPlayForm from "./promotion/PitchPlayForm";
import OnlinePressForm from "./promotion/OnlinePressForm";
import ManageRelease from "./manageRelease/ManageRelease";

const page = () => {
  const { tab, section, promotionType } = useTabQuery("dashboard");

  return (
    <main className="section h-full relative bg-main-white text-[14px] -tracking-[0.5px] leading-5 transition-all duration-300 ease-in-out">
      <div className="flex h-full">
        <div className="text-[#333333] lg:ml-[250px] w-full h-full">
          <div className="h-full">
            {(tab === "dashboard" || !tab) && <Dashboard />}
            {tab === "Music" && (
              <>
                {section === "uploadMusic" && <UploadMusic />}
                {section === "manageReleases" && <ManageRelease />}
                {!section && <UploadMusic />}
              </>
            )}
            {tab === "Artists" && (
              <>
                {section === "createArtist" && <CreateArtistForm />}
                {section === "manageArtist" && <ManageArtist />}
                {/* {section === "collaboration" && <Collaboration />} */}
                {!section && <CreateArtistForm />}
              </>
            )}
            {/* {tab === "Insight" && section === "songPerformance" && (
              <SongPerformance />
            )} */}
            {tab === "explore" &&
              section === "promotion" &&
              promotionType === "boomplay" && <BoomPlayForm />}
            {tab === "explore" &&
              section === "promotion" &&
              promotionType === "radio" && <RadioPromotionForm />}
            {tab === "explore" &&
              section === "promotion" &&
              promotionType === "pitchplay" && <PitchPlayForm />}
            {tab === "explore" &&
              section === "promotion" &&
              promotionType === "onlinepress" && <OnlinePressForm />}
            {tab === "explore" && section === "promotion" && !promotionType && (
              <Promotion />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;

// const ManageRelease = () => {
//   return <div>Manage</div>;
// };
// const CreateArtist = () => {
//   return <div>createArtist</div>;
// };
// const ManageArtist = () => {
//   return <div>manageArtist</div>;
// };
// const Collaboration = () => {
//   return <div>Collaboration</div>;
// };
// const SongPerformance = () => {
//   return <div>SongPerformance</div>;
// };
