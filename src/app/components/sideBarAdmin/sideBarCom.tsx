'use client';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface sideBarSection {
  title: string;
  icon: string;
// setSection: (text: string) => void;
  href:string;
  query:string
}

interface Props {
  title: string;
  list: sideBarSection[];
}

const sideBarCom = (props: Props) => {

  const pathname = usePathname();
  const pathNameArray = pathname.split("/")
  const newPathName = pathNameArray[2]
  return (
    <div className="">
      <p
        className={"w-full capitalize flex justify-between text-[16px] font-bold py-2 px-4 rounded-lg "}
      >
        {props.title}
      </p>
      {/* <div className={""}> */}
        <div
          className={
            " ml-5 mt-4 flex-col gap-2 " +
             (props.title === 'music'||props.title === 'explore'? " flex max-h-[100px] h-[100px]": props.title === "artist"? " max-h-[160px] h-[160px]" : " max-h-[40px] h-[40px]")}
          
        >
          {props.list.map((section, index) => (
            <Link
            key={index}
              href={section.href}
              aria-label={section.title}
              tabIndex={0}
              className={
                " focus:bg-neutral-700/90 hover:bg-neutral-700/90 transition-all duration-300 flex gap-2 font-extralight capitalize h-auto w-full px-3 py-2 rounded-lg opacity-100 focus:outline-none hover:cursor-pointer " + (section.href.includes(newPathName)? " bg-neutral-700" : " bg-transparent")
              }
            >
              <Image
                src={section.icon}
                alt="add icon"
                width={20}
                height={20}
              />
              {section.title}
            </Link>
          ))}
      </div>
    </div>
  );
};

export default sideBarCom;
