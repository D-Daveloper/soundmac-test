"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface SideBarSection {
  title: string;
  icon: string;
  href: string;
  query: string;
}

interface Props {
  title: string;
  list: SideBarSection[];
}

const SideBarCom = (props: Props) => {
  const pathname = usePathname();

  const isCurrentSection = props.list.some((item) =>
    pathname.toLowerCase().includes(item.query.toLowerCase())
  );

  const [open, setOpen] = useState(isCurrentSection);

  const isExpanded = isCurrentSection || open;

  return (
    <div className="border-b border-primary-500/30 pb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full capitalize flex justify-between items-center text-sm font-bold hover:cursor-pointer hover:bg-primary-500/20 py-2 px-4 rounded-lg focus:outline-none text-primary-100"
      >
        {props.title}

        <Image
          src="/arrow-down.png"
          alt="arrow"
          width={16}
          height={16}
          className={`transition-transform duration-300 ${
            isExpanded ? "rotate-0" : "rotate-180"
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-[350px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="ml-4 mt-1 flex flex-col gap-1">
          {props.list.map((section, index) => {
            const isActive =
              pathname
                .toLowerCase()
                .includes(section.query.toLowerCase()) ||
              section.href.includes(
                pathname.split("/")[2] + "/" + pathname.split("/")[3]
              );

            return (
              <Link
                key={index}
                href={section.href}
                aria-hidden={!isExpanded}
                aria-disabled={!isExpanded}
                tabIndex={!isExpanded ? -1 : 0}
                className={`flex items-center gap-3 font-light text-sm capitalize w-full px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary-500/90 text-white"
                    : "text-primary-100 hover:bg-primary-500/30 hover:text-white"
                }`}
              >
                <Image
                  src={section.icon}
                  alt={section.title}
                  width={18}
                  height={18}
                />

                {section.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SideBarCom;