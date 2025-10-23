'use client';
import UseAxios from "@/util/customHooks/UseAxios";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import { table } from "console";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
// import { sidebarComponents } from "../constant";
import SideBarCom from "../components/sideBarComponents/sideBarCom";

const page = () => {
  const searchParams = useSearchParams();
  const {setTab,tab,section,setSection} = useTabQuery();
  const [isActive,setIsActive] = useState<string>(tab);
const sidebarComponents = [
  {
    title:"music",
    list:[
      {
        title:"upload music",
        icon:"/add.svg",
        setSection: () => setSection("upload"),
        query:"upload"
      },
      {
        title:"manage release",
        icon:"/musiclibrary2.svg",
        setSection: () => setSection("manageRelease"),
        query:"manageRelease"
      },
      
    ],
    isActive:"",
    setIsActive:()=> setIsActive("music")
  },
  {
    title:"artists",
    list:[
      {
        title:"create artist",
        icon:"/add.svg",
        setSection: () => setSection("create"),
        query:"create"
      },
      {
        title:"manage artist",
        icon:"/profile2user.svg",
        setSection: () => setSection("manageArtist"),
        query:"manageArtist"
      },
      {
        title:"collaborations",
        icon:"/likeshapes.svg",
        setSection: () => setSection("collaboration"),
        query:"collaboration"
      },
      
    ],
    isActive:"",
    setIsActive:()=> setIsActive("artists")
  },
  {
    title:"insights",
    list:[
      {
        title:"song performance",
        icon:"/musicplay.svg",
        setSection: () => setSection("song"),
        query:"song"
      }
      
    ],
    isActive:"",
    setIsActive:()=> setIsActive("insights")
  },
]
console.log("1",isActive);
useEffect(()=>{
  const tab = searchParams.get("tab");
  if(!tab){
    setTab("dashboard");
  }
  
},[]);

useEffect(()=>{
  // const tab = searchParams.get("tab");
  // if(!tab){
  //   setTab("dashboard");
  //   return;
  // }
  setIsActive(tab);
},[tab,section]);

console.log("2",isActive);
    // const [music,setMusic] = useState(false);
    // const [artist,setArtist] = useState(false);
    // const [insight,setInsight] = useState(false);
    // const [loading,setLoading] = useState(false);
    // const [loading,setLoading] = useState(false);

  return (
    <main className="min-h-[100dvh] text-main-white text-[14px] -tracking-[0.5px] leading-5 transition-all duration-300 ease-in-out flex">
      <div className="flex min-h-full">
        <div className="bg-primary-700 min-h-[100dvh] max-w-[250px] w-full py-10 ">
          <div className="flex flex-col gap-15 ml-6 mr-2">
            <div className="flex gap-3 items-center opacity-60">
              <Image
                src="/logo.svg"
                alt="soundmac logo"
                width={20}
                height={20}
              />
              <h1 className="font-light ">SOUNDMAC</h1>
            </div>
            <div className="flex flex-col gap-5">
              <button className={"font-extralight flex gap-3 w-full px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-primary-500/90" + (isActive === "dashboard" && " bg-primary-500")} onClick={() => {setIsActive("dashboard"); setTab("dashboard")}}>
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
            {/* <div className="capitalize ">
              <button onClick={()=>setMusic(!music)} className="w-full flex justify-between text-[16px] font-bold hover:cursor-pointer hover:bg-primary-500/90 py-2 px-4 rounded-lg focus:outline-none focus:bg-primary-500/90 ">
                Music
                  <Image
                    src="/arrow-down.png"
                    alt="arrow point up"
                    width={20}
                    height={20}
                    className=""
                  />
              </button>
              <div className="h-20">
                <div className={"transition-all duration-300 ml-7 mt-4 flex-col border-b-2 border-primary-500 "+ (music? " flex h-full pb-5" : "  h-0 pb-1")}>

                <button onClick={()=>setSection("upload")} disabled={!music} aria-hidden={!music} aria-disabled={!music} tabIndex={!music?-1:0} className={"transition-all duration-300 flex gap-5 font-extralight capitalize" +( music? " block opacity-100 focus:outline-none focus:text-primary-500/70 hover:cursor-pointer hover:text-primary-500/99" : " opacity-0")}>
                  <Image
                    src="/add.svg"
                    alt="add icon"
                    width={20}
                    height={20}
                    className=""
                  />
                  upload music
                </button>
                <button disabled={!music} aria-hidden={!music} aria-disabled={!music} tabIndex={!music?-1:0} className={"mt-6 transition-all duration-300 flex gap-5 font-extralight capitalize" +( music? " block opacity-100 focus:outline-none focus:text-primary-500/70 hover:cursor-pointer hover:text-primary-500/99" : " opacity-0")}>
                  <Image
                    src="/musiclibrary2.svg"
                    alt="an icon for a collection of songs"
                    width={20}
                    height={20}
                    className=""
                  />
                  manage release
                </button>
                </div>
              </div>
            </div>
              

            <div className="capitalize ">
              <button onClick={()=>setArtist(!artist)} className="w-full flex justify-between text-[16px] font-bold hover:cursor-pointer hover:bg-primary-500/90 py-2 px-4 rounded-lg focus:outline-none focus:bg-primary-500/90 ">
                Artists
                  <Image
                    src="/arrow-down.png"
                    alt="arrow point up"
                    width={20}
                    height={20}
                    className=""
                  />
              </button>
              <div className="h-30">
                <div className={"transition-all duration-300 ml-7 mt-4 flex-col border-b-2 border-primary-500 "+ (artist? " flex h-full pb-5" : "  h-0 pb-1")}>

                <button disabled={!artist} aria-hidden={!artist} aria-disabled={!artist} tabIndex={!artist?-1:0} className={"transition-all duration-300 flex gap-5 font-extralight capitalize" +( artist? " block opacity-100 focus:outline-none focus:text-primary-500/70 hover:cursor-pointer hover:text-primary-500/99" : " opacity-0")}>
                  <Image
                    src="/add.svg"
                    alt="add icon"
                    width={20}
                    height={20}
                    className=""
                  />
                  Create artist
                </button>
                <button disabled={!artist} aria-hidden={!artist} aria-disabled={!artist} tabIndex={!artist?-1:0} className={"mt-6 transition-all duration-300 flex gap-5 font-extralight capitalize" +( artist? " block opacity-100 focus:outline-none focus:text-primary-500/70 hover:cursor-pointer hover:text-primary-500/99" : " opacity-0")}>
                  <Image
                    src="/profile2user.svg"
                    alt="icon of a group of people"
                    width={20}
                    height={20}
                    className=""
                  />
                  manage artist
                </button>
                <button disabled={!artist} aria-hidden={!artist} aria-disabled={!artist} tabIndex={!artist?-1:0} className={"mt-6 transition-all duration-300 flex gap-5 font-extralight capitalize" +( artist? " block opacity-100 focus:outline-none focus:text-primary-500/70 hover:cursor-pointer hover:text-primary-500/99" : " opacity-0")}>
                  <Image
                    src="/likeshapes.svg"
                    alt="like icon"
                    width={20}
                    height={20}
                    className=""
                  />
                  collaborations
                </button>
                </div>
              </div>
            </div>
            <div className="capitalize ">
              <button onClick={()=>setInsight(!insight)} className="w-full flex justify-between text-[16px] font-bold hover:cursor-pointer hover:bg-primary-500/90 py-2 px-4 rounded-lg focus:outline-none focus:bg-primary-500/90 ">
                insights
                  <Image
                    src="/arrow-down.png"
                    alt="soundmac logo"
                    width={20}
                    height={20}
                    className=""
                  />
              </button>
              <div className="h-8">
                <div className={"transition-all duration-300 ml-7 mt-4 flex-col border-b-2 border-primary-500 "+ (insight? " flex h-full pb-5" : "  h-0 pb-1")}>

                <button disabled={!insight} aria-hidden={!insight} aria-disabled={!insight} tabIndex={!insight?-1:0} className={"transition-all duration-300 flex gap-5 font-extralight capitalize" +( insight? " block opacity-100 focus:outline-none focus:text-primary-500/70 hover:cursor-pointer hover:text-primary-500/99" : " opacity-0")}>
                  <Image
                    src="/musicplay.svg"
                    alt="headphones icon"
                    width={20}
                    height={20}
                    className=""
                  />
                  song performance
                </button>
                </div>
              </div>
            </div> */}
  
          </div>
        </div>
      </div>
      <div className="text-black">

        {(tab === "dashboard" || !tab) && <Dashboard />}
        {tab === "Music" && (
          <>
            {section === "uploadMusic" && <Upload />}
            {section === "manageReleases" && <ManageRelease />}
            {!section && <Upload />}
          </>
        )}
        {tab === "Artists" && (
          <>
            {section === "createArtist" && <CreateArtist />}
            {section === "manageArtist" && <ManageArtist />}
            {section === "collaboration" && <Collaboration />}
            {!section && <CreateArtist />}
          </>
        )}
        {tab === "Insight" && 
            section === "songPerformance" && <SongPerformance />
        }
      </div>

    </main>
  );
};

export default page;

const Dashboard = ()=> {
    return <div>dashboard</div>
}
const Upload = ()=> {
    return <div>Upload</div>
}
const ManageRelease = ()=> {
    return <div>Manage</div>
}
const CreateArtist = ()=> {
    return <div>createArtist</div>
}
const ManageArtist = ()=> {
    return <div>manageArtist</div>
}
const Collaboration = ()=> {
    return <div>Collaboration</div>
}
const SongPerformance = ()=> {
    return <div>SongPerformance</div>
}