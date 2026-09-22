"use client";
import DynamicInput from "@/app/components/input/DynamicInput";
import Input from "@/app/components/input/Input";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { languagesList } from "@/app/constant";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";
import type {
  albumFromApi,
  FeaturedArtist,
  Performer,
  Producer,
  SongForm,
  SongWriter,
  TrackForm,
} from "@/app/type";
import {
  compositionTypes,
  country_list,
  genreList,
  instrumentalSources,
  otherArtistRoles,
  performerRoles,
  producerRoles,
} from "@/app/utils/constants";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import { uploadAlbumTrack } from "@/util/middleware/functions";
import { isAxiosError } from "axios";
import { Info, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

type TrackFormProps = {
  track: TrackForm;
  onChange: (patch: Partial<TrackFormProps["track"]>) => void;
  onRemove: () => void;
  album: albumFromApi;
  setIsUploadingTrack: (v: boolean) => void;
};

const UploadTrackForm = ({
  track,
  onChange,
  onRemove,
  album,
  setIsUploadingTrack,
}: TrackFormProps) => {
  const api = UseAxios();
  const dashboardContext = useContext(DashboardContext);
  const [uploading, setUploading] = useState(false);

  const addField = (field: keyof SongForm) => {
    switch (field) {
      case "featuredArtist":
        onChange({
          featuredArtist: [
            ...track.featuredArtist,
            { artistName: "", spotifyId: "", appleId: "", role: "" },
          ],
        });
        break;
      case "songWriter":
        onChange({
          songWriter: [...track.songWriter, { first_name: "", last_name: "" }],
        });
        break;
      case "performer":
        onChange({
          performer: [...track.performer, { name: "", role: "" }],
        });
        break;
      case "producer":
        onChange({
          producer: [...track.producer, { name: "", role: "" }],
        });
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
      onChange({ ...track, [name]: checked });
    } else if (name === "songAudio") {
      const file =
        e.target.files && e.target.files.length ? e.target.files[0] : null;
      onChange({ ...track, songAudio: file });
    } else {
      onChange({ ...track, [name]: value });
    }
  };

  const handleDynamicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
    field: keyof SongForm, // 'performers' or 'producers'
  ) => {
    const { name, value } = e.target;
    // console.log(name,value);

    // let updatedList;
    switch (field) {
      case "featuredArtist":
        const updatedList = [...track.featuredArtist];
        updatedList[index] = {
          ...updatedList[index],
          [name as keyof FeaturedArtist]: value,
        };
        onChange({ ...track, featuredArtist: updatedList });
        break;
      case "songWriter":
        // work explicitly with the songWriter array so spreading is on an array of objects
        const updatedListSongwrite = [...track.songWriter];
        updatedListSongwrite[index] = {
          ...updatedListSongwrite[index],
          [name as keyof SongWriter]: value,
        };
        onChange({ ...track, songWriter: updatedListSongwrite });
        break;
      case "performer":
        const updatedListPerformer = [...track.performer];
        updatedListPerformer[index] = {
          ...updatedListPerformer[index],
          [name as keyof Performer]: value,
        };
        onChange({ ...track, performer: updatedListPerformer });
        break;
      case "producer":
        const updatedListProducer = [...track.producer];
        updatedListProducer[index] = {
          ...updatedListProducer[index],
          [name as keyof Producer]: value,
        };
        onChange({ ...track, producer: updatedListProducer });

        break;

      default:
        break;
    }
  };

  const uploadSong = async () => {
    try {
      if (!dashboardContext?.isPremium) {
        dashboardContext?.setOpenUpgradePopUp(true);
        return;
      }
      setUploading(true);

      setIsUploadingTrack(true);

      if (!track.songAudio) {
        return toast.info("Track audio is required.");
      } else if (!track.trackNumber) {
        return toast.info("Track number is required.");
      }
      toast.info(
        "Uploading song. This may take a while depending on your internet speed.",
      );
      const { upc, songS3Key, error, uploadId } = await uploadAlbumTrack(
        track.songAudio,
        album.upc,
        album.artist.artistName,
        api,
        track.trackNumber,
      );
      console.log("nnnjjj", songS3Key);
      if (error != null) {
        return;
      }

      track.s3key = songS3Key; //the key from ther server i.e the storage location in the s3 bucket reference createawssignedurl route.ts
      track.songAudio = null;
      toast.success("Uploaded, please continue with the form.");
    } catch (error) {
      if (isAxiosError(error)) {
        return;
      }
      toast.error("Something went wrong!.");
    } finally {
      setUploading(false);
      setIsUploadingTrack(false);
    }
  };

  useEffect(() => {
    const string_form = localStorage.getItem("songForm");
    const featuredArtist = localStorage.getItem("featuredArtist");
    const songWriter = localStorage.getItem("songWriter");
    const performer = localStorage.getItem("performer");
    const producer = localStorage.getItem("producer");

    if (string_form) {
      const songForm = JSON.parse(string_form);

      // Parse with fallback to default value
      const featuredArtist1 = featuredArtist
        ? JSON.parse(featuredArtist)
        : [{ artistName: "", spotifyId: "", appleId: "", role: "" }];

      const songWriter1 = songWriter
        ? JSON.parse(songWriter)
        : [{ first_name: "", last_name: "" }];

      const performer1 = performer
        ? JSON.parse(performer)
        : [{ name: "", role: "" }];

      const producer1 = producer
        ? JSON.parse(producer)
        : [{ name: "", role: "" }];

      console.log(featuredArtist1);

      onChange({
        ...songForm,
        featuredArtist: featuredArtist1,
        songWriter: songWriter1,
        performer: performer1,
        producer: producer1,
        releaseDate: undefined,
        preOrderDate: undefined,
        musicImage: null,
        songAudio: null,
      });
    }
  }, []);
  console.log(album);

  // useEffect(() => {
  //   album.unassignedNumbers = album.unassignedNumbers.filter((num,index)=> num != track.trackNumber )
  // }, [track.trackNumber]);
  //   console.log(album);
  // UploadTrackForm.tsx — onChange handler for the file input
  // const handleFileSelect = async (file: File, trackNumber: string) => {
  //   const key = `${album.upc}_${trackNumber}`;
  //   await saveFileForResume(key, file);

  //   updateTrackStore(trackNumber, {
  //     fileName: file.name,
  //     fileType: file.type,
  //     fileSize: file.size,
  //     uploadStatus: "idle", // idle | uploading | completed | failed
  //   });
  // };
  return (
    <div className="bg-main-white h-full w-full flex flex-col">
      {uploading ? (
        <InlineLoadingScreen />
      ) : (
        <>
          <div className="flex gap-8 py-5 min-h-full h-full">
            <div className="flex-3 overflow-auto flex flex-col gap-10 px-5 pb-20 h-full">
              {/* Song info */}
              <div>
                <h1 className="text-base font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                  Track Information
                </h1>
                <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-xs md:text-sm mt-3 sm:max-w-[40%]">
                  Provide the main details about your track to ensure it is
                  properly identified and distributed.
                </p>
                <div className="w-full flex flex-wrap justify-between gap-y-3 mt-5 ">
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={track.title}
                      title={"Track title"}
                      type={"text"}
                      name={"title"}
                      placeholder={"Enter Track Title"}
                      updateValue={(e) => onChange({ title: e.target.value })}
                      required={true}
                    />
                    <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                      The title will appear on all streaming platforms.
                    </p>
                  </div>
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <div className="flex gap-1">
                      <p className="font-medium mb-2 text-sm ">
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
                        selected={track.genre}
                        setSelected={(t) => onChange({ genre: t })}
                        placeholder="Select Genre..."
                        options={genreList}
                        name="genre"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <div className="flex gap-1">
                      <p className="font-medium mb-2 text-sm ">
                        Language <span className="text-red-500">*</span>
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
                        selected={track.language}
                        setSelected={(t) => onChange({ language: t })}
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
                    <div className="flex gap-1">
                      <p className="font-medium mb-2 text-sm">
                        Track number <span className="text-red-500">*</span>
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
                        isDisabled={false}
                        // isDisabled={track.s3key.length > 0}
                        selected={track.trackNumber}
                        setSelected={(t) => {
                          onChange({ trackNumber: t });
                        }}
                        placeholder="Select track number..."
                        options={album.unassignedNumbers}
                        name="trackNumber"
                      />
                    </div>
                    {/* <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                      This can&apos;t be changed, except drafts
                    </p> */}
                  </div>
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

                {/* featuredArtist */}
                <div>
                  <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-10">
                    Other Artists
                  </h2>
                  <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                    You can leave blank if there are no other artists on your
                    release.
                  </p>
                  {track.featuredArtist.map((_, i) => (
                    <div
                      key={i}
                      className="w-full flex flex-wrap justify-between gap-y-3 mb-1"
                    >
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <DynamicInput
                          index={i}
                          field="featuredArtist"
                          value={track.featuredArtist[i].artistName}
                          title={"Artist name"}
                          type={"text"}
                          name={"artistName"}
                          placeholder={"Enter Artist Name"}
                          updateValue={handleDynamicChange}
                          required={false}
                        />
                      </div>
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <div className="flex gap-1">
                          <p className="font-medium mb-2 text-sm">
                            Role <span className="text-red-500">*</span>
                          </p>
                        </div>
                        <Select
                          selected={track.featuredArtist[i].role}
                          setSelected={(t) =>
                            onChange({
                              ...track,
                              featuredArtist: track.featuredArtist.map(
                                (p, i) => (i === i ? { ...p, role: t } : p),
                              ),
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
                          value={track.featuredArtist[i].spotifyId}
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
                          value={track.featuredArtist[i].appleId}
                          title={"Apple music ID"}
                          type={"text"}
                          name={"appleId"}
                          placeholder={"Enter Apple music ID"}
                          updateValue={handleDynamicChange}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={track.featuredArtist.length === 5}
                      onClick={() => {
                        addField("featuredArtist");
                      }}
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
                      Add featured Artist
                    </button>
                    <button
                      arelia-label="delete featured artist"
                      disabled={track.featuredArtist.length === 1}
                      onClick={() => {
                        onChange({
                          ...track,
                          featuredArtist: track.featuredArtist.filter(
                            (_, index) =>
                              index !== track.featuredArtist.length - 1,
                          ),
                        });
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

                  {track.songWriter.map((_, index) => (
                    <div
                      key={index}
                      className="w-full flex flex-wrap justify-between gap-y-3 mb-1"
                    >
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <DynamicInput
                          index={index}
                          field="songWriter"
                          value={track.songWriter[index].first_name}
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
                          value={track.songWriter[index].last_name}
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
                      disabled={track.songWriter.length === 12}
                      onClick={() => addField("songWriter")}
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
                      Add Songwriter
                    </button>
                    <button
                      aria-label="delete song writer"
                      disabled={track.songWriter.length === 1}
                      onClick={() => {
                        onChange({
                          ...track,
                          songWriter: track.songWriter.filter(
                            (_, index) => index !== track.songWriter.length - 1,
                          ),
                        });
                      }}
                      className="p-2 text-white bg-red-500 hover:bg-primary-red disabled:opacity-90 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors mt-9 h-9 w-9 shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* performers */}
                <div>
                  <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-15">
                    Performers
                  </h2>

                  {track.performer.map((_, index) => (
                    <div
                      key={index}
                      className="w-full flex flex-wrap justify-between gap-y-5 mb-1"
                    >
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <DynamicInput
                          index={index}
                          field="performer"
                          value={track.performer[index].name}
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
                          <p className="font-medium mb-2 text-sm ">
                            Role <span className="text-red-500">*</span>
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
                        <Select
                          selected={track.performer[index].role}
                          setSelected={(t) => {
                            const updatedList = [...track.performer];
                            updatedList[index] = {
                              ...updatedList[index],
                              role: t,
                            };
                            onChange({ ...track, performer: updatedList });
                          }}
                          placeholder="Select role..."
                          options={performerRoles}
                          name="perfomer"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={track.performer.length === 5}
                      onClick={() => addField("performer")}
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
                      Add Performer
                    </button>
                    <button
                      aria-label="delete performer"
                      disabled={track.performer.length === 1}
                      onClick={() => {
                        onChange({
                          ...track,
                          performer: track.performer.filter(
                            (_, index) => index !== track.performer.length - 1,
                          ),
                        });
                      }}
                      className="p-2 text-white bg-red-500 hover:bg-primary-red disabled:opacity-90 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors mt-9 h-9 w-9 shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* producer */}
                <div>
                  <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-15">
                    Producers
                  </h2>

                  {track.producer.map((_, index) => (
                    <div
                      key={index}
                      className="w-full flex flex-wrap justify-between gap-y-5 mb-1"
                    >
                      <div className="flex flex-col w-[40%] max-sm:w-full">
                        <DynamicInput
                          index={index}
                          field="producer"
                          value={track.producer[index].name}
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
                          selected={track.producer[index].role}
                          setSelected={(t) =>
                            onChange({
                              ...track,
                              producer: track.producer.map((p, i) =>
                                i === index ? { ...p, role: t } : p,
                              ),
                            })
                          }
                          placeholder="Select role..."
                          options={producerRoles}
                          name="producer"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={track.producer.length === 5}
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
                      disabled={track.producer.length === 1}
                      onClick={() => {
                        onChange({
                          ...track,
                          producer: track.producer.filter(
                            (_, index) => index !== track.producer.length - 1,
                          ),
                        });
                      }}
                      className="p-2 text-white bg-red-500 hover:bg-primary-red disabled:opacity-90 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors mt-9 h-9 w-9 shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* border line */}
              <div className="border border-neutral-100"></div>

              {/* add lyrics */}
              <div>
                <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                  Add Your Lyrics
                </h1>
                <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                  Upload or paste your song lyrics to make your music more
                  discoverable across platforms.
                </p>
                <div className="bg-warning-50 sm:max-w-[60%] rounded-2xl p-3 mt-10">
                  <Info color="#C58629" />
                  <ul className="list-disc mt-4 ml-5 text-caption-one flex flex-col gap-1">
                    <li>Do not include the vocalist's name</li>
                    <li>
                      Do not include extra text (ex: "intro", "chorus", social
                      media links, etc.)
                    </li>
                    <li>
                      Repeated lines must be written out. Don't write "Chorus
                      2x" etc.
                    </li>
                    <li>Begin each line with a capital letter</li>
                    <li>Do not use punctuation at the end of a line</li>
                    <li>
                      Do not include blank lines except between verses or chorus
                    </li>
                    <li>
                      Avoid entering excessively long lines. One sentence per
                      line
                    </li>
                    <li>
                      Don't censor explicit words unless the words are
                      dropped/bleeped in the audio recording. For example: Don't
                      enter "F**, unless the word was dropped or bleeped
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
                    value={track.lyrics}
                    onChange={(e) =>
                      onChange({
                        ...track,
                        lyrics: e.target.value,
                      })
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
                <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                  Clip Preview Settings
                </h1>
                <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                  Select where your song’s preview should start for platforms
                  that support clips.
                </p>
                <div>
                  <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10">
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <Input
                        value={track.startClip}
                        title={"Start Time (in seconds)"}
                        type={"text"}
                        name={"startClip"}
                        placeholder={"30"}
                        updateValue={handleChange}
                        required={false}
                      />
                      <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                        This determines which part of your song will play in
                        short previews on platforms like Spotify, Instagram, or
                        TikTok.
                      </p>
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
                <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                  Enter these details only if you are transferring from another
                  distributor
                </p>
                <div className="flex flex-wrap justify-between">
                  <div className="flex w-fit gap-2 items-center mb-5">
                    <input
                      aria-label="another distribution check box"
                      type="checkbox"
                      className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
                      name="anotherDistributionCheck"
                      checked={track.anotherDistributionCheck}
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
                      checked={track.explicitContent}
                      onChange={handleChange}
                    />
                    <p className="leading-6 text-sm font-medium">
                      Does Your release contain explicit content?
                    </p>
                  </div>
                </div>
                <div className="w-full flex flex-wrap justify-between gap-y-10">
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={track.isrc}
                      title={"Isrc"}
                      type={"text"}
                      name={"isrc"}
                      placeholder={"Enter Isrc"}
                      updateValue={handleChange}
                      disabled={!track.anotherDistributionCheck}
                      uppercase={true}
                      required={track.anotherDistributionCheck}
                    />
                    <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                      Unique code for tracking sales/streams.
                    </p>
                  </div>
                  <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                    <div className="flex">
                      <p className=" capitalize font-medium text-sm mr-1">
                        Composition Type <span className="text-red-500">*</span>
                      </p>
                    </div>
                    <div className="w-full">
                      <Select
                        selected={track.compositionType}
                        setSelected={(t) => onChange({ compositionType: t })}
                        placeholder="Select Composition Type..."
                        options={compositionTypes}
                        name="compositionType"
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
                        selected={track.instrumentalSource}
                        setSelected={(t) => onChange({ instrumentalSource: t })}
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
                        selected={track.countryOfRecording}
                        setSelected={(t) => onChange({ countryOfRecording: t })}
                        placeholder="Select Country of Recording..."
                        options={country_list}
                        name="countryOfRecording"
                      />
                    </div>
                  </div>
                </div>
                {/* border line */}
                <div className="border border-neutral-100 mt-5"></div>
                {/* upload music */}
                <div className="mt-5">
                  <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                    Audio Upload
                  </h1>
                  <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                    Upload your track in the correct format for distribution.
                  </p>
                  <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                    <span className="font-bold text-error-500">Note: </span>Song
                    is only uploaded after clicking the upload button below, if
                    audio is uploaded you can't track save to draft.
                  </p>
                  <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                    <div className="flex flex-col w-[50%] max-sm:w-full gap-2">
                      <div className="flex gap-1">
                        <h4 className="text-base font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                          Audio Upload <span className="text-red-500">*</span>
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

                      <div className="flex items-center justify-between w-full flex-wrap gap-2">
                        <label
                          htmlFor="songAudio"
                          className="flex w-60 md:w-80 p-3 gap-3 items-center justify-center h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  dark:bg-gray-700 hover:bg-gray-100 dark:hover:border-gray-500"
                        >
                          <div className="w-[50%] flex max-w-[50%] items-center justify-center p-3 rounded-2xl bg-[#103958] text-white">
                            <Image
                              src={"/music.svg"}
                              width={60}
                              height={60}
                              alt="music note icon"
                            />
                          </div>
                          <div className="w-[50%]">
                            {!track.songAudio ? (
                              <p className="mb-2 text-xs text-gray-500">
                                <span className="font-bold text-text-body">
                                  Supported Files:
                                </span>{" "}
                                WAV, FLAC, MP3
                              </p>
                            ) : (
                              <p className="font-bold text-[16px] text-[#494949] truncate max-w-[50%]">
                                <span className="font-semibold truncate">
                                  {track.songAudio?.name}
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
                        <button
                          disabled={!track.songAudio}
                          onClick={() => {
                            uploadSong();
                          }}
                          className={
                            "font-bold text-sm rounded-lg capitalize px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-white bg-primary-500 "
                          }
                        >
                          upload audio
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* buttons */}
        </>
      )}
    </div>
  );
};

export default UploadTrackForm;
