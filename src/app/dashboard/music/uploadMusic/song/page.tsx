import Image from "next/image";
import React from "react";

const page = () => {
  return (
    <div className="flex gap-8 px-10 py-5 bg-[#F9F9F9] h-screen">
      <div className="flex-3 overflow-auto flex flex-col gap-20 px-1 pb-3 h-full">
        <div>
          <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
            Song Summary
          </h1>
          <div className="w-full flex flex-col gap-y-3 mt-15">
            <p className="font-bold text-[#000000] text-sm leading-[18px] tracking-[0.5px]">
              Artwork File
            </p>
            <div className="max-w-70 max-h-32 flex gap-3 items-center justify-center p-19 rounded-4xl border-2 border-neutral-100">
              <Image
                src={"/previewimage.jpg"}
                width={70}
                height={60}
                alt="music note icon"
                className="w-auto h-auto object-cover rounded-2xl flex-1"
              />
              <p className="text-text-body font-bold text-sm leading-[18px] tracking-[0.5px] truncate min-w-[80%] flex-2">
                lsllslslslsllslsls
              </p>
            </div>
          </div>
        </div>
        <div className="text-[#103958] font-bold text-sm leading-[18px] tracking-[0.5px] grid grid-cols-2 gap-10 max-xs:grid-cols-1">
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <h2>Song Title</h2>
            <p className="text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">Pain</p>
            {/* border line */}
              <div className="border border-neutral-100"></div>
          </div>
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <h2>Song Title</h2>
            <p className="text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">Pain</p>
            {/* border line */}
              <div className="border border-neutral-100"></div>
          </div>
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <h2>Song Title</h2>
            <p className="text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">Pain</p>
            {/* border line */}
              <div className="border border-neutral-100"></div>
          </div>
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <h2>Song Title</h2>
            <p className="text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">Pain</p>
            {/* border line */}
              <div className="border border-neutral-100"></div>
          </div>
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <h2>Song Title</h2>
            <p className="text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">Pain</p>
            {/* border line */}
              <div className="border border-neutral-100"></div>
          </div>
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <h2>Song Title</h2>
            <p className="text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">Pain</p>
            {/* border line */}
              <div className="border border-neutral-100"></div>
          </div>
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <h2>Song Title</h2>
            <p className="text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">Pain</p>
            {/* border line */}
              <div className="border border-neutral-100"></div>
          </div>
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <h2>Song Title</h2>
            <p className="text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">Pain</p>
            {/* border line */}
              <div className="border border-neutral-100"></div>
          </div>
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <h2>Song Title</h2>
            <p className="text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">Pain</p>
            {/* border line */}
              <div className="border border-neutral-100"></div>
          </div>
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <h2>Song Title</h2>
            <p className="text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">Pain</p>
            {/* border line */}
              <div className="border border-neutral-100"></div>
          </div>
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <h2>Song Title</h2>
            <p className="text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">Pain</p>
            {/* border line */}
              <div className="border border-neutral-100"></div>
          </div>
          <div className="flex flex-col w-[40%] max-sm:w-full">
            <h2>Song Title</h2>
            <p className="text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">Pain</p>
            {/* border line */}
              <div className="border border-neutral-100"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
