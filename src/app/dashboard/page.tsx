"use client";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import SideBarCom from "../components/sideBarComponents/sideBarCom";
import Dashboard from "./Dashboard";
import UploadMusic from "./uploadMusic/UploadMusic";
import Link from "next/link";

const page = () => {
  const searchParams = useSearchParams();
  const { setTab, tab, section, setSection } = useTabQuery();
  const [isActive, setIsActive] = useState<string>(tab);
  const [isOpen, setIsOpen] = useState(false);
  const [headerMessage, setHeaderMessage] = useState("");
  const sidebarComponents = [
    {
      title: "music",
      list: [
        {
          title: "upload music",
          icon: "/add.svg",
          setSection: () => setSection("upload"),
          query: "upload",
        },
        {
          title: "manage release",
          icon: "/musiclibrary2.svg",
          setSection: () => setSection("manageRelease"),
          query: "manageRelease",
        },
      ],
      isActive: "",
      setIsActive: () => setIsActive("music"),
    },
    {
      title: "artists",
      list: [
        {
          title: "create artist",
          icon: "/add.svg",
          setSection: () => setSection("create"),
          query: "create",
        },
        {
          title: "manage artist",
          icon: "/profile2user.svg",
          setSection: () => setSection("manageArtist"),
          query: "manageArtist",
        },
        {
          title: "collaborations",
          icon: "/likeshapes.svg",
          setSection: () => setSection("collaboration"),
          query: "collaboration",
        },
      ],
      isActive: "",
      setIsActive: () => setIsActive("artists"),
    },
    {
      title: "insights",
      list: [
        {
          title: "song performance",
          icon: "/musicplay.svg",
          setSection: () => setSection("song"),
          query: "song",
        },
      ],
      isActive: "",
      setIsActive: () => setIsActive("insights"),
    },
  ];
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (!tab) {
      setTab("dashboard");
    }
  }, []);

  useEffect(() => {
    setIsActive(tab);
    setIsOpen(false);
  }, [tab, section]);

  return (
    <main className="section h-screen relative bg-main-white text-[14px] -tracking-[0.5px] leading-5 transition-all duration-300 ease-in-out">
      <div className="sticky top-0 z-20">
        <div className="flex gap-5 items-center p-5 outline-1 relative top-0 bg-main-white lg:pl-[250px]">
          <div
          role="button"
            className="flex items-center flex-col gap-1 hover:cursor-pointer lg:hidden "
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="bg-primary w-5 h-1"></div>
            <div className="bg-primary w-5 h-1"></div>
            <div className="bg-primary w-5 h-1"></div>
          </div>
          <h1 className="font-light text-2xl tracking-[-1px] leading-8 capitalize ml-5 h-8">
            {headerMessage}
          </h1>
          <div
            className={
              " transition-all duration-300 ease-in-out flex h-[100dvh] lg:w-[250px] max-lg:w-[50%] max-sm:w-full absolute top-0 max-lg:top-18 bottom-0 left-0 right-0 " +
              (isOpen ? " max-lg:-translate-x-0" : " max-lg:-translate-x-full")
            }
          >
            <div className="bg-primary-700 py-10 w-full text-main-white">
              <div className="flex flex-col gap-15 ml-6 mr-2">
                <div className="flex justify-between items-center">
                  <Link href={"/"} className="flex gap-3 items-center opacity-60">
                    <Image
                      src="/logo.svg"
                      alt="soundmac logo"
                      width={20}
                      height={20}
                    />
                    <h1 className="font-light ">SOUNDMAC</h1>
                  </Link>
                  <button
                    className="bg-primary text-white px-5 py-3 rounded-lg lg:hidden"
                    onClick={() => {
                      setIsOpen(false);
                      console.log(isOpen);
                    }}
                  >
                    X
                  </button>
                </div>
                <div className="flex flex-col gap-5">
                  <button
                    className={
                      "font-extralight flex gap-3 w-full px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-primary-500/90" +
                      (tab === "dashboard" && " bg-primary-500")
                    }
                    onClick={() => {
                      setIsActive("dashboard");
                      setTab("dashboard");
                    }}
                  >
                    <Image
                      src="/home.svg"
                      alt="home logo"
                      width={20}
                      height={20}
                    />
                    Dashboard
                  </button>
                </div>
                {sidebarComponents.map((component, index) => (
                  <SideBarCom
                    isActive={isActive}
                    setIsActive={setIsActive}
                    key={index}
                    title={component.title}
                    list={component.list}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex h-full">
        <div className="text-[#333333] lg:ml-[250px] w-full h-full">
          <div className="h-full">
            {(tab === "dashboard" || !tab) && (
              <Dashboard setHeaderMessage={setHeaderMessage} />
            )}
            {tab === "Music" && (
              <>
                {section === "uploadMusic" && (
                  <UploadMusic setHeaderMessage={setHeaderMessage} />
                )}
                {/* {section === "manageReleases" && <ManageRelease />} */}
                {!section && (
                  <UploadMusic setHeaderMessage={setHeaderMessage} />
                )}
              </>
            )}
            {/* {tab === "Artists" && (
              <>
                {section === "createArtist" && <CreateArtist />}
                {section === "manageArtist" && <ManageArtist />}
                {section === "collaboration" && <Collaboration />}
                {!section && <CreateArtist />}
              </>
            )}
            {tab === "Insight" && section === "songPerformance" && (
              <SongPerformance />
            )} */}
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;

// const ManageRelease = () => {
//   return <div>Manage</div>;
// };
// const CreateArtist = () => {
//   return <div>createArtist</div>;
// };
// const ManageArtist = () => {
//   return <div>manageArtist</div>;
// };
// const Collaboration = () => {
//   return <div>Collaboration</div>;
// };
// const SongPerformance = () => {
//   return <div>SongPerformance</div>;
// };
