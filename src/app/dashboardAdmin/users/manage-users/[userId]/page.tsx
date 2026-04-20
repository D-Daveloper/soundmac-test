"use client";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import useDebounce from "@/app/components/searchBox/searchBox";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import { Bell, ChevronDown, UserLock, UserPen, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { use, useContext, useEffect, useState } from "react";
import UserInfo from "./UserInfo";
import UserEarnings from "./UserEarnings";
import BillingInfo from "./BillingInfo";
import Verification from "./Verification";
import { useQueryClient } from "@tanstack/react-query";
import UseAxios from "@/util/customHooks/UseAxios";
import Select from "@/components/Select";
import { languagesList, userTypeOptionsForAdmin } from "@/app/constant";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { adminNotifyUserReasons, genreList } from "@/app/utils/constants";

export default function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { getParam, setParam } = useTabQuery();
  let tab = getParam("tab");
  const [isFilterOpen, setisFilterOpen] = useState(false);
  const api = UseAxios();
  const queryClient = useQueryClient();
  const [isSubmitting, setisSubmitting] = useState(false);
  const [showChangeUserTypeModal, setshowChangeUserTypeModal] = useState(false);
  const [userRoleForm, setuserRoleForm] = useState({
    userType: "",
  });
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
  const dashboardContext = useContext(DashboardContext);

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("User Details");
  }, []);

  if (!userId) {
    return <InlineLoadingScreen />;
  }

  useEffect(() => {
    if (
      !tab ||
      (tab != "user-info" &&
        tab != "user-earnings" &&
        tab != "billing" &&
        tab != "verification")
    ) {
      setParam("tab", "user-info");
    }
  }, [tab]);

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
    {
      name: "update user role",
      icon: <UserPen strokeWidth={1} />,
      func: () => {
        setshowChangeUserTypeModal(true);
      },
    },
  ];

  const handleSubmitChangeUserTypeForm = async () => {
    if (!userId) {
      return toast.warn("No UserId Details");
    }

    try {
      setisSubmitting(true);
      const res = await api.patch("admin/users/manage-users/" + userId, userRoleForm);
      toast.success(res.data.msg);
      setisFilterOpen(false);
      setshowChangeUserTypeModal(false);
      setuserRoleForm({
        userType: "",
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

  const handleSubmitNotificationForm = async () => {
    if (!userId) {
      return toast.warn("No UserId Details");
    }

    try {
      setisSubmitting(true);
      const res = await api.post("admin/users/manage-users/" + userId, notifyUserForm);
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
    if (!userId) {
      return toast.warn("No UserId Details");
    }

    try {
      setisSubmitting(true);
      const res = await api.put(
        "admin/users/manage-users/" + userId,
        deactivationForm,
      );
      toast.success(res.data.msg);
      setisFilterOpen(false);
      setshowDeactivateModal(false);
      setdeactivationForm({
        deactivateReason: "",
        deactivateOption: "",
        deactivateMessage: "",
      });
      await queryClient.invalidateQueries({
        queryKey: ["allUsers", "inactive"],
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
  return (
    <div className="bg-main-white min-h-screen w-full flex flex-col lg:pl-[260px] px-5 overflow-hidden">
      <Link
        href={"/dashboardAdmin/users/manage-users?userStatus=active"}
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
            setParam("tab", "user-info");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (tab === "user-info"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          User Info
        </button>
        <button
          onClick={() => {
            setParam("tab", "user-earnings");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (tab === "user-earnings"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          View Earnings
        </button>
        <button
          onClick={() => {
            setParam("tab", "billing");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (tab === "billing"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Payments & Billing
        </button>
        <button
          onClick={() => {
            setParam("tab", "verification");
          }}
          className={
            "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
            (tab === "verification"
              ? " bg-primary hover:bg-primary/90 text-white"
              : " bg-transparent border-2 border-text-disable text-text-disable")
          }
        >
          Verification
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
                  className="capitalize flex items-center gap-2 hover:bg-gray-200 p-2 rounded transition-colors text-sm"
                >
                  {options.icon}
                  {options.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* update user type Modal */}
      {showChangeUserTypeModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm  bg-opacity-60 flex items-center justify-center z-[60]">
          {isSubmitting ? (
            <InlineLoadingScreen />
          ) : (
            <div className="bg-white rounded-2xl w-[700px] shadow-2xl h-fit">
              {/* update user role Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 capitalize">
                  update user role
                </h3>
                <button
                  onClick={() => {
                    setshowChangeUserTypeModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* update user role Modal Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Select the new account type you want to assign to this user.
                </p>
                <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <div className="flex gap-1">
                      <p className="font-medium mb-2 sm:text-sm text-lg">
                        New Account Type
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
                        selected={userRoleForm.userType}
                        setSelected={(t) =>
                          setuserRoleForm((prev) => ({
                            ...prev,
                            userType: t,
                          }))
                        }
                        placeholder="Select"
                        options={userTypeOptionsForAdmin}
                        name="usertype"
                      />
                    </div>
                  </div>
                </div>

                {/* change user role modal Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setshowChangeUserTypeModal(false);
                    }}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitChangeUserTypeForm}
                    disabled={!userRoleForm.userType}
                    className=" capitalize px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    confirm update
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
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
                    className="px-5 py-2.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-500/80 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirm Notification
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {tab == "user-info" ? (
        <UserInfo userId={userId} />
      ) : tab == "user-earnings" ? (
        <UserEarnings userId={userId} />
      ) : tab === "billing" ? (
        <BillingInfo userId={userId} />
      ) : (
        <Verification userId={userId} />
      )}
    </div>
  );
}
