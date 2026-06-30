"use client";
import { TrackForm, TrackFromApi } from "@/app/type";
import {
  containsEmoji,
  createEmptyTrack,
  isTrackFormValid,
} from "@/util/middleware/functions";
import Image from "next/image";
import React, { use, useContext, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import UseAxios from "@/util/customHooks/UseAxios";
import EditTrackForm from "./EditTrackForm";
import { useGetAlbums, useGetAlbumTracks } from "@/util/customHooks/useQueries";
import { InlineLoadingScreen } from "@/app/components/Loader/loader";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import DashboardContext from "@/app/context/dashboardContext/dashboardContext";

const EditTrack = ({ params }: { params: Promise<{ track: string }> }) => {
  const queryClient = useQueryClient();
  const dashboardContext = useContext(DashboardContext);
  useEffect(() => {
    dashboardContext?.setHeader({ title: "Edit Tracks", showBackButton: true });
  }, []);
  const router = useRouter();
  const { track } = use(params);

  const api = UseAxios();

  const { data: album, isLoading: isAlbumLoading } = useGetAlbums({
    albumTitle: track.replaceAll("-", " "),
  });
  const { data, isLoading, isError, error, refetch } = useGetAlbumTracks({
    albumTitle: track.replaceAll("-", " "),
  });

  const [tracks, setTracks] = useState<TrackForm[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  useEffect(() => {
    if (isError) {
      if (isAxiosError(error)) {
        if (error.status === 401) {
          return;
        } else {
          router.back();
          return;
        }
      } else {
        toast.error(error?.message);
        router.back();
        return;
      }
    }
    if (!data?.data?.length) return;

    const mappedTracks: TrackForm[] = data.data.map((item: TrackFromApi) => ({
      id: item._id, // must exist
      title: item.releaseTitle || "",
      genre: item.genre || "",
      language: item.releaseLanguage || "",
      artist: item.artistName || "",
      release_date: item.releaseDate || null,
      preOrderDate: item.preOrderDate || null,

      featured_artist:
        item.featuredArtist.length > 0
          ? item.featuredArtist
          : [{ artistName: "", spotifyId: "", appleId: "" }],
      performer:
        item.performer.length > 0 ? item.performer : [{ name: "", role: "" }],
      song_writer:
        item.songWriter.length > 0
          ? item.songWriter
          : [{ first_name: "", last_name: "" }],
      producer: item.producer.length > 0 ? item.producer : [{ name: "" }],

      pre_order_check: item.preOrderCheck || false,
      another_distribution_check: item.anotherDistributionCheck || false,

      song_audio: null, // new upload
      old_audio: item.releaseAudio || null, // existing file

      lyrics: item.lyrics || "",
      start_clip: item.startClip || "",

      isrc: item.isrc || "",
      upc: item.upc || "",
      track_number: item.trackNumber,

      explicit_content: item.explicitContent || false,
    }));

    setTracks(mappedTracks);
    setActiveTrackId(mappedTracks[0].id);
  }, [data, isError, router]);

  console.log(tracks);

  if (isAlbumLoading || !album || album.data.length < 1 || !data) {
    return <InlineLoadingScreen />;
  }

  const maxTracks = parseInt(album.data[0].numberOfTracks, 10);
  const activeTrack = tracks.find((t) => t.id === activeTrackId)!;
  // console.log("dss", activeTrack);

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
      setIsSubmittingForm(true);
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].artist = album.data[0].artistName;
        tracks[i].upc = album.data[0].upc;
        if (tracks[i].title.length < 3 || tracks[i].title.length > 32) {
          return (
            "track" +
            " " +
            (i + 1) +
            " " +
            "Song title must be longer than 3 not more than 32"
          );
        } else if (containsEmoji(tracks[i].title)) {
          return (
            "track" + " " + (i + 1) + " " + "Song title can not contain emojis"
          );
        }
        if (action === "upload") {
          const validForm = isTrackFormValid(tracks[i]);
          if (validForm != "true") {
            setIsSubmittingForm(false);
            return toast.warn("track" + " " + (i + 1) + " " + validForm);
          }
        } else if (action === "draft") {
        }
      }

      let res;

      if (action === "upload") {
        toast.info(
          "Uploading song. This may take a while depending on your internet speed.",
        );
        res = await api.put(
          "v1/music/album/track",
          JSON.stringify({ tracks, album: album.data[0].releaseTitle }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      } else {
        res = await api.put(
          "v1/music/album/track/draft",
          JSON.stringify({ tracks, album: album.data[0].releaseTitle }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      toast.success(res?.data?.msg);
      await queryClient.invalidateQueries({
        queryKey: ["edit tracks", album.data[0].releaseTitle],
        exact: true,
      });
      router.push("/dashboard/music/manageRelease?type=album");
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

  // const saveToLocalStorage = () => {
  //   localStorage.setItem(
  //     "albumTracks",
  //     JSON.stringify(tracks.map((track) => JSON.stringify(track))),
  //   );
  // };

  return isLoading || !activeTrack || !activeTrackId || isSubmittingForm ? (
    <InlineLoadingScreen />
  ) : (
    <div className="bg-main-white  max-sm:min-h-[90dvh] min-h-[90dvh] h-full w-full flex flex-col pb-20 lg:pb-5 lg:pl-[280px]">
      {/* <button
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
      </button> */}
      <div className="py-4 px-2">
        <div className="flex flex-wrap gap-2 mb-4">
          {tracks.map((track, index) => (
            <button
              className={
                " capitalize px-5 py-1 font-bold rounded-xl text-center max-w-fit hover:cursor-pointer text-sm " +
                (track.id === activeTrack?.id
                  ? " bg-primary hover:bg-primary/90 text-white"
                  : " bg-transparent border-2 border-text-disable text-text-disable")
              }
              key={index}
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
        <EditTrackForm
          setIsUploadingTrack={(v) => setIsSubmittingForm(v)}
          track={activeTrack}
          onChange={(patch) => updateTrack(activeTrack.id, patch)}
          onRemove={() => removeTrack(activeTrack.id)}
          album={album.data[0]}
        />
        <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-neutral-100 flex justify-end items-center gap-3 sm:gap-4 py-3 sm:py-4 px-4 sm:px-10 z-20 shadow-lg">
          {/* Delete Track Action Button */}
          <button
            type="button"
            aria-label="Delete featured artist track"
            disabled={tracks.length === 1 || isSubmittingForm}
            onClick={() => {
              removeTrack(activeTrackId);
            }}
            // className="p-2 text-white bg-red-500 hover:bg-primary-red disabled:opacity-90 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors mt-9 h-9 w-9 shrink-0"

            className="font-bold text-xs sm:text-sm rounded-xl bg-red-500 hover:bg-primary-red text-white p-3 hover:bg-error-700 disabled:opacity-90 disabled:hover:bg-error-600 transition-all flex items-center justify-center shrink-0"
          >
            <Trash2 size={14} />
          </button>

          {/* Save as Draft Action Button */}
          <button
            type="button"
            disabled={isSubmittingForm}
            onClick={() => {
              handleSubmit("draft");
            }}
            className="font-bold text-xs sm:text-sm rounded-xl px-4 py-2.5 border-2 border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 disabled:hover:bg-white transition-all flex items-center justify-center"
          >
            Save as Draft
          </button>

          {/* Distribute/Submit Form Action Button */}
          <button
            type="button"
            disabled={isSubmittingForm}
            onClick={() => {
              handleSubmit("upload");
            }}
            className="font-bold text-xs sm:text-sm rounded-xl px-5 py-2.5 text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:hover:bg-primary-500 transition-all flex items-center justify-center shadow-sm shadow-primary-500/10"
          >
            Distribute
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTrack;
