"use client";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import Dashboard from "./Dashboard";
import UploadMusic from "./uploadMusic/UploadMusic";

const page = () => {

  const { tab, section } = useTabQuery("dashboard");

  return (

    <main className="section h-screen relative bg-main-white text-[14px] -tracking-[0.5px] leading-5 transition-all duration-300 ease-in-out">

      <div className="flex h-full">
        <div className="text-[#333333] lg:ml-[250px] w-full h-full">
          <div className="h-full">
            {(tab === "dashboard" || !tab) && (
              <Dashboard />
            )}
            {tab === "Music" && (
              <>
                {section === "uploadMusic" && (
                  <UploadMusic />
                )}
                {/* {section === "manageReleases" && <ManageRelease />} */}
                {!section && (
                  <UploadMusic />
                )}
              </>
            )}
            {/* {tab === "Artists" && (
              <>
                {section === "createArtist" && <CreateArtist />}
                {section === "manageArtist" && <ManageArtist />}
                {section === "collaboration" && <Collaboration />}
                {!section && <CreateArtist />}
              </>
            )}
            {tab === "Insight" && section === "songPerformance" && (
              <SongPerformance />
            )} */}
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
