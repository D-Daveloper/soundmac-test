"use client";
import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import Link from "next/link";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import ArtistInfo from "./ArtistInfo";
import ArtistEarnings from "./ArtistEarnings";
import {
  Bell,
  ChevronDown,
  UserLock,
  X,
} from "lucide-react";
import Select from "@/components/Select";
import { adminNotifyUserReasons, genreList } from "@/app/utils/constants";
import { languagesList } from "@/app/constant";
import EditArtist from "./EditArtist";
import UseAxios from "@/util/customHooks/UseAxios";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const api = UseAxios();
  const queryClient = useQueryClient();
  const [isFilterOpen, setisFilterOpen] = useState(false);
  const [isSubmitting, setisSubmitting] = useState(false);
  const [showDeactivateModal, setshowDeactivateModal] = useState(false);
  const [showSendNotificationModal, setshowSendNotificationModal] =
    useState(false);
  const [deactivationForm, setdeactivationForm] = useState({
    deactivateReason: "",
    deactivateOption: "",
    deactivateMessage: "",
  });
  const [notifyUserForm, setnotifyUserForm] = useState({
    notifyUserReason: "",
    notifyUserMessage: "",
  });
  const { getParam, setParam } = useTabQuery();
  let tab = getParam("tab");

  useEffect(() => {
    if (
      !tab ||
      (tab != "artist-info" && tab != "artist-earnings" && tab != "edit-artist")
    ) {
      setParam("tab", "artist-info");
    }
  }, [tab]);
  const { id } = use(params);
  if (!id) {
    return <InlineLoadingScreen />;
  }

  const handleSubmitNotificationForm = async () => {
    if (!id) {
      return toast.warn("No Artist Details");
    }

    try {
      setisSubmitting(true);
      const res = await api.post("admin/artist/all-artists/" + id, notifyUserForm);
      toast.success(res.data.msg);
      setisFilterOpen(false);
      setshowSendNotificationModal(false);
      setnotifyUserForm({
        notifyUserReason: "",
        notifyUserMessage: "",
      });
    } catch (error) {
      if (isAxiosError(error)) {
        return;
      }
      toast.error("something went wrong");
    } finally {
      setisSubmitting(false);
    }
  };
  const handleSubmitDeactivationForm = async () => {
    if (!id) {
      return toast.warn("No Artist Details");
    }

    try {
      setisSubmitting(true);
      const res = await api.put("admin/artist/all-artists/" + id, deactivationForm);
      toast.success(res.data.msg);
      setisFilterOpen(false);
      setshowDeactivateModal(false);
      setdeactivationForm({
        deactivateReason: "",
        deactivateOption: "",
        deactivateMessage: "",
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-all-artists ", "inactive"],
      });
    } catch (error) {
      if (isAxiosError(error)) {
        return;
      }
      toast.error("something went wrong");
    } finally {
      setisSubmitting(false);
    }
  };

  const adminartistOptions = [
    {
      name: "Deactivate Artist",
      icon: <UserLock strokeWidth={1} />,
      func: () => {
        setshowDeactivateModal(true);
      },
    },
    {
      name: "Send Notification",
      icon: <Bell strokeWidth={1} />,
      func: () => {
        setshowSendNotificationModal(true);
      },
    },
    // {
    //   name: "Deactivate Artist",
    //   icon: <ChartNoAxesCombined strokeWidth={1} />,
    // },
  ];
  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-5 overflow-hidden">
      <Link
        href={"/dashboardAdmin/artist/all-artists"}
        aria-label="go back"
        className="bg-main-white/70 p-3 w-[48px] h-[48px] text-primary! text-2xl rounded-full shadow-2xl shadow-black my-2"
      >
        <Image
          src={"/arrow-left.svg"}
          height={32}
          width={32}
          alt="arrow left"
        />
      </Link>
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => {
            setParam("tab", "artist-info");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (tab === "artist-info"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Artist Info
        </button>
        <button
          onClick={() => {
            setParam("tab", "artist-earnings");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (tab === "artist-earnings"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          View Earnings
        </button>
        <button
          onClick={() => {
            setParam("tab", "edit-artist");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (tab === "edit-artist"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Edit Details
        </button>
        <div className="relative pl-6 ml-auto">
          <button
            onClick={() => {
              setisFilterOpen(!isFilterOpen);
            }}
            className="ml-auto border-2 border-primary-500 text-text-body rounded-lg px-5 py-1 flex justify-between gap-3 items-center hover:bg-primary-500/20"
          >
            Action{" "}
            <span className="p-1 border-2 border-primary-500 rounded-sm">
              <ChevronDown color="#11456b " size={10} />
            </span>
          </button>

          {isFilterOpen && (
            <div className="p-3 absolute top-[calc(100%+8px)] right-0 w-fit text-nowrap bg-white border border-gray-200 rounded-lg shadow-lg z-40 transition-all duration-200 ease-in-out text-sm flex flex-col gap-2">
              {adminartistOptions.map((options, index) => (
                <button
                  key={index}
                  onClick={options.func}
                  name={options.name}
                  aria-label={options.name}
                  className="flex items-center gap-2 hover:bg-gray-200 p-2 rounded transition-colors text-sm"
                >
                  {options.icon}
                  {options.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {tab == "artist-info" ? (
        <ArtistInfo id={id} />
      ) : tab == "artist-earnings" ? (
        <ArtistEarnings id={id} />
      ) : tab === "edit-artist" ? (
        <EditArtist id={id} />
      ) : null}
      {/* Deactivation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm  bg-opacity-60 flex items-center justify-center z-[60]">
          {isSubmitting ? (
            <InlineLoadingScreen />
          ) : (
            <div className="bg-white rounded-2xl w-[700px] shadow-2xl h-fit">
              {/* Reject Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Deactivate Artist Profile
                </h3>
                <button
                  onClick={() => {
                    setshowDeactivateModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Reject Modal Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to deactivate this artist&apos;s
                  profile? Choose the type of deactivation and provide a reason.
                  A notification will be sent to the user&apos;s email.
                </p>
                <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <div className="flex gap-1">
                      <p className="font-medium mb-2 sm:text-sm text-lg">
                        Select Deactivation Option
                      </p>
                      <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-5"
                      />
                    </div>
                    <div className="w-full">
                      <Select
                        selected={deactivationForm.deactivateOption}
                        setSelected={(t) =>
                          setdeactivationForm((prev) => ({
                            ...prev,
                            deactivateOption: t,
                          }))
                        }
                        placeholder="Select"
                        options={genreList}
                        name="deactivateOption"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <div className="flex gap-1">
                      <p className="font-medium mb-2 sm:text-sm text-lg">
                        Reason for Deactivation
                      </p>
                      <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-5"
                      />
                    </div>
                    <div className="w-full">
                      <Select
                        selected={deactivationForm.deactivateReason}
                        setSelected={(t) =>
                          setdeactivationForm((prev) => ({
                            ...prev,
                            deactivateReason: t,
                          }))
                        }
                        placeholder="Select"
                        options={languagesList}
                        name="deactivateReason"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex gap-1 sm:text-sm text-lg mt-10">
                    <p className=" capitalize font-medium">Additional Notes </p>{" "}
                    <Image
                      priority={false}
                      loading="lazy"
                      src="/required.svg"
                      alt="a star marking this field as required"
                      width={0}
                      height={0}
                      className="w-2 -mt-5"
                    />
                  </div>

                  <textarea
                    value={deactivationForm.deactivateMessage}
                    onChange={(e) =>
                      setdeactivationForm((prev) => ({
                        ...prev,
                        deactivateMessage: e.target.value,
                      }))
                    }
                    className="w-full min-h-50 border-2 rounded-2xl p-4 mt-1"
                    placeholder="Add more details that will be shared in the notification email…"
                  ></textarea>
                </div>

                {/* Reject Modal Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setshowDeactivateModal(false);
                    }}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitDeactivationForm}
                    disabled={
                      !deactivationForm.deactivateMessage ||
                      !deactivationForm.deactivateReason ||
                      !deactivationForm.deactivateOption
                    }
                    className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirm Deactivation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* send notification Modal */}
      {showSendNotificationModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm  bg-opacity-60 flex items-center justify-center z-[60]">
          {isSubmitting ? (
            <InlineLoadingScreen />
          ) : (
            <div className="bg-white rounded-2xl w-[700px] shadow-2xl h-fit">
              {/* Reject Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Notify User
                </h3>
                <button
                  onClick={() => {
                    setshowSendNotificationModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Reject Modal Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Send a notification to this user. Please select a reason and
                  include any additional details you want them to see.
                </p>
                <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <div className="flex gap-1">
                      <p className="font-medium mb-2 sm:text-sm text-lg">
                        Reason
                      </p>
                      <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-5"
                      />
                    </div>
                    <div className="w-full">
                      <Select
                        selected={notifyUserForm.notifyUserReason}
                        setSelected={(t) =>
                          setnotifyUserForm((prev) => ({
                            ...prev,
                            notifyUserReason: t,
                          }))
                        }
                        placeholder="Select"
                        options={adminNotifyUserReasons}
                        name="notifyUserReason"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex gap-1 sm:text-sm text-lg mt-10">
                    <p className=" capitalize font-medium">Additional Notes </p>{" "}
                    <Image
                      priority={false}
                      loading="lazy"
                      src="/required.svg"
                      alt="a star marking this field as required"
                      width={0}
                      height={0}
                      className="w-2 -mt-5"
                    />
                  </div>

                  <textarea
                    value={notifyUserForm.notifyUserMessage}
                    onChange={(e) =>
                      setnotifyUserForm((prev) => ({
                        ...prev,
                        notifyUserMessage: e.target.value,
                      }))
                    }
                    className="w-full min-h-50 border-2 rounded-2xl p-4 mt-1"
                    placeholder="Write a message to the user"
                  ></textarea>
                </div>

                {/* Reject Modal Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setshowDeactivateModal(false);
                    }}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitNotificationForm}
                    disabled={
                      !notifyUserForm.notifyUserMessage ||
                      !notifyUserForm.notifyUserReason
                    }
                    className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirm Deactivation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
