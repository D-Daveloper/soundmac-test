"use client";
import Input from "@/app/components/input/Input";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { adminNotifyUserReasons } from "@/app/utils/constants";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import { useGetAdminUserDetails } from "@/util/customHooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { CircleCheck, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";

const Verification = ({ userId }: { userId: string }) => {
  const api = UseAxios();
  const queryClient = useQueryClient();
  const [isSubmitting, setisSubmitting] = useState(false);
  const [showConfirmApproveVerification, setshowConfirmApproveVerification] =
    useState(false);

  const [showSendRejectVerificationModal, setshowSendRejectVerificationModal] =
    useState(false);
  const [verifyUserForm, setverifyUserForm] = useState({
    rejecteUserVerificationReason: "",
    rejecteUserVerificationMessage: "",
  });

  if (!userId) {
    return <InlineLoadingScreen />;
  }
  
  const {
    isLoading: isLoadinguserDetails,
    data: userDetails,
    isFetching,
    isPending,
    isRefetching,
    isError,
  } = useGetAdminUserDetails({ userId });

  const handleRejectUserVerification = async () => {
    if (!userId) {
      return toast.warn("No User Details");
    }

    try {
      setisSubmitting(true);
      const res = await api.post(
        "admin/users/manage-users/" + userId + "/verification",
        { ...verifyUserForm, requestType: "rejected" },
      );
      toast.success(res.data.msg);
      setshowSendRejectVerificationModal(false);
      setverifyUserForm({
        rejecteUserVerificationReason: "",
        rejecteUserVerificationMessage: "",
      });
      await queryClient.invalidateQueries({
        queryKey: ["adminUserDetails", userId],
        exact: true,
      });
      if (userDetails && userDetails.data.verificationDetails) {
        userDetails.data.verificationDetails.verified = "approved";
      }
    } catch (error) {
      if (isAxiosError(error)) {
        return;
      }
      toast.error("something went wrong");
    } finally {
      setisSubmitting(false);
    }
  };

  const handleApproveVerification = async () => {
    try {
      setisSubmitting(true);
      const res = await api.post(
        "admin/users/manage-users/" + userId + "/verification",
        {
          requestType: "approved",
        },
      );
      console.log(res.data);
      toast.success(res.data.msg);
      await queryClient.invalidateQueries({
        queryKey: ["adminUserDetails", userId],
        exact: true,
      });
      if (userDetails && userDetails.data.verificationDetails) {
        userDetails.data.verificationDetails.verified = "approved";
      }
      setshowConfirmApproveVerification(false);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error);
        return;
      }
      toast.error("Something went wrong!");
    } finally {
      setisSubmitting(false);
    }
  };

  return (
    <div className=" w-full flex flex-col px-5 min-h-[90dvh] h-full">
      {isLoadinguserDetails || !userDetails ? (
        <InlineLoadingScreen />
      ) : !userDetails.data.verificationDetails ? (
        <div className=" flex justify-center items-center min-h-[90dvh]">
          <div className="bg-neutral-50 max-w-[500px] p-10 flex flex-col items-center gap-5">
            <span
              className={
                "px-5 py-2 font-bold rounded-full max-w-fit max-h-10 text-sm bg-error-100 text-error-500"
              }
            >
              Not Verified
            </span>
            <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
              No Verification Request Submitted
            </h1>
            <p className="text-caption-one font-normal leading-[18px] tracking-[-0.5px] text-text-body ">
              This user has not submitted any verification request. Once they
              submit one, the details will appear here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className=" pb-30 flex flex-col gap-10 px-1 min-h-[64dvh]">
            {/* Account info */}
            <div className="w-full flex flex-wrap justify-between gap-y-5 mt-10 ">
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <Input
                  value={userDetails.data?.firstName || ""}
                  title={"First name"}
                  type={"text"}
                  name={"idType"}
                  placeholder={"Enter id type"}
                  updateValue={(e) => {}}
                  required={false}
                  disabled={true}
                />
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <Input
                  value={userDetails.data.lastName || ""}
                  title={"last name"}
                  type={"text"}
                  name={"idType"}
                  placeholder={"Enter id type"}
                  updateValue={(e) => {}}
                  required={false}
                  disabled={true}
                />
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <Input
                  value={userDetails.data.verificationDetails?.middleName || ""}
                  title={"middle name"}
                  type={"text"}
                  name={"idType"}
                  placeholder={"Enter id type"}
                  updateValue={(e) => {}}
                  required={false}
                  disabled={true}
                />
              </div>
            </div>

            {/* border line */}
            <div className="border border-neutral-100 my-5"></div>

            <div className="w-full flex flex-wrap justify-between gap-y-5 ">
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <Input
                  value={userDetails.data.verificationDetails?.idType || ""}
                  title={"ID Type"}
                  type={"text"}
                  name={"idType"}
                  placeholder={"Enter id type"}
                  updateValue={(e) => {}}
                  required={false}
                  disabled={true}
                />
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <Input
                  value={userDetails.data.verificationDetails?.idNumber || ""}
                  title={"ID Number"}
                  type={"text"}
                  name={"idNumber"}
                  placeholder={"Enter id Number"}
                  updateValue={(e) => {}}
                  required={false}
                  disabled={true}
                />
              </div>
            </div>

            {/* cover art */}
            <div>
              <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading mt-5">
                ID Upload{" "}
              </h1>
              <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 ">
                ID document must be clear and unaltered.{" "}
              </p>
              <div className="flex items-center justify-center w-full">
                <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                  <div className="flex flex-col max-sm:w-full gap-2">
                    <div className="flex gap-1">
                      <h4 className="text-sm font-bold leading-[24px] tracking-[-0.5px] text-main-heading">
                        image File
                      </h4>
                    </div>
                    <div className="flex items-center justify-center w-60">
                      <label
                        htmlFor="id_image"
                        className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                      >
                        <div
                          className={
                            "w-[50%] flex items-center justify-center rounded-2xl text-white border border-neutral-100"
                          }
                        >
                          <Image
                            src={
                              userDetails.data.verificationDetails?.idImage ||
                              "/document-upload.svg"
                            }
                            width={60}
                            height={60}
                            alt="music note icon"
                          />
                        </div>
                        <div className="w-[50%]">
                          <p className="font-bold text-[16px] text-[#494949] truncate">
                            <span className="font-semibold">
                              {userDetails.data.firstName}
                            </span>
                            <a
                              aria-label="download address image"
                              download={userDetails.data.lastName + "_NIN"}
                              href={
                                userDetails.data.verificationDetails
                                  ?.addressImage || "/signinimage.png"
                              }
                              target="_blank"
                              className="flex items-center gap-2 text-primary-500! font-bold hover:text-primary/90! transition-colors"
                            >
                              view
                            </a>
                          </p>
                        </div>
                        <input
                          id="id_image"
                          name="id_image"
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={(e) => {}}
                          disabled={true}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* border line */}
            <div className="border border-neutral-100 my-5"></div>

            {/* address */}
            <div>
              <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading mt-5">
                Proof of Address
              </h1>
              <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 ">
                Documents such as utility bill, bank statement, etc., with valid
                address.
              </p>
              <div className="flex items-center justify-center w-full">
                <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                  <div className="flex flex-col max-sm:w-full gap-2">
                    <div className="flex gap-1">
                      <h4 className="text-sm font-bold leading-[24px] tracking-[-0.5px] text-main-heading">
                        image File
                      </h4>
                    </div>
                    <div className="flex items-center justify-center w-60">
                      <label
                        htmlFor="address_image"
                        className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                      >
                        <div
                          className={
                            "w-[50%] flex items-center justify-center rounded-2xl text-white border border-neutral-100"
                          }
                        >
                          <Image
                            src={
                              userDetails.data.verificationDetails
                                ?.addressImage || "/document-upload.svg"
                            }
                            width={60}
                            height={60}
                            alt="music note icon"
                          />
                        </div>
                        <div className="w-[50%]">
                          <p className="font-bold text-[16px] text-[#494949] truncate">
                            <span className="font-semibold">Address</span>
                            <a
                              aria-label="download address image"
                              download={userDetails.data.lastName + "_address"}
                              href={
                                userDetails.data.verificationDetails
                                  ?.addressImage || "/signinimage.png"
                              }
                              target="_blank"
                              className="flex items-center gap-2 text-primary-500! font-bold hover:text-primary/90! transition-colors"
                            >
                              view
                            </a>
                          </p>
                        </div>
                        <input
                          id="address_image"
                          name="address_image"
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={(e) => {}}
                          disabled={true}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* buttons */}
          <div className="bg-[#F0F0E7] border border-neutral-100 flex justify-end items-center gap-5 h-20 pr-10 fixed bottom-0 z-2 left-0 w-full">
            <button
              onClick={() => setshowSendRejectVerificationModal(true)}
              disabled={userDetails.data.verificationDetails.verified != "pending"}
              className={
                "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-error-100 flex text-white bg-error-500 disabled:bg-gray-300 "
              }
            >
              Reject
            </button>

            <button
              onClick={() => setshowConfirmApproveVerification(true)}
              disabled={userDetails.data.verificationDetails.verified != "pending"}
              className={
                "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 flex text-white bg-primary-500 disabled:bg-gray-300 "
              }
            >
              Approve
            </button>
          </div>
        </>
      )}
      {/* send notification Modal */}
      {showSendRejectVerificationModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm  bg-opacity-60 flex items-center justify-center z-[60]">
          {isSubmitting ? (
            <InlineLoadingScreen />
          ) : (
            <div className="bg-white rounded-2xl w-[700px] shadow-2xl h-fit">
              {/* Reject Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Reject Verification Request
                </h3>
                <button
                  onClick={() => {
                    setshowSendRejectVerificationModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Reject Modal Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Please select a reason for rejecting this verification request
                  and add any additional details to help the artist make
                  corrections.
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
                        selected={verifyUserForm.rejecteUserVerificationReason}
                        setSelected={(t) =>
                          setverifyUserForm((prev) => ({
                            ...prev,
                            rejecteUserVerificationReason: t,
                          }))
                        }
                        placeholder="Select"
                        options={adminNotifyUserReasons}
                        name="rejecteUserVerificationReason"
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
                    value={verifyUserForm.rejecteUserVerificationMessage}
                    onChange={(e) =>
                      setverifyUserForm((prev) => ({
                        ...prev,
                        rejecteUserVerificationMessage: e.target.value,
                      }))
                    }
                    className="w-full min-h-50 border-2 rounded-2xl p-4 mt-1"
                    placeholder="Provide clear feedback to help the artist resolve the issue."
                  ></textarea>
                </div>

                {/* Reject Modal Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setshowSendRejectVerificationModal(false);
                    }}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectUserVerification}
                    disabled={
                      !verifyUserForm.rejecteUserVerificationMessage ||
                      !verifyUserForm.rejecteUserVerificationReason
                    }
                    className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/*info pop up */}
      <div
        className={
          showConfirmApproveVerification
            ? " fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl  "
            : " hidden"
        }
      >
        {isSubmitting ? (
          <InlineLoadingScreen />
        ) : (
          <div className="max-w-[400px] h-[400px]">
            <div className="flex flex-col w-fit py-5 px-10 justify-center items-center bg-neutral-100  rounded-lg shadow-2xl">
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex justify-center my-5">
                  <CircleCheck size={50} color="#103958" strokeWidth={1} />
                </div>
                <h3 className="text-xl font-normal leading-[30px] tracking-[-1px] text-main-heading text-center">
                  Approve Verification Request
                </h3>
                <p className="text-body-two-regular text-text-body text-center">
                  You are about to approve this user&apos;s verification
                  request. Once approved, their profile will be marked as
                  verified and they will gain access to verification-only
                  features. Confirm to proceed.
                </p>
              </div>
              <div className="flex gap-5 mt-5">
                <button
                  aria-label="cancel Approve Verification Request"
                  disabled={false}
                  onClick={() => {
                    setshowConfirmApproveVerification(false);
                  }}
                  className={
                    "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/20 flex text-primary-500 outline-2 outline-primary-500 "
                  }
                >
                  Cancel
                </button>
                <button
                  aria-label="Approve Verification Request"
                  disabled={isSubmitting}
                  onClick={() => {
                    handleApproveVerification();
                  }}
                  className={
                    "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/20 flex text-primary-500 outline-2 outline-primary-500 "
                  }
                >
                  Approve Release
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;
