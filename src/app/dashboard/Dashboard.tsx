import Image from "next/image";
import React from "react";
// import useSWR from "swr";

const Dashboard = () => {
  // return (
  //   <div className="flex flex-col gap-5 w-full ">
  //     <div className="grid grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-5 w-full ">
  //       <div className="flex-2 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full col-span-1">
  //           <div className="max-w-[80%] text-center flex flex-col justify-center items-center m-auto h-full">
  //             <h1 className="text-lg font-bold leading-[20px] tracking-tight text-text-body">
  //               No Pending Release
  //             </h1>
  //             <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-sm">
  //               Upload your first track and start sharing your sound with the
  //               world.
  //             </p>
  //           </div>
  //       </div>
  //       <div className="flex gap-2 max-sm:flex-col max-sm:h-[320px]">
  //         <div className="flex-1 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full max-xl:col-span-[1.25]">
  //           <div className="capitalize flex flex-col gap-3 p-3 h-full justify-center">
  //             <div className="flex justify-between flex-1">
  //               <Image
  //                 src={"/headphone.svg"}
  //                 height={50}
  //                 width={53}
  //                 alt="head phones icon"
  //               />
  //               <h2 className="text-4xl font-bold leading-[50px] tracking-tight text-text-body text-end w-fit self-end">
  //                 0
  //               </h2>
  //             </div>
  //             <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-lg w-full flex-1 text-end">
  //               total streams
  //             </p>
  //           </div>
  //         </div>
  //         <div className="flex-1 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full max-xl:col-span-[1.25]">
  //           <div className="capitalize flex flex-col gap-3 p-3 h-full justify-center">
  //             <div className="flex justify-between flex-1">
  //               <Image
  //                 src={"/musicnote.svg"}
  //                 height={50}
  //                 width={53}
  //                 alt="music note icon"
  //               />
  //               <h2 className="text-4xl font-bold leading-[50px] tracking-tight text-text-body text-end w-fit self-end">
  //                 0
  //               </h2>
  //             </div>
  //             <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-lg w-full flex-1 text-end">
  //               released songs
  //             </p>
  //           </div>
  //         </div>
  //       </div>
  //       <div className="flex-2 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full col-span-1 max-xl:col-span-2 max-sm:col-span-1">
  //         <div className="capitalize flex justify-between p-3 h-full">
  //           <Image
  //             src={"/musicnote.svg"}
  //             height={50}
  //             width={53}
  //             alt="head phones icon"
  //             className="self-start"
  //           />
  //           <div className="mt4 self-end">
  //             <p className="text-text-disable font-normal leading-[20px] tracking-[-0.5px] text-lg">
  //               Total Earnings
  //             </p>
  //             <h2 className="text-4xl font-bold leading-[40px] tracking-tighter text-text-body text-end">
  //               ₦00.00
  //             </h2>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //     <div className="flex gap-5 max-sm:flex-col">
  //       <div className="bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 w-full h-[450px] sm:flex-1 sm:min-w-[300px]">
  //           <div className="max-w-[80%] text-center flex flex-col justify-center items-center m-auto h-full">
  //             <h1 className="text-lg font-bold leading-[20px] tracking-tight text-text-body">
  //               No Pending Release
  //             </h1>
  //             <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-sm">
  //               Upload your first track and start sharing your sound with the
  //               world.
  //             </p>
  //           </div>
  //       </div>
  //       <div className="bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 w-full h-[450px] sm:flex-2 p-3">
  //           <div className=" flex flex-col h-full">
  //             <Image src={"/convert.png"} height={700} width={1200} alt="picture of different audio formats" priority={true} className="rounded-md object-cover h-[280px] w-full"/>
  //             <h1 className="text-2xl font-semibold leading-[30px] tracking-[-1px] text-main-heading mt-5">
  //               Seamless Conversion, Any Format
  //             </h1>
  //             <button className="text-main-white bg-primary py-4 px-2.5 rounded-xl max-w-[40%] font-bold leading-[18px] tracking-[0.5px] text-sm mt-auto max-xs:max-w-[50%]">
  //               Try Converter
  //             </button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
  return <FilledDashboard />;
};

