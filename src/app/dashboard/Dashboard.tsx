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
    dashboardContext?.setLayoutHeaderMessage("Welcome " + user?.firstName);
  }, [dashboardContext, data]);

  return (
    <div className="flex flex-col gap-5 w-full p-5">
      <div className="grid grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-5 w-full ">
        <div
          className={
            " h-[160px] w-full col-span-1 rounded-3xl mb-5 bg-warning-50 border-[1px] border-neutral-100 " +
            (isLoading && " shimmer")
          }
        >
          {data && data.pendingRelease ? (
            <div className=" flex-2 h-full ">
              <div className=" grid grid-cols-2 w-full h-full">
                <div className=" flex flex-col p-2 justify-between col-span-1">
                  <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-sm">
                    Upcoming Release
                  </p>
                  <h2 className="text-2xl line-clamp-2 capitalize font-normal leading-[30px] tracking-tight text-text-body mt-6">
                    {data?.pendingRelease.releaseTitle || "No Release name"}
                  </h2>
                  <p className="text-text-body font-normal leading-[18px] tracking-tighter text-sm">
                    ~{data?.pendingRelease.artistName || "No Artist name"}
                  </p>
                </div>
                <div className="col-span-1 overflow-hidden rounded-3xl">
                  <Image
                    src={data?.pendingRelease.releaseImage}
                    fetchPriority="high"
                    priority={true}
                    height={100}
                    width={100}
                    alt="picture of the users music cover art"
                    className=" object-contain min-h-full w-[99%] rounded-3xl"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={"flex-2 h-full " + (isLoading && " hidden")}>
              <div className="max-w-[80%] text-center flex flex-col justify-center items-center m-auto h-full">
                <h2 className="text-lg font-bold leading-[20px] tracking-tight text-text-body">
                  No Pending Release
                </h2>
                <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-sm">
                  Upload your first track and start sharing your sound with the
                  world.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 max-sm:flex-col max-sm:h-[320px]">
          <div
            className={
              "flex-1 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full max-xl:col-span-[1.25] " +
              (isLoading && " shimmer")
            }
          >
            <div
              className={
                "capitalize flex flex-col gap-3 p-3 h-full justify-center " +
                (isLoading && " hidden")
              }
            >
              <div className="flex justify-between flex-1">
                <Image
                  src={"/headphone.svg"}
                  priority={false}
                  height={50}
                  width={53}
                  alt="head phones icon"
                  className="w-auto h-auto"
                />
                <h2 className="text-4xl font-bold leading-[50px] tracking-tight text-text-body text-end w-fit self-end truncate">
                  {data?.totalAlbums || 0}
                </h2>
              </div>
              <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-lg w-full flex-1 text-end">
                total Albums
              </p>
            </div>
          </div>
          <div
            className={
              "flex-1 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full max-xl:col-span-[1.25] " +
              (isLoading && " shimmer")
            }
          >
            <div
              className={
                "capitalize flex flex-col gap-3 p-3 h-full justify-center " +
                (isLoading && " hidden")
              }
            >
              <div className="flex justify-between flex-1">
                <Image
                  src={"/musicnote.svg"}
                  priority={false}
                  height={50}
                  width={53}
                  alt="music note icon"
                  className="w-auto h-auto"
                />
                <h2 className="text-4xl font-bold leading-[50px] tracking-tight text-text-body text-end w-fit self-end truncate">
                  {data?.totalSongs || 0}
                </h2>
              </div>
              <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-lg w-full flex-1 text-end">
                Total Songs
              </p>
            </div>
          </div>
        </div>
        <div
          className={
            "flex-2 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full col-span-1 max-xl:col-span-2 max-sm:col-span-1 " +
            (isLoading && " shimmer")
          }
        >
          <div
            className={
              "capitalize flex justify-between p-3 h-full " +
              (isLoading && " hidden")
            }
          >
            <Image
              src={"/musicnote.svg"}
              priority={false}
              height={50}
              width={53}
              alt="music note icon"
              className="self-start w-auto h-auto"
            />
            <div className="mt4 self-end">
              <p className="text-text-disable font-normal leading-[20px] tracking-[-0.5px] text-lg">
                Total Earnings
              </p>
              <h2 className="text-4xl font-bold leading-[40px] tracking-tighter text-text-body text-end">
                {data && data.totalEarnings && formatAmount(data.totalEarnings || 0)}
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-5 max-sm:flex-col">
        <div
          className={
            "bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 w-full h-[450px] sm:flex-1 sm:min-w-[300px] " +
            (isLoading && " shimmer")
          }
        >
          {isLoading ? (
            <></>
          ) : data && data.lastRelease ? (
            <div className="grid grid-rows-3 p-3 gap-5">
              <div className="flex flex-col h-full row-span-2">
                <div className="w-full">
                  <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-sm mb-2">
                    Last Release
                  </p>
                  <Image
                    priority={true}
                    src={data?.lastRelease.releaseImage}
                    alt="artist last release cover art"
                    height={0}
                    width={100}
                    className="w-full h-50 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h2 className="text-2xl line-clamp-2 capitalize font-normal leading-[30px] tracking-tight text-text-body mt-2">
                    {data?.lastRelease.releaseTitle || "No Release name"}
                  </h2>
                  <p className="text-text-body font-normal leading-[18px] tracking-tighter text-sm">
                    ~ {data?.lastRelease.artistName || "No Artist name"}
                  </p>
                </div>
              </div>
              <div className="row-span-1">
                <p className="text-text-disable font-bold leading-[18px] tracking-tighter text-sm mb-2">
                  Streams
                </p>
                <div className="flex mt-auto justify-between">
                  <div className="flex gap-5">
                    <div>
                      <Image
                        src={"/applemusic.svg"}
                        priority={false}
                        height={32}
                        width={32}
                        alt="apple music icon"
                      />
                      <p className="text-text-body font-normal leading-[18px] tracking-tighter text-xl mt-5">
                        40
                      </p>
                    </div>
                    <div>
                      <Image
                        src={"/spotify.svg"}
                        priority={false}
                        height={32}
                        width={32}
                        alt="apple music icon"
                      />
                      <p className="text-text-body font-normal leading-[18px] tracking-tighter text-xl mt-5">
                        123
                      </p>
                    </div>
                    <div>
                      <Image
                        src={"/boomplay.svg"}
                        priority={false}
                        height={32}
                        width={32}
                        alt="apple music icon"
                      />
                      <p className="text-text-body font-normal leading-[18px] tracking-tighter text-xl mt-5">
                        40
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary-300 py-4 px-6 rounded-2xl text-main-white">
                    <p className="font-bold text-xl leading-5">319</p>
                    <p className="font-light text-xs leading-4 mt-1">Total</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-[80%] text-center flex flex-col justify-center items-center m-auto h-full">
              <h2 className="text-lg font-bold leading-[20px] tracking-tight text-text-body">
                No Approved Release
              </h2>
              <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-sm">
                Upload your first track and start sharing your sound with the
                world.
              </p>
            </div>
          )}
        </div>
        <div className="bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 w-full h-[450px] sm:flex-2 p-3">
          <div className=" flex flex-col h-full">
            <Image
              src={"/convert.png"}
              height={700}
              width={1200}
              alt="picture of different audio formats"
              priority={true}
              className="rounded-md object-cover h-[280px] w-full"
            />
            <h2 className="text-2xl font-semibold leading-[30px] tracking-[-1px] text-main-heading mt-5">
              Seamless Conversion, Any Format
            </h2>
            <button className="text-main-white bg-primary py-4 px-2.5 rounded-xl max-w-[40%] font-bold leading-[18px] tracking-[0.5px] text-sm mt-auto max-xs:max-w-[50%]">
              Try Converter
            </button>
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
