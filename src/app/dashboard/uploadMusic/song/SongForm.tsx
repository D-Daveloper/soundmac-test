"use client";
import CheckboxSelect from "@/app/components/checkBox/CheckBoxSelect";
import { SelectDate } from "@/app/components/datepicker/SelectDate";
import DynamicInput from "@/app/components/input/DynamicInput";
import Input from "@/app/components/input/Input";
import type {
  FeaturedArtist,
  Performer,
  Producer,
  SongForm,
  SongWriter,
} from "@/app/type";
import { genreList, performerRoles, territories } from "@/app/utils/constants";
import Select from "@/components/Select";
import UseAxios from "@/util/customHooks/UseAxios";
import { useTabQuery } from "@/util/customHooks/useTabQuery";
import { isFormValid } from "@/util/middleware/functions";
import { isAxiosError } from "axios";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const SongForm = () => {
  const api = UseAxios();
  const [image, setImage] = useState<string | null>(null);
  const [date, setDate] = useState({
    fromYear: new Date(),
    toYear: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
  });
  const [preview, setPreview] = useState(false);
  const [songForm, setSongForm] = useState<SongForm>({
    song_title: "",
    genre: "",
    language: "",
    artist: "gggg",
    release_date: undefined,
    preOrderDate: undefined,
    featured_artist: [{ artistName: "", spotifyId: "", appleId: "" }],
    performer: [{ name: "", role: "" }],
    song_writer: [{ first_name: "", last_name: "" }],
    producer: [{ first_name: "", last_name: "" }],
    pre_order_check: false,
    another_distribution_check: false,
    territories: [],
    song_audio: null,
    song_image: null,
    dsp: [],
    lyrics: "",
    start_clip: "",
    isrc: "",
    upc: "",
    copyRightHolder: "",
    copyRightYear: undefined,
  });
  const { deleteParam } = useTabQuery();

  const addField = (field: keyof SongForm) => {
    switch (field) {
      case "featured_artist":
        setSongForm((prev) => ({
          ...prev,
          featured_artist: [
            ...prev.featured_artist,
            { artistName: "", spotifyId: "", appleId: "" },
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
    if (name === "another_distribution_check" || name === "pre_order_check") {
      setSongForm((prev) => ({ ...prev, [name]: checked }));
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
  console.log(songForm);

  const handleDynamicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number,
    field: keyof SongForm // 'performers' or 'producers'
  ) => {
    const { name, value } = e.target;
    // console.log(name,value);

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
      case "song_writer":
        setSongForm((prev) => {
          // work explicitly with the song_writer array so spreading is on an array of objects
          const updatedList = [...prev.song_writer];
          updatedList[index] = {
            ...updatedList[index],
            [name as keyof SongWriter]: value,
          };
          return { ...prev, song_writer: updatedList };
        });
        break;
      case "performer":
        setSongForm((prev) => {
          // work explicitly with the song_writer array so spreading is on an array of objects
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
          // work explicitly with the song_writer array so spreading is on an array of objects
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
    // setSongForm((prev) => {
    //   const updatedList = [...prev[field]];
    //   updatedList[index] = { ...updatedList[index], [name]: value };
    //   return { ...prev, [field]: updatedList };
    // });
  };
  const handleSubmit = async (form: SongForm, action: "draft" | "upload") => {
    console.log(form);

    const string_form = { ...form, action: action };
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(`${key}[]`, v));
      } else {
        formData.append(key, value);
      }
    });
    if (songForm.song_image) formData.append("song_image", songForm.song_image);
    console.log(...formData);
    try {
      const res = await api.post("song", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.msg);
      localStorage.removeItem("songForm");
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error);
        return;
      }
      toast.error("something went wrong.");
    }
  };

  const handlePreview = (form: SongForm) => {
    console.log(form);
   
    if (preview === false) {
      const validForm = isFormValid(form);
      if (validForm != "true")
        return toast.warn(validForm);
      const string_form = JSON.stringify(form);
      const featured_artist = JSON.stringify(form.featured_artist);
      const song_writer = JSON.stringify(form.song_writer);
      const performer = JSON.stringify(form.performer);
      const producer = JSON.stringify(form.producer);
      localStorage.setItem("song_writer", song_writer);
      localStorage.setItem("songForm", string_form);
      localStorage.setItem("featured_artist", featured_artist);
      localStorage.setItem("performer", performer);
      localStorage.setItem("producer", producer);
    }
    setPreview(!preview);
  };

  useEffect(() => {
    const string_form = localStorage.getItem("songForm");
    const featured_artist = localStorage.getItem("featured_artist");
    const song_writer = localStorage.getItem("song_writer");
    const performer = localStorage.getItem("performer");
    const producer = localStorage.getItem("producer");

    if (string_form) {
      const songForm = JSON.parse(string_form);

      // Parse with fallback to default value
      const featured_artist1 = featured_artist
        ? JSON.parse(featured_artist)
        : [{ artistName: "", spotifyId: "", appleId: "" }];

      const song_writer1 = song_writer
        ? JSON.parse(song_writer)
        : [{ first_name: "", last_name: "" }];

      const performer1 = performer
        ? JSON.parse(performer)
        : [{ name: "", role: "" }];

      const producer1 = producer
        ? JSON.parse(producer)
        : [{ first_name: "", last_name: "" }];

      console.log(featured_artist1);

      setSongForm({
        ...songForm,
        featured_artist: featured_artist1,
        song_writer: song_writer1,
        performer: performer1,
        producer: producer1,
        release_date: songForm.release_date
          ? new Date(songForm.release_date)
          : undefined,
        song_image: null,
        song_audio: null,
      });
    }
  }, []);

 return (
    <div className="bg-main-white h-full w-full flex flex-col">
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
      <div className="flex gap-8 px-5 py-5">
        {!preview ? (
          <div className="flex-3 overflow-auto flex flex-col gap-10 px-5 pb-3 h-[64dvh]">
            {/* Song info */}
            <div>
              <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                Song Information
              </h1>
              <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                Provide the main details about your single to ensure it is
                properly identified and distributed.
              </p>
              <div className="w-full flex flex-wrap justify-between gap-y-10 mt-15 ">
                <div className="flex flex-col w-[40%] max-sm:w-full">
                  <Input
                    value={songForm.song_title}
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
                      selected={songForm.language}
                      setSelected={(t) =>
                        setSongForm((prev) => ({ ...prev, language: t }))
                      }
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
              <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
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
                      value={songForm.artist}
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
                {songForm.featured_artist.map((_, i) => (
                  <div
                    key={i}
                    className="w-full flex flex-wrap justify-between gap-y-10 mb-5"
                  >
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <DynamicInput
                        index={i}
                        field="featured_artist"
                        value={songForm.featured_artist[i].artistName}
                        title={"Artist name"}
                        type={"text"}
                        name={"artistName"}
                        placeholder={"Enter Artist Name"}
                        updateValue={handleDynamicChange}
                        required={true}
                      />
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <DynamicInput
                        index={i}
                        field="featured_artist"
                        value={songForm.featured_artist[i].spotifyId}
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
                        field="featured_artist"
                        value={songForm.featured_artist[i].appleId}
                        title={"Apple music ID"}
                        type={"text"}
                        name={"appleId"}
                        placeholder={"Enter Apple music ID"}
                        updateValue={handleDynamicChange}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <button
                    disabled={songForm.featured_artist.length === 5}
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
                  <button
                    disabled={songForm.featured_artist.length === 1}
                    onClick={() => {
                      setSongForm((prev) => ({
                        ...prev,
                        featured_artist: prev.featured_artist.filter(
                          (_, index) =>
                            index !== prev.featured_artist.length - 1
                        ),
                      }));
                    }}
                    className="font-bold text-sm rounded-lg bg-primary-red text-white px-4 py-2.5 hover:bg-primary-red/90 mt-9 flex"
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>

              {/* song writer */}
              <div>
                <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-15">
                  Songwriters
                </h2>
                <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                  You can leave blank if there are no songwriters on your
                  release
                </p>
                {songForm.song_writer.map((_, index) => (
                  <div
                    key={index}
                    className="w-full flex flex-wrap justify-between gap-y-10 mb-5"
                  >
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <DynamicInput
                        index={index}
                        field="song_writer"
                        value={songForm.song_writer[index].first_name}
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
                        field="song_writer"
                        value={songForm.song_writer[index].last_name}
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
                <div className="flex gap-2">
                  <button
                    disabled={songForm.song_writer.length === 12}
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
                  <button
                    disabled={songForm.song_writer.length === 1}
                    onClick={() => {
                      setSongForm((prev) => ({
                        ...prev,
                        song_writer: prev.song_writer.filter(
                          (_, index) => index !== prev.song_writer.length - 1
                        ),
                      }));
                    }}
                    className="font-bold text-sm rounded-lg bg-primary-red text-white px-4 py-2.5 hover:bg-primary-red/90 mt-9 flex"
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>

              {/* performers */}
              <div>
                <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-15">
                  Performers
                </h2>
                <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                  You can leave blank if there are no performers on your release
                </p>
                {songForm.performer.map((_, index) => (
                  <div
                    key={index}
                    className="w-full flex flex-wrap justify-between gap-y-10 mb-5"
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
                        <p className="font-medium mb-2 sm:text-sm text-lg">
                          Role
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
                <div className="flex gap-2">
                  <button
                    disabled={songForm.performer.length === 5}
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
                    disabled={songForm.performer.length === 1}
                    onClick={() => {
                      setSongForm((prev) => ({
                        ...prev,
                        performer: prev.performer.filter(
                          (_, index) => index !== prev.performer.length - 1
                        ),
                      }));
                    }}
                    className="font-bold text-sm rounded-lg bg-primary-red text-white px-4 py-2.5 hover:bg-primary-red/90 mt-9 flex"
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>

              {/* producer */}
              <div>
                <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-15">
                  Producers
                </h2>
                <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px] mb-5">
                  You can leave blank if there are no performers on your release
                </p>
                {songForm.producer.map((_, index) => (
                  <div
                    key={index}
                    className="w-full flex flex-wrap justify-between gap-y-10 mb-5"
                  >
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <DynamicInput
                        index={index}
                        field="producer"
                        value={songForm.producer[index].first_name}
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
                        field="producer"
                        value={songForm.producer[index].last_name}
                        title={"last name"}
                        type={"text"}
                        name={"last_name"}
                        placeholder={"Enter last name"}
                        updateValue={handleDynamicChange}
                        required={true}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
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
                  <button
                    disabled={songForm.producer.length === 1}
                    onClick={() => {
                      setSongForm((prev) => ({
                        ...prev,
                        producer: prev.producer.filter(
                          (_, index) => index !== prev.producer.length - 1
                        ),
                      }));
                    }}
                    className="font-bold text-sm rounded-lg bg-primary-red text-white px-4 py-2.5 hover:bg-primary-red/90 mt-9 flex"
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
              {/* release details */}
              <div>
                <h2 className="text-sm font-bold leading-[20px] tracking-[-0.5px] text-primary mt-15">
                  Release Details
                </h2>
                <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%] mb-5">
                  Set how and when your song goes live.
                </p>
                <div className="w-full flex flex-wrap justify-between gap-y-5">
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
                    {/* <Input
                    value={SongForm.release_date}
                    title={"Release Date"}
                    type={"text"}
                    name={"release_date"}
                    placeholder={"DD/MM/YY"}
                    updateValue={handleChange}
                    required={true}
                  /> */}
                    <SelectDate
                      disabled={false}
                      setDate={(date) =>
                        setSongForm((prev) => ({ ...prev, release_date: date }))
                      }
                      value={songForm.release_date}
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
                      selected={songForm.territories}
                      onChange={(s: string[]) => {
                        setSongForm((prev) => ({ ...prev, territories: s }));
                      }}
                    />
                  </div>
                  <div className="mt-5 justify-between w-full flex max-sm:flex-col">
                    <div className="flex w-fit gap-2 items-center">
                      <input
                        type="checkbox"
                        className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
                        name="pre_order_check"
                        checked={songForm.pre_order_check}
                        onChange={handleChange}
                      />
                      <p className="leading-6 text-sm sm:text-lg font-medium">
                        Pre-Order (optional)
                      </p>
                    </div>
                    <div className="flex flex-col w-[40%] max-sm:w-full">
                      <SelectDate
                        disabled={!songForm.pre_order_check}
                        setDate={(date) =>
                          setSongForm((prev) => ({
                            ...prev,
                            preOrderDate: date,
                          }))
                        }
                        value={songForm.preOrderDate}
                        releaseDate={songForm.release_date}
                        type="second"
                        toYear={date.toYear}
                        fromYear={date.fromYear}
                      />
                      <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                        Pre order date must be 3 weeks before the release date
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
              <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
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
                  <CheckboxSelect
                    title="Select DSPs"
                    options={territories}
                    selected={songForm.dsp}
                    onChange={(s: string[]) => {
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
              <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                Audio Upload
              </h1>
              <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                Upload your track in the correct format for distribution.
              </p>
              <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
                <div className="flex flex-col w-[40%] max-sm:w-full gap-2">
                  <div className="flex gap-1">
                    <h4 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                      Audio Upload
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
                        {!songForm.song_audio ? (
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                        ) : (
                          <p className="font-bold text-[16px] text-[#494949] truncate max-w-[50%]">
                            <span className="font-semibold truncate">
                              {songForm.song_audio?.name}
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
              <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
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
                  value={songForm.lyrics}
                  onChange={(e) =>
                    setSongForm((prev) => ({ ...prev, lyrics: e.target.value }))
                  }
                  className="w-full sm:w-[70%] min-h-80 border-2 rounded-2xl p-4 mt-1"
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
                Select where your song’s preview should start for platforms that
                support clips.
              </p>
              <div>
                <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10">
                  <div className="flex flex-col w-[40%] max-sm:w-full">
                    <Input
                      value={songForm.start_clip}
                      title={"Start Time (in seconds)"}
                      type={"text"}
                      name={"start_clip"}
                      placeholder={"30"}
                      updateValue={handleChange}
                      required={true}
                    />
                    <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                      This determines which part of your song will play in short
                      previews on platforms like Spotify, Instagram, or TikTok.
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
              <p className="text-text-body font-normal leading-[18px] tracking-[-0.5px] text-sm mt-3 sm:max-w-[40%]">
                Add eye-catching artwork that represents your single.{" "}
              </p>
              <div className="flex items-center justify-center w-60">
                <div className="w-full flex flex-wrap justify-between gap-y-10 mt-10 ">
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
                        htmlFor="song_image"
                        className="flex p-3 gap-3 items-center justify-center w-full h-28 border-2 border-gray-300 rounded-3xl cursor-pointer bg-gray-50  hover:bg-gray-100"
                      >
                        <div
                          className={
                            "w-[50%] flex items-center justify-center p-3 rounded-2xl  text-white border border-neutral-100" +
                            (!songForm.song_image && " bg-neutral-50 ")
                          }
                        >
                          <Image
                            src={image ? image : "/document-upload.svg"}
                            width={60}
                            height={60}
                            alt="music note icon"
                            className={
                              songForm.song_image
                                ? " w-full object-cover"
                                : undefined
                            }
                          />
                        </div>
                        <div className="w-[50%]">
                          {!songForm.song_image ? (
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                          ) : (
                            <p className="font-bold text-[16px] text-[#494949] truncate">
                              <span className="font-semibold">
                                {songForm.song_image?.name}
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
              {/* <div className="flex w-fit gap-2 items-center mb-5">
                <input
                  type="checkbox"
                  className="p-5 max-sm:p-3 rounded-lg accent-primary hover:accent-primary"
                  name="another_distribution_check"
                  checked={songForm.another_distribution_check}
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
                  checked={songForm.another_distribution_check}
                  onChange={handleChange}
                />
                <p className="leading-6 text-sm font-medium">
                  Transferring from another distributor?
                </p>
              </div>
              <div className="w-full flex flex-wrap justify-between gap-y-10">
                <div className="flex flex-col w-[40%] max-sm:w-full">
                  <Input
                    value={songForm.isrc}
                    title={"Isrc"}
                    type={"text"}
                    name={"isrc"}
                    placeholder={"Enter Isrc"}
                    updateValue={handleChange}
                    disabled={!songForm.another_distribution_check}
                    uppercase={true}
                    required={songForm.another_distribution_check}
                  />
                  <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                    Unique code for tracking sales/streams.
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
                    disabled={!songForm.another_distribution_check}
                    uppercase={true}
                    required={songForm.another_distribution_check}
                  />
                  <p className="font-light italic text-warning-700 text-xs leading-[18px] tracking-[0.5px]">
                    Unique code for tracking sales/streams.
                  </p>
                </div>
                <div className="flex flex-col w-[40%] max-sm:w-full">
                  <Input
                    value={songForm.copyRightHolder}
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
                <div className="flex flex-col w-[40%] max-sm:w-full">
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
                  <SelectDate
                    disabled={false}
                    setDate={(date) =>
                      setSongForm((prev) => ({
                        ...prev,
                        copyRightYear: date,
                      }))
                    }
                    value={songForm.copyRightYear}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-3 overflow-auto flex flex-col gap-20 px-1 pb-3 h-[64dvh]">
            <div>
              <h1 className="text-xl font-semibold leading-[24px] tracking-[-0.5px] text-main-heading">
                Song Summary
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
                          className="min-w-32 h-32 object-cover rounded-2xl flex-1"
                        />
                      </div>
                      <p className="text-text-body font-bold text-sm leading-[18px] tracking-[0.5px] truncate min-w-[80%] flex-2">
                        {songForm.song_image?.name}
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
                <h2>Song Title</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  Pain
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <h2>Language</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  {songForm.language}
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <h2>Main Artist</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  {songForm.artist}
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <h2>Featured Artists</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  {songForm.featured_artist.map(
                    (item) => item.artistName + ","
                  )}
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <h2>Performers</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  {songForm.performer.map((item) => item.name + ",")}
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <h2>Songwriter</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  {songForm.song_writer.map((item) => item.first_name + ",")}
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <h2>Producer</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  {songForm.producer.map((item) => item.first_name + ",")}
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <h2>Territories</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  {songForm.territories.join(",")}
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <h2>UPC</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  {songForm.upc}
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <h2>ISRC</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  {songForm.isrc}
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <h2>Release date</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  {songForm.release_date?.toLocaleDateString() || ""}
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>
              <div className="flex flex-col w-[40%] max-sm:w-full">
                <h2>Preorder Start date</h2>
                <p className="truncate text-text-body font-normal text-2xl leading-[30px] tracking-[1px]">
                  {songForm.preOrderDate?.toLocaleDateString() || ""}
                </p>
                {/* border line */}
                <div className="border border-neutral-100"></div>
              </div>
            </div>
          </div>
        )}
        <div className="bg-neutral-50 border-2 border-neutral-100 flex-1 rounded-lg p-2 max-xl:hidden h-70 flex flex-col ">
          <div className="w-full h-[80%] flex-2">
            {songForm.song_image ? (
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
            <p className="font-normal leading-[30px] tracking-[-1px] text-main-heading text-2xl">
              {songForm.song_title || "Title"}
            </p>
            <p className="font-light leading-[20px] tracking-[-0.5px] text-main-heading text-[16px]">
              {songForm.artist || "Artist"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#F0F0E7] border border-neutral-100 flex justify-end items-center gap-5 h-20 pr-10 fixed bottom-0 z-2 left-0 w-full">
        <button
          onClick={() => {
            handleSubmit(songForm, "draft");
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
            handleSubmit(songForm, "upload");
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
            handlePreview(songForm);
          }}
          className={
            "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-white bg-primary-500 "
          }
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>
    </div>
  );
};

export default SongForm;
