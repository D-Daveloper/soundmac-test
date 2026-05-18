"use client";
import { TrackForm } from "@/app/type";
import {
  containsEmoji,
  createEmptyTrack,
  isTrackFormValid,
  numRegex,
} from "@/util/middleware/functions";
import Image from "next/image";
import React, { use, useContext, useEffect, useState } from "react";
import UploadTrackForm from "./UploadTrackForm";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import UseAxios from "@/util/customHooks/UseAxios";
import { useRouter } from "next/navigation";
import { useGetAlbums } from "@/util/customHooks/useQueries";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";

const UploadTrack = ({ params }: { params: Promise<{ track: string }> }) => {
  const dashboardContext = useContext(DashboardContext);
  useEffect(() => {
    dashboardContext?.setLayoutHeaderMessage("Upload tracks");
  }, []);
  const { track } = use(params);
  console.log(track);

  const api = UseAxios();
  const router = useRouter();
  // const [album, setAlbum] = useState<albumFromApi | null>(null);
  const {
    data: album,
    isLoading,
    refetch,
  } = useGetAlbums({
    albumTitle: track.replaceAll("-", " "),
  });
  const [tracks, setTracks] = useState<TrackForm[]>([createEmptyTrack()]);
  const [activeTrackId, setActiveTrackId] = useState(tracks[0].id);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  if (isLoading || !album) {
    return <InlineLoadingScreen />;
  }else if(
    album.data.length < 1
  ){
    toast.error(album.msg)
    return router.push("/dashboard/music/manageRelease?type=album");
  }
  const maxTracks = parseInt(album.data[0].numberOfTracks, 10); // e.g. 5

  const activeTrack = tracks.find((t) => t.id === activeTrackId)!;

  function addTrack() {
    if (tracks.length >= maxTracks) return;
    if (isTrackFormValid(activeTrack) != "true") {
      activeTrack.validationError = "track " + isTrackFormValid(activeTrack);
    }
    const newTrack = createEmptyTrack();
    setTracks((prev) => [...prev, newTrack]);
    setActiveTrackId(newTrack.id);
  }

  function removeTrack(id: string) {
    if (tracks.length === 1) return;

    setTracks((prev) => prev.filter((t) => t.id !== id));

    if (activeTrackId === id) {
      const next = tracks.find((t) => t.id !== id);
      if (next) setActiveTrackId(next.id);
    }
  }

  function updateTrack(id: string, patch: Partial<TrackForm>) {
    setTracks((prev) =>
      prev.map((track) => (track.id === id ? { ...track, ...patch } : track)),
    );
  }

  const handleSubmit = async (action: "draft" | "upload") => {
    try {
      if (!dashboardContext?.isPremium) {
        dashboardContext?.setOpenUpgradePopUp(true);
        return;
      }
      setIsSubmittingForm(true);
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].artist = album.data[0].artistName;
        tracks[i].upc = album.data[0].upc;
        if (tracks[i].title.length < 3 || tracks[i].title.length > 32) {
          return toast.warn(
            "track" +
              " " +
              (i + 1) +
              " " +
              "Song title must be longer than 3 not more than 32",
          );
        } else if (containsEmoji(tracks[i].title)) {
          return toast.warn(
            "track" + " " + (i + 1) + " " + "Song title can not contain emojis",
          );
        } else if (
          !tracks[i].track_number ||
          !numRegex.test(tracks[i].track_number)
        ) {
          return toast.warn(
            "track" +
              " " +
              (i + 1) +
              " " +
              "Track number is required and must be a number.",
          );
        } else if (
          !album.data[0].unassignedNumbers.includes(tracks[i].track_number)
        ) {
          return toast.warn(
            "track" + " " + (i + 1) + " " + "Invalid Track number.",
          );
        }
        if (action === "upload") {
          const validForm = isTrackFormValid(tracks[i]);
          if (validForm != "true") {
            setIsSubmittingForm(false);
            return toast.warn("track" + " " + (i + 1) + " " + validForm);
          }
        }
      }

      let res;

      if (action === "upload") {
        res = await api.post(
          "album/track",
          JSON.stringify({ tracks, album: album.data[0].releaseTitle }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      } else {
        res = await api.post(
          "album/track/draft",
          JSON.stringify({ tracks, album: album.data[0].releaseTitle }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      toast.success(res?.data?.msg);
      //   localStorage.removeItem("songForm");
      //   localStorage.removeItem("song_writer");
      //   localStorage.removeItem("featured_artist");
      //   localStorage.removeItem("performer");
      //   localStorage.removeItem("producer");
      refetch();
      router.back();
      //   setImage(null);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error);
        return;
      }
      toast.error("something went wrong.");
      // songForm.music_image = null;
      // songForm.song_audio = null;
    } finally {
      setIsSubmittingForm(false);
      // setPreview(false);
    }
  };

  // const saveToLocalStorage = () => {
  //   localStorage.setItem(
  //     "albumTracks",
  //     JSON.stringify(tracks.map((track) => JSON.stringify(track))),
  //   );
  // };

  return (
    <div className="bg-main-white  max-sm:min-h-[90dvh] min-h-[90dvh] h-full w-full flex flex-col pb-10 lg:pl-[300px]">
      {isSubmittingForm ? (
        <InlineLoadingScreen />
      ) : (
        <>
          <button
            onClick={() => {
              // saveToLocalStorage();
              router.push("/dashboard/music/manageRelease?type=album");
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
          <div>
            <div className="flex gap-2 mb-4">
              {tracks.map((track, index) => (
                <button
                  className={
                    " capitalize px-5 py-2 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
                    (track.id === activeTrack?.id
                      ? " bg-primary hover:bg-primary/90 text-white"
                      : " bg-transparent border-2 border-text-disable text-text-disable")
                  }
                  key={track.id}
                  onClick={() => {
                    setActiveTrackId(track.id);
                  }}
                >
                  Track {index + 1}
                </button>
              ))}

              {tracks.length < 5 && (
                <button
                  className={
                    " capitalize px-5 py-1 font-bold rounded-md text-center max-w-fit hover:cursor-pointer text-xl bg-transparent border-2 border-primary-500 text-primary-500"
                  }
                  onClick={() => addTrack()}
                >
                  +
                </button>
              )}
            </div>
            <UploadTrackForm
              setIsUploadingTrack={(v) => setIsSubmittingForm(v)}
              track={activeTrack}
              onChange={(patch) => updateTrack(activeTrack.id, patch)}
              onRemove={() => removeTrack(activeTrack.id)}
              album={album.data[0]}
            />
            <div className="bg-[#F0F0E7] mt-30 border border-neutral-100 flex justify-end items-center gap-5 h-20 pr-10 fixed bottom-0 z-2 left-0 w-full">
              <button
                arelia-label="delete featured artist"
                disabled={tracks.length === 1 || isSubmittingForm}
                onClick={() => {
                  removeTrack(activeTrackId);
                }}
                className="font-bold text-sm rounded-lg bg-primary-red text-white px-4 py-2.5 hover:bg-primary-red/90 flex"
              >
                <Trash2 />
              </button>
              <button
                disabled={isSubmittingForm}
                onClick={() => {
                  handleSubmit("draft");
                }}
                className={
                  "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 border-3 border-primary text-main-heading flex "
                }
              >
                {" "}
                Save as Draft
              </button>
              <button
                disabled={isSubmittingForm}
                onClick={() => {
                  handleSubmit("upload");
                }}
                className={
                  "font-bold text-sm rounded-lg  px-4 py-2.5 hover:bg-primary/20 border-3 border-primary flex text-white bg-primary-500 "
                }
              >
                Distribute
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UploadTrack;
