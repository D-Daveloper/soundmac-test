'use client';
import Image from "next/image";
import React, { useState } from "react";

interface sideBarSection {
  title: string;
  icon: string;
setSection: (text: string) => void;
query:string
}

interface Props {
  title: string;
  list: sideBarSection[];
  isActive:string;
  setIsActive: (text:string)=>void;
}

const sideBarCom = (props: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="">
      <button
        onClick={() => {setOpen(!open);}}
        className={"w-full capitalize flex justify-between text-[16px] font-bold hover:cursor-pointer hover:bg-primary-500/90 py-2 px-4 rounded-lg focus:outline-none focus:bg-primary-500/90 " + (props.isActive.toLowerCase().trim() == props.title.toLowerCase().trim() ? "bg-primary-500/90" : "bg-transparent")}
      >
        {props.title}
        <Image
          src="/arrow-down.png"
          alt="arrow point up"
          width={20}
          height={20}
          className={""+(open ? " rotate-180 " : " rotate-0 ")}
        />
      </button>
      {/* <div className={""}> */}
        <div
          className={
            " transition-all duration-300 ml-7 mt-4 flex-col border-b-2 border-primary-500 " +
            (open ? (props.title === 'music'||props.title === 'explore'? " flex max-h-[90px] h-[90px]": props.title === "artists"? " max-h-[125px] h-[120px]" : " max-h-[40px] h-[40px]") : "  max-h-[0px] h-0")
          }
        >
          {props.list.map((section, index) => (
            <button
            key={index}
              onClick={() => section.setSection(section.query)}
              disabled={!open}
              aria-hidden={!open}
              aria-disabled={!open}
              tabIndex={!open ? -1 : 0}
              className={(index > 0? "mt-4 " : "") +
                " transition-all duration-300 flex gap-5 font-extralight capitalize h-auto" +
                (open
                  ? " block opacity-100 focus:outline-none focus:text-primary-500/70 hover:cursor-pointer hover:text-primary-500/99"
                  : " opacity-0")
              }
            >
              <Image
                src={section.icon}
                alt="add icon"
                width={20}
                height={20}
                className=""
              />
              {section.title}
            </button>
          ))}
          {/* <button
            disabled={!open}
            aria-hidden={!open}
            aria-disabled={!open}
            tabIndex={!open ? -1 : 0}
            className={
              "mt-6 transition-all duration-300 flex gap-5 font-extralight capitalize" +
              (open
                ? " block opacity-100 focus:outline-none focus:text-primary-500/70 hover:cursor-pointer hover:text-primary-500/99"
                : " opacity-0")
            }
          >
            <Image
              src="/musiclibrary2.svg"
              alt="an icon for a collection of songs"
              width={20}
              height={20}
              className=""
            />
            manage release
          </button> */}
        {/* </div> */}
      </div>
    </div>
  );
};

export default sideBarCom;
