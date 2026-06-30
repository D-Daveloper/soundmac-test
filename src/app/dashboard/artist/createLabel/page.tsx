"use client";
import Input from "@/app/components/input/Input";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { CreateLabelForm } from "@/app/type";
import UseAxios from "@/util/customHooks/UseAxios";
import { useAuthUser } from "@/util/customHooks/useQueries";
import { isAxiosError } from "axios";
import { LockKeyhole } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const Page = () => {
  const { data, isLoading } = useAuthUser();
  const api = UseAxios();
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [isNotLabel, setisNotLabel] = useState(false);
  const dashboardContext = useContext(DashboardContext);
  const [issubmitting, setissubmitting] = useState(false);
  const [labelForm, setlabelForm] = useState<CreateLabelForm>({
    label_name: "",
    first_name: "",
    last_name: "",
    instagram_profile_link: "",
    twitter_profile_link: "",
    linkedin_profile_link: "",
    tiktok_profile_link: "",
    label_logo: null,
    wants_to_change_name: false,
  });

  // useEffect(() => {
  //   dashboardContext?.setLayoutHeaderMessage("Create Label");
  // }, []);

  useEffect(() => {
    if (preview) {
      dashboardContext?.setHeader({
        title: "preview label",
        showBackButton: true,
        onBack: () => setPreview(false),
      });
    } else {
      dashboardContext?.setHeader({
        title: "Create Label",
        showBackButton: false,
        onBack: () => router.back(),
      });
    }
  }, [preview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, checked } = e.target;
    if (name === "wants_to_change_name") {
      setlabelForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "label_logo") {
      const file =
        e.target.files && e.target.files.length ? e.target.files[0] : null;
      setlabelForm((prev) => ({ ...prev, label_logo: file }));
      if (file) {
        setImage(URL.createObjectURL(file));
      }
    } else {
      setlabelForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (form: CreateLabelForm) => {
    console.log(form);
    if (!dashboardContext?.isPremium) {
      setisNotLabel(true);
      return;
    }
    if (!labelForm.label_name) {
      toast.warn("Label Name is required.");
      return;
    } else if (!labelForm.first_name) {
      toast.warn("first name is required.");
      return;
    } else if (!labelForm.last_name) {
      toast.warn("last name is required.");
      return;
    } else if (!labelForm.label_logo) {
      toast.warn("Label Logo is required.");
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value instanceof File) {
        console.log(key, value);

        formData.append(key, value);
      } else if (value) {
        formData.append(key, String(value));
      }
    });
    try {
      setissubmitting(true);
      const res = await api.post("users/label", formData, {
        headers: { "Content-Type": "multipart/formdata" },
      });
      setlabelForm({
        label_name: "",
        first_name: "",
        last_name: "",
        instagram_profile_link: "",
        twitter_profile_link: "",
        linkedin_profile_link: "",
        tiktok_profile_link: "",
        label_logo: null,
        wants_to_change_name: false,
      });
      setImage(null);
      toast.success(res.data.msg);
      router.push("/dashboard/artist/createArtist/");
    } catch (error) {
      if (isAxiosError(error)) {
        return;
      }
      toast.error("something went wrong");
    } finally {
      setPreview(false);
      setissubmitting(false);
    }
  };

  const handlePreview = (form: CreateLabelForm) => {
    console.log(form);
    if (preview === false) {
      const string_form = JSON.stringify(form);
      localStorage.setItem("labelForm", string_form);
      setPreview(true);
    } else {
      setPreview(false);
    }
  };

  useEffect(() => {
    const string_form = localStorage.getItem("labelForm");

    if (string_form) {
      const labelForm = JSON.parse(string_form);

      console.log(string_form);

      setlabelForm({
        ...labelForm,
        label_logo: null,
      });
    }
  }, []);

  useEffect(() => {
    if (data) {
      if (
        !data.premium ||
        data.type === "INDEPENDENT_ARTIST" ||
        data.type === "EMERGING_ARTIST"
      ) {
        setissubmitting(true);
        setisNotLabel(true);
        return;
      } else {
        setlabelForm((prev) => ({
          ...prev,
          first_name: data.firstName,
          last_name: data.lastName,
        }));
      }
    }
  }, [data]);

  return (
    <div className="bg-main-white h-[90dvh] w-full flex flex-col lg:pl-[280px]">
      {/* <button
        aria-label="go back"
        onClick={() => {
          router.back();
        }}
        className="bg-main-white/70 p-3 w-[48px] h-[48px] text-primary text-2xl rounded-full shadow-2xl shadow-black mb-5"
      >
        <Image
          src={"/arrow-left.svg"}
          height={32}
          width={32}
          alt="arrow left"
        />
      </button> */}
      {isLoading || !data || issubmitting ? (
        <InlineLoadingScreen />
      ) : (
        <>
          <div className="flex gap-8 px-2 lg:px-0 py-5">
            {!preview ? (
              <div className="flex-3 overflow-auto flex flex-col gap-10 px-2 lg:px-1 pb-20 lg:pb-5 lg:h-[68dvh]">
                {/* Song info */}
                <div>
                  <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                    Label Owner Profile
                  </h1>
                  <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                    Set up a label profile to start releasing and managing music
                    on Soundmac.
                  </p>
                  <div className="w-full flex flex-wrap justify-between gap-y-5 mt-5 items-end">
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <Input
                        value={labelForm.label_name}
                        title={"Label Name"}
                        type={"text"}
                        name={"label_name"}
                        placeholder={"Enter Label Name"}
                        updateValue={handleChange}
                        required={true}
                      />
                    </div>

                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <Input
                        value={labelForm.first_name}
                        title={"First Name"}
                        type={"text"}
                        name={"first_name"}
                        placeholder={"Enter Label First Name"}
                        updateValue={handleChange}
                        required={labelForm.wants_to_change_name}
                        disabled={!labelForm.wants_to_change_name}
                      />
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <Input
                        value={labelForm.last_name}
                        title={"Last Name"}
                        type={"text"}
                        name={"last_name"}
                        placeholder={"Enter Last Name"}
                        updateValue={handleChange}
                        required={labelForm.wants_to_change_name}
                        disabled={!labelForm.wants_to_change_name}
                      />
                    </div>
                    <div className="flex justify-between flex-col w-[40%] max-sm:w-full">
                      <div className="flex w-fit gap-2 items-center">
                        <input
                          aria-label="another distribution check box"
                          type="checkbox"
                          className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
                          name="wants_to_change_name"
                          checked={labelForm.wants_to_change_name}
                          onChange={handleChange}
                        />
                        <p className="leading-6 text-sm font-normal">
                          Want to change the first and last name to something
                          else.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* border line */}
                <div className="border border-neutral-100"></div>
                {/* cover art */}
                <div>
                  <div className="flex items-center justify-center w-60">
                    <div className="w-full flex flex-wrap justify-between gap-y-10">
                      <div className="flex flex-col max-sm:w-full gap-2">
                        <div className="flex gap-1">
                          <h2 className="text-base font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                            Label Logo <span className="text-red-500">*</span>
                          </h2>
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
                            htmlFor="label_logo"
                            className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                          >
                            <div
                              className={
                                "w-[50%] flex items-center justify-center p-3 rounded-2xl  text-white border border-neutral-100" +
                                (!labelForm.label_logo && " bg-neutral-50 ")
                              }
                            >
                              <Image
                                src={image ? image : "/document-upload.svg"}
                                width={60}
                                height={60}
                                alt="music note icon"
                                className={
                                  labelForm.label_logo
                                    ? " w-full object-fit min-w-15 h-15 overflow-hidden"
                                    : undefined
                                }
                              />
                            </div>
                            <div className="w-[50%]">
                              {!labelForm.label_logo ? (
                                <p className="mb-2 text-xs text-gray-500">
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
                                    {labelForm.label_logo?.name}
                                  </span>
                                </p>
                              )}
                            </div>
                            <input
                              id="label_logo"
                              name="label_logo"
                              type="file"
                              accept="image/png,image/jpeg"
                              className="hidden"
                              onChange={handleChange}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* border line */}
                <div className="border border-neutral-100"></div>
                {/* platform id  */}
                <div>
                  <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary">
                    Platform IDs
                  </h2>
                  <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-1 mb-3 sm:max-w-[40%]">
                    Add Social Media Links for your Label (if any).
                  </p>

                  <div className="w-full flex flex-wrap justify-between gap-y-5">
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <Input
                        value={labelForm.instagram_profile_link}
                        title={"Instagram Profile Link"}
                        type={"text"}
                        name={"instagram_profile_link"}
                        placeholder={"Enter Instagram Profile Link"}
                        updateValue={handleChange}
                      />
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <Input
                        value={labelForm.twitter_profile_link}
                        title={"Twitter(X) Profile Link"}
                        type={"text"}
                        name={"twitter_profile_link"}
                        placeholder={"Enter Twitter Profile Link"}
                        updateValue={handleChange}
                      />
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <Input
                        value={labelForm.tiktok_profile_link}
                        title={"TikTok Profile Link"}
                        type={"text"}
                        name={"tiktok_profile_link"}
                        placeholder={"Enter TikTok Profile Link"}
                        updateValue={handleChange}
                      />
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <Input
                        value={labelForm.linkedin_profile_link}
                        title={"LinkedIn Profile Link"}
                        type={"text"}
                        name={"linkedin_profile_link"}
                        placeholder={"Enter LinkedIn Profile Link"}
                        updateValue={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // preview starts here
              <div className="flex-3 overflow-y-auto flex flex-col gap-10 px-2 pb-6 h-[64dvh] custom-scrollbar">
                <div>
                  <div className="flex items-center justify-between border-b md:border-none border-neutral-100 pb-4">
                    <h1 className="text-base font-bold tracking-tight text-main-heading">
                      Label Summary
                    </h1>
                    <button
                      onClick={() => setPreview(!preview)}
                      className="text-sm font-semibold text-primary hover:underline transition-all mr-2"
                    >
                      Edit Details
                    </button>
                  </div>

                  {/* Artwork / Logo file preview */}
                  <div className="w-full flex flex-col gap-y-3">
                    <p className="font-bold text-[#000000] text-sm leading-[18px] tracking-[0.5px]">
                      Artwork File
                    </p>
                    <div className="w-64 md:w-80 h-24 flex gap-4 items-center p-4 rounded-2xl border border-neutral-200 bg-white">
                      {image ? (
                        <>
                          <div className="w-20 h-20 relative shrink-0 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                            <Image
                              src={image}
                              fill
                              alt="music note icon"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-text-body font-bold text-sm truncate">
                              {labelForm.label_logo?.name}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-3 py-2 px-1">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
                            ⚠️
                          </div>
                          <p className="text-text-disable font-medium text-sm">
                            No image selected
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metadata Fields Grid */}
                <div className="text-[#103958] font-bold text-sm leading-[18px] tracking-[0.5px] grid grid-cols-2 gap-x-8 gap-y-6 px-4">
                  {/* Label Name */}
                  <div className="flex flex-col w-full">
                    <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
                      Label Name
                    </h2>
                    <div className="">
                      <p className="truncate text-text-body font-normal text-xs leading-[30px] tracking-[1px] min-h-[30px]">
                        {labelForm.label_name}
                      </p>
                      <div className="border border-neutral-100"></div>
                    </div>
                  </div>

                  {/* First Name */}
                  <div className="flex flex-col w-full">
                    <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
                      First Name
                    </h2>
                    <div className="">
                      <p className="truncate text-text-body font-normal text-xs leading-[30px] tracking-[1px] min-h-[30px]">
                        {labelForm.first_name}
                      </p>
                      <div className="border border-neutral-100"></div>
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col w-full">
                    <h2 className="text-xs font-bold tracking-wider text-[#103958] capitalize">
                      Last Name
                    </h2>
                    <div className="">
                      <p className="truncate text-text-body font-normal text-xs leading-[30px] tracking-[1px] min-h-[30px]">
                        {labelForm.last_name}
                      </p>
                      <div className="border border-neutral-100"></div>
                    </div>
                  </div>

                  {/* Instagram Profile Link */}
                  <div className="flex flex-col w-full">
                    <h2 className="text-xs font-bold tracking-tighter text-[#103958] capitalize">
                      Instagram Profile Link
                    </h2>
                    <div className="">
                      <p className="truncate text-text-body font-normal text-xs leading-[30px] tracking-[1px] min-h-[30px]">
                        {labelForm.instagram_profile_link}
                      </p>
                      <div className="border border-neutral-100"></div>
                    </div>
                  </div>

                  {/* Twitter (X) Profile Link */}
                  <div className="flex flex-col w-full">
                    <h2 className="text-xs font-bold tracking-tighter text-[#103958] capitalize ">
                      Twitter (X) Profile Link
                    </h2>
                    <div className="">
                      <p className="truncate text-text-body font-normal text-xs leading-[30px] tracking-[1px] min-h-[30px]">
                        {labelForm.twitter_profile_link}
                      </p>
                      <div className="border border-neutral-100"></div>
                    </div>
                  </div>

                  {/* TikTok Profile Link */}
                  <div className="flex flex-col w-full">
                    <h2 className="text-xs font-bold tracking-tighter text-[#103958] capitalize">
                      TikTok Profile Link
                    </h2>
                    <div className="pb-1">
                      <p className="truncate text-text-body font-normal text-xs leading-[30px] tracking-[1px] min-h-[30px]">
                        {labelForm.tiktok_profile_link}
                      </p>
                      <div className="border border-neutral-100"></div>
                    </div>
                  </div>

                  {/* LinkedIn Profile Link */}
                  <div className="flex flex-col w-full">
                    <h2 className="text-xs font-bold tracking-tighter text-[#103958] capitalize">
                      LinkedIn Profile Link
                    </h2>
                    <div className="">
                      <p className="truncate text-text-body font-normal text-xs leading-[30px] tracking-[1px] min-h-[30px]">
                        {labelForm.linkedin_profile_link}
                      </p>
                      <div className="border border-neutral-100"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-neutral-50 border-2 border-neutral-100 flex-1 rounded-lg p-2 max-xl:hidden h-70 flex flex-col ">
              <div className="w-full h-[80%] flex-2">
                {labelForm.label_logo ? (
                  <Image
                    src={image ? image : ""}
                    width={0}
                    height={0}
                    alt="preview of the artist song cover"
                    className="rounded-lg w-full h-full object-fit"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-100 relative z-[10]">
                    <p className="font-bold text-[16px] leading-[20px] text-text-disable tracking-[0.5px] absolute top-1/2 text-center w-full">
                      No Preview Available
                    </p>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-normal leading-[30px] tracking-[-1px] text-main-heading text-2xl">
                  {labelForm.label_name || "Name"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#F0F0E7] border border-neutral-100 flex justify-end items-center gap-5 h-20 pr-10 fixed bottom-0 z-2 left-0 w-full">
            <button
              disabled={issubmitting}
              onClick={() => {
                handleSubmit(labelForm);
              }}
              className={
                "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-white bg-primary-500 " +
                (!preview && " hidden ") +
                (issubmitting && " bg-primary hover:bg-primary/90")
              }
            >
              <div
                className={
                  "flex justify-center mr-1 " + (!issubmitting && " hidden")
                }
              >
                <div className="w-5 h-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              Create
            </button>
            <button
              onClick={() => {
                handlePreview(labelForm);
              }}
              className={
                "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-white bg-primary-500 "
              }
            >
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
        </>
      )}
      <div
        className={
          isNotLabel
            ? " fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm  "
            : " hidden"
        }
      >
        <div className="flex flex-col gap-5 w-fit py-5 px-5 justify-center items-center bg-neutral-100  rounded-xl shadow-2xl max-w-[350px]">
          <div className="flex flex-col gap-2 mb-2 justify-center items-center">
            <LockKeyhole size={80} color="#999" strokeWidth={2} />
            <h3 className="text-xl font-semibold tracking-[-0.5px] text-main-heading">
              Label Subscription Required{" "}
            </h3>
            <p className="text-p font-normal text-sm leading-4 -tracking-[0.5px] text-center">
              This feature is available only to subscribed label accounts.
              <br /> Pick a label plan to access this feature.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                // setisNotLabel(false);
                router.push("/dashboard");
              }}
              className={
                "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm  bg-transparent border-2 border-primary-500 text-[#494949]"
              }
            >
              Not Now
            </button>
            <Link
              href={"/pricing"}
              aria-label="go to pricing page"
              className={
                "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white!"
              }
            >
              View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
Page;
