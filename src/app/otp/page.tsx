"use client";
import React from "react";
import si from "@/../public/signinimage.png";
import Image from "next/image";
import OtpInput from "../components/otp/Otp";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  return (
    <main className="section flex h-[100dvh] sm:overflow-hidden bg-white">
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
        <OtpInput />
      </div>
    </main>
  );
};

export default Page;
