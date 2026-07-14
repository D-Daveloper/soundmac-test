"use client";
import { SelectDate } from "@/app/components/datepicker/SelectDate";
import Input from "@/app/components/input/Input";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { country_list } from "@/app/utils/constants";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import { useAuthUser } from "@/util/customHooks/useQueries";
import { isVerificationformValid } from "@/util/middleware/functions";
import { isAxiosError } from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const formData = [
  {
    title: "first name",
    placeholder: "Enter your first name",
    alt: "a user icon for first name",
    image: "/user.svg",
    required: true,
    name: "first_name",
    disabled: true,
  },
  {
    title: "last name",
    placeholder: "Enter your Last name",
    alt: "a user icon for last name",
    image: "/user.svg",
    required: true,
    name: "last_name",
    disabled: true,
  },
  {
    title: "Middle Name",
    placeholder: "Enter your Middle name",
    alt: "an Middle Name icon",
    image: "/sms.svg",
    required: true,
    name: "middle_name",
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
const IDForm = [
  {
    title: "ID Type",
    placeholder: "Enter your ID Type",
    alt: "a user icon for ID Type",
    image: "/user.svg",
    required: true,
    name: "id_type",
    disabled: true,
  },
  {
    title: "ID Number",
    placeholder: "Enter your ID Number",
    alt: "a user icon for ID Number",
    image: "/user.svg",
    required: true,
    name: "id_number",
  },
];

export type VerificationForm = {
  first_name: string;
  last_name: string;
  middle_name: string;
  id_type: string;
  id_number: string;
  dob: Date | undefined;
  id_image: File | null;
  address_image: File | null;
  old_id_image: string;
  old_address_image: string;
};

const Verification = () => {
  const { data, isLoading, refetch } = useAuthUser();
  const api = UseAxios();
  const [wantsToEdit, setWantsToEdit] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [addressImage, setAddressImage] = useState<string | null>(null);
  const [verificationForm, setVerificationForm] = useState<VerificationForm>({
    first_name: "",
    last_name: "",
    middle_name: "",
    dob: undefined,
    id_image: null,
    address_image: null,
    old_id_image: "",
    old_address_image: "",
    id_number: "",
    id_type: "NIN",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, files } = e.target;
    console.log(verificationForm);
    if (name === "id_image") {
      const file = files && files.length ? files[0] : null;

      if (file) {
        setVerificationForm((prev) => ({ ...prev, [name]: file }));
        setIdImage(URL.createObjectURL(file));
        return;
      }
    } else if (name === "address_image") {
      const file = files && files.length ? files[0] : null;

      if (file) {
        setVerificationForm((prev) => ({ ...prev, [name]: file }));
        setAddressImage(URL.createObjectURL(file));
        return;
      }
    }
    setVerificationForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmittingForm(true);
      console.log(verificationForm);
      const validateForm = isVerificationformValid(verificationForm);
      if (validateForm !== "true") {
        return toast.warn(validateForm);
      }
      const formData = new FormData();
      Object.entries(verificationForm).forEach(([key, value]) => {
        if (value != null) {
          if (value instanceof Date) {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value);
          }
        }
      });
      console.log(...formData);
      //   return;
      let res;
      res = await api.post("users/verification", formData, {
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
      setVerificationForm({
        first_name: data.firstName,
        last_name: data.lastName,
        middle_name: data.verificationDetails
          ? data.verificationDetails.middleName
          : "",
        id_number: data.verificationDetails
          ? data.verificationDetails.idNumber
          : "",
        id_type: data.verificationDetails?.idType || "NIN",
        dob: data.verificationDetails?.dob
          ? new Date(data.verificationDetails.dob)
          : undefined,
        id_image: null,
        address_image: null,
        old_address_image: data.verificationDetails?.addressImage || "",
        old_id_image: data.verificationDetails?.idImage || "",
      });
      if (data.verificationDetails) {
        setIdImage(data.verificationDetails.idImage);
        setAddressImage(data.verificationDetails.addressImage);
        setIsVerified(data.verificationDetails.verified == "approved" ? true : false);
      }
    }
  }, [data]);

  return (
    <div className=" w-full max-w-[800px] flex flex-col px-5 lg:px-3">
      {isLoading || !data || isSubmittingForm ? (
        <InlineLoadingScreen />
      ) : (
        <>
          <div className="flex gap-8 py-5 pb-30">
            <div className="flex-3 overflow-auto flex flex-col gap-10">
              {/* Account info */}
              <div>
                <div className="flex items-start gap-5 justify-between max-xs:flex-wrap">
                  <div>
                    <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Submit Your Verification Details
                    </h1>
                    <p className="text-caption-one font-normal leading-[18px] tracking-[-0.5px] text-text-body mt-3 ">
                      To comply with Soundmac&apos;s verification policy, please
                      provide your identification details. Ensure all
                      information matches your legal documents.
                    </p>
                  </div>
                  <div
                    className={
                      "px-5 py-2 font-bold rounded-full sm:ml-auto min-w-fit max-h-10 text-sm " +
                      (!isVerified
                        ? " bg-warning-100 text-warning-500"
                        : " bg-success-100 text-success-500")
                    }
                  >
                    {isVerified ? "Verified" : "Not Verified"}
                  </div>
                </div>
                <div className="w-full flex flex-wrap justify-between gap-y-5 mt-5 px-1 ">
                  {formData.map((data, index) => (
                    <div
                      key={index}
                      className="flex flex-col w-[40%] max-sm:w-full"
                    >
                      <Input
                        value={
                          (verificationForm[
                            data.name as keyof typeof verificationForm
                          ] as string) ?? ""
                        }
                        title={data.title}
                        type={data.title}
                        name={data.name}
                        placeholder={data.placeholder}
                        updateValue={handleChange}
                        required={true}
                        disabled={data.disabled || !wantsToEdit || isVerified}
                      />
                    </div>
                  ))}
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <div className="flex">
                      <p className=" capitalize font-medium text-sm">
                        Date of Birth <span className="text-red-500">*</span>
                      </p>
                      {/* <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-3 "
                      /> */}
                    </div>
                    <SelectDate
                      disabled={!wantsToEdit || isVerified}
                      setDate={(date) =>
                        setVerificationForm((prev) => ({
                          ...prev,
                          dob: date,
                        }))
                      }
                      value={verificationForm.dob}
                      type="first"
                    />
                    <p className=" font-normal text-xs leading-[20px] text-warning-600 -tracking-[0.5px] p-1">
                      Must be 18+
                    </p>
                  </div>
                </div>

                {/* border line */}
                <div className="border border-neutral-100 my-10"></div>

                <div className="w-full flex flex-wrap justify-between gap-y-5 mt-10 px-1">
                  {IDForm.map((data, index) => (
                    <div
                      key={index}
                      className="flex flex-col w-[40%] max-sm:w-full"
                    >
                      <Input
                        value={
                          (verificationForm[
                            data.name as keyof typeof verificationForm
                          ] as string) ?? ""
                        }
                        title={data.title}
                        type={"text"}
                        name={data.name}
                        placeholder={data.placeholder}
                        updateValue={handleChange}
                        required={true}
                        disabled={data.disabled || !wantsToEdit || isVerified}
                      />
                    </div>
                  ))}
                  {/* cover art */}
                  <div>
                    <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading mt-7">
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
                              image File <span className="text-red-500">*</span>
                            </h4>
                            {/* <Image
                              priority={false}
                              loading="lazy"
                              src="/required.svg"
                              alt="a star marking this field as required"
                              width={0}
                              height={0}
                              className="w-2 -mt-3 "
                            /> */}
                          </div>
                          <div className="flex items-center justify-center w-64 md:w-80">
                            <label
                              htmlFor="id_image"
                              className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                            >
                              <div
                                className={
                                  "w-[50%] flex items-center justify-center rounded-2xl text-white border border-neutral-100" +
                                  (!verificationForm.id_image &&
                                    " bg-neutral-50 ")
                                }
                              >
                                <Image
                                  src={
                                    idImage ? idImage : "/document-upload.svg"
                                  }
                                  width={60}
                                  height={60}
                                  alt="music note icon"
                                  className={
                                    verificationForm.id_image
                                      ? " w-full object-cover min-w-15 h-15"
                                      : undefined
                                  }
                                />
                              </div>
                              <div className="w-[50%]">
                                {!verificationForm.id_image ? (
                                  <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-bold text-text-body">
                                      Supported Files:
                                    </span>{" "}
                                    JPG, PNG
                                  </p>
                                ) : (
                                  <p className="font-bold text-[16px] text-[#494949] truncate">
                                    <span className="font-semibold">
                                      {verificationForm.id_image &&
                                        verificationForm.id_image.name}
                                    </span>
                                  </p>
                                )}
                              </div>
                              <input
                                id="id_image"
                                name="id_image"
                                type="file"
                                accept="image/png,image/jpeg"
                                className="hidden"
                                onChange={handleChange}
                                disabled={!wantsToEdit || isVerified}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* border line */}
                <div className="border border-neutral-100 my-10"></div>
                {/* cover art */}
                <div>
                  <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading mt-15">
                    Proof of Address
                  </h1>
                  <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 ">
                    Upload documents such as utility bill, bank statement, etc.,
                    with valid address.
                  </p>
                  <div className="flex items-center justify-center w-full">
                    <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                      <div className="flex flex-col max-sm:w-full gap-2">
                        <div className="flex gap-1">
                          <h4 className="text-sm font-bold leading-[24px] tracking-[-0.5px] text-main-heading">
                            image File <span className="text-red-500">*</span>
                          </h4>
                          {/* <Image
                            priority={false}
                            loading="lazy"
                            src="/required.svg"
                            alt="a star marking this field as required"
                            width={0}
                            height={0}
                            className="w-2 -mt-3 "
                          /> */}
                        </div>
                        <div className="flex items-center justify-center w-64 md:w-80">
                          <label
                            htmlFor="address_image"
                            className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                          >
                            <div
                              className={
                                "w-[50%] flex items-center justify-center rounded-2xl text-white border border-neutral-100" +
                                (!verificationForm.address_image &&
                                  " bg-neutral-50 ")
                              }
                            >
                              <Image
                                src={
                                  addressImage
                                    ? addressImage
                                    : "/document-upload.svg"
                                }
                                width={60}
                                height={60}
                                alt="music note icon"
                                className={
                                  verificationForm.address_image
                                    ? " w-full object-cover min-w-15 h-15"
                                    : undefined
                                }
                              />
                            </div>
                            <div className="w-[50%]">
                              {!verificationForm.address_image ? (
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-bold text-text-body">
                                    Supported Files:
                                  </span>{" "}
                                  JPG, PNG
                                </p>
                              ) : (
                                <p className="font-bold text-[16px] text-[#494949] truncate">
                                  <span className="font-semibold">
                                    {verificationForm.address_image &&
                                      verificationForm.address_image.name}
                                  </span>
                                </p>
                              )}
                            </div>
                            <input
                              id="address_image"
                              name="address_image"
                              type="file"
                              accept="image/png,image/jpeg"
                              className="hidden"
                              onChange={handleChange}
                              disabled={!wantsToEdit || isVerified}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className=" font-normal text-xs leading-[20px] text-warning-600 -tracking-[0.5px] py-1">
                  Verification helps secure your account and enable payouts.
                  Reviews typically take 24–48 hours.
                </p>
              </div>
            </div>
          </div>
          {/* buttons */}
          <div className="bg-[#F0F0E7] border border-neutral-100 flex justify-end items-center gap-5 h-20 pr-10 fixed bottom-0 z-2 left-0 w-full">
            {(wantsToEdit || isVerified) && (
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
              disabled={isVerified}
              onClick={() => {
                wantsToEdit ? handleSubmit() : setWantsToEdit(true);
              }}
              className={
                "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-white bg-primary-500 "
              }
            >
              {wantsToEdit ? "Save Changes" : "Update"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Verification;
