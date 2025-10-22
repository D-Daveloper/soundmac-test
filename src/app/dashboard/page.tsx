import Image from "next/image";
import React from "react";

const page = () => {
  return (
    <main className="min-h-[100dvh] text-main-white text-[14px] -tracking-[0.5px] leading-5">
      <div className="flex min-h-full">
        <div className="bg-primary-700 min-h-[100dvh] max-w-[250px] w-full py-10 ">
          <div className="flex flex-col gap-15 ml-6 mr-2">
            <div className="flex gap-3 items-center opacity-60">
              <Image
                src="/logo.svg"
                alt="soundmac logo"
                width={20}
                height={25}
              />
              <h1 className="font-light ">
                SOUNDMAC
              </h1>
            </div>
            <div className="flex flex-col gap-5">
              <button className="font-extralight flex gap-3 bg-primary-500 w-full px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-primary-500/90 transition-all duration-300 ease-in-out">
                <Image
                  src="/home.svg"
                  alt="soundmac logo"
                  width={20}
                  height={25}
                />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
