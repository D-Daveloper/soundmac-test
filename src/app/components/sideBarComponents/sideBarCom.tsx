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
  console.log(props.title,props.isActive.toLowerCase().trim() == props.title.toLowerCase().trim());  
  return (
    <div className="">
      <button
        onClick={() => {setOpen(!open); props.setIsActive(props.title)}}
        className={"w-full capitalize flex justify-between text-[16px] font-bold hover:cursor-pointer hover:bg-primary-500/90 py-2 px-4 rounded-lg focus:outline-none focus:bg-primary-500/90 " + (props.isActive.toLowerCase().trim() == props.title.toLowerCase().trim() ? "bg-primary-500/90" : "bg-transparent")}
      >
        {props.title}
        <Image
          src="/arrow-down.png"
          alt="arrow point up"
          width={20}
          height={20}
          className=""
        />
      </button>
      <div className={props.title === "music" ? "h-20" : props.title === "artists" ? "h-30" : "h-8"}>
        <div
          className={
            "transition-all duration-300 ml-7 mt-4 flex-col border-b-2 border-primary-500 " +
            (open ? " flex h-full pb-5" : "  h-0 pb-1")
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
              className={(index === 1 || index === 2? "mt-4 " : "") +
                " transition-all duration-300 flex gap-5 font-extralight capitalize" +
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
        </div>
      </div>
    </div>
  );
};

export default sideBarCom;
