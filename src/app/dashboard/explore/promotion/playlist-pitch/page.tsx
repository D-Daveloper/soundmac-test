"use client";
import CheckboxSelect from "@/app/components/checkBox/CheckBoxSelect";
import Input from "@/app/components/input/Input";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import {
  editorialTeams,
  genderList,
  moods,
  priorityList,
  promotionCategory,
  timeList,
  typeOfRelease,
} from "@/app/constant";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import { genreList } from "@/app/utils/constants";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import {
  useGetUserArtistsNames,
  useGetUserReleaseNames,
  useGetUserReleaseTrackNames,
} from "@/util/customHooks/useQueries";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import { isAxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
type pitchFormArrayType = {
  name: string;
  title: string;
  placeholder: string;
  required?: boolean;
  type?: string;
};

type pitchPlayFormType = {
  // Required fields
  artist: string;
  // release_date: Date | undefined;
  promotionPackage: string;
  promotionType: string;
  releaseTitle: string;
  priority: string;
  configuration: string;
  type_of_release: string;
  editorial_teams: string;
  // targeted_streaming_platform_playlist: string;
  marketing_detail: string;
  focus_track: string;
  // Optional fields
  featuring_artist?: string;
  artist_gender?: string;
  track_language?: string;
  country?: string;
  location?: string;
  release_time: string;
  subgenres: string[];
  moods: string;
  promotionImage?: File | null;
  comment?: string;
  facebook_profile_link?: string;
  instagram_profile_link?: string;
  twitter_profile_link?: string;
  youtube_profile_link?: string;
  tiktok_profile_link?: string;
  [key: string]: string | File | null | undefined | string[];
};
const pitchplayFormFields: pitchFormArrayType[] = [
  // {
  //   name: "label",
  //   title: "Label",
  //   placeholder: "Enter the label name",
  //   required: true,
  // },
  // {
  //   name: "upc",
  //   title: "UPC",
  //   placeholder: "Enter UPC code",
  //   required: true,
  // },
  // {
  //   name: "main_artists",
  //   title: "Main artists",
  //   placeholder: "Enter main artist(s)",
  //   required: true,
  // },
  // {
  //   name: "featuring_artists",
  //   title: "Featuring artists",
  //   placeholder: "Enter featuring artist(s)",
  //   required: false,
  // },
  // {
  //   name: "artist_gender",
  //   title: "Artist gender",
  //   placeholder: "Enter artist gender",
  //   required: false,
  // },
  // {
  //   name: "track_language",
  //   title: "Track language",
  //   placeholder: "e.g. English",
  //       required:false
  // },
  // {
  //   name: "country",
  //   title: "Country",
  //   placeholder: "e.g. USA",
  //   required: false,
  // },
  // {
  //   name: "release_date",
  //   title: "Release date",
  //   type: "date",
  //   required: true,
  // },
  // {
  //   name: "release_time",
  //   title: "Release time (UTC)",
  //   type: "time",
  // },
  // {
  //   name: "title",
  //   title: "Title",
  //   placeholder: "Enter track title",
  //   required: true,
  // },
  // {
  //   name: "priority",
  //   title: "Priority",
  //   placeholder: "High/Low",
  //   required: true,
  // },
  // {
  //   name: "configuration",
  //   title: "Configuration",
  //   placeholder: "e.g. Single, Album",
  //   required: true,
  // },
  // {
  //   name: "type_of_release",
  //   title: "Type Of Release",
  //   placeholder: "e.g. Single",
  //   required: true,
  // },
  // {
  //   name: "focus_track",
  //   title: "Focus track",
  //   placeholder: "Enter focus track name",
  //   required: true,
  // },
  // {
  //   name: "focus_track_isrc",
  //   title: "Focus track ISRC",
  //   placeholder: "e.g. US-XXX-21-00001",
  //   required: true,
  // },
  // {
  //   name: "genres",
  //   title: "Genres (up to 3)",
  //   placeholder: "e.g. Pop, Rock",
  //   required: true,
  // },
  // {
  //   name: "subgenres",
  //   title: "Subgenres",
  //   placeholder: "e.g. Indie Pop",
  // },
  // {
  //   name: "photos",
  //   title: "Photos",
  //   type: "file",
  // },
  // {
  //   name: "targeted_streaming_platform_playlist",
  //   title: "Targeted streaming platform playlist",
  //   placeholder: "e.g. Today's Top Hits",
  //   required: true,
  // },
  // {
  //   name: "marketing_detail",
  //   title: "Marketing detail",
  //   placeholder: "Describe marketing strategy...",
  //   required: true,
  // },

  // {
  //   name: "moods",
  //   title: "Moods",
  //   placeholder: "e.g. Happy, Energetic",
  // },
  // {
  //   name: "editorial_teams",
  //   title: "Editorial teams",
  //   placeholder: "Enter editorial team names",
  //   required: true,
  // },
  {
    name: "location",
    title: "Location",
    placeholder: "City or region",
    required: false,
  },
  {
    name: "facebook_profile_link",
    title: "Facbook Profile link",
    type: "url",
    placeholder: "https://facebook.com/username",
  },
  {
    name: "instagram_profile_link",
    title: "Instagram Profile link",
    type: "url",
    placeholder: "https://instagram.com/username",
  },
  {
    name: "twitter_profile_link",
    title: "Twitter Profile link",
    type: "url",
    placeholder: "https://twitter.com/username",
  },
  {
    name: "youtube_profile_link",
    title: "Youtube Profile link",
    type: "url",
    placeholder: "https://youtube.com/channel/...",
  },
  {
    name: "tiktok_profile_link",
    title: "TikTok Profile link",
    type: "url",
    placeholder: "https://tiktok.com/@username",
  },
  {
    name: "comment",
    title: "Comment",
    placeholder: "Any additional comments",
  },
];
const Page = () => {
  const router = useRouter();
  const api = UseAxios();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [image, setImage] = useState("");
  const [promotionForm, setPromotionForm] = React.useState<pitchPlayFormType>({
    artist: "",
    promotionPackage: "",
    promotionType: "",
    releaseTitle: "",
    priority: "",
    configuration: "",
    type_of_release: "",
    editorial_teams: "",
    // targeted_streaming_platform_playlist: "",
    marketing_detail: "",
    artist_gender: "",
    location: "",
    release_time: "",
    subgenres: [],
    moods: "",
    promotionImage: null,
    comment: "",
    facebook_profile_link: "",
    instagram_profile_link: "",
    twitter_profile_link: "",
    youtube_profile_link: "",
    tiktok_profile_link: "",
    focus_track: "",
  });
  const dashboardContext = useContext(DashboardContext);
  useEffect(() => {
    dashboardContext?.setHeader({
      title: "Explore Promotions",
      showBackButton: true,
    });
  }, []);
  
  const { isLoading, data, isFetching, isPending, isRefetching, isError } =
    useGetUserArtistsNames();

  const {
    isLoading: releaseNamesIsLoading,
    data: releaseNamesData,
    isFetching: releaseNamesIsFetching,
    isPending: releaseNamesIsPending,
    isRefetching: releaseNamesIsRefetching,
    isError: releaseNamesIsError,
    refetch: releaseNamesRefetch,
  } = useGetUserReleaseNames(
    { artist: promotionForm.artist },
    {
      enabled: !!promotionForm.artist, // ✅ only run if artist exists
    },
  );
  const {
    isLoading: releaseTrackNamesIsLoading,
    data: releaseTrackNamesData,
    isFetching: releaseTrackNamesIsFetching,
    isPending: releaseTrackNamesIsPending,
    isRefetching: releaseTrackNamesIsRefetching,
    isError: releaseTrackNamesIsError,
    refetch: releaseTrackNamesRefetch,
  } = useGetUserReleaseTrackNames(
    { release_title: promotionForm.releaseTitle },
    {
      enabled: !!promotionForm.releaseTitle, // ✅ only run if artist exists
    },
  );

  // useEffect(() => {
  //   if (data && data?.length > 0 && !promotionForm.artist) {
  //     setPromotionForm((prev) => ({
  //       ...prev,
  //       artist: data[0],
  //     }));
  //   }
  // }, [data]);

  const handleSubmit = async () => {
    try {
      setIsSubmittingForm(true);
      console.log(promotionForm);
      promotionForm.promotionType = promotionCategory.playlistPitch;
      if (!promotionForm.artist) {
        toast.warn("Artist is required.");
        return;
      } else if (!promotionForm.releaseTitle) {
        toast.warn("Release Title is required.");
        return;
      } else if (!promotionForm.promotionType) {
        toast.warn("Please select a package type.");
        return;
      } else if (!promotionForm.priority) {
        toast.warn("Please select a priority.");
        return;
      } else if (!promotionForm.editorial_teams) {
        toast.warn("Please select an editoridal team.");
        return;
      } else if (!promotionForm.type_of_release) {
        toast.warn("Please select a release type.");
        return;
      } else if (
        releaseTrackNamesData &&
        releaseTrackNamesData.length > 0 &&
        !promotionForm.focus_track
      ) {
        toast.warn("Please select a focus track.");
        return;
      } else if (
        !promotionForm.marketing_detail ||
        promotionForm.marketing_detail.trim().length < 500
      ) {
        toast.warn(
          "Please fill the market detail field with at least 500 characters.",
        );
        return;
      }
      const formData = new FormData();
      Object.entries(promotionForm).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(`${key}`, JSON.stringify(v)));
        } else if (value) formData.append(key, value);
      });
      let res;
      res = await api.post("promotions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res?.data?.msg);
      router.push("/dashboard/explore/promotion?page=myPromotions");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, files } = e.target;
    if (name === "promotionImage") {
      const file = files && files.length ? files[0] : null;
      setPromotionForm((prev) => ({ ...prev, promotionImage: file }));
      if (file) {
        setImage(URL.createObjectURL(file));
      }
    } else {
      setPromotionForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <>
      <div className="bg-main-white  w-full flex flex-col px-5 ">
        {/* back button */}
        {isLoading ||
        releaseNamesIsLoading ||
        isSubmittingForm ||
        releaseTrackNamesIsLoading ? (
          <InlineLoadingScreen />
        ) : (
          <>
            <div className=" sm:mb-20">
              <div className="flex items-center gap-3 mt-5">
                {/* <Link
                  className="max-lg:flex hidden"
                  aria-label="go back"
                  href={"/dashboard/explore/promotion/explore-promotions"}
                >
                  <Image
                    src={"/arrow-left.svg"}
                    height={28}
                    width={20}
                    alt="arrow left"
                  />
                </Link> */}
                <p className="text-text-body text-body-two-regular">
                  Select the track you want to promote
                </p>
              </div>
              {/* form */}
              <form
                id="pitchForm"
                onSubmit={handleSubmit}
                className="mt-5 flex flex-col gap-5 mb-10"
              >
                {/* artist image */}
                <div>
                  {/* <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Cover Art
                    </h1>
                    <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                      Add eye-catching artwork that represents your single.{" "}
                    </p> */}
                  <div className="flex items-center justify-center w-full">
                    <div className="w-full flex flex-wrap justify-between gap-y-10 ">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                          <h4 className="text-base font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                            Artist press image (high resolution).
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
                        <div className="flex items-center justify-center w-60 md:w-80">
                          <label
                            htmlFor="promotionImage"
                            className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                          >
                            <div
                              className={
                                "w-[50%] flex items-center justify-center p-3 rounded-2xl  text-white border border-neutral-100" +
                                (!promotionForm.promotionImage &&
                                  " bg-neutral-50 ")
                              }
                            >
                              <Image
                                src={image ? image : "/document-upload.svg"}
                                width={60}
                                height={60}
                                alt="music note icon"
                                className={
                                  promotionForm.promotionImage
                                    ? " w-full object-fit min-w-15 h-15"
                                    : undefined
                                }
                              />
                            </div>
                            <div className="w-[50%]">
                              {!promotionForm.promotionImage ? (
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
                                    {promotionForm.promotionImage?.name}
                                  </span>
                                </p>
                              )}
                            </div>
                            <input
                              id="promotionImage"
                              name="promotionImage"
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
                <div className="w-full flex flex-wrap justify-between gap-y-10">
                  {/* artist */}
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <p className="font-medium mb-2 text-sm flex justify-start gap-1 mr-auto">
                      {/* <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-3 "
                      />{" "} */}
                      Artist <span className="text-red-500">*</span>
                    </p>
                    <div className="w-full">
                      <Select
                        selected={promotionForm.artist}
                        setSelected={(t) =>
                          setPromotionForm((prev) => ({ ...prev, artist: t }))
                        }
                        placeholder="Select Artist..."
                        options={data || []}
                        name="artist"
                      />
                    </div>
                  </div>
                  {/* release title */}
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <p className="font-medium mb-2 text-sm flex justify-start gap-1 mr-auto">
                      {/* <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-3 "
                      /> */}
                      Release Title <span className="text-red-500">*</span>
                    </p>
                    <div className="w-full">
                      <Select
                        selected={promotionForm.releaseTitle}
                        setSelected={(t) =>
                          setPromotionForm((prev) => ({
                            ...prev,
                            releaseTitle: t,
                          }))
                        }
                        placeholder="Select Release..."
                        options={releaseNamesData || []}
                        name="releaseTitle"
                      />
                    </div>
                  </div>
                  {/* type of release */}
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <p className="font-medium mb-2 text-sm capitalize flex justify-start gap-1 mr-auto">
                      {/* <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-3 "
                      /> */}
                      Realease Type <span className="text-red-500">*</span>
                    </p>
                    <div className="w-full">
                      <Select
                        // isDisabled={!promotionForm.releaseTitle}
                        selected={promotionForm.type_of_release}
                        setSelected={(t) =>
                          setPromotionForm((prev) => ({
                            ...prev,
                            type_of_release: t,
                          }))
                        }
                        placeholder="Select track..."
                        options={typeOfRelease}
                        name="type_of_release"
                      />
                    </div>
                  </div>
                  {/* focus Track */}
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <p className="font-medium mb-2 text-sm capitalize flex flex-row-reverse justify-start gap-1 mr-auto">
                      <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className={
                          "w-2 -mt-3 " +
                          ((!releaseTrackNamesData ||
                            (releaseTrackNamesData &&
                              releaseTrackNamesData.length < 1)) &&
                            " hidden")
                        }
                      />
                      focus track
                    </p>
                    <div className="w-full">
                      <Select
                        isDisabled={!promotionForm.releaseTitle}
                        selected={promotionForm.focus_track}
                        setSelected={(t) =>
                          setPromotionForm((prev) => ({
                            ...prev,
                            focus_track: t,
                          }))
                        }
                        placeholder="Select track..."
                        options={releaseTrackNamesData || []}
                        name="focus_track"
                      />
                    </div>
                  </div>
                  {/* priority */}
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <p className="font-medium mb-2 text-sm capitalize flex justify-start gap-1 mr-auto">
                      {/* <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-3 "
                      /> */}
                      priority <span className="text-red-500">*</span>
                    </p>
                    <div className="w-full">
                      <Select
                        // isDisabled={!promotionForm.releaseTitle}
                        selected={promotionForm.priority}
                        setSelected={(t) =>
                          setPromotionForm((prev) => ({
                            ...prev,
                            priority: t,
                          }))
                        }
                        placeholder="Select track..."
                        options={priorityList}
                        name="priority"
                      />
                    </div>
                  </div>
                  {/* editorial teams */}
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <p className="font-medium mb-2 text-sm capitalize flex justify-start gap-1 mr-auto">
                      {/* <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-3 "
                      /> */} 
                      Editorial teams <span className="text-red-500">*</span>
                    </p>
                    <div className="w-full">
                      <Select
                        // isDisabled={!promotionForm.releaseTitle}
                        selected={promotionForm.editorial_teams}
                        setSelected={(t) =>
                          setPromotionForm((prev) => ({
                            ...prev,
                            editorial_teams: t,
                          }))
                        }
                        placeholder="Select track..."
                        options={editorialTeams}
                        name="editorial_teams"
                      />
                    </div>
                  </div>
                  {/* moods */}
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <p className="font-medium mb-2 text-sm capitalize">
                      {/* <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-3 "
                      /> */}
                      Mood <span className="text-red-500">*</span>
                    </p>
                    <div className="w-full">
                      <Select
                        // isDisabled={!promotionForm.releaseTitle}
                        selected={promotionForm.moods}
                        setSelected={(t) =>
                          setPromotionForm((prev) => ({
                            ...prev,
                            moods: t,
                          }))
                        }
                        placeholder="Select mood..."
                        options={moods}
                        name="moods"
                      />
                    </div>
                  </div>
                  {/* artist gender */}
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <p className="font-medium mb-2 text-sm capitalize ">
                      {/* <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-3 "
                      /> */}
                      artist gender <span className="text-red-500">*</span>
                    </p>
                    <div className="w-full">
                      <Select
                        // isDisabled={!promotionForm.releaseTitle}
                        selected={promotionForm.artist_gender || ""}
                        setSelected={(t) =>
                          setPromotionForm((prev) => ({
                            ...prev,
                            artist_gender: t,
                          }))
                        }
                        placeholder="Select gender..."
                        options={genderList}
                        name="artist_gender"
                      />
                    </div>
                  </div>
                  {/* sub genre */}
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <p className="font-medium mb-2 text-sm capitalize ">
                      {/* <Image
                        priority={false}
                        loading="lazy"
                        src="/required.svg"
                        alt="a star marking this field as required"
                        width={0}
                        height={0}
                        className="w-2 -mt-3 "
                      /> */}
                      sub genre
                    </p>
                    <div className="w-full">
                      <CheckboxSelect
                        title="Select Subgenres"
                        options={genreList.map((item, index) => ({
                          value: item,
                          label: item,
                        }))}
                        selected={promotionForm.subgenres}
                        onChange={(s: string[]) => {
                          setPromotionForm((prev) => ({
                            ...prev,
                            subgenres: s,
                          }));
                        }}
                      />
                    </div>
                  </div>
                  {pitchplayFormFields.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col w-[40%] max-sm:w-full"
                    >
                      <Input
                        value={
                          typeof promotionForm[item.name] === "string"
                            ? (promotionForm[item.name] as string)
                            : ""
                        }
                        title={item.title}
                        type={item.type}
                        name={item.name}
                        // image={item.image}
                        placeholder={item.placeholder}
                        updateValue={handleChange}
                        required={item.required}
                      />
                    </div>
                  ))}
                  {/* release time */}
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <p className="font-medium mb-2 sm:text-sm text-lg">
                      Release Time
                    </p>
                    <div className="w-full">
                      <Select
                        selected={promotionForm.release_time}
                        setSelected={(t) =>
                          setPromotionForm((prev) => ({
                            ...prev,
                            release_time: t,
                          }))
                        }
                        placeholder="Select Release..."
                        options={timeList}
                        name="release_time"
                      />
                    </div>
                  </div>
                  {/* marketing details */}
                  <div className="w-[40%] max-sm:w-full">
                    <div className="flex gap-1">
                      <p className=" capitalize font-medium text-sm flex justify-start gap-1 mr-auto">
                        {/* <Image
                          priority={false}
                          loading="lazy"
                          src="/required.svg"
                          alt="a star marking this field as required"
                          width={0}
                          height={0}
                          className="w-2 -mt-3 "
                        /> */}
                        Marketing Detail <span className="text-red-500">*</span>
                      </p>
                    </div>

                    <textarea
                      value={promotionForm.marketing_detail}
                      minLength={500}
                      maxLength={1000}
                      onChange={(e) =>
                        setPromotionForm((prev) => ({
                          ...prev,
                          marketing_detail: e.target.value,
                        }))
                      }
                      className="w-full min-h-50 border-2 rounded-2xl p-4 mt-1"
                      placeholder="Short pitch explaining story, rollout plan, momentum."
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>
            <div className="flex py-3 w-full h-fit bg-secondary-50 self-end justify-end mt-auto border-1 border-neutral-100 fixed bottom-0">
              <button
                form="pitchForm"
                onClick={() => {
                  // setIsExplorePage(true);
                  handleSubmit();
                }}
                type="button"
                className={
                  "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white"
                }
              >
                Confirm Request
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
export default Page;
