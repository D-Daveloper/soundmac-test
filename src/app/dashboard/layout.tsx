"use client";
import Image from "next/image";
import Link from "next/link";
import React, {
  Suspense,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import SideBarCom from "../components/sideBarComponents/sideBarCom";
import UserRoute from "../protectedRoute/protectedRoute";
import DashboardContext from "../context/dashboardContext/dashboardContext";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, ChevronUp, LockKeyhole } from "lucide-react";
import { NormalLoadingScreen } from "../components/Loader/loader";
import {
  useAuthUser,
  useGetUserNotifications,
} from "@/util/customHooks/useQueries";
import Notification from "../components/notification/Notification";
import axios from "axios";
import LogoutButton from "../logout/Logout";

const sidebarComponents = [
  {
    title: "music",
    list: [
      {
        title: "upload release",
        icon: "/add.svg",
        href: "/dashboard/music/uploadMusic",
        query: "uploadMusic",
      },
      {
        title: "manage release",
        icon: "/musiclibrary2.svg",
        href: "/dashboard/music/manageRelease?type=single",
        query: "manageRelease",
      },
    ],
  },
  {
    title: "artist",
    list: [
      {
        title: "create artist",
        icon: "/add.svg",
        href: "/dashboard/artist/createArtist",
        query: "createArtist",
      },
      {
        title: "create label",
        icon: "/add.svg",
        href: "/dashboard/artist/createLabel",
        query: "createlabel",
      },
      {
        title: "manage artist",
        icon: "/profile2user.svg",
        href: "/dashboard/artist/manageArtist",
        query: "manageArtist",
      },
    ],
  },
  {
    title: "insights",
    list: [
      {
        title: "song performance",
        icon: "/musicplay.svg",
        href: "/dashboard/insights/songPerformance/song",
        query: "songPerformance",
      },
    ],
  },
  {
    title: "finance",
    list: [
      {
        title: "sales report",
        icon: "/musicplay.svg",
        href: "/dashboard/finance/salesReport",
        query: "salesReport",
      },
    ],
  },
  {
    title: "explore",
    list: [
      {
        title: "promotion",
        icon: "/add.svg",
        href: "/dashboard/explore/promotion",
        query: "promotion",
      },
      {
        title: "cover license",
        icon: "/musiclibrary2.svg",
        href: "/dashboard/explore/coverLicense",
        query: "coverLicense",
      },
      {
        title: "Chart Registration",
        icon: "/musiclibrary2.svg",
        href: "/dashboard/explore/chartRegistration",
        query: "chartRegistration",
      },
    ],
  },
];

