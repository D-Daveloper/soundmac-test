"use client";
import React from "react";
import si from "@/../public/signinimage.png";
import Image from "next/image";
import RegisterForm from "./RegisterForm";

const page = () => {
  return (
    <main className="section flex h-[100dvh] sm:overflow-hidden max-xs:min-h-[100dvh]">
      <div className="w-[40%] max-md:hidden">
        <Image
          priority={true}
          src={si}
          width={0}
          height={0}
          alt="just a face with head phones on"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 mt-3 flex-col">
        <div className="w-[70%] mx-auto text-center max-sm:w-[90%]">
          <h1 className="text-primary font-extrabold text-4xl leading-10 tracking-[0.5px] max-lg:text-2xl">
            {" "}
            Create Your Soundmac Account
          </h1>
          <p className="text-p font-normal text-sm leading-5 tracking-[0.5px] mt-3">
            Join thousands of artists and labels distributing their music
            worldwide.
          </p>
          <div className="border-2 border-dashed border-[#E1E1CF] my-10"></div>
        </div> 
<RegisterForm/>
      </div>
    </main>
  );
};

export default page;
