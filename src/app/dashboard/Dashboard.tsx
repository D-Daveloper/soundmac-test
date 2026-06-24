"use client";
import { useAuthUser, useDashboard } from "@/util/customHooks/useQueries";
import Image from "next/image";
import { useContext, useEffect } from "react";
import DashboardContext from "../context/dashboardContext/dashboardContext";
import { formatAmount } from "@/util/middleware/functions";
import { InlineLoadingScreen } from "../components/Loader/loader";

const Dashboard = () => {
  const { data, isLoading, isError, error } = useDashboard();
  const { data: user } = useAuthUser();
  const dashboardContext = useContext(DashboardContext);

  useEffect(() => {
    if (user?.firstName) {
      dashboardContext?.setHeader({ title: "Welcome, " +  user.firstName,  showBackButton:false});
    }
  }, []);

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50dvh] w-full p-5">
        <div className="text-center bg-red-50 p-6 rounded-2xl border border-red-100 max-w-md">
          <h2 className="text-lg font-semibold text-red-800">Failed to load dashboard statistics</h2>
          <p className="text-sm text-red-600 mt-1">{error?.message || "Something went wrong. Please try again later."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-4 ">
      
{/* Top Cards Statistics Section Row Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 w-full border border-red-50">
        
{/* Card 1: Upcoming Release */}
        <div className={`h-[120px] w-full rounded-3xl bg-warning-50 border border-neutral-100 overflow-hidden transition ${isLoading ? "shimmer min-h-[160px]" : ""}`}>
          {!isLoading && data && (
            data.pendingRelease ? (
              <div className="grid grid-cols-2 w-full h-full">
                <div className="flex flex-col p-4 justify-between h-full">
                  <div>
                    <p className="text-text-disable font-medium tracking-tight text-xs uppercase">
                      Upcoming Release
                    </p>
                    <h2 className="text-lg font-semibold line-clamp-2 capitalize text-text-body mt-2 leading-tight">
                      {data?.pendingRelease.releaseTitle || "No Release name"}
                    </h2>
                  </div>
                  <p className="text-text-body/80 font-normal tracking-tight text-xs truncate">
                    ~ {data?.pendingRelease.artistName || "No Artist name"}
                  </p>
                </div>
                <div className="relative w-full h-full p-2">
                  <div className="w-full h-full relative rounded-2xl overflow-hidden bg-neutral-200">
                    <Image
                      src={data?.pendingRelease.releaseImage}
                      fetchPriority="high"
                      priority={true}
                      fill
                      alt="picture of the users music cover art"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4 text-center">
                <div className="max-w-[90%]">
                  <h2 className="text-sm font-bold text-text-body">
                    No Pending Release
                  </h2>
                  <p className="text-text-disable text-xs mt-1 leading-normal">
                    Upload your first track and start sharing your sound with the world.
                  </p>
                </div>
              </div>
            )
          )}
        </div>

{/* Card 2: Total Albums */}
        <div className={`bg-neutral-50 border border-neutral-100 rounded-3xl h-[120px] w-full transition ${isLoading ? "shimmer min-h-[160px]" : ""}`}>
          {!isLoading && (
            <div className="capitalize flex flex-col p-4 h-full justify-between">
              <div className="flex justify-between items-start w-full">
                <div className="p-2 bg-white rounded-2xl shadow-sm border border-neutral-100">
                  <Image
                    src="/headphone.svg"
                    priority={false}
                    height={32}
                    width={32}
                    alt="head phones icon"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-text-body truncate pl-2">
                  {data?.totalAlbums || 0}
                </h2>
              </div>
              <p className="text-text-disable font-medium text-sm text-end w-full uppercase tracking-wider">
                total Albums
              </p>
            </div>
          )}
        </div>

{/* Card 3: Total Songs */}
        <div className={`bg-neutral-50 border border-neutral-100 rounded-3xl h-[120px] w-full transition ${isLoading ? "shimmer min-h-[160px]" : ""}`}>
          {!isLoading && (
            <div className="capitalize flex flex-col p-4 h-full justify-between">
              <div className="flex justify-between items-start w-full">
                <div className="p-2 bg-white rounded-2xl shadow-sm border border-neutral-100">
                  <Image
                    src="/musicnote.svg"
                    priority={false}
                    height={32}
                    width={32}
                    alt="music note icon"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-text-body truncate pl-2">
                  {data?.totalSingles || 0}
                </h2>
              </div>
              <p className="text-text-disable font-medium text-sm text-end w-full uppercase tracking-wider">
                Total Songs
              </p>
            </div>
          )}
        </div>

{/* Card 4: Total Earnings */}
        <div className={`bg-neutral-50 border border-neutral-100 rounded-3xl h-[120px] w-full transition ${isLoading ? "shimmer min-h-[160px]" : ""}`}>
          {!isLoading && (
            <div className="capitalize flex flex-col p-4 h-full justify-between">
              <div className="flex justify-between items-start w-full">
                <div className="p-2 bg-white rounded-2xl shadow-sm border border-neutral-100">
                  <Image
                    src="/musicnote.svg"
                    priority={false}
                    height={32}
                    width={32}
                    alt="music note icon"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <p className="text-text-disable font-medium text-sm uppercase tracking-wider text-end">
                  Total Earnings
                </p>
              </div>
              <div className="w-full">
                <h2 className="text-2xl font-extrabold tracking-tight text-text-body text-end truncate">
                  {data?.totalEarnings ? formatAmount(data.totalEarnings) : formatAmount(0)}
                </h2>
              </div>
            </div>
          )}
        </div>

      </div>

{/* Main Double Dashboard Metric Blocks Row Grid */}
      <div className="flex flex-col md:flex-row gap-5 ">
        
{/* Left Double Height Block Panel Block */}
        <div className={`bg-neutral-50 border border-neutral-100 rounded-3xl md:h-[380px] md:w-[400px] flex flex-col overflow-hidden transition ${isLoading ? "shimmer" : ""}`}>
          {!isLoading && (
            data && data.lastRelease ? (
              <div className="p-5 flex flex-col h-full justify-between flex-1 space-y-4">
                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-text-disable font-medium text-xs uppercase tracking-wider mb-2">
                      Last Release
                    </p>
                    <div className="w-full h-48 relative rounded-2xl overflow-hidden bg-neutral-200 shadow-sm">
                      <Image
                        priority={true}
                        src={data?.lastRelease.releaseImage}
                        alt="artist last release cover art"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold capitalize tracking-tight text-text-body truncate">
                      {data?.lastRelease.releaseTitle || "No Release name"}
                    </h2>
                    <p className="text-text-body/70 text-sm font-medium">
                      ~ {data?.lastRelease.artistName || "No Artist name"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200/60">
                  <p className="text-text-disable font-bold text-xs uppercase tracking-wider mb-3">
                    Streams Summary Breakdown
                  </p>
                  <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1 bg-white p-2.5 rounded-xl border border-neutral-200/60 shadow-xs min-w-[55px]">
                        <Image src="/applemusic.svg" priority={false} height={24} width={24} alt="apple music icon" className="w-6 h-6 object-contain" />
                        <span className="text-text-body font-bold text-sm mt-1">40</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 bg-white p-2.5 rounded-xl border border-neutral-200/60 shadow-xs min-w-[55px]">
                        <Image src="/spotify.svg" priority={false} height={24} width={24} alt="spotify icon" className="w-6 h-6 object-contain" />
                        <span className="text-text-body font-bold text-sm mt-1">123</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 bg-white p-2.5 rounded-xl border border-neutral-200/60 shadow-xs min-w-[55px]">
                        <Image src="/boomplay.svg" priority={false} height={24} width={24} alt="boomplay icon" className="w-6 h-6 object-contain" />
                        <span className="text-text-body font-bold text-sm mt-1">40</span>
                      </div>
                    </div>
                    
                    <div className="bg-primary-300 py-3 px-6 rounded-2xl text-main-white text-right self-stretch flex flex-col justify-center min-w-[100px] shadow-sm ml-auto">
                      <p className="font-black text-xl tracking-tight leading-none">319</p>
                      <p className="font-light text-[10px] uppercase tracking-wider mt-1 opacity-90">Total</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center ">
                <h2 className="text-lg font-bold text-text-body">
                  No Approved Release
                </h2>
                <p className="text-text-disable text-sm mt-1 max-w-[280px]">
                  Upload your first track and start sharing your sound with the world.
                  </p>
              </div>
            )
          )}
        </div>

{/* Right Double Height Block Panel Block */}
        <div className="bg-neutral-50 border border-neutral-100 rounded-3xl w-full md:h-[380px] p-5 flex flex-col justify-between">
          <div className="flex flex-col h-full flex-1 space-y-4">
            <div className="space-y-4">
              <div className="w-full h-56 relative rounded-2xl overflow-hidden shadow-sm bg-neutral-200">
                <Image
                  src="/convert.png"
                  alt="picture of different audio formats"
                  priority={true}
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text- font-bold tracking-tight text-main-heading leading-snug">
                Seamless Conversion, Any Format
              </h2>
            </div>
            {/* <div className="pt-"> */}
              <button className="text-main-white bg-primary py-2.5 px-6 rounded-xl font-bold text-sm tracking-wide shadow-md hover:bg-primary/90 transition w-full sm:max-w-[180px]">
                Try Converter
              </button>
            {/* </div> */}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

// } else {
//   return (
//     <MainDashboard dataProp={data} setHeaderMessage={setHeaderMessage} />
//   );
// }
// return <FilledDashboard />;

// export const FilledDashboard = () => {
//   return (
//     <div className="flex flex-col gap-5 w-full ">
//       <div className="grid grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-5 w-full ">
//         <div className="flex-2 bg-warning-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full col-span-1">
//           <div className=" grid grid-cols-2 w-full h-full">
//             <div className=" flex flex-col p-2 justify-between col-span-1">
//               <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-sm">
//                 Upcoming Release
//               </p>
//               <h2 className="text-2xl line-clamp-2 capitalize font-normal leading-[30px] tracking-tight text-text-body mt-6">
//                 Low Tides & Fame Life
//               </h2>
//               <p className="text-text-body font-normal leading-[18px] tracking-tighter text-sm">
//                 ~TomBaggz (feat C.Kay)
//               </p>
//             </div>
//             <div className="col-span-1 overflow-hidden">
//               <Image
//                 src={"/dashboardart.png"}
//                 priority={true}
//                 height={100}
//                 width={100}
//                 alt="picture of the users music cover art"
//                 className=" object-contain h-full w-[99%] "
//               />
//             </div>
//           </div>
//         </div>
//         <div className="flex gap-2 max-sm:flex-col max-sm:h-[320px]">
//           <div className="flex-1 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full max-xl:col-span-[1.25]">
//             <div className="capitalize flex flex-col gap-3 p-3 h-full justify-center">
//               <div className="flex justify-between flex-1">
//                 <Image
//                   src={"/headphone.svg"}
//                   priority={false}
//                   height={50}
//                   width={53}
//                   alt="head phones icon"
//                   className="w-auto h-auto"
//                 />
//                 <h2 className="text-4xl font-bold leading-[50px] tracking-tight text-text-body text-end w-fit self-end">
//                   894
//                 </h2>
//               </div>
//               <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-lg w-full flex-1 text-end">
//                 total streams
//               </p>
//             </div>
//           </div>
//           <div className="flex-1 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full max-xl:col-span-[1.25]">
//             <div className="capitalize flex flex-col gap-3 p-3 h-full justify-center">
//               <div className="flex justify-between flex-1">
//                 <Image
//                   src={"/musicnote.svg"}
//                   priority={false}
//                   height={50}
//                   width={53}
//                   alt="music note icon"
//                   className="w-auto h-auto"
//                 />
//                 <h2 className="text-4xl font-bold leading-[50px] tracking-tight text-text-body text-end w-fit self-end">
//                   31
//                 </h2>
//               </div>
//               <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-lg w-full flex-1 text-end">
//                 released songs
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="flex-2 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full col-span-1 max-xl:col-span-2 max-sm:col-span-1">
//           <div className="capitalize flex justify-between p-3 h-full">
//             <Image
//               src={"/money-icon.svg"}
//               priority={false}
//               height={50}
//               width={53}
//               alt="icon of money pilled up"
//               className="self-start"
//             />
//             <div className=" self-end">
//               <p className="text-text-disable font-normal leading-[20px] tracking-[-0.5px] text-lg text-end">
//                 Total Earnings
//               </p>
//               <h2 className="text-4xl font-bold leading-[40px] tracking-tighter text-text-body text-end">
//                 ₦10,983.0232
//               </h2>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="flex gap-5 max-sm:flex-col">
//         <div className="bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 w-full h-[450px] sm:flex-1 sm:min-w-[300px]">
//           <div className="grid grid-rows-3 p-3 gap-5">
//             <div className="flex flex-col h-full row-span-2">
//               <div className="w-full">
//                 <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-sm mb-2">
//                   Last Release
//                 </p>
//                 <Image
//                   priority={true}
//                   src={"/lastrelease.png"}
//                   alt="artist last release cover art"
//                   height={0}
//                   width={100}
//                   className="w-full h-50 object-cover rounded-lg"
//                 />
//               </div>
//               <div>
//                 <h2 className="text-2xl line-clamp-2 capitalize font-normal leading-[30px] tracking-tight text-text-body mt-2">
//                   Falling Skies
//                 </h2>
//                 <p className="text-text-body font-normal leading-[18px] tracking-tighter text-sm">
//                   ~TomBaggz (feat C.Kay)
//                 </p>
//               </div>
//             </div>
//             <div className="row-span-1">
//               <p className="text-text-disable font-bold leading-[18px] tracking-tighter text-sm mb-2">
//                 Streams
//               </p>
//               <div className="flex mt-auto justify-between">
//                 <div className="flex gap-5">
//                   <div>
//                     <Image
//                       src={"/applemusic.svg"}
//                       priority={false}
//                       height={32}
//                       width={32}
//                       alt="apple music icon"
//                     />
//                     <p className="text-text-body font-normal leading-[18px] tracking-tighter text-xl mt-5">
//                       40
//                     </p>
//                   </div>
//                   <div>
//                     <Image
//                       src={"/spotify.svg"}
//                       priority={false}
//                       height={32}
//                       width={32}
//                       alt="apple music icon"
//                     />
//                     <p className="text-text-body font-normal leading-[18px] tracking-tighter text-xl mt-5">
//                       123
//                     </p>
//                   </div>
//                   <div>
//                     <Image
//                       src={"/boomplay.svg"}
//                       priority={false}
//                       height={32}
//                       width={32}
//                       alt="apple music icon"
//                     />
//                     <p className="text-text-body font-normal leading-[18px] tracking-tighter text-xl mt-5">
//                       40
//                     </p>
//                   </div>
//                 </div>
//                 <div className="bg-primary-300 py-4 px-6 rounded-2xl text-main-white">
//                   <p className="font-bold text-xl leading-5">319</p>
//                   <p className="font-light text-xs leading-4 mt-1">Total</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 w-full h-[450px] sm:flex-2 p-3">
//           <div className=" flex flex-col h-full">
//             <Image
//               src={"/convert.png"}
//               height={700}
//               width={1200}
//               alt="picture of different audio formats"
//               priority={true}
//               className="rounded-md object-cover h-[280px] w-full"
//             />
//             <h2 className="text-2xl font-semibold leading-[30px] tracking-[-1px] text-main-heading mt-5">
//               Seamless Conversion, Any Format
//             </h2>
//             <button className="text-main-white bg-primary py-4 px-2.5 rounded-xl max-w-[40%] font-bold leading-[18px] tracking-[0.5px] text-sm mt-auto max-xs:max-w-[50%]">
//               Try Converter
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };