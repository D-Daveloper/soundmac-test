"use client";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import SideBarCom from "../components/sideBarComponents/sideBarCom";
import UserRoute from "../protectedRoute/protectedRoute";
import DashboardContext from "../context/dashboardContext/dashboardContext";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const layout = ({ children }: { children: React.ReactNode }) => {
  // const { data, isLoading } = useAuthUser();
  const { tab } = useTabQuery("dashboard");
  const dashboardContext = useContext(DashboardContext);
  const pathname = usePathname();
  const [isActive, setIsActive] = useState<string>(tab);
  const [isOpen, setIsOpen] = useState(false);
  const sidebarComponents = [
    {
      title: "music",
      list: [
        {
          title: "upload release",
          icon: "/add.svg",
          href: "/dashboard/music/uploadMusic",
          query: "upload",
        },
        {
          title: "manage release",
          icon: "/musiclibrary2.svg",
          href: "/dashboard/music/manageRelease?type=single",
          query: "manageRelease",
        },
      ],
      isActive: "",
      setIsActive: () => setIsActive("music"),
    },
    {
      title: "artist",
      list: [
        {
          title: "create artist",
          icon: "/add.svg",
          href: "/dashboard/artist/createArtist",
          query: "create",
        },
        {
          title: "manage artist",
          icon: "/profile2user.svg",
          href: "/dashboard/artist/manageArtist",
          query: "manageArtist",
        },
        {
          title: "collaborations",
          icon: "/likeshapes.svg",
          href: "",
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
          href: "",
          query: "song",
        },
      ],
      isActive: "",
      setIsActive: () => setIsActive("insights"),
    },
    {
      title: "finance",
      list: [
        {
          title: "sales report",
          icon: "/musicplay.svg",
          href: "",
          query: "sales_report",
        },
      ],
      isActive: "",
      setIsActive: () => setIsActive("finance"),
    },
    {
      title: "explore",
      list: [
        {
          title: "promotion",
          icon: "/add.svg",
          href: "",
          query: "promotion",
        },
        {
          title: "cover license",
          icon: "/musiclibrary2.svg",
          href: "",
          query: "manageRelease",
        },
      ],
      isActive: "",
      setIsActive: () => setIsActive("explore"),
    },
  ];
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  // if (isLoading || !data?.firstName) return <NormalLoadingScreen />;
  return (
    <UserRoute>
      <div>
        <div className="sticky top-0 z-20">
          <div className="flex gap-5 items-center p-5 outline-1 relative top-0 bg-main-white lg:pl-[250px]">
            <div
              aria-label="side bar nav button"
              role="button"
              className="flex items-center flex-col gap-1 hover:cursor-pointer lg:hidden "
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="bg-primary w-5 h-1"></div>
              <div className="bg-primary w-5 h-1"></div>
              <div className="bg-primary w-5 h-1"></div>
            </div>
            <h1 className="font-light text-2xl tracking-[-1px] leading-8 capitalize ml-5 h-8">
              {dashboardContext?.layoutHeaderMessage}
            </h1>
            <div
              className={
                " transition-all duration-300 ease-in-out flex h-[100dvh] lg:w-[250px] max-lg:w-[50%] max-sm:w-full absolute top-0 max-lg:top-18 bottom-0 left-0 right-0 " +
                (isOpen
                  ? " max-lg:-translate-x-0"
                  : " max-lg:-translate-x-full")
              }
            >
              <div className="bg-primary-700 py-10 w-full text-main-white remove-scrollbar">
                <div className="flex flex-col gap-12 ml-6 mr-2 overflow-y-auto h-full remove-scrollbar">
                  <div className="flex justify-between items-center">
                    <Link
                      href={"/"}
                      className="flex gap-3 items-center opacity-60"
                    >
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
                    <Link
                      className={
                        "font-extralight flex gap-3 w-full px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-primary-500/90" +
                        (pathname.endsWith("dashboard") && " bg-primary-500")
                      }
                      href={"/dashboard"}

                      // onClick={() => {
                      //   setIsOpen(false);
                      //   setIsActive("dashboard");
                      //   setTab("dashboard");
                      // }}
                    >
                      <Image
                        src="/home.svg"
                        alt="home logo"
                        width={20}
                        height={20}
                      />
                      Dashboard
                    </Link>
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
        <div
          className={
            dashboardContext?.openUpgradePopUp
              ? " fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm  "
              : " hidden"
          }
        >
          <div className="flex flex-col w-fit py-5 px-10 justify-center items-center bg-neutral-100  rounded-lg shadow-2xl">
            <button
              onClick={() => dashboardContext?.setOpenUpgradePopUp(false)}
              className="ml-auto bg-error-500 p-1 rounded-sm text-white flex justify-center items-center mb-5"
            >
              <X width={20} height={20} />
            </button>
            <div className="flex flex-col gap-2 mb-2">
              <h3 className="text-xl font-semibold tracking-[-0.5px] text-main-heading">
                Subscription needed to continue
              </h3>
            </div>
            <div>
              <Link href={"/pricing"}
                aria-label="go to pricing page"
                className={
                  "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 flex text-white! bg-primary-500"
                }
              >
                Proceed to pricing
              </Link>
            </div>
          </div>
        </div>
        {children}
      </div>
    </UserRoute>
  );
};

export default layout;
