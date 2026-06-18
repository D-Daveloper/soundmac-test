"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
// import avatar from '@/assets/images/avatar.webm'
// import { NormalLoadingScreen } from '../components/Loader/loader';


const Features = () => {
  // const [isLoading, setIsLoading] = useState(true);
  //  const handleLoading = () => {
  //     setIsLoading(false);
  //   };

  // useEffect(() => {
  //   if (document.readyState === "complete") {
  //     // Page already loaded
  //     setIsLoading(false);
  //   } else {
  //     // Wait for it to load
  //     window.addEventListener("load", handleLoading);
  //     return () => window.removeEventListener("load", handleLoading);
  //   }
  // }, []);

  //   if (isLoading) {
  //     return <NormalLoadingScreen/>;
  //   }

  return (
    <>
      <section className="mt-10 md:mt-20">
        <h2 className="text-center w-full text-[#333333] text-2xl lg:text-4xl capitalize font-semibold">
          key soundmac features
        </h2>

        <div className="flex flex-col md:flex-row md:mx-10 mx-5 gap-y-5 md:mt-10 mt-5 justify-between items-start">
          <div className="space-y-4">
            <p className="capitalize text-[#103958] md:text-3xl font-semibold">
              global music distribution
            </p>
            <p className="text-[#494949] text-[10px] md:text-md">
              Keep all your singles and albums in one place. Edit <br />{" "}
              details, track status, and stay organized.
            </p>
            <Link href={'/register'} className="border-[1.5px] border-[#6B6B11] rounded-[15px] px-5 py-1 capitalize text-[10px] md:text-sm hover:bg-[#F0F0E7] ">
              start now
            </Link>
          </div>

          <div className="border md:w-[50%] bg-[#F4F4F4] rounded-[20px] md:h-[300px] overflow-hidden">
            <video autoPlay loop muted playsInline className="">
              <source src="/LandingPageGif2.webm" type="video/webm" width={200} />
            </video>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row mx-10 mt-10 gap-y-5 md:gap-x-10 lg:justify-between ">
            <div className="border md:w-[50%] w-full bg-[#F4F4F4] rounded-[20px] md:h-[300px] overflow-hidden">
            <video autoPlay loop muted playsInline className="">
              <source src="/LandingPageGif1.webm" type="video/webm" width={200} />
            </video>
          </div>
          <div className="space-y-4">
            <p className="capitalize text-[#103958] md:text-3xl font-semibold">
              promote music
            </p>
            <p className="text-[#494949] md:text-md  text-[10px]">
              Select songs and run promotions to reach more <br /> listeners and
              grow your audience.
            </p>
             <Link href={'/register'} className="border-[1.5px] border-[#6B6B11] rounded-[15px] px-5 py-1 capitalize text-[10px] md:text-sm hover:bg-[#F0F0E7] ">
              start now
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row mx-10 mt-10 gap-y-5 justify-between">
          <div className="space-y-4">
            <p className="capitalize text-[#103958] md:text-3xl font-semibold">
              track earnings
            </p>
            <p className="text-[#494949] md:text-md text-[10px]">
              View your sales reports and download ready CSV <br /> files
              anytime you need them..
            </p>
            <Link href={'/register'} className="border-[1.5px] border-[#6B6B11] rounded-[15px] px-5 py-1 capitalize text-[10px] md:text-sm hover:bg-[#F0F0E7] ">
              start now
            </Link>
          </div>

            <div className="border w-full md:w-[50%] bg-[#F4F4F4] rounded-[20px] md:h-[300px] overflow-hidden">
            <video autoPlay loop muted playsInline className="">
              <source src="/LandingPageGif3.webm" type="video/webm" width={200} />
            </video>
          </div>

        </div>

        <div className="md:mt-20 mt-10">
          <h2 className="text-center text-[#103958] text-2xl lg:text-4xl capitalize font-semibold">
            Other Benefits
          </h2>

          <div className="mx-6 mt-5 flex flex-row flex-wrap justify-center gap-3">
            <div className="bg-[#F0F0E7] border rounded-[60px] w-fit px-5 py-3">
              <p className="capitalize font-semibold text-[#103958] text-[10px] md:text-md">
                artist collaborations
              </p>
            </div>

            <div className="bg-[#F0F0E7] border rounded-[60px] w-fit px-5 py-3">
              <p className="capitalize font-semibold text-[#103958] text-[10px] md:text-md">
                chart registration
              </p>
            </div>

            <div className="bg-[#F0F0E7] border rounded-[60px] w-fit px-5 py-3">
              <p className="capitalize font-semibold text-[#103958] text-[10px] md:text-md">
                smartlink sharing
              </p>
            </div>

            <div className="bg-[#F0F0E7] border rounded-[60px] w-fit px-5 py-3">
              <p className="capitalize font-semibold text-[#103958] text-[10px] md:text-md">
                reliable support
              </p>
            </div>

            <div className="bg-[#F0F0E7] border rounded-[60px] w-fit px-5 py-3">
              <p className="capitalize font-semibold text-[#103958] text-[10px] md:text-md">
                royalty splits
              </p>
            </div>

            <div className="bg-[#F0F0E7] border rounded-[60px] w-fit px-5 py-3">
              <p className="capitalize font-semibold text-[#103958] text-[10px] md:text-md">
                catalog management
              </p>
            </div>

            <div className="bg-[#F0F0E7] border rounded-[60px] w-fit px-5 py-3">
              <p className="capitalize font-semibold text-[#103958] text-[10px] md:text-md">
                label management
              </p>
            </div>

            <div className="bg-[#F0F0E7] border rounded-[60px] w-fit px-5 py-3">
              <p className="capitalize font-semibold text-[#103958] text-[10px] md:text-md">
                schedule releases
              </p>
            </div>

            <div className="bg-[#F0F0E7] border rounded-[60px] w-fit px-5 py-3">
              <p className="capitalize font-semibold text-[#103958] text-[10px] md:text-md">
                withdrawal & payouts
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