const profileLinks = [
  {
    title: "Help & Support",
    href: "/dashboard/help",
  },
  {
    title: "Subscription",
    href: "/dashboard/subscription",
  },
  {
    title: "Account Information",
    href: "/dashboard/profile?info=profile-info",
  },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data, isLoading } = useAuthUser();
  const {
    data: notification,
    isLoading: isLoadingNotification,
    refetch: refetchNotifications,
  } = useGetUserNotifications();
  const dashboardContext = useContext(DashboardContext);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfilePopUpOpen, setIsProfilePopUpOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfilePopUpOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsProfilePopUpOpen(false);
  }, [pathname]);

  if (isLoading || !data) return <NormalLoadingScreen />;

  const handleMarkAsRead = async (id?: string) => {
    try {
      await axios.patch("api/users/notification", { id });
      await refetchNotifications();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <UserRoute>
      <div className="min-h-screen bg-neutral-50 flex flex-col  relative">
        {/* Top Navbar Header Section */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-100 lg:pl-[250px] transition-all">
          <div className="flex h-16 items-center justify-between px-2 lg:px-6">
            {/* Left Side: Navigation Controls & Title */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Hamburger */}
              <button
                type="button"
                aria-label="Toggle side bar navigation"
                className="flex flex-col gap-1 hover:bg-neutral-50 lg:hidden p-2 rounded-lg transition-colors cursor-pointer shrink-0"
                onClick={() => setIsOpen(!isOpen)}
              >
                <div className="bg-[#11456B] w-5 h-0.5 rounded-full"></div>
                <div className="bg-[#11456B] w-5 h-0.5 rounded-full"></div>
                <div className="bg-[#11456B] w-5 h-0.5 rounded-full"></div>
              </button>

              {/* Back Button Container */}
              {dashboardContext?.header.showBackButton && (
                <button
                  type="button"
                  aria-label="Go back"
                  onClick={() => {
                    if (dashboardContext.header.onBack) {
                      dashboardContext.header.onBack();
                    } else {
                      router.back();
                    }
                  }}
                  className="p-2 w-9 h-9 text-neutral-600 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 transition-all items-center justify-center shrink-0 shadow- hidden lg:flex"
                >
                  <Image
                    src="/arrow-left.svg"
                    height={20}
                    width={20}
                    alt="arrow left"
                    className="w-5 h-5"
                  />
                </button>
              )}

              <h1 className="font-normal text-base md:text-xl text-main-heading truncate tracking-tight py-1">
                {dashboardContext?.header.title || "Dashboard"}
              </h1>
            </div>

            {/* Notification Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2.5 rounded-xl border border-transparent hover:border-neutral-100 hover:bg-neutral-50 transition-all shrink-0 cursor-pointer"
            >
              <Bell color="#11456B" stroke="#11456B" size={20} />
              {notification?.hasNewNotification && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error-500 ring-2 ring-white animate-pulse"></span>
              )}
            </button>
          </div>
        </header>
        {/* Notification Modal Slide Panel */}
        <div
          className={`fixed inset-y-0 right-0 z-40 w-full sm:w-[400px] bg-neutral-100 shadow-2xl border-l border-neutral-200 transform transition-transform duration-300 ease-in-out flex flex-col ${
            isNotificationOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 flex items-center justify-between border-b border-neutral-200">
            <div>
              <h2 className="font-semibold text-xl text-main-heading">
                Notifications
              </h2>
              <button
                onClick={() => handleMarkAsRead()}
                disabled={notification?.hasNewNotification === false}
                className="text-xs font-medium text-white bg-primary-500 rounded px-2 py-1 mt-1 hover:bg-primary-500/80 disabled:bg-neutral-300 disabled:text-neutral-500 transition"
              >
                Mark all as read
              </button>
            </div>
            <button
              className="w-10 h-10 flex items-center justify-center font-bold text-neutral-600 hover:bg-neutral-200 rounded-full transition"
              onClick={() => setIsNotificationOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 remove-scrollbar">
            {notification?.notifications?.map((item: any, index: number) => (
              <Notification
                key={index}
                title={item.reason}
                description={item.message}
                createdAt={item.createdAt}
                statusWeight={item.statusWeight}
                onClick={() => handleMarkAsRead(item._id)}
              />
            ))}
          </div>
        </div>

        {/* Mobile Sidebar Overlay Background */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* left side of dashboard container */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[250px] lg:w-[260px] bg-primary-700 text-main-white transform lg:transform-none transition-transform duration-300 ease-in-out flex flex-col border-r border-primary-800 ${
            isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Sidebar Brand Logo Header  */}
          <div className="p-6 flex items-center justify-between h-16 opacity-50">
            <Link
              href="/"
              className="flex gap-3 items-center opacity-80 hover:opacity-100 transition"
            >
              <Image
                src="/logo.svg"
                alt="soundmac logo"
                width={24}
                height={24}
              />
              <h1 className="font-bold tracking-wider text-sm">SOUNDMAC</h1>
            </Link>
            <button
              className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg lg:hidden font-bold"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Nav Links Body Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 remove-scrollbar pb-32">
            <div className="space-y-1">
              <Link
                className={`font-light flex gap-3 w-full px-4 py-2.5 rounded-lg items-center transition hover:bg-primary-500/50 ${
                  pathname.endsWith("dashboard")
                    ? "bg-primary-500 text-white font-medium"
                    : "text-primary-100"
                }`}
                href="/dashboard"
              >
                <Image src="/home.svg" alt="home logo" width={18} height={18} />
                Dashboard
              </Link>
            </div>

            <nav className="space-y-3 md:mt-5">
              {sidebarComponents.map((component, index) => (
                <SideBarCom
                  // isActive={isActive}
                  // setIsActive={setIsActive}
                  key={index}
                  title={component.title}
                  list={component.list}
                />
              ))}
            </nav>
          </div>

          {/* Artist name modal Container Element inside Layout Panel */}
          <div className="absolute bottom-4 inset-x-4 z-50" ref={profileRef}>
            <button
              onClick={() => setIsProfilePopUpOpen(!isProfilePopUpOpen)}
              className="w-full h-14 bg-black/90 hover:bg-black rounded-xl flex items-center justify-between p-2.5 transition backdrop-blur-sm shadow-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Image
                  src="/boomplay.jpg"
                  width={40}
                  height={40}
                  alt="profile picture"
                  className="rounded-lg object-cover flex-shrink-0"
                />
                <div className="text-left min-w-0">
                  <h2 className="font-medium text-sm text-white capitalize truncate">
                    {data.firstName}
                  </h2>
                  <p className="text-primary-300 font-light text-xs truncate">
                    {data.type}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 ml-1">
                {isProfilePopUpOpen ? (
                  <ChevronDown color="#fff" size={18} />
                ) : (
                  <ChevronUp color="#fff" size={18} />
                )}
              </div>
            </button>

            {/* profile popup dropdown */}
            <div
              className={`absolute bottom-16 left-0 w-full bg-white text-neutral-800 rounded-xl shadow-2xl border border-neutral-100 p-1.5 flex flex-col space-y-0.5 transition-all duration-200 origin-bottom ${
                isProfilePopUpOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              {profileLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-neutral-700 font-normal text-sm capitalize px-4 py-2 hover:bg-neutral-100 rounded-lg transition"
                >
                  {link.title}
                </Link>
              ))}
              <LogoutButton />
            </div>
          </div>
        </aside>
        {/* Main Content Area Execution Grid Wrapper */}
        {/* Main Content Area Execution Grid Wrapper */}
        <main className="w-full lg:pl-[260px] h-[calc(100dvh-64px)]">
          <div className="h-full">{children}</div>
        </main>

        {/* unsubscribed users modal */}
        {dashboardContext?.openUpgradePopUp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="flex flex-col gap-5 w-full max-w-[360px] p-6 items-center bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col gap-3 items-center text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-1">
                  <LockKeyhole
                    size={36}
                    className="text-neutral-500"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-neutral-900">
                  Subscription Required
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  This feature is available only to subscribed users.
                  <br /> Pick a plan and start creating with Soundmac.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    dashboardContext?.setOpenUpgradePopUp(false);
                    router.push("/dashboard");
                  }}
                  className="flex-1 px-4 py-2.5 font-semibold rounded-xl text-sm border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition"
                >
                  Not Now
                </button>
                <Link
                  href="/pricing"
                  aria-label="go to pricing page"
                  className="flex-1 px-4 py-2.5 font-semibold rounded-xl text-center text-sm bg-primary hover:bg-primary/90 text-white shadow-md transition"
                >
                  View Plans
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserRoute>
  );
};

export default Layout;
