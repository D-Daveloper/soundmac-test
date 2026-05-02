"use client";
import CheckboxSelect from "@/app/components/checkBox/CheckBoxSelect";
import CheckboxSelectDsp from "@/app/components/checkBox/CheckBoxSelectDsp";
import { SelectDate } from "@/app/components/datepicker/SelectDate";
import Input from "@/app/components/input/Input";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { languagesList, timeZones } from "@/app/constant";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import type { AlbumForm, SongForm } from "@/app/type";
import { genreList, territories } from "@/app/utils/constants";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import {
  useGetDPMDsp,
  useGetUserArtistsNames,
} from "@/util/customHooks/useQueries";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import { isAlbumFormValid } from "@/util/middleware/functions";
import { isAxiosError } from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const AlbumForm = () => {
  const dashboardContext = useContext(DashboardContext);
  const router = useRouter();
  const { isLoading, data, isFetching, isPending, isRefetching, isError } =
    useGetUserArtistsNames();
  const {
    isLoading: isLoadingDsp,
    data: dspData,
    isError: isErrorDsp,
  } = useGetDPMDsp();
  const { deleteParam } = useTabQuery();
  const api = UseAxios();
  const [image, setImage] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [date, setDate] = useState({
    fromYear: new Date(),
    toYear: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
  });
  const futureYears = Array.from({ length: 11 }, (_, i) =>
    (new Date().getFullYear() + i).toString(),
  );
  const pastYears = Array.from({ length: 21 }, (_, i) =>
    (new Date().getFullYear() - (i + 1)).toString(),
  );
  const years = [
    ...pastYears.reverse().filter((_, i) => _ !== "2025"),
    "2025",
    ...futureYears,
  ];
  const [preview, setPreview] = useState(false);
  const [albumForm, setAlbumForm] = useState<AlbumForm>({
    title: "",
    genre: "",
    language: "",
    artist: "",
    release_date: undefined,
    preOrderDate: undefined,
    pre_order_check: false,
    another_distribution_check: false,
    territories: [],
    music_image: null,
    dsp: [],
    upc: "",
    copyRightHolder: "",
    copyRightYear: "",
    number_of_track: "",
    timeZone: { label: "", value: "", name: "" },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, checked } = e.target;
    if (name === "another_distribution_check" || name === "pre_order_check") {
      setAlbumForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "music_image") {
      const file =
        e.target.files && e.target.files.length ? e.target.files[0] : null;
      setAlbumForm((prev) => ({ ...prev, music_image: file }));
      if (file) {
        setImage(URL.createObjectURL(file));
      }
    } else {
      setAlbumForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (form: AlbumForm, action: "draft" | "upload") => {
    try {
      if (!dashboardContext?.isPremium) {
        dashboardContext?.setOpenUpgradePopUp(true);
        return;
      }
      setIsSubmittingForm(true);
      console.log(form);
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(`${key}`, JSON.stringify(v)));
        } else if (key === "timeZone" && typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      formData.append("action", action);
      console.log(...formData);
      let res;
      if (action === "upload") {
        const validForm = isAlbumFormValid(form);
        if (validForm != "true") return toast.warn(validForm);
        res = await api.post("album", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.post("album/draft", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      toast.success("You're getting redirected to add tracks to your album.");
      localStorage.removeItem("albumForm");
      setAlbumForm({
        title: "",
        genre: "",
        language: "",
        artist: "",
        release_date: undefined,
        preOrderDate: undefined,
        pre_order_check: false,
        another_distribution_check: false,
        territories: [],
        music_image: null,
        dsp: [],
        upc: "",
        copyRightHolder: "",
        copyRightYear: "",
        number_of_track: "",
        timeZone: { label: "", value: "", name: "" },
      });

      setImage(null);
      setPreview(false);
      if (action === "upload") {
        router.push(
          `/dashboard/music/manageRelease/${albumForm.title.trim().replaceAll(" ", "-")}`,
        );
      }
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

  const handlePreview = (form: AlbumForm) => {
    console.log(form);
    if (preview === false) {
      const string_form = JSON.stringify(form);
      localStorage.setItem("albumForm", string_form);
    }
    setPreview(!preview);
  };

  useEffect(() => {
    const string_form = localStorage.getItem("albumForm");

    if (string_form) {
      const albumForm = JSON.parse(string_form);

      setAlbumForm({
        ...albumForm,
        release_date: albumForm.release_date
          ? new Date(albumForm.release_date)
          : undefined,
        preOrderDate: albumForm.preOrderDate
          ? new Date(albumForm.preOrderDate)
          : undefined,
        music_image: null,
      });
    }
  }, []);

  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Upload Album");
  }, [dashboardContext]);

  if (isErrorDsp) {
    toast.error("Failed to load DSP list. Please refresh the page.");
    return <InlineLoadingScreen />;
  }

  return (
    <div className="bg-main-white h-full w-full flex flex-col lg:pl-[260px] px-5">
      {isLoading || isSubmittingForm || isLoadingDsp ? (
        <InlineLoadingScreen />
      ) : (
        !isLoading &&
        (!isError || data != undefined || !dspData) && (
          <>
            <button
              onClick={() => {
                deleteParam("type");
              }}
              className="bg-main-white/70 p-3 w-[48px] h-[48px] text-primary text-2xl rounded-full shadow-2xl shadow-black my-2"
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
                <div className="flex-3 overflow-auto flex flex-col gap-5 px-5 pb-30 min-h-[64dvh]">
                  {/* Song info */}
                  <div>
                    <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Album Information
                    </h1>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                      Provide the main details about your album to ensure it is
                      properly identified and distributed.
                    </p>
                    <div className="w-full flex flex-wrap justify-between gap-y-5 mt-10 ">
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <Input
                          value={albumForm.title}
                          title={"Album title"}
                          type={"text"}
                          name={"title"}
                          placeholder={"Enter Album Title"}
                          updateValue={handleChange}
                          required={true}
                        />
                        <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                          The title will appear on all streaming platforms.
                        </p>
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <div className="flex gap-1">
                          <p className="font-medium mb-2 sm:text-sm text-lg">
                            Genre
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
                            selected={albumForm.genre}
                            setSelected={(t) =>
                              setAlbumForm((prev) => ({ ...prev, genre: t }))
                            }
                            placeholder="Select Genre..."
                            options={genreList}
                            name="genre"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <div className="flex gap-1">
                          <p className="font-medium mb-2 sm:text-sm text-lg">
                            Language
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
                            selected={albumForm.language}
                            setSelected={(t) =>
                              setAlbumForm((prev) => ({ ...prev, language: t }))
                            }
                            placeholder="Select Language..."
                            options={languagesList}
                            name="language"
                          />
                        </div>
                        <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                          The main language of the lyrics.
                        </p>
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <Input
                          value={albumForm.number_of_track}
                          title={"No. of tracks"}
                          type={"text"}
                          name={"number_of_track"}
                          placeholder={"Enter the number of tracks"}
                          updateValue={handleChange}
                          required={true}
                        />
                        <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                          The Number of tracks expected to be in the album.
                        </p>
                        <p className="font-light italic text-error-500 text-xs leading-[18px] tracking-[0.5px]">
                          This can&apos;t be changed, except drafts
                        </p>
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <div className="flex gap-1">
                          <p className="font-medium mb-2 sm:text-sm text-lg">
                            Artist
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
                            selected={albumForm.artist}
                            setSelected={(t) =>
                              setAlbumForm((prev) => ({ ...prev, artist: t }))
                            }
                            placeholder="Select artist..."
                            options={data || []}
                            name="artist"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border border-neutral-100"></div>
                  {/* release details */}
                  <div>
                    <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Release Details
                    </h1>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                      Set how and when your album goes live.
                    </p>

                    <div>
                      <div className="w-full flex flex-wrap justify-between gap-y-5 mt-5">
                        <div className="flex flex-col w-[40%] max-sm:w-full">
                          <div className="flex">
                            <p className=" capitalize font-medium sm:text-sm text-lg">
                              Release Date
                            </p>
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
                          <SelectDate
                            disabled={false}
                            setDate={(date) =>
                              setAlbumForm((prev) => ({
                                ...prev,
                                release_date: date,
                              }))
                            }
                            value={albumForm.release_date}
                            type="first"
                            toYear={date.toYear}
                            fromYear={date.fromYear}
                          />
                          <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mt-1">
                            Release date must be 2 weeks ahead the upload date
                          </p>
                        </div>
                        <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                          <div className="flex">
                            <p className=" capitalize font-medium sm:text-sm text-lg mr-1">
                              Time Zones
                            </p>
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
                          <div className="w-full">
                            <Select
                              selected={albumForm.timeZone.label}
                              setSelected={(t) => {
                                // Find the timezone object where label matches the selected value (t)
                                const selectedTimeZone = timeZones.find(
                                  (item) => item.label === t,
                                );

                                // Update form with the value (or full object if needed)
                                setAlbumForm((prev) => ({
                                  ...prev,
                                  timeZone: selectedTimeZone
                                    ? selectedTimeZone
                                    : { label: "", value: "", name: "" },
                                }));
                              }}
                              placeholder="Select TimeZone..."
                              options={timeZones.map((item) => item.label)}
                              name="timeZone"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                          <div className="flex">
                            <p className=" capitalize font-medium sm:text-sm text-lg">
                              territories{" "}
                            </p>
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

                          <CheckboxSelect
                            title="Select Territories"
                            options={territories}
                            selected={albumForm.territories}
                            onChange={(s: string[]) => {
                              setAlbumForm((prev) => ({
                                ...prev,
                                territories: s,
                              }));
                            }}
                          />
                        </div>
                        <div className="justify-between w-full flex max-sm:flex-col">
                          <div className="flex w-fit gap-2 items-center">
                            <input
                              type="checkbox"
                              className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
                              name="pre_order_check"
                              checked={albumForm.pre_order_check}
                              onChange={handleChange}
                            />
                            <p className="leading-6 text-sm sm:text-lg font-medium">
                              Pre-Order (optional)
                            </p>
                          </div>
                          <div className="flex flex-col w-[40%] max-sm:w-full">
                            <SelectDate
                              disabled={!albumForm.pre_order_check}
                              setDate={(date) =>
                                setAlbumForm((prev) => ({
                                  ...prev,
                                  preOrderDate: date,
                                }))
                              }
                              value={albumForm.preOrderDate}
                              releaseDate={albumForm.release_date}
                              type="second"
                              toYear={date.toYear}
                              fromYear={date.fromYear}
                            />
                            <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                              Pre order date must be 3 weeks before the release
                              date
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/*  */}
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100"></div>

                  {/*  DSP*/}
                  <div>
                    <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Distribution Platforms
                    </h1>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                      Choose the platforms where your release will be available.
                    </p>
                    <div className="w-full flex flex-wrap justify-between gap-y-5 mt-10 ">
                      <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                        <div className="flex">
                          <p className=" capitalize font-medium sm:text-sm text-lg">
                            DSPs
                          </p>
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
                        <CheckboxSelectDsp
                          title="Select DSPs"
                          options={
                            dspData
                              ? dspData.map((dsp) => ({
                                  label: dsp.store_name,
                                  value: dsp.id,
                                }))
                              : []
                          }
                          selected={albumForm.dsp}
                          onChange={(s: { label: string; value: number }[]) => {
                            setAlbumForm((prev) => ({ ...prev, dsp: s }));
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* border line */}
                  <div className="border border-neutral-100"></div>

                  {/* cover art */}
                  <div>
                    <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Cover Art
                    </h1>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                      Add eye-catching artwork that represents your single.{" "}
                    </p>
                    <div className="flex items-center justify-center w-60">
                      <div className="w-full flex flex-wrap justify-between gap-y-5 mt-10 ">
                        <div className="flex flex-col max-sm:w-full gap-2">
                          <div className="flex gap-1">
                            <h4 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                              Artwork File
                            </h4>
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
                              htmlFor="music_image"
                              className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-50"
                            >
                              <div
                                className={
                                  "w-[50%] flex items-center justify-center p-3 rounded-2xl  text-white border border-neutral-100" +
                                  (!albumForm.music_image && " bg-neutral-50 ")
                                }
                              >
                                <Image
                                  src={image ? image : "/document-upload.svg"}
                                  width={60}
                                  height={60}
                                  alt="music note icon"
                                  className={
                                    albumForm.music_image
                                      ? " w-full object-cover min-w-15 h-15"
                                      : undefined
                                  }
                                />
                              </div>
                              <div className="w-[50%]">
                                {!albumForm.music_image ? (
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
                                      {albumForm.music_image?.name}
                                    </span>
                                  </p>
                                )}
                              </div>
                              <input
                                id="music_image"
                                name="music_image"
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

                  {/* meta data */}
                  <div>
                    <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary">
                      Album Metadata
                    </h2>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                      Provide additional details to optimize your release.
                    </p>
                    <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                      Enter these details only if you are transferring from
                      another distributor
                    </p>
                    {/* <div className="flex w-fit gap-2 items-center mb-5">
                <input
                  type="checkbox"
                  className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
                  name="another_distribution_check"
                  checked={albumForm.another_distribution_check}
                  onChange={handleChange}
                />
                <p className="leading-6 text-sm font-medium">
                  Pitch to an Editorial Playlist?
                </p>
              </div> */}
                    <div className="flex w-fit gap-2 items-center mb-5">
                      <input
                        type="checkbox"
                        className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
                        name="another_distribution_check"
                        checked={albumForm.another_distribution_check}
                        onChange={handleChange}
                      />
                      <p className="leading-6 text-sm font-medium">
                        Transferring from another distributor?
                      </p>
                    </div>
                    <div className="w-full flex flex-wrap justify-between gap-y-5">
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <Input
                          value={albumForm.upc}
                          title={"upc"}
                          type={"text"}
                          name={"upc"}
                          placeholder={"Enter upc"}
                          updateValue={handleChange}
                          disabled={!albumForm.another_distribution_check}
                          uppercase={true}
                          required={albumForm.another_distribution_check}
                        />
                        <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                          Don’t have this? Soundmac will generate for you.
                        </p>
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <Input
                          value={albumForm.copyRightHolder}
                          title={"Copy Right Holder"}
                          type={"text"}
                          name={"copyRightHolder"}
                          placeholder={"Enter Copy Right Holder"}
                          updateValue={handleChange}
                          disabled={false}
                          uppercase={false}
                          required={true}
                        />
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                        <div className="flex">
                          <p className=" capitalize font-medium sm:text-sm text-lg mr-1">
                            Copy Right Year
                          </p>
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
                        <div className="w-full">
                          <Select
                            selected={albumForm.copyRightYear}
                            setSelected={(t) =>
                              setAlbumForm((prev) => ({
                                ...prev,
                                copyRightYear: t,
                              }))
                            }
                            placeholder="Select Copy right year..."
                            options={years}
                            name="copyRightYear"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-3 overflow-auto flex flex-col gap-20 px-1 pb-3 h-[64dvh]">
                  <div>
                    <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Album Summary
                    </h1>
                    {/* image */}
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
                                className="min-w-32 h-32 object-cover rounded-2xl flex-1"
                              />
                            </div>
                            <p className="text-text-body font-bold text-sm leading-[18px] tracking-[0.5px] truncate min-w-[80%] flex-2">
                              {albumForm.music_image?.name}
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
                      <h2>Album Title</h2>
                      <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                        {albumForm.title}
                      </p>
                      {/* border line */}
                      <div className="border border-neutral-100"></div>
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <h2>Genre</h2>
                      <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                        {albumForm.genre}
                      </p>
                      {/* border line */}
                      <div className="border border-neutral-100"></div>
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <h2>Language</h2>
                      <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                        {albumForm.language}
                      </p>
                      {/* border line */}
                      <div className="border border-neutral-100"></div>
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <h2>Main Artist</h2>
                      <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                        {albumForm.artist}
                      </p>
                      {/* border line */}
                      <div className="border border-neutral-100"></div>
                    </div>

                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <h2>Territories</h2>
                      <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                        {albumForm.territories.join(",")}
                      </p>
                      {/* border line */}
                      <div className="border border-neutral-100"></div>
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <h2>UPC</h2>
                      <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                        {albumForm.upc}
                      </p>
                      {/* border line */}
                      <div className="border border-neutral-100"></div>
                    </div>

                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <h2>Release date</h2>
                      <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                        {albumForm.release_date?.toLocaleDateString() || ""}
                      </p>
                      {/* border line */}
                      <div className="border border-neutral-100"></div>
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <h2>Preorder Start date</h2>
                      <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                        {albumForm.preOrderDate?.toLocaleDateString() || ""}
                      </p>
                      {/* border line */}
                      <div className="border border-neutral-100"></div>
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <h2>Copy Right Holder</h2>
                      <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                        {albumForm.copyRightHolder}
                      </p>
                      {/* border line */}
                      <div className="border border-neutral-100"></div>
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <h2>Copy Right Year</h2>
                      <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                        {albumForm.copyRightYear}
                      </p>
                      {/* border line */}
                      <div className="border border-neutral-100"></div>
                    </div>
                  </div>
                </div>
              )}
              {/* the image side bar */}
              <div className="bg-neutral-50 border-2 border-neutral-100 flex-1 rounded-lg p-2 max-xl:hidden h-70 flex flex-col ">
                <div className="w-full h-[80%] flex-2">
                  {albumForm.music_image ? (
                    <Image
                      src={image ? image : ""}
                      width={0}
                      height={0}
                      alt="preview of the artist album cover"
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
                    {albumForm.title || "Title"}
                  </p>
                  <p className="font-light leading-[20px] truncate max-w-50 tracking-[-0.5px] text-main-heading text-[16px]">
                    {albumForm.artist || "Artist"}
                  </p>
                </div>
              </div>
            </div>
            {/* buttons */}
            <div className="bg-[#F0F0E7] border border-neutral-100 flex justify-end items-center gap-5 h-20 pr-10 fixed bottom-0 z-2 left-0 w-full">
              <button
                onClick={() => {
                  handleSubmit(albumForm, "draft");
                }}
                className={
                  "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 border-3 border-primary text-main-heading flex " +
                  (!preview && " hidden")
                }
              >
                {" "}
                Save as Draft
              </button>
              <button
                onClick={() => {
                  handleSubmit(albumForm, "upload");
                }}
                className={
                  "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-white bg-primary-500 " +
                  (!preview && " hidden")
                }
              >
                Continue
              </button>
              <button
                onClick={() => {
                  handlePreview(albumForm);
                }}
                className={
                  "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-white bg-primary-500 "
                }
              >
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default AlbumForm;
