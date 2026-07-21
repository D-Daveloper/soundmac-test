"use client";
import Input from "@/app/components/input/Input";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { country_list } from "@/app/utils/constants";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import { useAuthUser } from "@/util/customHooks/useQueries";
import { isAxiosError } from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGetReferralDetails } from "@/util/customHooks/useQueries";
import { handleCopy } from "@/util/middleware/functions";
import { Copy } from "lucide-react";
import ReferralDetails from "./ReferralDetails";

const formData = [
  {
    title: "first name",
    placeholder: "Enter your first name",
    alt: "a user icon for first name",
    image: "/user.svg",
    required: true,
    name: "first_name",
  },
  {
    title: "last name",
    placeholder: "Enter your Last name",
    alt: "a user icon for last name",
    image: "/user.svg",
    required: true,
    name: "last_name",
  },
  {
    title: "email",
    placeholder: "you@example.com",
    alt: "an email icon",
    image: "/sms.svg",
    required: true,
    name: "email",
    type: "email",
  },
  //   {
  //     title: "phone number",
  //     placeholder: "070..",
  //     alt: "an email icon",
  //     image: "/sms.svg",
  //     required: true,
  //     name: "phone",
  //     type: "phone",
  //   },
];
type ProfileForm = {
  first_name: string;
  last_name: string;
  country: string;
  email: string;
  profile_pic: File | null;
};

