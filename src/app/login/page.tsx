"use client";
import React from "react";
import si from "@/../public/signinimage.png";
import Image from "next/image";
import LoginForm from "./LoginForm";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const Page = () => {
  const router = useRouter();
  return (
    <main className="section flex h-[100dvh] sm:overflow-hidden max-xs:min-h-[100dvh]">
      <div className="w-[40%] max-md:hidden relative">
        <Image
          priority={true}
          src={si}
          width={0}
          height={0}
          alt="just a face with head phones on"
          className="h-full w-full object-cover"
        />
        <button
          onClick={() => router.back()}
          className="absolute w-15 h-10 rounded-lg flex justify-center items-center text-2xl text-white! bg-primary-500 top-0 m-8"
        >
          <ChevronLeft />
        </button>
      </div>
      <div className="flex flex-1 mt-3 flex-col">
        <button
          onClick={() => router.back()}
          className="max-w-15 max-h-10 min-w-15 min-h-10 rounded-lg flex justify-center items-center text-2xl text-white! bg-primary-500 m-5 md:hidden"
        >
          <ChevronLeft />
        </button>
        <div className="w-[70%] mx-auto text-center max-sm:w-[90%]">
          <h1 className="text-primary font-extrabold text-4xl leading-10 tracking-[0.5px] max-lg:text-2xl">
            {" "}
            Log into Your Soundmac Account
          </h1>
          <p className="text-p font-normal text-sm leading-5 tracking-[0.5px] mt-5">
            Welcome back creator!
          </p>
          <div className="border-2 border-dashed border-[#E1E1CF] my-10"></div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
};

export default Page;
