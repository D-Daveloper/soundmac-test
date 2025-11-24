import React from "react";
import si from "@/../public/signinimage.png";
import Image from "next/image";
import OtpForm from "./otp-form";

const page = () => {
  return (
    <main className="section flex h-[100dvh] sm:overflow-hidden bg-white">
      <div className="w-[40%] h-dvh max-md:hidden">
        <Image
          priority={true}
          src={si}
          width={0}
          height={0}
          alt="just a face with head phones on"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 mt-15 flex-col">

        <OtpForm />
      </div>
    </main>
  );
};

export default page;
