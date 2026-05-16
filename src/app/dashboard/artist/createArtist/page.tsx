"use client";
import Input from "@/app/components/input/Input";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import type { CreateArtistForm } from "@/app/type";
import { useCreatArtistMutation } from "@/util/customHooks/useMutations";
import { isArtistFormValid } from "@/util/middleware/functions";
import { isAxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const CreateArtistForm = () => {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [showSuccessPage, setshowSuccessPage] = useState(false);
  const { mutateAsync, isPending } = useCreatArtistMutation();
  const dashboardContext = useContext(DashboardContext);
  const [artistForm, setArtistForm] = useState<CreateArtistForm>({
    artist_name: "",
    apple_id: "",
    spotify_id: "",
    artist_image: null,
    hasPlatformId: false,
  });
  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Create Artist");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, checked } = e.target;
    if (name === "hasPlatformId") {
      setArtistForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "artist_image") {
      const file =
        e.target.files && e.target.files.length ? e.target.files[0] : null;
      setArtistForm((prev) => ({ ...prev, artist_image: file }));
      if (file) {
        setImage(URL.createObjectURL(file));
      }
    } else {
      setArtistForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (form: CreateArtistForm) => {
    console.log(form);
    if (!dashboardContext?.isPremium) {
      dashboardContext?.setOpenUpgradePopUp(true);
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (typeof value === "boolean" || typeof value === "string") {
        formData.append(key, String(value));
      }
    });
    if (artistForm.artist_image)
      formData.append("artist_image", artistForm.artist_image);
    console.log(...formData);
    try {
      await mutateAsync(form);
      setshowSuccessPage(true);
    } catch (error) {
      if (isAxiosError(error)) {
        return;
      }
      toast.error("something went wrong");
    } finally {
      setPreview(false);
    }
  };

  const createAnother = () => {
    setArtistForm({
      artist_name: "",
      apple_id: "",
      spotify_id: "",
      artist_image: null,
      hasPlatformId: false,
    });
    setImage(null);
    setshowSuccessPage(false);
  };

  const handlePreview = (form: CreateArtistForm) => {
    console.log(form);

    if (preview === false) {
      const validForm = isArtistFormValid(form);
      if (validForm != "true") return toast.warn(validForm);
      const string_form = JSON.stringify(form);
      localStorage.setItem("artistForm", string_form);
    }
    setPreview(!preview);
  };

  useEffect(() => {
    const string_form = localStorage.getItem("artistForm");

    if (string_form) {
      const artistForm = JSON.parse(string_form);

      console.log(string_form);

      setArtistForm({
        ...artistForm,
        artist_image: null,
      });
    }
  }, []);

  return (
    <div className="bg-main-white h-[90dvh] w-full flex flex-col lg:pl-[260px]">
      <button
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
      </button>
      <div className="flex gap-8 px-5 py-5">
        {!preview ? (
          !showSuccessPage ? (
            <div className="flex-3 overflow-auto flex flex-col gap-10 px-5 pb-3 h-[64dvh]">
              {/* Song info */}
              <div>
                <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                  Artist Profile
                </h1>
                <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                  Set up an artist profile to start releasing and managing music
                  on Soundmac.
                </p>
                <div className="w-full flex flex-wrap justify-between gap-y-10 mt-15 ">
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={artistForm.artist_name}
                      title={"Artist Name"}
                      type={"text"}
                      name={"artist_name"}
                      placeholder={"Enter Artist Name"}
                      updateValue={handleChange}
                      required={true}
                    />
                    <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                      The title will appear on all streaming platforms.
                    </p>
                  </div>
                </div>
              </div>
              {/* border line */}
              <div className="border border-neutral-100"></div>
              {/* cover art */}
              <div>
                <h2 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                  Upload your profile picture.
                </h2>
                <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                  Upload your profile picture.
                </p>
                <div className="flex items-center justify-center w-60">
                  <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                    <div className="flex flex-col max-sm:w-full gap-2">
                      <div className="flex gap-1">
                        <h3 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                          Artwork File
                        </h3>
                        <Image
                          priority={false}
                          loading="lazy"
                          src="/required.svg"
                          alt="a star marking this field as required"
                          width={0}
                          height={0}
                          className="w-2 -mt-3 "
                        />
                      </div>
                      <div className="flex items-center justify-center w-60">
                        <label
                          htmlFor="artist_image"
                          className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                        >
                          <div
                            className={
                              "w-[50%] flex items-center justify-center p-3 rounded-2xl  text-white border border-neutral-100" +
                              (!artistForm.artist_image && " bg-neutral-50 ")
                            }
                          >
                            <Image
                              src={image ? image : "/document-upload.svg"}
                              width={60}
                              height={60}
                              alt="music note icon"
                              className={
                                artistForm.artist_image
                                  ? " w-full object-cover min-w-15 h-15 overflow-hidden"
                                  : undefined
                              }
                            />
                          </div>
                          <div className="w-[50%]">
                            {!artistForm.artist_image ? (
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
                                  {artistForm.artist_image?.name}
                                </span>
                              </p>
                            )}
                          </div>
                          <input
                            id="artist_image"
                            name="artist_image"
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
                <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                  Link your artist profile to streaming platforms.
                </p>
                <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                  Enter these details only if you are transferring from another
                  distributor
                </p>
                <div className="flex justify-between">
                  <div className="flex w-fit gap-2 items-center mb-5">
                    <input
                      aria-label="another distribution check box"
                      type="checkbox"
                      className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
                      name="hasPlatformId"
                      checked={artistForm.hasPlatformId}
                      onChange={handleChange}
                    />
                    <p className="leading-6 text-sm font-medium">
                      Do you have existing Platform IDs from another
                      distributor?
                    </p>
                  </div>
                </div>
                <div className="w-full flex flex-wrap justify-between gap-y-10">
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={artistForm.apple_id}
                      title={"Apple ID"}
                      type={"text"}
                      name={"apple_id"}
                      placeholder={"Enter Apple ID"}
                      updateValue={handleChange}
                      disabled={!artistForm.hasPlatformId}
                      required={artistForm.hasPlatformId}
                    />
                    <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                      Don’t have this? Soundmac will generate for you.
                    </p>
                  </div>
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={artistForm.spotify_id}
                      title={"spotify id"}
                      type={"text"}
                      name={"spotify_id"}
                      placeholder={"Enter spotify id"}
                      updateValue={handleChange}
                      disabled={!artistForm.hasPlatformId}
                      required={artistForm.hasPlatformId}
                    />
                    <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                      Don’t have this? Soundmac will generate for you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-full w-full h-full my-auto">
              <div className="xs:w-[70%] flex flex-col justify-center items-center min-h-full gap-5">
                <Image
                  alt="check mark"
                  width={100}
                  height={100}
                  src={"/tick-circle2.svg"}
                />
                <p className="text-main-heading font-normal text-xl leading-5 tracking-[0.5px] mt-3 text-center">
                  Artist profile created. Start uploading music, managing
                  releases, tracking royalties, and growing your audience.
                </p>
                <div className="bg-neutral-50 border border-neutral-100 p-2 rounded-lg flex gap-3 md:max-w-[30%] max-md:max-w-[70%] w-full">
                  <Image
                    alt="release image"
                    width={60}
                    height={60}
                    src={image ?? "/document-upload.svg"}
                    className="object-cover w-15 h-15 rounded-lg"
                  />
                  <div className="text-main-heading flex-1 line-clamp-1 flex items-center w-full">
                    <p className="text-xl font-normal w-full">
                      {artistForm.artist_name}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    type="button"
                    onClick={createAnother}
                    className={
                      "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm hover:bg-primary-500/10 border-2 border-primary-500 text-text-body"
                    }
                  >
                    Create Another
                  </button>
                  <Link
                    href={"/dashboard/artist/manageArtist"}
                    type="button"
                    className={
                      "px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white!"
                    }
                  >
                    Manage Artist
                  </Link>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="flex-3 overflow-auto flex flex-col gap-20 px-1 pb-3 h-[64dvh]">
            <div>
              <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                Artist Summary
              </h1>
              <div className="w-full flex flex-col gap-y-3 mt-15">
                <p className="font-bold text-[#000000] text-sm leading-[18px] tracking-[0.5px]">
                  Artwork File
                </p>
                <div className="max-w-70 max-h-32 flex gap-3 items-center justify-center p-19 rounded-4xl border-2 border-neutral-100">
                  {image ? (
                    <>
                      <div className="flex-1 w-full">
                        <Image
                          src={image ? image : ""}
                          width={100}
                          height={150}
                          alt="music note icon"
                          className="min-w-32 h-32 object-contain rounded-2xl flex-1"
                        />
                      </div>
                      <p className="text-text-body font-bold text-sm leading-[18px] tracking-[0.5px] truncate min-w-[80%] flex-2">
                        {artistForm.artist_image?.name}
                      </p>
                    </>
                  ) : (
                    <p className="text-text-body font-bold text-sm leading-[18px] tracking-[0.5px] truncate ">
                      No image Selected
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="text-[#103958] font-bold text-sm leading-[18px] tracking-[0.5px] grid grid-cols-2 gap-16 max-xs:grid-cols-1">
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <h2>Artist Name</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  {artistForm.artist_name}
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>

              <div className="flex flex-col w-[40%] max-sm:w-full">
                <h2>Apple ID</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  {artistForm.apple_id}
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <h2>Spotify ID</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  {artistForm.spotify_id}
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>
            </div>
          </div>
        )}
        <div className="bg-neutral-50 border-2 border-neutral-100 flex-1 rounded-lg p-2 max-xl:hidden h-70 flex flex-col ">
          <div className="w-full h-[80%] flex-2">
            {artistForm.artist_image ? (
              <Image
                src={image ? image : ""}
                width={0}
                height={0}
                alt="preview of the artist song cover"
                className="rounded-lg w-full h-full object-cover"
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
            <p className="font-normal leading-[30px] truncate max-w-50 tracking-[-1px] text-main-heading text-2xl">
              {artistForm.artist_name || "Name"}
            </p>
          </div>
        </div>
      </div>

      {!showSuccessPage && (
        <div className="bg-[#F0F0E7] border border-neutral-100 flex justify-end items-center gap-5 h-20 pr-10 fixed bottom-0 z-2 left-0 w-full">
          <button
            disabled={isPending}
            onClick={() => {
              handleSubmit(artistForm);
            }}
            className={
              "font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-white bg-primary-500 " +
              (!preview && " hidden ") +
              (isPending && " bg-primary hover:bg-primary/90")
            }
          >
            <div
              className={
                "flex justify-center mr-1 " + (!isPending && " hidden")
              }
            >
              <div className="w-5 h-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            Create
          </button>
          <button
            onClick={() => {
              handlePreview(artistForm);
            }}
            className={
              "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-white bg-primary-500 "
            }
          >
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateArtistForm;
