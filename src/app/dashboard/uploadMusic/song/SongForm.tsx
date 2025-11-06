"use client";
import CheckboxSelect from "@/app/components/checkBox/CheckBoxSelect";
import Input from "@/app/components/input/Input";
import { genreList, territories } from "@/app/utils/constants";
import Select from "@/components/Select";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import { Music } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

export interface FeaturedArtist {
  aritistName: string;
  spotifyId: string;
  appleId: string;
}
export interface SongWriter {
  first_name: string;
  last_name: string;
}
export interface Performer {
  name: string;
  role: string;
}
export interface Producer {
  first_name: string;
  last_name: string;
}
export interface SongForm {
  song_title: string;
  genre: string;
  languages: string;
  artist: string;
  release_date: string;
  featured_artist: FeaturedArtist[];
  performer: Performer[];
  song_writer: SongWriter[];
  producer: Producer[];
  territories: string[];
  isChecked: boolean;
  song_audio: File | null;
  song_image: File | null;
}
const SongForm = () => {
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [SongForm, setSongForm] = useState<SongForm>({
    song_title: "",
    genre: "",
    languages: "",
    artist: "gggg",
    release_date: "",
    featured_artist: [{ aritistName: "", spotifyId: "", appleId: "" }],
    performer: [{ name: "", role: "" }],
    song_writer: [{ first_name: "", last_name: "" }],
    producer: [{ first_name: "", last_name: "" }],
    isChecked: false,
    territories: selectedTerritories,
    song_audio: null,
    song_image: null,
  });
  const { deleteParam } = useTabQuery();

  const addField = (field: keyof SongForm) => {
    switch (field) {
      case "featured_artist":
        setSongForm((prev) => ({
          ...prev,
          featured_artist: [
            ...prev.featured_artist,
            { aritistName: "", spotifyId: "", appleId: "" },
          ],
        }));
        break;
      case "song_writer":
        setSongForm((prev) => ({
          ...prev,
          song_writer: [...prev.song_writer, { first_name: "", last_name: "" }],
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
          producer: [...prev.producer, { first_name: "", last_name: "" }],
        }));
        break;

      default:
        break;
    }
  };

  // const removeField = (field: keyof SongForm, index: number) => {
  //   setSongForm((prev) => {
  //     const updatedList = [...prev[field]];
  //     updatedList.splice(index, 1);
  //     return { ...prev, [field]: updatedList };
  //   });
  // };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name, checked } = e.target;
    if (name === "isChecked") {
      setSongForm((prev) => ({ ...prev, isChecked: checked }));
    } else if (name === "song_audio") {
      const file =
        e.target.files && e.target.files.length ? e.target.files[0] : null;
      setSongForm((prev) => ({ ...prev, song_audio: file }));
    } else if (name === "song_image") {
      const file =
        e.target.files && e.target.files.length ? e.target.files[0] : null;
      setSongForm((prev) => ({ ...prev, song_image: file }));
      if (file) {
        setImage(URL.createObjectURL(file));
      }
    } else {
      setSongForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  console.log(SongForm);
  const handleDynamicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
    field: keyof SongForm // 'performers' or 'producers'
  ) => {
    const { name, value } = e.target;
    switch (field) {
      case "featured_artist":
        setSongForm((prev) => {
          // work explicitly with the featured_artist array so spreading is on an array of objects
          const updatedList = [...prev.featured_artist];
          updatedList[index] = {
            ...updatedList[index],
            [name as keyof FeaturedArtist]: value,
          };
          return { ...prev, featured_artist: updatedList };
        });
        break;
      case "featured_artist":
        setSongForm((prev) => {
          // work explicitly with the featured_artist array so spreading is on an array of objects
          const updatedList = [...prev.featured_artist];
          updatedList[index] = {
            ...updatedList[index],
            [name as keyof FeaturedArtist]: value,
          };
          return { ...prev, featured_artist: updatedList };
        });
        break;

      default:
        break;
    }
    // setSongForm((prev) => {
    //   const updatedList = [...prev[field]];
    //   updatedList[index] = { ...updatedList[index], [name]: value };
    //   return { ...prev, [field]: updatedList };
    // });
  };
  // const handleDynamicChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  //   index: number,
  //   field: "featured_artist"
  // ) => {
  //   const { name, value } = e.target;

  //   setSongForm((prev) => {
  //     // work explicitly with the featured_artist array so spreading is on an array of objects
  //     const updatedList = [...prev.featured_artist];
  //     updatedList[index] = { ...updatedList[index], [name as keyof FeaturedArtist]: value };
  //     return { ...prev, featured_artist: updatedList };
  //   });
  // };
  return (
    <div className="bg-main-white h-full w-full px-5 py-5">
      <button
        onClick={() => {
          deleteParam("type");
        }}
        className="bg-main-white/70 p-3 w-[48px] h-[48px] text-primary text-2xl rounded-full shadow-2xl shadow-black mb-9"
      >
        <Image
          src={"/arrow-left.svg"}
          height={32}
          width={32}
          alt="arrow left"
        />
      </button>
      <div className="flex gap-8 ">
        <div className="flex-3 overflow-auto flex flex-col gap-20 px-1 pb-3 h-[74dvh]">
          {/* Song info */}
          <div>
            <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
              Song Information
            </h1>
            <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 max-w-[40%]">
              Provide the main details about your single to ensure it is
              properly identified and distributed.
            </p>
            <div className="w-full flex flex-wrap justify-between gap-y-10 mt-15 ">
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <Input
                  value={SongForm.song_title}
                  title={"Song title"}
                  type={"text"}
                  name={"song_title"}
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
                  <p className="font-medium mb-2 sm:text-sm text-lg">Genre</p>
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
                    selected={SongForm}
                    setSelected={setSongForm}
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
                    selected={SongForm}
                    setSelected={setSongForm}
                    placeholder="Select Language..."
                    options={genreList}
                    name="language"
                  />
                </div>
                <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                  The main language of the lyrics.
                </p>
              </div>
            </div>
          </div>
          <div className="border border-neutral-100"></div>
          {/* Artists and Contributors */}
          <div>
            <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
              Artists and Contributors
            </h1>
            <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 max-w-[40%]">
              Credit everyone who worked on your song. Add main artists,
              featured acts, and other contributors.
            </p>

            {/* main Artists */}
            <div>
              <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-15 mb-5">
                Main Artist
              </h2>
              <div className="w-full flex flex-wrap justify-between gap-y-10 ">
                <div className="flex flex-col w-[40%] max-sm:w-full">
                  <Input
                    value={SongForm.artist}
                    title={"Artist name"}
                    type={"text"}
                    name={"artist"}
                    placeholder={"Enter Artist Name"}
                    updateValue={handleChange}
                    required={true}
                    disabled={true}
                  />
                </div>
              </div>
            </div>

            {/* featured_artist */}
            <div>
              <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-15">
                Featured Artists
              </h2>
              <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                You can leave blank if there are no featured artists on your
                release.
              </p>
              {SongForm.featured_artist.map((_, i) => (
                <div
                  key={i}
                  className="w-full flex flex-wrap justify-between gap-y-10 mb-5"
                >
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={SongForm.artist}
                      title={"Artist name"}
                      type={"text"}
                      name={"artist"}
                      placeholder={"Enter Artist Name"}
                      updateValue={handleChange}
                    />
                  </div>
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={SongForm.artist}
                      title={"Spotify ID"}
                      type={"text"}
                      name={"artist"}
                      placeholder={"Enter Artist Name"}
                      updateValue={handleChange}
                    />
                  </div>
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={SongForm.artist}
                      title={"Apple music ID"}
                      type={"text"}
                      name={"artist"}
                      placeholder={"Enter Artist Name"}
                      updateValue={handleChange}
                    />
                  </div>
                </div>
              ))}
              <button
                disabled={SongForm.featured_artist.length === 5}
                onClick={() => {
                  addField("featured_artist");
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
            </div>

            {/* song writer */}
            <div>
              <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-15">
                Songwriters
              </h2>
              <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                You can leave blank if there are no songwriters on your release
              </p>
              {SongForm.song_writer.map((_, index) => (
                <div
                  key={index}
                  className="w-full flex flex-wrap justify-between gap-y-10 mb-5"
                >
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={SongForm.artist}
                      title={"First name"}
                      type={"text"}
                      name={"artist"}
                      placeholder={"Enter First name"}
                      updateValue={handleChange}
                    />
                  </div>
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={SongForm.artist}
                      title={"Last name"}
                      type={"text"}
                      name={"artist"}
                      placeholder={"Enter Last Name"}
                      updateValue={handleChange}
                    />
                  </div>
                </div>
              ))}
              <button
                disabled={SongForm.song_writer.length === 12}
                onClick={() => addField("song_writer")}
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
            </div>

            {/* performers */}
            <div>
              <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-15">
                Performers
              </h2>
              <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                You can leave blank if there are no performers on your release
              </p>
              {SongForm.performer.map((_, index) => (
                <div
                  key={index}
                  className="w-full flex flex-wrap justify-between gap-y-10 mb-5"
                >
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={SongForm.artist}
                      title={"First name"}
                      type={"text"}
                      name={"artist"}
                      placeholder={"Enter First name"}
                      updateValue={handleChange}
                    />
                  </div>
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={SongForm.artist}
                      title={"Last name"}
                      type={"text"}
                      name={"artist"}
                      placeholder={"Enter Last Name"}
                      updateValue={handleChange}
                    />
                  </div>
                </div>
              ))}
              <button
                disabled={SongForm.performer.length === 5}
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
            </div>

            {/* producer */}
            <div>
              <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-15">
                Producers
              </h2>
              <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                You can leave blank if there are no performers on your release
              </p>
              {SongForm.producer.map((_, i) => (
                <div
                  key={i}
                  className="w-full flex flex-wrap justify-between gap-y-10 mb-5"
                >
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={SongForm.artist}
                      title={"First name"}
                      type={"text"}
                      name={"artist"}
                      placeholder={"Enter First name"}
                      updateValue={handleChange}
                    />
                  </div>
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={SongForm.artist}
                      title={"Last name"}
                      type={"text"}
                      name={"artist"}
                      placeholder={"Enter Last Name"}
                      updateValue={handleChange}
                    />
                  </div>
                </div>
              ))}
              <button
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
            </div>
            {/* release details */}
            <div>
              <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-15">
                Release Details
              </h2>
              <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 max-w-[40%] mb-5">
                Set how and when your song goes live.
              </p>
              <div className="w-full flex flex-wrap justify-between gap-y-10 mb-5">
                <div className="flex flex-col w-[40%] max-sm:w-full">
                  <Input
                    value={SongForm.release_date}
                    title={"Release Date"}
                    type={"text"}
                    name={"release_date"}
                    placeholder={"DD/MM/YY"}
                    updateValue={handleChange}
                    required={true}
                  />
                </div>
                <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                  <p className=" capitalize font-medium sm:text-sm text-lg">
                    territories{" "}
                  </p>

                  <CheckboxSelect
                    title="Select Territories"
                    options={territories}
                    selected={selectedTerritories}
                    onChange={setSelectedTerritories}
                  />
                </div>
                <div className="mt-5 justify-between w-full flex">
                  <div className="flex w-fit gap-2 items-center">
                    <input
                      type="checkbox"
                      className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
                      name="isChecked"
                      checked={SongForm.isChecked}
                      onChange={handleChange}
                    />
                    <p className="leading-6 text-sm sm:text-lg font-medium">
                      Pre-Order (optional)
                    </p>
                  </div>
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      disabled={!SongForm.isChecked}
                      value={SongForm.release_date}
                      title={"Preorder start date"}
                      type={"text"}
                      name={"release_date"}
                      placeholder={"DD/MM/YY"}
                      updateValue={handleChange}
                    />
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
            <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 max-w-[40%]">
              Choose the platforms where your release will be available.
            </p>
            <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
              <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                <p className=" capitalize font-medium sm:text-sm text-lg">
                  territories{" "}
                </p>
                <CheckboxSelect
                  title="Select Territories"
                  options={territories}
                  selected={selectedTerritories}
                  onChange={setSelectedTerritories}
                />
              </div>
            </div>
          </div>

          {/* border line */}
          <div className="border border-neutral-100"></div>

          {/* upload music */}
          <div>
            <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
              Audio Upload
            </h1>
            <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 max-w-[40%]">
              Upload your track in the correct format for distribution.
            </p>
            <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
              <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                <h4 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                  Audio Upload
                </h4>

                <div className="flex items-center justify-center w-60">
                  <label
                    htmlFor="song_audio"
                    className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  dark:bg-gray-700 hover:bg-gray-100 dark:hover:border-gray-500"
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
                      {!SongForm.song_audio ? (
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                      ) : (
                        <p className="font-bold text-[16px] text-[#494949] truncate max-w-[50%]">
                          <span className="font-semibold truncate">
                            {SongForm.song_audio?.name}
                          </span>
                        </p>
                      )}
                    </div>
                    <input
                      id="song_audio"
                      name="song_audio"
                      type="file"
                      accept="audio/*"
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
            <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
              Add Your Lyrics
            </h1>
            <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 max-w-[40%]">
              Upload or paste your song lyrics to make your music more
              discoverable across platforms.
            </p>
            <div>
              <div className="flex gap-1 sm:text-sm text-lg mt-10">
                <p className=" capitalize font-medium">lyrics </p>

                <Image
                  priority={false}
                  loading="lazy"
                  src="/required.svg"
                  alt="a star marking this field as required"
                  width={0}
                  height={0}
                  className="w-2 -mt-3"
                />
              </div>

              <textarea
                className=" w-[70%] min-h-80 border-2 rounded-2xl p-4 mt-1"
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
            <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 max-w-[40%]">
              Select where your song’s preview should start for platforms that
              support clips.
            </p>
            <div>
              <div className="w-full flex flex-wrap justify-between gap-y-10 mb-5 mt-10">
                <div className="flex flex-col w-[40%] max-sm:w-full">
                  <Input
                    value={SongForm.artist}
                    title={"Start Time (in seconds)"}
                    type={"text"}
                    name={"artist"}
                    placeholder={"Enter First name"}
                    updateValue={handleChange}
                  />
                <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                  This determines which part of your song will play in short previews on platforms like Spotify, Instagram, or TikTok.
                </p>
                </div>
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
            <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 max-w-[40%]">
              Add eye-catching artwork that represents your single.{" "}
            </p>
            <div className="flex items-center justify-center w-60">
              <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                <div className="flex flex-col max-sm:w-full gap-2">
                  <h4 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading w-full">
                    Artwork File
                  </h4>
                  <div className="flex items-center justify-center w-60">
                    <label
                      htmlFor="song_image"
                      className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                    >
                      <div
                        className={
                          "w-[50%] flex items-center justify-center p-3 rounded-2xl  text-white border border-neutral-100" +
                          (!SongForm.song_image && " bg-neutral-50 ")
                        }
                      >
                        <Image
                          src={image ? image : "/document-upload.svg"}
                          width={60}
                          height={60}
                          alt="music note icon"
                          className={
                            SongForm.song_image
                              ? " w-full object-cover"
                              : undefined
                          }
                        />
                      </div>
                      <div className="w-[50%]">
                        {!SongForm.song_image ? (
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                        ) : (
                          <p className="font-bold text-[16px] text-[#494949] truncate">
                            <span className="font-semibold">
                              {SongForm.song_image?.name}
                            </span>
                          </p>
                        )}
                      </div>
                      <input
                        id="song_image"
                        name="song_image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-neutral-50 border-2 border-neutral-100 flex-1 rounded-lg p-2 max-xl:hidden h-70 flex flex-col ">
          <div className="w-full h-full">
            {SongForm.song_image ? (
              <Image
                src={image ? image : ""}
                width={0}
                height={0}
                alt="preview of the artist song cover"
                className="rounded-lg w-full h-[70%] object-cover"
              />
            ) : (
              <div className="w-full h-[80%] bg-neutral-100 relative z-[10]">
                <p className="font-bold text-[16px] leading-[20px] text-text-disable tracking-[0.5px] absolute top-1/2 text-center w-full">
                  No Preview Available
                </p>
              </div>
            )}
          </div>
          <div>
            <p className="font-normal leading-[30px] tracking-[-1px] text-main-heading text-2xl">
              {SongForm.song_title || "Title"}
            </p>
            <p className="font-light leading-[20px] tracking-[-0.5px] text-main-heading text-[16px]">
              {SongForm.artist || "Artist"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongForm;