export default Dashboard;

export const FilledDashboard = () => {
  return (
    <div className="flex flex-col gap-5 w-full ">
      <div className="grid grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-5 w-full ">
        <div className="flex-2 bg-warning-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full col-span-1">
          <div className=" grid grid-cols-2 w-full h-full">
            <div className=" flex flex-col p-2 justify-between col-span-1">
              <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-sm">
                Upcoming Release
              </p>
              <h1 className="text-2xl line-clamp-2 capitalize font-normal leading-[30px] tracking-tight text-text-body mt-6">
                Low Tides & Fame Life
              </h1>
              <p className="text-text-body font-normal leading-[18px] tracking-tighter text-sm">
                ~TomBaggz (feat C.Kay)
              </p>
            </div>
            <div className="col-span-1 overflow-hidden">

            <Image
              src={"/dashboardart.png"}
              height={0}
              width={100}
              alt="picture of the users music cover art"
              className=" object-contain h-full w-[90%] "
            />
            </div>
          </div>
        </div>
        <div className="flex gap-2 max-sm:flex-col max-sm:h-[320px]">
          <div className="flex-1 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full max-xl:col-span-[1.25]">
            <div className="capitalize flex flex-col gap-3 p-3 h-full justify-center">
              <div className="flex justify-between flex-1">
                <Image
                  src={"/headphone.svg"}
                  height={50}
                  width={53}
                  alt="head phones icon"
                />
                <h2 className="text-4xl font-bold leading-[50px] tracking-tight text-text-body text-end w-fit self-end">
                  894
                </h2>
              </div>
              <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-lg w-full flex-1 text-end">
                total streams
              </p>
            </div>
          </div>
          <div className="flex-1 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full max-xl:col-span-[1.25]">
            <div className="capitalize flex flex-col gap-3 p-3 h-full justify-center">
              <div className="flex justify-between flex-1">
                <Image
                  src={"/musicnote.svg"}
                  height={50}
                  width={53}
                  alt="music note icon"
                />
                <h2 className="text-4xl font-bold leading-[50px] tracking-tight text-text-body text-end w-fit self-end">
                  31
                </h2>
              </div>
              <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-lg w-full flex-1 text-end">
                released songs
              </p>
            </div>
          </div>
        </div>
        <div className="flex-2 bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 h-[160px] w-full col-span-1 max-xl:col-span-2 max-sm:col-span-1">
          <div className="capitalize flex justify-between p-3 h-full">
            <Image
              src={"/musicnote.svg"}
              height={50}
              width={53}
              alt="head phones icon"
              className="self-start"
            />
            <div className="mt4 self-end">
              <p className="text-text-disable font-normal leading-[20px] tracking-[-0.5px] text-lg text-end">
                Total Earnings
              </p>
              <h2 className="text-4xl font-bold leading-[40px] tracking-tighter text-text-body text-end">
                ₦10,983.0232
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-5 max-sm:flex-col">
        <div className="bg-neutral-50 border-[1px] rounded-3xl border-neutral-100 w-full h-[450px] sm:flex-1 sm:min-w-[300px]">
          <div className="max-w-[80%] text-center flex flex-col justify-center items-center m-auto h-full">
            <h1 className="text-lg font-bold leading-[20px] tracking-tight text-text-body">
              No Pending Release
            </h1>
            <p className="text-text-disable font-normal leading-[18px] tracking-tighter text-sm">
              Upload your first track and start sharing your sound with the
              world.
            </p>
          </div>
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
            <h1 className="text-2xl font-semibold leading-[30px] tracking-[-1px] text-main-heading mt-5">
              Seamless Conversion, Any Format
            </h1>
            <button className="text-main-white bg-primary py-4 px-2.5 rounded-xl max-w-[40%] font-bold leading-[18px] tracking-[0.5px] text-sm mt-auto max-xs:max-w-[50%]">
              Try Converter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
