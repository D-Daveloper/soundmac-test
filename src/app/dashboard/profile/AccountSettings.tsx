"use client";
import Input from "@/app/components/input/Input";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { deactivateReasons } from "@/app/constant";
import { BankObject } from "@/app/type";
import { country_list } from "@/app/utils/constants";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import { useAuthUser, useGetBankList } from "@/util/customHooks/useQueries";
import { isPaymentformValid } from "@/util/middleware/functions";
import { isAxiosError } from "axios";
import { BadgeAlert, ExternalLink, PencilLine } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";


const AccountSettings = () => {
  const { data, isLoading } = useAuthUser();
  const api = UseAxios();
  const [wantsToChangePassword, setWantsToChangePassword] = useState(false);
  const [wantsToDeleteAccount, setWantsToDeleteAccount] = useState(false);
  const [confirmRequest, setConfirmRequest] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [passwordChangeForm, setPasswordChangeForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [deactivateForm, setDeactivateForm] = useState({
    reason: "",
    description: "",
    two_factor_authentication: false,
    isChecked: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name,checked } = e.target;
    if (name == "two_factor_authentication"){
      return setPasswordChangeForm((prev)=> ({...prev,two_factor_authentication: checked}))
    }
    setPasswordChangeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeactivateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name,checked } = e.target;
    if (name == "two_factor_authentication"){
      return setDeactivateForm((prev)=> ({...prev,two_factor_authentication: checked}))
    }
    setDeactivateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmittingForm(true);
      if (
        !passwordChangeForm.currentPassword ||
        !passwordChangeForm.newPassword ||
        !passwordChangeForm.confirmNewPassword
      ) {
        return toast.warn("Please fill in all password fields.");
      } else if (
        passwordChangeForm.newPassword === passwordChangeForm.currentPassword
      ) {
        return toast.warn("New password and old password must be different.");
      } else if (
        passwordChangeForm.newPassword !== passwordChangeForm.confirmNewPassword
      ) {
        return toast.warn("New password and confirm new password must match.");
      }

      let res;

      res = await api.put("users/accountsettings", passwordChangeForm, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success(res?.data?.msg);
      setPasswordChangeForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setWantsToChangePassword(false);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error);
        return;
      }
      toast.error("something went wrong.");
    } finally {
      setIsSubmittingForm(false);
    }
  };
  useEffect(()=>{
    setDeactivateForm((prev)=> ({...prev, two_factor_authentication: data?.twoFactorAuthentication === "true" ? true : false}))
  },[data?.twoFactorAuthentication])

  return (
    <div className=" w-full max-w-[800px] flex flex-col px-5">
      {isLoading || !data || isSubmittingForm ? (
        <InlineLoadingScreen />
      ) : (
        <>
          <div className="flex gap-8 py-5 pb-20">
            <div className="flex-3 overflow-auto flex flex-col gap-10 px-1 min-h-[64dvh]">
              <div>
                <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                  Security Settings
                </h1>
                <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 ">
                  Manage your account&apos;s security preferences. Update your
                  password regularly to keep your account safe and enable extra
                  protection where available.
                </p>
              </div>
              <div className="bg-[#FFFFFF] rounded-xl max-w-[800px] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Password Setting
                    </h2>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3">
                      Update your login password to keep your account secure.
                    </p>
                  </div>
                  <div
                    className={
                      "flex gap-5 items-start " +
                      (!wantsToChangePassword && "hidden")
                    }
                  >
                    <button
                      type="button"
                      onClick={() => setWantsToChangePassword(false)}
                      className={
                        "p-4 font-bold rounded-lg text-center max-w-fit flex items-center h-8 hover:cursor-pointer text-sm border-2 border-primary-500 text-text-body bg-transparent hover:bg-primary-500/90 "
                      }
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isSubmittingForm}
                      type="button"
                      onClick={() => handleSubmit()}
                      className={
                        "p-4 font-bold rounded-lg text-center max-w-fit flex items-center h-8 hover:cursor-pointer text-sm border-2 border-primary-500 text-white bg-primary-500 hover:bg-primary-500/90 "
                      }
                    >
                      Update Password
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWantsToChangePassword(true)}
                  className={
                    "mt-10 p-4 font-bold rounded-lg text-center max-w-fit flex items-center h-8 hover:cursor-pointer text-sm border-2 border-primary-500 text-white bg-primary-500 hover:bg-primary-500/90 " +
                    (wantsToChangePassword && "hidden")
                  }
                >
                  Change Password
                </button>
                <div className={" " + (!wantsToChangePassword && "hidden")}>
                  <div className="flex flex-col w-[40%] max-sm:w-full my-5">
                    <Input
                      value={passwordChangeForm.currentPassword}
                      title={"current password"}
                      name={"currentPassword"}
                      type="password"
                      placeholder={"Enter current password"}
                      updateValue={handleChange}
                      required={false}
                      disabled={!wantsToChangePassword}
                    />
                  </div>
                  <div className="flex gap-5">
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <Input
                        value={passwordChangeForm.newPassword}
                        title={"new password"}
                        type="password"
                        name={"newPassword"}
                        placeholder={"Enter new password"}
                        updateValue={handleChange}
                        required={false}
                        disabled={!wantsToChangePassword}
                      />
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <Input
                        value={passwordChangeForm.confirmNewPassword}
                        title={"confirm password"}
                        type="password"
                        name={"confirmNewPassword"}
                        placeholder={"Enter confirm password"}
                        updateValue={handleChange}
                        required={false}
                        disabled={!wantsToChangePassword}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#FFFFFF] rounded-xl max-w-[800px] p-5">
                <h2 className="text-sm font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                  Two-Factor Authentication (2FA)
                </h2>
                <p className=" font-medium text-xs leading-[20px] text-warning-600 -tracking-[0.5px]">
                  Two-factor authentication adds an extra step during login,
                  helping prevent unauthorized access.
                </p>
                <input
                  type="checkbox"
                  className="p-5 rounded-full max-sm:p-3 accent-primary hover:accent-primary"
                  name="two_factor_authentication"
                  checked={deactivateForm.two_factor_authentication}
                  onChange={handleDeactivateFormChange}
                />
              </div>

              {/* border line */}
              <div className="border border-neutral-100 mt-5"></div>
              {/* reuqest account Deactivation */}
              <div className="bg-[#FFFFFF] rounded-xl max-w-[800px] p-5">
                <h2 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                  Account Deactivation & Deletion
                </h2>
                <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3">
                  Deleting your Soundmac account will permanently remove your
                  access after a review period. You will receive an email
                  confirmation before the deletion is finalized.
                </p>
                <button
                  type="button"
                  onClick={() => setWantsToDeleteAccount(true)}
                  className={
                    "mt-10 p-5 font-bold rounded-xl text-center max-w-fit flex items-center h-8 hover:cursor-pointer text-sm border-2 border-error-500 text-white bg-error-500 hover:bg-error-500/90"
                  }
                >
                  Request Account Deletion
                </button>
              </div>
            </div>
          </div>

          {/* submit delete account reason */}
          <div
            className={
              wantsToDeleteAccount
                ? " fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm "
                : " hidden"
            }
          >
            <div className="flex flex-col gap-5 pt-5 justify-start bg-neutral-100 rounded-xl shadow-2xl w-full max-w-[500px] h-full max-h-[450px]">
              <div className="flex justify-between h-fit w-full items-start px-5">
                <h3 className="text-xl font-semibold tracking-[-0.5px] text-main-heading">
                  Account Deletion Request
                </h3>
                <button
                  onClick={() => setWantsToDeleteAccount(false)}
                  className="cursor-pointer text-primary-500"
                  aria-label="cancel deactivate account"
                >
                  X
                </button>
              </div>
              <div className="flex flex-col w-full h-fit px-5">
                <p className="font-medium mb-2 sm:text-sm text-lg">
                  Reason for Deactivation
                </p>
                <div className="w-full">
                  <Select
                    selected={deactivateForm.reason}
                    setSelected={(t) =>
                      setDeactivateForm((prev) => ({ ...prev, reason: t }))
                    }
                    placeholder="Select Reason..."
                    options={deactivateReasons}
                    name="reason"
                  />
                </div>
                <div className="flex gap-1 sm:text-sm text-lg mt-5">
                  <p className=" capitalize font-medium">Others</p>
                </div>
                <textarea
                  required={deactivateForm.reason === "Other (please specify)"}
                  value={deactivateForm.description}
                  onChange={(e) =>
                    setDeactivateForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full min-h-30 border-2 outline-1 rounded-2xl p-4 mt-1"
                  placeholder=""
                ></textarea>
                <div className="mt-5 flex gap-3">
                  <input
                    type="checkbox"
                    className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
                    name="isChecked"
                    checked={deactivateForm.isChecked}
                    onChange={handleChange}
                  />
                  <p className="leading-6 text-xs text-text-body font-semibold">
                    I agree to the Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
              <div className="bg-[#F0F0E7] border border-neutral-100 gap-5 h-15 min-w-full flex justify-end mt-auto rounded-lg p-3">
                <button
                  onClick={() => {
                    setWantsToDeleteAccount(false);
                  }}
                  className={
                    "font-bold text-sm rounded-lg px-2 py-1 hover:bg-primary/20 border-2 border-primary text-main-heading "
                  }
                >
                  {" "}
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setConfirmRequest(true);
                  }}
                  className={
                    "font-bold text-sm rounded-lg px-2 py-1 hover:bg-primary/20 text-white bg-error-500 "
                  }
                >
                  {" "}
                  Submit Request
                </button>
              </div>
            </div>
          </div>

          {/* confirm request component */}
          <div
            className={
              confirmRequest
                ? " fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm  "
                : " hidden"
            }
          >
            <div className="flex flex-col gap-5 w-fit py-5 px-5 justify-center items-center bg-neutral-100  rounded-xl shadow-2xl max-w-[350px]">
              <div className="flex flex-col gap-2 mb-2 justify-center items-center">
                <BadgeAlert size={80} color="#D91B1B" strokeWidth={2} />
                <h3 className="text-xl font-semibold tracking-[-0.5px] text-main-heading">
                  Submit Details?
                </h3>
                <p className="text-p font-normal text-sm leading-4 -tracking-[0.5px] text-center">
                  Your deletion request will be reviewed by the Soundmac team
                  within 3-5 business days. You&apos;ll receive an email
                  confirmation once the process begins.
                  <br /> You can cancel this request anytime before final
                  approval.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  aria-label="cancel and go back"
                  onClick={() => setConfirmRequest(false)}
                  className={
                    "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm  bg-transparent border-2 border-primary-500 text-[#494949]"
                  }
                >
                  Go back
                </button>
                <button
                  aria-label="sumbit request"
                  className={
                    "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white!"
                  }
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountSettings;