const AccountInfo = () => {
  const { data, isLoading, refetch } = useAuthUser();
  const api = UseAxios();
  const [wantsToEdit, setWantsToEdit] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    first_name: "",
    last_name: "",
    country: "",
    email: "",
    profile_pic: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, files } = e.target;
    if (name === "profile_pic") {
      const file = files && files.length ? files[0] : null;
      console.log(file);
      console.log(profileForm);

      if (file) {
        setProfileForm((prev) => ({ ...prev, profile_pic: file }));
        setImage(URL.createObjectURL(file));
        return;
      }
    }
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmittingForm(true);
      console.log(profileForm);
      const formData = new FormData();
      Object.entries(profileForm).forEach(([key, value]) => {
        if (value != null) {
          formData.append(key, value);
        }
      });
      console.log(...formData);
      let res;
      res = await api.put("users/user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res?.data?.msg);
      await refetch();
      setWantsToEdit(false);
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

  useEffect(() => {
    if (data) {
      setProfileForm({
        first_name: data.firstName,
        last_name: data.lastName,
        country: data.country,
        email: data.email,
        profile_pic: null,
      });
      setImage(data.profilePic);
    }
  }, [data]);

  return (
    <div className=" w-full max-w-[800px] 2xl:w-full flex flex-col px-2">
      {isLoading || !data || isSubmittingForm ? (
        <InlineLoadingScreen />
      ) : (
        !false &&
        true && (
          <>
            <div className="bg-secondary-50 rounded-xl p-5 mt-8 flex gap-5 mb-5 max-sm:flex-col ">
              <div className="flex gap-5 items-center">
                <div className="md:p-14 p-10 relative">
                  <Image
                    priority={true}
                    loading="eager"
                    src={image ? image : "/boomplay.jpg"}
                    alt="Profile picture"
                    fill
                    className="object-cover rounded-lg "
                    unoptimized
                  />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold leading-[30px] -tracking-[1px] text-text-body line-clamp-1">
                    {data.lastName + " " + data.firstName}
                  </h1>
                  <p className="text-text-disable font-normal leading-[18px] tracking-[-0.5px] text-sm line-clamp-1">
                    Joined Date:{new Date(data.createdAt).toDateString()}
                  </p>
                </div>
              </div>

              <div
                className={
                  "px-5 py-2 font-bold rounded-full sm:ml-auto max-w-fit max-h-10 text-sm bg-primary-100 text-primary-500 "
                }
              >
                {data.type}
              </div>
            </div>

            {/* referral details */}

            {/* <ReferralDetails /> */}

            <div className="flex gap-8 py-5 pb-30">
              <div className="flex-3 overflow-auto flex flex-col gap-5 px-1 ">
                {/* cover art */}
                {wantsToEdit && (
                  <div className=" px-2 md:px-5">
                    <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Profile Image{" "}
                    </h1>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                      Upload your profile picture.{" "}
                    </p>
                    <div className="flex items-center justify-center w-60">
                      <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                        <div className="flex flex-col max-sm:w-full gap-2">
                          <h4 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                            Image File
                          </h4>
                          <div className="flex items-center justify-center w-64 md:w-80">
                            <label
                              htmlFor="profile_pic"
                              className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                            >
                              <div
                                className={
                                  "w-[50%] flex items-center justify-center rounded-2xl text-white border border-neutral-100" +
                                  (!profileForm.profile_pic &&
                                    " bg-neutral-50 ")
                                }
                              >
                                <Image
                                  src={image ? image : "/document-upload.svg"}
                                  width={60}
                                  height={60}
                                  unoptimized
                                  alt="music note icon"
                                  className={
                                    profileForm.profile_pic
                                      ? " w-full object-cover min-w-15 h-15"
                                      : undefined
                                  }
                                />
                              </div>
                              <div className="w-[50%]">
                                {!profileForm.profile_pic ? (
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-bold text-text-body">
                                      Supported Files:
                                    </span>{" "}
                                    JPG, PNG
                                    <br />
                                    3000 x 3000px minimum
                                  </p>
                                ) : (
                                  <p className="font-bold text-[16px] text-[#494949] truncate">
                                    <span className="font-semibold">
                                      {profileForm.profile_pic &&
                                        profileForm.profile_pic.name}
                                    </span>
                                  </p>
                                )}
                              </div>
                              <input
                                id="profile_pic"
                                name="profile_pic"
                                type="file"
                                accept="image/png,image/jpeg"
                                className="hidden"
                                onChange={handleChange}
                                disabled={!wantsToEdit}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Account info */}
                <div className="md:ml-5 px-2 md:">
                  <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                    Personal Info
                  </h1>
                  <div className="w-full flex flex-wrap justify-between gap-y-5 mt-5 ">
                    {formData.map((data, index) => (
                      <div
                        key={index}
                        className="flex flex-col w-[40%] max-sm:w-full"
                      >
                        <Input
                          value={
                            (profileForm[
                              data.name as keyof typeof profileForm
                            ] as string) ?? ""
                          }
                          title={data.title}
                          type={data.title}
                          name={data.name}
                          placeholder={data.placeholder}
                          updateValue={handleChange}
                          required={false}
                          disabled={!wantsToEdit}
                        />
                      </div>
                    ))}
                    <div className="flex flex-col w-[40%] max-sm:w-full mb-5">
                      <p className="font-medium mb-2 sm:text-sm text-lg">
                        Country
                      </p>
                      <div className="w-full">
                        <Select
                          selected={profileForm.country}
                          setSelected={(t) =>
                            setProfileForm((prev) => ({ ...prev, country: t }))
                          }
                          placeholder="Select Country..."
                          options={country_list}
                          name="country"
                          isDisabled={!wantsToEdit}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* buttons */}
            <div className="bg-[#F0F0E7] border border-neutral-100 flex justify-end items-center gap-5 h-20 pr-10 fixed bottom-0 z-2 left-0 w-full">
              {wantsToEdit && (
                <button
                  onClick={() => {
                    setWantsToEdit(false);
                  }}
                  className={
                    "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-primary-500 bg-transparent "
                  }
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => {
                  wantsToEdit ? handleSubmit() : setWantsToEdit(true);
                }}
                className={
                  "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-white bg-primary-500 "
                }
              >
                {wantsToEdit ? "Save Changes" : "Edit Profile Info"}
              </button>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default AccountInfo;
