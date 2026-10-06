"use client";
import CheckboxSelect from "@/app/components/checkBox/CheckBoxSelect";
import CheckboxSelectDsp from "@/app/components/checkBox/CheckBoxSelectDsp";
import { SelectDate } from "@/app/components/datepicker/SelectDate";
import DynamicInput from "@/app/components/input/DynamicInput";
import Input from "@/app/components/input/Input";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { ToggleSwitch } from "@/app/components/roundRadioButton/toggleButton";
import { languagesList, timeZones, years } from "@/app/constant";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import type {
  CheckboxOption,
  FeaturedArtist,
  Performer,
  Producer,
  SongForm,
  SongWriter,
} from "@/app/type";
import {
  compositionTypes,
  country_list,
  genreList,
  instrumentalSources,
  otherArtistRoles,
  performerRoles,
  producerRoles,
  territories,
} from "@/app/utils/constants";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import {
  useAuthUser,
  useGetDPMDsp,
  useGetUserArtistsNames,
} from "@/util/customHooks/useQueries";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import {
  isDateInPast,
  isSongFormValid,
  uploadTrack,
} from "@/util/middleware/functions";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ArrowRight, Info, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import SongPreview from "./SongPreview";

const SongForm = () => {
  const { data: user, isLoading: loadingUser } = useAuthUser();
  const queryClient = useQueryClient();
  const api = UseAxios();
  const router = useRouter();
  const dashboardContext = useContext(DashboardContext);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [showSuccessPage, setshowSuccessPage] = useState(false);
  const { isLoading, data, isFetching, isPending, isRefetching, isError } =
    useGetUserArtistsNames();
  const {
    isLoading: isLoadingDsp,
    data: dspData,
    isError: isErrorDsp,
  } = useGetDPMDsp();
  const [image, setImage] = useState<string | null>(null);
  const fromYear = new Date();
  const toYear = new Date(new Date().setFullYear(new Date().getFullYear() + 5));
  const [preview, setPreview] = useState(false);
  // const searchParams = useSearchParams();
  // const preview = searchParams.get("step") === "preview";

  const [songForm, setSongForm] = useState<SongForm>({
    title: "",
    genre: "",
    language: "",
    artist: "",
    releaseDate: undefined,
    preOrderDate: undefined,
    featuredArtist: [{ artistName: "", spotifyId: "", appleId: "", role: "" }],
    performer: [{ name: "", role: "" }],
    songWriter: [{ first_name: "", last_name: "" }],
    producer: [{ name: "", role: "" }],
    preOrderCheck: false,
    anotherDistributionCheck: false,
    territories: [],
    songAudio: null,
    musicImage: null,
    dsp: [],
    lyrics: "",
    startClip: "",
    isrc: "",
    upc: "",
    copyRightHolder: "",
    copyRightYear: "",
    explicitContent: false,
    timeZone: { label: "", value: "", name: "" },
    coverSong: false,
    license: null,
    compositionType: "",
    instrumentalSource: "",
    countryOfRecording: "",
    courtesyLine: "",
    providedBy: "",
  });
  // const { deleteParam } = useTabQuery();

  const addField = (field: keyof SongForm) => {
    switch (field) {
      case "featuredArtist":
        setSongForm((prev) => ({
          ...prev,
          featuredArtist: [
            ...prev.featuredArtist,
            { artistName: "", spotifyId: "", appleId: "", role: "" },
          ],
        }));
        break;
      case "songWriter":
        setSongForm((prev) => ({
          ...prev,
          songWriter: [...prev.songWriter, { first_name: "", last_name: "" }],
        }));
        break;
      case "performer":
        setSongForm((prev) => ({
          ...prev,
          performer: [...prev.performer, { name: "", role: "" }],
        }));
        break;
      case "producer":
        setSongForm((prev) => ({
          ...prev,
          producer: [...prev.producer, { name: "", role: "" }],
        }));
        break;

      default:
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, checked } = e.target;
    if (
      name === "anotherDistributionCheck" ||
      name === "preOrderCheck" ||
      name === "explicitContent"
    ) {
      setSongForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "songAudio") {
      const file =
        e.target.files && e.target.files.length ? e.target.files[0] : null;
      setSongForm((prev) => ({ ...prev, songAudio: file }));
    } else if (name === "musicImage") {
      const file =
        e.target.files && e.target.files.length ? e.target.files[0] : null;
      setSongForm((prev) => ({ ...prev, musicImage: file }));
      if (file) {
        setImage(URL.createObjectURL(file));
      }
    } else {
      setSongForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDynamicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
    field: keyof SongForm,
  ) => {
    const { name, value } = e.target;

    switch (field) {
      case "featuredArtist":
        setSongForm((prev) => {
          const updatedList = [...prev.featuredArtist];
          updatedList[index] = {
            ...updatedList[index],
            [name as keyof FeaturedArtist]: value,
          };
          return { ...prev, featuredArtist: updatedList };
        });
        break;
      case "songWriter":
        setSongForm((prev) => {
          const updatedList = [...prev.songWriter];
          updatedList[index] = {
            ...updatedList[index],
            [name as keyof SongWriter]: value,
          };
          return { ...prev, songWriter: updatedList };
        });
        break;
      case "performer":
        setSongForm((prev) => {
          const updatedList = [...prev.performer];
          updatedList[index] = {
            ...updatedList[index],
            [name as keyof Performer]: value,
          };
          return { ...prev, performer: updatedList };
        });
        break;
      case "producer":
        setSongForm((prev) => {
          const updatedList = [...prev.producer];
          updatedList[index] = {
            ...updatedList[index],
            [name as keyof Producer]: value,
          };
          return { ...prev, producer: updatedList };
        });
        break;

      default:
        break;
    }
  };

  const handleSubmit = async (form: SongForm, action: "draft" | "upload") => {
    if (!dashboardContext?.isPremium) {
      dashboardContext?.setOpenUpgradePopUp(true);
      return;
    }
    if (user?.type.includes("LABEL") === false) {
      songForm.providedBy = "SoundMac";
      songForm.courtesyLine = "SoundMac";
    } else {
      songForm.providedBy = songForm.providedBy || user?.label || "";
      songForm.courtesyLine = songForm.courtesyLine || user?.label || "";
    }
    console.log(songForm);
    setIsSubmittingForm(true);
    const formData = new FormData();
    if (form.title == "") {
      setIsSubmittingForm(false);
      return toast.warn("Song title is required");
    } else if (form.artist === "") {
      setIsSubmittingForm(false);
      return toast.warn("Main artist is required");
    }
    if (action === "upload") {
      const validForm = isSongFormValid(form);
      if (validForm != "true") {
        setIsSubmittingForm(false);
        return toast.warn(validForm);
      }
      if (form.songAudio) {
        const { upc, songS3Key, error, uploadId } = await uploadTrack(
          form.songAudio,
          form.upc,
          form.artist,
          form.anotherDistributionCheck,
          api,
        );
        if (error != null) {
          setIsSubmittingForm(false);
          toast.error(error);
          return;
        }
        form.s3keyAudio = songS3Key;
        form.uploadId = uploadId;
        form.upc = upc;
        form.songAudio = null;
      }
    }

    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value) && key != "territories") {
        value.forEach((v) => formData.append(`${key}`, JSON.stringify(v)));
      } else if (key === "territories" && Array.isArray(value)) {
        value.forEach((v) => formData.append(`${key}`, v));
      } else if (key === "timeZone" && typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else if (value) {
        formData.append(key, value);
      }
    });

    if (action === "draft") {
      if (
        form.featuredArtist.length === 1 &&
        form.featuredArtist.some((artist) => !artist.artistName || !artist.role)
      ) {
        formData.delete("featuredArtist");
      } else if (
        form.featuredArtist.length > 1 &&
        form.featuredArtist.some((artist) => !artist.artistName || !artist.role)
      ) {
        setIsSubmittingForm(false);
        return toast.error(
          "Artist name and role is required for other artists.",
        );
      }

      if (
        form.songWriter.length === 1 &&
        form.songWriter.some(
          (artist) => !artist.first_name || !artist.last_name,
        )
      ) {
        formData.delete("songWriter");
      } else if (
        form.songWriter.length > 1 &&
        form.songWriter.some(
          (artist) => !artist.first_name || !artist.last_name,
        )
      ) {
        setIsSubmittingForm(false);
        return toast.error(
          "First and last names are required for song writers",
        );
      }

      if (
        form.producer.length === 1 &&
        form.producer.some((artist) => !artist.name || !artist.role)
      ) {
        formData.delete("producer");
      } else if (
        form.producer.length > 1 &&
        form.producer.some((artist) => !artist.name || !artist.role)
      ) {
        setIsSubmittingForm(false);
        return toast.error("Name and role is required for producers.");
      }

      if (
        form.performer.length === 1 &&
        form.performer.some((artist) => !artist.name || !artist.role)
      ) {
        formData.delete("performer");
      } else if (
        form.performer.length > 1 &&
        form.performer.some((artist) => !artist.name || !artist.role)
      ) {
        setIsSubmittingForm(false);
        return toast.error("Name and role is required for performers");
      }
    }

    formData.append("action", action);
    let res;
    let idempotencyKey = localStorage.getItem("single-idempotency-key");
    if (!idempotencyKey) {
      idempotencyKey = crypto.randomUUID();
      localStorage.setItem("single-idempotency-key", idempotencyKey);
    }
    try {
      if (action === "upload") {
        toast.info(
          "Uploading song. This may take a while depending on your internet speed.",
        );
        res = await api.post("v1/music/song", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Idempotency-Key": idempotencyKey,
          },
        });
      } else {
        res = await api.post("v1/music/song/draft", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Idempotency-Key": idempotencyKey,
          },
        });
      }
      toast.success(res?.data?.msg);
      setshowSuccessPage(true);
      if (action === "upload") {
        queryClient.invalidateQueries({
          queryKey: ["notifications"],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["manageSongs"],
      });
      localStorage.removeItem("songForm");
      localStorage.removeItem("songWriter");
      localStorage.removeItem("featuredArtist");
      localStorage.removeItem("performer");
      localStorage.removeItem("producer");
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error);
        return;
      }
      toast.error("something went wrong.");
      songForm.musicImage = null;
      songForm.songAudio = null;
    } finally {
      localStorage.removeItem("single-idempotency-key");
      setIsSubmittingForm(false);
      setPreview(false);
    }
  };

  const handlePreview = (form: SongForm) => {
    console.log(form);

    if (!preview) {
      const string_form = JSON.stringify(form);
      const featuredArtist = JSON.stringify(form.featuredArtist);
      const songWriter = JSON.stringify(form.songWriter);
      const performer = JSON.stringify(form.performer);
      const producer = JSON.stringify(form.producer);
      localStorage.setItem("songWriter", songWriter);
      localStorage.setItem("songForm", string_form);
      localStorage.setItem("featuredArtist", featuredArtist);
      localStorage.setItem("performer", performer);
      localStorage.setItem("producer", producer);
      setPreview(true);
    } else {
      setPreview(false);
    }
  };

  const createAnother = () => {
    setSongForm({
      title: "",
      genre: "",
      language: "",
      artist: "",
      releaseDate: undefined,
      preOrderDate: undefined,
      featuredArtist: [
        { artistName: "", spotifyId: "", appleId: "", role: "" },
      ],
      performer: [{ name: "", role: "" }],
      songWriter: [{ first_name: "", last_name: "" }],
      producer: [{ name: "", role: "" }],
      preOrderCheck: false,
      anotherDistributionCheck: false,
      territories: [],
      songAudio: null,
      musicImage: null,
      dsp: [],
      lyrics: "",
      startClip: "",
      isrc: "",
      upc: "",
      copyRightHolder: "",
      copyRightYear: "",
      explicitContent: false,
      timeZone: { label: "", value: "", name: "" },
      coverSong: false,
      license: null,
      compositionType: "",
      instrumentalSource: "",
      countryOfRecording: "",
      courtesyLine: "",
      providedBy: "",
    });
    setImage(null);
    setshowSuccessPage(false);
  };

  useEffect(() => {
    localStorage.removeItem("single-idempotency-key");
    const string_form = localStorage.getItem("songForm");
    const featuredArtist = localStorage.getItem("featuredArtist");
    const songWriter = localStorage.getItem("songWriter");
    const performer = localStorage.getItem("performer");
    const producer = localStorage.getItem("producer");

    if (string_form) {
      const songForm = JSON.parse(string_form);

      const featuredArtist1 = featuredArtist
        ? JSON.parse(featuredArtist)
        : [{ artistName: "", spotifyId: "", appleId: "", role: "" }];

      const songWriter1 = songWriter
        ? JSON.parse(songWriter)
        : [{ first_name: "", last_name: "" }];

      const performer1 = performer
        ? JSON.parse(performer)
        : [{ name: "", role: "" }];

      const producer1 = producer ? JSON.parse(producer) : [{ name: "" }];

      setSongForm({
        ...songForm,
        featuredArtist: featuredArtist1,
        songWriter: songWriter1,
        performer: performer1,
        producer: producer1,
        releaseDate: songForm.releaseDate
          ? new Date(songForm.releaseDate)
          : undefined,
        preOrderDate: songForm.preOrderDate
          ? new Date(songForm.preOrderDate)
          : undefined,
        musicImage: null,
        songAudio: null,
        coverSong: false,
        license: null,
      });
    }
  }, []);

  useEffect(() => {
    if (preview) {
      dashboardContext?.setHeader({
        title: "preview",
        showBackButton: true,
        onBack: () => setPreview(false),
      });
    } else {
      dashboardContext?.setHeader({
        title: "upload single",
        showBackButton: true,
        onBack: () => router.back(),
      });
    }
  }, [preview]);

  // useEffect(() => {
  //   dashboardContext?.setHeader({
  //     title: "upload single",
  //     showBackButton: true,
  //   });
  // }, []);

  if (isErrorDsp) {
    toast.error("Failed to load DSP list. Please refresh the page.");
    router.push("/dashboard/music/uploadMusic");
    return null;
  }

  return (
    <div className="bg-main-white h-full w-full flex flex-col md:pl-[10px]">
      {isLoading || isSubmittingForm || isLoadingDsp || loadingUser ? (
        <InlineLoadingScreen />
      ) : (
        !isLoading &&
        !isError &&
        data != undefined &&
        dspData &&
        user && (
          <>
            <div className="flex gap-8 px-5 md:px-2 py-5 min-h-full h-full">
              {/* form */}
              {!preview && !showSuccessPage && (
                <div className="flex-3 overflow-auto flex flex-col gap-8 pb-10 lg:h-full">
                  {/* Song info */}
                  <div>
                    <h1 className="text-base font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Song Information
                    </h1>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-xs mt-3 sm:max-w-[40%]">
                      Provide the main details about your single to ensure it is
                      properly identified and distributed.
                    </p>
                    <div className="w-full flex flex-wrap justify-between gap-y-5 mt-10 px-1">
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <Input
                          value={songForm.title}
                          title={"Song title"}
                          type={"text"}
                          name={"title"}
                          placeholder={"Enter Song Title"}
                          updateValue={handleChange}
                          required={true}
                        />
                        <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                          The title will appear on all streaming platforms.
                        </p>
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <div className="flex gap-1">
                          <p className="font-medium mb-2 text-sm flex items-center">
                            Genre <span className="text-red-500">*</span>
                          </p>
                          {/* <Image
                            priority={false}
                            loading="lazy"
                            src="/required.svg"
                            alt="a star marking this field as required"
                            width={0}
                            height={0}
                            className="w-2 -mt-5"
                          /> */}
                        </div>
                        <div className="w-full">
                          <Select
                            selected={songForm.genre}
                            setSelected={(t) =>
                              setSongForm((prev) => ({ ...prev, genre: t }))
                            }
                            placeholder="Select Genre..."
                            options={genreList}
                            name="genre"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <div className="flex gap-1">
                          <p className="font-medium mb-2 text-sm">
                            Language <span className="text-red-500">*</span>
                          </p>
                        </div>
                        <div className="w-full">
                          <Select
                            selected={songForm.language}
                            setSelected={(t) =>
                              setSongForm((prev) => ({
                                ...prev,
                                language: t,
                              }))
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
                    </div>
                    <div className="flex flex-col w-[40%] mt-10 max-sm:w-full">
                      <div className="flex flex-col max-sm:w-full gap-2">
                        <div className="flex">
                          <p className=" capitalize font-medium text-sm mr-1">
                            Composition Type{" "}
                            <span className="text-red-500">*</span>
                          </p>
                        </div>
                        <div className="w-full">
                          <Select
                            selected={songForm.compositionType}
                            setSelected={(t) =>
                              setSongForm((prev) => ({
                                ...prev,
                                compositionType: t,
                              }))
                            }
                            placeholder="Select Composition Type..."
                            options={compositionTypes}
                            name="compositionType"
                          />
                        </div>
                      </div>
                      {songForm.compositionType === "Cover Song" && (
                        <>
                          <div className="flex gap-1 mt-5">
                            <p className="font-medium mb-2 text-sm">
                              Cover License{" "}
                              <span className="text-red-500">*</span>
                            </p>
                          </div>
                          <div
                            className={
                              "flex px-3 mx-1 rounded-lg border-transparent border-10 outline-1 gap-3 mt-1 sm:text-sm text-[16px] "
                            }
                          >
                            <label
                              htmlFor="license"
                              className="line-clamp-1 outline-0  font-extralight h-5"
                            >
                              {!songForm.license
                                ? "please select a file"
                                : songForm.license?.name}
                            </label>
                            <input
                              id="license"
                              name="license"
                              onChange={(e) =>
                                setSongForm((prev) => ({
                                  ...prev,
                                  license: e.target.files
                                    ? e.target.files[0]
                                    : null,
                                }))
                              }
                              type="file"
                              accept="application/pdf"
                              className="hidden w-full"
                            />
                          </div>
                          <p className="font-light italic flex gap-3 text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                            Don&apos;t have a license?{" "}
                            <Link
                              href={"/dashboard/explore/coverLicense"}
                              className="text-primary-500! items-center gap-2 flex font-bold leading-[20px] tracking-tighter text-sm"
                            >
                              Get License here
                              <ArrowRight color="#11456B" size={15} />
                            </Link>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="border border-neutral-100"></div>
                  {/* Artists and Contributors */}
                  <div>
                    <h1 className="text-base font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Artists and Contributors
                    </h1>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-xs md:text-sm mt-3 sm:max-w-[40%]">
                      Credit everyone who worked on your song. Add main artists,
                      featured acts, and other contributors.
                    </p>

                    {/* main Artists */}
                    <div>
                      <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary my-5">
                        Main Artist
                      </h2>
                      <div className="w-full flex flex-wrap justify-between gap-y-2 ">
                        <div className="flex flex-col w-[40%] max-sm:w-full px-1">
                          <label
                            htmlFor=""
                            className="pb-1 text-sm font-semibold"
                          >
                            Artist name <span className="text-red-500">*</span>
                          </label>
                          <Select
                            selected={songForm.artist}
                            setSelected={(t) =>
                              setSongForm((prev) => ({ ...prev, artist: t }))
                            }
                            placeholder="Select Artist..."
                            options={data || []}
                            name="artist"
                          />
                        </div>
                      </div>
                    </div>

                    {/* featuredArtist */}
                    <div>
                      <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-5">
                        Other Artists
                      </h2>
                      <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                        You can leave blank if there are no other artists on
                        your release.
                      </p>
                      {songForm.featuredArtist.map((_, i) => (
                        <div
                          key={i}
                          className="w-full flex flex-wrap justify-between gap-y-3 mt-5 px-1"
                        >
                          <div className="flex flex-col w-[40%] max-sm:w-full">
                            <DynamicInput
                              index={i}
                              field="featuredArtist"
                              value={songForm.featuredArtist[i].artistName}
                              title={"Artist name"}
                              type={"text"}
                              name={"artistName"}
                              placeholder={"Enter Artist Name"}
                              updateValue={handleDynamicChange}
                              required={true}
                            />
                          </div>
                          <div className="flex flex-col w-[40%] max-sm:w-full">
                            <div className="flex gap-1">
                              <p className="font-medium mb-2 text-sm">
                                Role <span className="text-red-500">*</span>
                              </p>
                            </div>
                            <Select
                              selected={songForm.featuredArtist[i].role}
                              setSelected={(t) =>
                                setSongForm((prev) => {
                                  const updatedList = [...prev.featuredArtist];
                                  updatedList[i] = {
                                    ...updatedList[i],
                                    role: t,
                                  };
                                  return {
                                    ...prev,
                                    featuredArtist: updatedList,
                                  };
                                })
                              }
                              placeholder="Select role..."
                              options={otherArtistRoles}
                              name="featuredArtist"
                            />
                          </div>
                          <div className="flex flex-col w-[40%] max-sm:w-full">
                            <DynamicInput
                              index={i}
                              field="featuredArtist"
                              value={songForm.featuredArtist[i].spotifyId}
                              title={"Spotify ID"}
                              type={"text"}
                              name={"spotifyId"}
                              placeholder={"Enter Spotify ID"}
                              updateValue={handleDynamicChange}
                            />
                          </div>
                          <div className="flex flex-col w-[40%] max-sm:w-full">
                            <DynamicInput
                              index={i}
                              field="featuredArtist"
                              value={songForm.featuredArtist[i].appleId}
                              title={"Apple music ID"}
                              type={"text"}
                              name={"appleId"}
                              placeholder={"Enter Apple music ID"}
                              updateValue={handleDynamicChange}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 items-center">
                        <button
                          aria-label="add other artist"
                          disabled={songForm.featuredArtist.length === 5}
                          onClick={() => {
                            addField("featuredArtist");
                          }}
                          className="font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-primary/20 mt-9 border-2 border-primary text-main-heading flex"
                        >
                          <Image
                            priority={false}
                            loading="lazy"
                            src="/add2.svg"
                            alt="an add icon"
                            width={0}
                            height={0}
                            className="w-4 text-primary"
                          />
                          Add Other Artist
                        </button>
                        <button
                          aria-label="delete other artist"
                          disabled={songForm.featuredArtist.length === 1}
                          onClick={() => {
                            setSongForm((prev) => ({
                              ...prev,
                              featuredArtist: prev.featuredArtist.filter(
                                (_, index) =>
                                  index !== prev.featuredArtist.length - 1,
                              ),
                            }));
                          }}
                          className="p-2 text-white bg-red-500 hover:bg-primary-red disabled:opacity-90 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors mt-9 h-9 w-9 shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* song writer */}
                    <div>
                      <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-10">
                        Songwriters
                      </h2>
                      {songForm.songWriter.map((_, index) => (
                        <div
                          key={index}
                          className="w-full flex flex-wrap justify-between gap-y-5 px-1 mt-2"
                        >
                          <div className="flex flex-col w-[40%] max-sm:w-full">
                            <DynamicInput
                              index={index}
                              field="songWriter"
                              value={songForm.songWriter[index].first_name}
                              title={"First name"}
                              type={"text"}
                              name={"first_name"}
                              placeholder={"Enter First name"}
                              updateValue={handleDynamicChange}
                              required={true}
                            />
                          </div>
                          <div className="flex flex-col w-[40%] max-sm:w-full">
                            <DynamicInput
                              index={index}
                              field="songWriter"
                              value={songForm.songWriter[index].last_name}
                              title={"Last name"}
                              type={"text"}
                              name={"last_name"}
                              placeholder={"Enter Last Name"}
                              updateValue={handleDynamicChange}
                              required={true}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <button
                          disabled={songForm.songWriter.length === 12}
                          onClick={() => addField("songWriter")}
                          className="font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 mt-9 border-2 border-primary text-main-heading flex"
                        >
                          <Image
                            priority={false}
                            loading="lazy"
                            src="/add2.svg"
                            alt="an add icon"
                            width={0}
                            height={0}
                            className="w-4 text-primary"
                          />
                          Add Songwriter
                        </button>
                        <button
                          aria-label="delete song writer"
                          disabled={songForm.songWriter.length === 1}
                          onClick={() => {
                            setSongForm((prev) => ({
                              ...prev,
                              songWriter: prev.songWriter.filter(
                                (_, index) =>
                                  index !== prev.songWriter.length - 1,
                              ),
                            }));
                          }}
                          className="p-2 text-white bg-red-500 hover:bg-primary-red disabled:opacity-90 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors mt-9 h-9 w-9 shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* performers */}
                    <div>
                      <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-10">
                        Performers
                      </h2>
                      {songForm.performer.map((_, index) => (
                        <div
                          key={index}
                          className="w-full flex flex-wrap justify-between gap-y-5 px-1"
                        >
                          <div className="flex flex-col w-[40%] max-sm:w-full">
                            <DynamicInput
                              index={index}
                              field="performer"
                              value={songForm.performer[index].name}
                              title={"name"}
                              type={"text"}
                              name={"name"}
                              placeholder={"Enter name"}
                              updateValue={handleDynamicChange}
                              required={true}
                            />
                          </div>
                          <div className="flex flex-col w-[40%] max-sm:w-full">
                            <div className="flex gap-1">
                              <p className="font-medium mb-2 text-sm">
                                Role <span className="text-red-500">*</span>
                              </p>
                            </div>
                            <Select
                              selected={songForm.performer[index].role}
                              setSelected={(t) =>
                                setSongForm((prev) => {
                                  const updatedList = [...prev.performer];
                                  updatedList[index] = {
                                    ...updatedList[index],
                                    role: t,
                                  };
                                  return { ...prev, performer: updatedList };
                                })
                              }
                              placeholder="Select role..."
                              options={performerRoles}
                              name="perfomer"
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 items-center">
                        <button
                          disabled={songForm.performer.length === 5}
                          onClick={() => addField("performer")}
                          className="font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 mt-9 border-2 border-primary text-main-heading flex"
                        >
                          <Image
                            priority={false}
                            loading="lazy"
                            src="/add2.svg"
                            alt="an add icon"
                            width={0}
                            height={0}
                            className="w-4 text-primary"
                          />
                          Add Performer
                        </button>
                        <button
                          aria-label="delete performer"
                          disabled={songForm.performer.length === 1}
                          onClick={() => {
                            setSongForm((prev) => ({
                              ...prev,
                              performer: prev.performer.filter(
                                (_, index) =>
                                  index !== prev.performer.length - 1,
                              ),
                            }));
                          }}
                          className="font-bold text-sm rounded-lg bg-primary-red text-white px-3 py-2.5 hover:bg-primary-red/90 mt-9 flex"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* producer */}
                    <div>
                      <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-10">
                        Producers
                      </h2>
                      {songForm.producer.map((_, index) => (
                        <div
                          key={index}
                          className="w-full flex flex-wrap justify-between gap-y-5 px-1 mt-1"
                        >
                          <div className="flex flex-col w-[40%] max-sm:w-full">
                            <DynamicInput
                              index={index}
                              field="producer"
                              value={songForm.producer[index].name}
                              title={"name"}
                              type={"text"}
                              name={"name"}
                              placeholder={"Enter name"}
                              updateValue={handleDynamicChange}
                              required={true}
                            />
                          </div>
                          <div className="flex flex-col w-[40%] max-sm:w-full">
                            <div className="flex gap-1">
                              <p className="font-medium mb-2 text-sm">
                                Role <span className="text-red-500">*</span>
                              </p>
                            </div>
                            <Select
                              selected={songForm.producer[index].role}
                              setSelected={(t) =>
                                setSongForm((prev) => {
                                  const updatedList = [...prev.producer];
                                  updatedList[index] = {
                                    ...updatedList[index],
                                    role: t,
                                  };
                                  return {
                                    ...prev,
                                    producer: updatedList,
                                  };
                                })
                              }
                              placeholder="Select role..."
                              options={producerRoles}
                              name="producer"
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 items-center">
                        <button
                          disabled={songForm.producer.length === 5}
                          onClick={() => addField("producer")}
                          className="font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 mt-9 border-3 border-primary text-main-heading flex"
                        >
                          <Image
                            priority={false}
                            loading="lazy"
                            src="/add2.svg"
                            alt="an add icon"
                            width={0}
                            height={0}
                            className="w-4 text-primary"
                          />
                          Add Producer
                        </button>
                        <button
                          aria-label="delete producer"
                          disabled={songForm.producer.length === 1}
                          onClick={() => {
                            setSongForm((prev) => ({
                              ...prev,
                              producer: prev.producer.filter(
                                (_, index) =>
                                  index !== prev.producer.length - 1,
                              ),
                            }));
                          }}
                          className="font-bold text-sm rounded-lg bg-primary-red text-white px-3 py-2.5 hover:bg-primary-red/90 mt-9 flex"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="border border-neutral-100 my-10"></div>

                    {/* release details */}
                    <div>
                      <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary">
                        Release Details
                      </h2>
                      <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%] mb-5">
                        Set how and when your song goes live.
                      </p>
                      <div className="w-full flex flex-wrap justify-between gap-y-5">
                        <div className="flex flex-col w-[40%] max-sm:w-full">
                          <div className="flex">
                            <p className=" capitalize font-medium text-sm ">
                              Release Date{" "}
                              <span className="text-red-500">*</span>
                            </p>
                          </div>
                          <SelectDate
                            disabled={false}
                            setDate={(date) =>
                              setSongForm((prev) => ({
                                ...prev,
                                releaseDate: date,
                              }))
                            }
                            value={songForm.releaseDate}
                            type="first"
                            toYear={toYear}
                            fromYear={fromYear}
                          />
                          <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mt-1">
                            Release date must be 2 weeks ahead the upload date
                          </p>
                        </div>
                        <div className="flex flex-col w-[40%] max-sm:w-full gap-2 px-1">
                          <div className="flex">
                            <p className=" capitalize font-medium text-sm mr-1">
                              Time Zones <span className="text-red-500">*</span>
                            </p>
                          </div>
                          <div className="w-full">
                            <Select
                              selected={songForm.timeZone.label}
                              setSelected={(t) => {
                                const selectedTimeZone = timeZones.find(
                                  (item) => item.label === t,
                                );
                                setSongForm((prev) => ({
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
                        <div className="flex flex-col w-[40%] max-sm:w-full gap-2 px-1">
                          <div className="flex flex-col">
                            <div>
                              <p className=" capitalize font-medium text-sm">
                                territories{" "}
                                <span className="text-red-500">*</span>
                              </p>
                            </div>
                          </div>
                          <CheckboxSelect
                            title="Select Territories"
                            options={territories}
                            selected={songForm.territories}
                            onChange={(s: string[]) => {
                              setSongForm((prev) => ({
                                ...prev,
                                territories: s,
                              }));
                            }}
                          />
                          <p className="text-xs text-warning-700 font-light italic mt-1">
                            Choose where your music will be available. Select
                            “Worldwide” to distribute your release to listeners
                            around the world
                          </p>
                        </div>
                        <div className="flex flex-col w-[40%] max-sm:w-full px-1">
                          <p className=" capitalize font-medium text-base">
                            Pre order date{" "}
                          </p>
                          <SelectDate
                            disabled={!songForm.preOrderCheck}
                            setDate={(date) =>
                              setSongForm((prev) => ({
                                ...prev,
                                preOrderDate: date,
                              }))
                            }
                            value={
                              !songForm.releaseDate ||
                              isDateInPast(new Date(songForm.releaseDate))
                                ? undefined
                                : songForm.preOrderDate
                            }
                            releaseDate={songForm.releaseDate}
                            type="second"
                            toYear={toYear}
                            fromYear={fromYear}
                          />
                          <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                            Pre order date must be 3 weeks before the release
                            date
                          </p>
                        </div>
                        <div className="mt-5 justify-between w-full flex max-sm:flex-col">
                          <div className="flex w-fit gap-2 items-center">
                            <input
                              type="checkbox"
                              className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
                              name="preOrderCheck"
                              checked={
                                !songForm.releaseDate ||
                                isDateInPast(new Date(songForm.releaseDate))
                                  ? false
                                  : songForm.preOrderCheck
                              }
                              onChange={handleChange}
                              disabled={
                                !songForm.releaseDate ||
                                isDateInPast(new Date(songForm.releaseDate))
                              }
                            />
                            <p className="leading-6 text-sm font-medium">
                              Pre-Order (optional)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* border line */}
                  <div className="border border-neutral-100"></div>

                  {/*  DSP*/}
                  <div>
                    <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Distribution Platforms
                    </h1>
                    <p className="text-warning-700 italic font-light leading-[18px] tracking-[-0.5px] text-xs mt-1 sm:max-w-[40%]">
                      Choose the streaming platforms for your release. We
                      recommend selecting “Select All” so your music is
                      delivered to all available streaming platforms.
                    </p>
                    <div className="w-full flex flex-wrap justify-between gap-y-5 mt-5 px-1 ">
                      <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                        <div className="flex">
                          <p className=" capitalize font-medium text-sm">
                            DSPs <span className="text-red-500">*</span>
                          </p>
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
                          selected={songForm.dsp}
                          onChange={(s: CheckboxOption[]) => {
                            setSongForm((prev) => ({ ...prev, dsp: s }));
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* border line */}
                  <div className="border border-neutral-100"></div>

                  {/* upload music */}
                  <div>
                    <h1 className="text-base font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Audio Upload
                    </h1>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-xs md:text-sm mt-3 sm:max-w-[40%]">
                      Upload your track in the correct format for distribution.
                    </p>
                    <div className="w-full flex flex-wrap justify-between gap-y-5 mt-10 ">
                      <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                        <div className="flex gap-1">
                          <h4 className="text-base font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                            Audio Upload <span className="text-red-500">*</span>
                          </h4>
                        </div>

                        <div className="flex items-center justify-center w-64 lg:w-80">
                          <label
                            htmlFor="songAudio"
                            className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  dark:bg-gray-700 hover:bg-gray-50 dark:hover:border-gray-500"
                          >
                            <div className="w-[50%] flex max-w-[50%] items-center justify-center p-3 rounded-2xl bg-[#103958] text-white">
                              <Image
                                src={"/music.svg"}
                                width={60}
                                height={60}
                                alt="music note icon"
                              />
                            </div>
                            <div className="w-[60%]">
                              {!songForm.songAudio ? (
                                <p className="mb-2 text-xs text-gray-500">
                                  <span className="font-bold text-text-body">
                                    Supported Files:
                                  </span>{" "}
                                  WAV, FLAC, MP3
                                </p>
                              ) : (
                                <p className="font-bold text-[16px] text-[#494949] truncate max-w-[50%]">
                                  <span className="font-semibold truncate">
                                    {songForm.songAudio?.name}
                                  </span>
                                </p>
                              )}
                            </div>
                            <input
                              id="songAudio"
                              name="songAudio"
                              type="file"
                              accept="audio/wav,audio/flac,audio/mp3"
                              className="hidden"
                              onChange={handleChange}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* border line */}
                  <div className="border border-neutral-100"></div>

                  {/* add lyrics */}
                  <div>
                    <h1 className="text-base font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Add Your Lyrics
                    </h1>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-xs md:text-sm mt-3 sm:max-w-[40%]">
                      Upload or paste your song lyrics to make your music more
                      discoverable across platforms.
                    </p>
                    <div className="bg-warning-50 sm:max-w-[60%] rounded-2xl p-3 mt-10">
                      <Info color="#C58629" />
                      <ul className="list-disc mt-4 ml-5 text-caption-one flex flex-col gap-1">
                        <li>Do not include the vocalist's name</li>
                        <li>
                          Do not include extra text (ex: "intro", "chorus",
                          social media links, etc.)
                        </li>
                        <li>
                          Repeated lines must be written out. Don't write
                          "Chorus 2x" etc.
                        </li>
                        <li>Begin each line with a capital letter</li>
                        <li>Do not use punctuation at the end of a line</li>
                        <li>
                          Do not include blank lines except between verses or
                          chorus
                        </li>
                        <li>
                          Avoid entering excessively long lines. One sentence
                          per line
                        </li>
                        <li>
                          Don't censor explicit words unless the words are
                          dropped/bleeped in the audio recording.
                        </li>
                      </ul>
                      <p className="text-caption-one text-warning-600 mt-5">
                        For complete list of store requirements, visit{" "}
                        <a
                          aria-label="musix match lyrics guidelines"
                          href="https://community.musixmatch.com/guidelines?lng=en"
                          target="_blank"
                          className="!text-primary-500 !underline "
                        >
                          Musixmatch guidelines{" "}
                        </a>
                        and{" "}
                        <a
                          aria-label="apple lyrics guidlines"
                          href="https://artists.apple.com/support/1111-lyrics-guidelines"
                          target="_blank"
                          className="!text-primary-500 !underline"
                        >
                          Apple guidelines
                        </a>
                      </p>
                    </div>
                    <div>
                      <div className="flex gap-1 sm:text-sm text-lg mt-10">
                        <p className=" capitalize font-medium">lyrics </p>
                      </div>

                      <textarea
                        value={songForm.lyrics}
                        onChange={(e) =>
                          setSongForm((prev) => ({
                            ...prev,
                            lyrics: e.target.value,
                          }))
                        }
                        className="w-full sm:w-[70%] text-xs min-h-80 border-2 rounded-2xl p-4 mt-1"
                        placeholder="Enter Lyrics here"
                      ></textarea>
                    </div>
                  </div>

                  {/* border line */}
                  <div className="border border-neutral-100"></div>

                  {/* clip settings */}
                  <div>
                    <h1 className="text-base font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Clip Preview Settings
                    </h1>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-xs md:text-sm mt-3 sm:max-w-[40%]">
                      Select where your song’s preview should start for
                      platforms that support clips.
                    </p>
                    <div>
                      <div className="w-full flex flex-wrap justify-between gap-y-5 mt-10">
                        <div className="flex flex-col w-[40%] max-sm:w-full px-2">
                          <Input
                            value={songForm.startClip}
                            title={"Start Time (in seconds)"}
                            type={"text"}
                            name={"startClip"}
                            placeholder={"30"}
                            updateValue={handleChange}
                          />
                          <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                            This determines which part of your song will play in
                            short previews on platforms like Spotify, Instagram,
                            or TikTok.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* border line */}
                  <div className="border border-neutral-100"></div>

                  {/* cover art */}
                  <div>
                    <h1 className="text-base font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Cover Art
                    </h1>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-xs md:text-sm mt-3 sm:max-w-[40%]">
                      Add eye-catching artwork that represents your single.{" "}
                    </p>
                    <div className="flex items-center justify-center w-60">
                      <div className="w-full flex flex-wrap justify-between gap-y-5 mt-10 ">
                        <div className="flex flex-col max-sm:w-full gap-2">
                          <div className="flex gap-1">
                            <h4 className="text-base font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                              Artwork File{" "}
                              <span className="text-red-500">*</span>
                            </h4>
                          </div>
                          <div className="flex items-center justify-center w-64 lg:w-80">
                            <label
                              htmlFor="musicImage"
                              className="flex p-3 gap-3 items-center justify-center w-full h-25 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-50"
                            >
                              <div
                                className={
                                  "w-[50%] flex items-center justify-center p-3 rounded-2xl  text-white border border-neutral-100" +
                                  (!songForm.musicImage && " bg-neutral-50 ")
                                }
                              >
                                <Image
                                  src={image ? image : "/document-upload.svg"}
                                  width={60}
                                  height={60}
                                  alt="music note icon"
                                  className={
                                    songForm.musicImage
                                      ? " w-full object-cover min-w-15 h-15"
                                      : undefined
                                  }
                                />
                              </div>
                              <div className="w-[50%]">
                                {!songForm.musicImage ? (
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
                                      {songForm.musicImage?.name}
                                    </span>
                                  </p>
                                )}
                              </div>
                              <input
                                id="musicImage"
                                name="musicImage"
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

                  {/* song meta data */}
                  <div>
                    <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary">
                      Song Metadata
                    </h2>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                      Provide additional details to optimize your release.
                    </p>
                    {/* <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                      Enter these details only if you are transferring from
                      another distributor
                    </p> */}
                    <div className="flex flex-wrap justify-between">
                      <div className="flex w-fit gap-2 items-center mb-2">
                        <input
                          aria-label="another distribution check box"
                          type="checkbox"
                          className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
                          name="anotherDistributionCheck"
                          checked={songForm.anotherDistributionCheck}
                          onChange={handleChange}
                        />
                        <p className="leading-6 text-sm font-medium">
                          Transferring from another distributor?
                        </p>
                      </div>
                      <div className="flex w-fit gap-2 items-center mb-5">
                        <input
                          type="checkbox"
                          className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
                          name="explicitContent"
                          checked={songForm.explicitContent}
                          onChange={handleChange}
                        />
                        <p className="leading-6 text-sm font-medium">
                          Does Your release contain explicit content?
                        </p>
                      </div>
                    </div>
                    <div className="w-full flex flex-wrap justify-between gap-y-5 px-2 pb-10">
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <Input
                          value={songForm.isrc}
                          title={"Isrc"}
                          type={"text"}
                          name={"isrc"}
                          placeholder={"Enter Isrc"}
                          updateValue={handleChange}
                          disabled={!songForm.anotherDistributionCheck}
                          uppercase={true}
                          required={songForm.anotherDistributionCheck}
                        />
                        <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                          Don’t have this? Soundmac will generate for you.
                        </p>
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <Input
                          value={songForm.upc}
                          title={"upc"}
                          type={"text"}
                          name={"upc"}
                          placeholder={"Enter upc"}
                          updateValue={handleChange}
                          disabled={!songForm.anotherDistributionCheck}
                          uppercase={true}
                          required={songForm.anotherDistributionCheck}
                        />
                        <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                          Don’t have this? Soundmac will generate for you.
                        </p>
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        {user?.type.includes("LABEL") ? (
                          <Input
                            value={songForm.providedBy}
                            title={"Provided By"}
                            type={"text"}
                            name={"providedBy"}
                            placeholder={"Enter Provided By"}
                            updateValue={handleChange}
                            disabled={false}
                            uppercase={false}
                            required={true}
                          />
                        ) : (
                          <Input
                            value={"SoundMac"}
                            title={"Provided By"}
                            type={"text"}
                            name={"providedBy"}
                            placeholder={"Enter Provided By"}
                            updateValue={() => {}}
                            disabled={true}
                            uppercase={false}
                            required={true}
                          />
                        )}
                        <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                          {user?.type.includes("LABEL")
                            ? "If not provided, the label name will be used as the default value for this field."
                            : "Only Labels can edit."}
                        </p>
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        {user?.type.includes("LABEL") ? (
                          <Input
                            value={songForm.courtesyLine}
                            title={"Courtesy Line"}
                            type={"text"}
                            name={"courtesyLine"}
                            placeholder={"Enter Courtesy Line"}
                            updateValue={handleChange}
                            disabled={false}
                            uppercase={false}
                            required={true}
                          />
                        ) : (
                          <Input
                            value={"SoundMac"}
                            title={"Courtesy Line"}
                            type={"text"}
                            name={"courtesyLine"}
                            placeholder={"Enter Courtesy Line"}
                            updateValue={() => {}}
                            disabled={true}
                            uppercase={false}
                            required={true}
                          />
                        )}
                        <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                          {user?.type.includes("LABEL")
                            ? "If not provided, the label name will be used as the default value for this field."
                            : "Only Labels can edit."}
                        </p>
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <Input
                          value={songForm.copyRightHolder}
                          title={"Copyright Holder"}
                          type={"text"}
                          name={"copyRightHolder"}
                          placeholder={"Enter Copyright Holder"}
                          updateValue={handleChange}
                          disabled={false}
                          uppercase={false}
                          required={true}
                        />
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                        <div className="flex">
                          <p className=" capitalize font-medium text-sm mr-1">
                            Copyright Year{" "}
                            <span className="text-red-500">*</span>
                          </p>
                        </div>
                        <div className="w-full">
                          <Select
                            selected={songForm.copyRightYear}
                            setSelected={(t) =>
                              setSongForm((prev) => ({
                                ...prev,
                                copyRightYear: t,
                              }))
                            }
                            placeholder="Select Copyright Year..."
                            options={years}
                            name="copyRightYear"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                        <div className="flex">
                          <p className=" capitalize font-medium text-sm mr-1">
                            instrumental Source{" "}
                            <span className="text-red-500">*</span>
                          </p>
                        </div>
                        <div className="w-full">
                          <Select
                            selected={songForm.instrumentalSource}
                            setSelected={(t) =>
                              setSongForm((prev) => ({
                                ...prev,
                                instrumentalSource: t,
                              }))
                            }
                            placeholder="Select instrumental Source..."
                            options={instrumentalSources}
                            name="instrumentalSource"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                        <div className="flex">
                          <p className=" capitalize font-medium text-sm mr-1">
                            Country of Recording{" "}
                            <span className="text-red-500">*</span>
                          </p>
                        </div>
                        <div className="w-full">
                          <Select
                            selected={songForm.countryOfRecording}
                            setSelected={(t) =>
                              setSongForm((prev) => ({
                                ...prev,
                                countryOfRecording: t,
                              }))
                            }
                            placeholder="Select Country of Recording..."
                            options={country_list}
                            name="countryOfRecording"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showSuccessPage && (
                <div className="flex  w-[80%] mx-auto animate-fade-in h-fit pb-5">
                  <div className="w-full flex flex-col justify-cente items-center text-center gap-6">
                    {/* Success Icon */}
                    <div className="relative w-14 h-14 transition-transform hover:scale-105 duration-300">
                      <Image
                        alt="check mark"
                        fill
                        src="/tick-circle2.svg"
                        className="object-contain w-5 h-5 "
                        priority
                      />
                    </div>

                    {/* Message Header */}
                    <div className="space-y-2">
                      <p className="text-main-heading font-semibold text-base leading-relaxed tracking-tight">
                        Your single has been submitted for review. We&apos;ll
                        notify you once approved.
                      </p>
                    </div>

                    {/* Release Info Card */}
                    <div className="bg-neutral-50 border border-neutral-200/80 p-3 rounded-xl flex items-center gap-4 w-full shadow-xs text-left">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 relative shrink-0 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                        <Image
                          alt="release image"
                          fill
                          src={image ?? "/document-upload.svg"}
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p
                          className="text-base sm:text-lg font-bold text-main-heading truncate"
                          title={songForm.title}
                        >
                          {songForm.title}
                        </p>
                        <p
                          className="text-xs sm:text-sm font-medium text-text-body truncate"
                          title={songForm.artist}
                        >
                          {songForm.artist}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons Group */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 md:w-[60%] mt-2 sm:mt-4">
                      <button
                        type="button"
                        onClick={createAnother}
                        className="w-fit sm:w-1/2 px-5 py-3 font-bold rounded-xl text-center text-sm transition-colors cursor-pointer border-2 border-primary-500 text-text-body bg-transparent hover:bg-primary-500/5 shrink-0"
                      >
                        Upload Another
                      </button>
                      <Link
                        href="/dashboard/music/manageRelease/song"
                        className="w-full sm:w-1/2 px-5 py-3 font-bold rounded-xl text-center text-sm transition-all cursor-pointer bg-primary hover:bg-primary/90 text-white flex items-center justify-center shrink-0 shadow-sm"
                      >
                        <p className="text-white">View Song </p>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Section */}
              {preview && (
                <SongPreview
                  songForm={songForm}
                  image={image}
                  onEdit={() => handlePreview(songForm)}
                  // preview = {preview}
                  // {DashboardContext?.setHeader}
                />
              )}

              {/* the image side bar */}
              {!showSuccessPage && (
                <div className="bg-neutral-50 w-[20%] border-2 border-neutral-100 flex-1 rounded-lg p-2 max-xl:hidden h-70 flex flex-col ">
                  <div className="w-full h-[80%] flex-2">
                    {songForm.musicImage ? (
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
                    <p className="font-normal leading-[30px] truncate max-w-50 tracking-[-1px] text-main-heading text-xl">
                      {songForm.title || "Title"}
                    </p>
                    <p className="font-light leading-[20px] truncate max-w-50 tracking-[-0.5px] text-main-heading text-base">
                      {songForm.artist || "Artist"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!showSuccessPage && (
              <div className="bg-[#F0F0E7]/95 backdrop-blur-xs border-t border-neutral-200/60 flex items-center justify-between sm:justify-end gap-3 sm:gap-5 h-auto py-4 sm:h-20 px-4 sm:px-10 fixed bottom-0 z-2 left-0 w-full shadow-md">
                {/* Left group / Early buttons on mobile */}
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-start">
                  <button
                    onClick={() => handleSubmit(songForm, "draft")}
                    className={`font-bold text-xs sm:text-sm rounded-lg px-3 sm:px-4 py-2.5 hover:bg-primary/10 border-2 border-primary text-main-heading transition-colors shrink-0 ${
                      !preview ? "hidden" : "flex"
                    }`}
                  >
                    Save as Draft
                  </button>

                  <button
                    onClick={() => handleSubmit(songForm, "upload")}
                    className={`font-bold text-xs sm:text-sm rounded-lg px-3 sm:px-4 py-2.5 hover:bg-primary-500/90 border-2 border-primary text-white bg-primary-500 transition-colors shrink-0 ${
                      !preview ? "hidden" : "flex"
                    }`}
                  >
                    Distribute
                  </button>
                </div>

                {/* Primary action toggle (Pushed right on mobile if other buttons are hidden) */}
                <button
                  onClick={() => handlePreview(songForm)}
                  className="font-bold text-xs sm:text-sm rounded-lg px-4 sm:px-5 py-2.5 hover:bg-primary-500/90 border-2 border-primary text-white bg-primary-500 transition-colors ml-auto sm:ml-0 shrink-0 flex items-center justify-center"
                >
                  {preview ? "Edit" : "Preview"}
                </button>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
};
export default SongForm;
