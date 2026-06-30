"use client";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useEffect } from "react";

const Page = () => {
  const dashboardContext = useContext(DashboardContext);
  useEffect(() => {
    dashboardContext?.setHeader({
      title: "Explore Promotions",
      showBackButton: false,
    });
  }, []);
  
  return (
    <div className="lg:pl-[280px] bg-main-white max-sm:min-h-auto min-h-[90.5dvh] h-full w-full flex flex-col px-5 ">
      <div className="flex gap-3 my-5">
        <Link
          href={"/dashboard/explore/promotion/explore-promotions"}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white!"
          }
        >
          Explore
        </Link>
        <Link
          href={"/dashboard/explore/promotion/my-promotions"}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm bg-transparent border-2 border-text-disable text-text-disable"
          }
        >
          My Promotions
        </Link>
      </div>
      <div className="max-w-[2000px] mx-auto">
        <>
          <p className="text-text-body font-medium leading-[18px] tracking-tighter text-sm mb-5 max-w-[50%] max-sm:max-w-[70%] max-xs:!max-w-full w-full">
            Promote your music and reach more listeners. Create campaigns that
            boost streams, grow your audience, and spotlight your latest
            releases.
          </p>
          <div className="w-full h-full grid grid-cols-2 max-sm:grid-cols-1 items-center justify-center gap-5 mb-30">
            <Link
              href={"/dashboard/explore/promotion/boomplay"}
              className="border-2 border-neutral-100 bg-neutral-50 w-fit max-w-[550px] max-h-[400px] flex flex-col items-center rounded-lg gap-5"
            >
              {/* <div> */}
              <Image
                src="/boomplay.jpg"
                alt="explore promotion"
                width={600}
                height={400}
                className="rounded-t-lg object-cover h-[250px] w-full "
              />

              <h1 className="text-2xl font-semibold leading-[30px] tracking-[-1px] text-main-heading">
                Boomplay Editorial playlist
              </h1>
              <p className="text-text-body font-medium leading-[18px] tracking-tighter text-sm text-center px-5">
                Get featured on Boomplay&apos;s top editorial playlists and
                amplify your reach to millions of music fans across Africa.
              </p>
              <Image
                src="/arrow-right.svg"
                alt="explore promotion"
                width={20}
                height={20}
                className="mb-5"
              />
              {/* </div> */}
            </Link>
            <Link
              href={"/dashboard/explore/promotion/radio"}
              className="border-2 border-neutral-100 bg-neutral-50 w-fit max-w-[550px] max-h-[400px] flex flex-col items-center rounded-lg gap-5"
            >
              {/* <div> */}
              <Image
                src="/radio.png"
                alt="explore promotion"
                width={600}
                height={400}
                className="rounded-t-lg object-cover h-[250px] w-full "
              />

              <h1 className="text-2xl font-semibold leading-[30px] tracking-[-1px] text-main-heading">
                Nigeria Radio Promotion
              </h1>
              <p className="text-text-body font-medium leading-[18px] tracking-tighter text-sm text-center px-5">
                Achieve nationwide recognition with 30 days of consistent
                airplay on Nigeria’s leading radio stations.
              </p>
              <Image
                src="/arrow-right.svg"
                alt="explore promotion"
                width={20}
                height={20}
                className="mb-5"
              />
              {/* </div> */}
            </Link>
            <Link
              href={"/dashboard/explore/promotion/playlist-pitch"}
              className="border-2 border-neutral-100 bg-neutral-50 w-fit max-w-[550px] max-h-[400px] flex flex-col items-center rounded-lg gap-5"
            >
              {/* <div> */}
              <Image
                src="/pitchplay.jpg"
                alt="explore promotion"
                width={600}
                height={400}
                className="rounded-t-lg object-cover h-[250px] w-full "
              />

              <h1 className="text-2xl font-semibold leading-[30px] tracking-[-1px] text-main-heading">
                Playlist Pitch
              </h1>
              <p className="text-text-body font-medium leading-[18px] tracking-tighter text-sm text-center px-5">
                Pitch your release to top Dsps. Increase your reach, grow your
                fanbase, and let your sound stand out!.
              </p>
              <Image
                src="/arrow-right.svg"
                alt="explore promotion"
                width={20}
                height={20}
                className="mb-5"
              />
              {/* </div> */}
            </Link>
            <Link
              href={"/dashboard/explore/promotion/online-press"}
              className="border-2 border-neutral-100 bg-neutral-50 w-fit max-w-[550px] max-h-[400px] flex flex-col items-center rounded-lg gap-5"
            >
              {/* <div> */}
              <Image
                src="/onlinepress.png"
                alt="explore promotion"
                width={600}
                height={400}
                className="rounded-t-lg object-cover h-[250px] w-full "
              />

              <h1 className="text-2xl font-semibold leading-[30px] tracking-[-1px] text-main-heading">
                Online Press
              </h1>
              <p className="text-text-body font-medium leading-[18px] tracking-tighter text-sm text-center px-5">
                Increase your credibility and reach with strategic features in
                top online newspapers, connecting your music to a broader
                audience.
              </p>
              <Image
                src="/arrow-right.svg"
                alt="explore promotion"
                width={20}
                height={20}
                className="mb-5"
              />
              {/* </div> */}
            </Link>
          </div>
        </>
      </div>
    </div>
  );
};

export default Page;
