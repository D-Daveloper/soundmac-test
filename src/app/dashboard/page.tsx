"use client";
import Dashboard from "./Dashboard";

const Page = () => {

  return (
    <main className="section min-h-screen relative bg-main-white text-[14px] -tracking-[0.5px] leading-5 transition-all duration-300 ease-in-out">
      <div className="flex h-full">
        <div className="text-[#333333] lg:ml-[300px] w-full h-full">
          <div className="h-full">
          <Dashboard />
            {/* {tab === "Music" && (
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
                {!section && <CreateArtistForm />}
              </>
            )}
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
            )} */}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;