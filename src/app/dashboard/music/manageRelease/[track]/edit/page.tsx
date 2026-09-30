"use client";
import { TrackForm, TrackFromApi } from "@/app/type";
import {
  containsEmoji,
  createEmptyTrack,
  isTrackFormValid,
  numRegex,
  runWithConcurrency,
  uploadAlbumTrack,
} from "@/util/middleware/functions";
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
import { useBeforeUnloadGuard } from "@/util/customHooks/useBeforeUnloadGuard";
import UploadTrackForm from "../UploadTrackForm";

const EditTrack = ({ params }: { params: Promise<{ track: string }> }) => {
  const queryClient = useQueryClient();
  const dashboardContext = useContext(DashboardContext);
  useEffect(() => {
    dashboardContext?.setHeader({ title: "Edit Tracks", showBackButton: true });
  }, []);
  const router = useRouter();
  const { track } = use(params);

  const api = UseAxios();

  const { data, isLoading, isError, error, refetch } = useGetAlbumTracks({
    albumTitle: track.replaceAll("-", " "),
  });

  const [tracks, setTracks] = useState<TrackForm[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  useBeforeUnloadGuard(
    isDistributing || tracks.some((t) => t.uploadStatus === "uploading"),
  );

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

    const mappedTracks: TrackForm[] = data.data.map(
      (item: TrackFromApi): TrackForm => ({
        id: item._id, // must exist
        title: item.releaseTitle || "",
        genre: item.genre || "",
        language: item.releaseLanguage || "",

        featuredArtist:
          item.featuredArtist.length > 0
            ? item.featuredArtist
            : [{ artistName: "", spotifyId: "", appleId: "", role: "" }],
        performer:
          item.performer.length > 0 ? item.performer : [{ name: "", role: "" }],
        songWriter:
          item.songWriter.length > 0
            ? item.songWriter
            : [{ first_name: "", last_name: "" }],
        producer:
          item.producer.length > 0 ? item.producer : [{ name: "", role: "" }],
        anotherDistributionCheck: item.anotherDistributionCheck || false,

        songAudio: null, // new upload
        // oldAudio: item.releaseAudio || null, // existing file

        lyrics: item.lyrics || "",
        startClip: item.startClip || "",

        isrc: item.isrc || "",
        trackNumber: item.trackNumber,

        explicitContent: item.explicitContent || false,
        compositionType: item.compositionType || "",
        instrumentalSource: item.instrumentalSource || "",
        countryOfRecording: item.countryOfRecording || "",
        validationError: "",
        uploadStatus: "idle",
        s3key: item.releaseAudio,
        uploadProgress: 100, // 0–100
        uploadError: null,
      }),
    );

    setTracks(mappedTracks);
    setActiveTrackId(mappedTracks[0].id);
  }, [data, isError, router]);

  console.log(tracks);

  if (isLoading || !data) {
    return <InlineLoadingScreen />;
  }

  const maxTracks = parseInt(data.album.numberOfTracks, 10);
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
  // Returns the s3 key on success, null on failure. Shared by the manual button and Distribute.
  async function uploadTrackAudio(track: TrackForm): Promise<string | null> {
    if (!track.songAudio) return track.s3key || null;

    const replace = Boolean(track.s3key); // it had a completed upload before this attempt

    updateTrack(track.id, {
      uploadStatus: "uploading",
      uploadProgress: 0,
      uploadError: null,
    });

    const { s3key, error } = await uploadAlbumTrack(
      track.songAudio,
      data?.album!.upc || "",
      api,
      track.trackNumber,
      replace,
      (pct) => updateTrack(track.id, { uploadProgress: pct }),
    );

    if (error !== null) {
      updateTrack(track.id, { uploadStatus: "failed", uploadError: error });
      return null;
    }

    updateTrack(track.id, {
      s3key,
      songAudio: null,
      uploadStatus: "completed",
      uploadProgress: 100,
      uploadError: null,
    });
    return s3key;
  }

  async function handleManualUpload(track: TrackForm) {
    if (!dashboardContext?.isPremium) {
      dashboardContext?.setOpenUpgradePopUp(true);
      return;
    }
    if (!track.songAudio) return toast.info("Track audio is required.");
    if (!track.trackNumber) return toast.info("Track number is required.");

    const s3key = await uploadTrackAudio(track);
    if (s3key) toast.success("Uploaded, please continue with the form.");
  }

  const handleSubmit = async (action: "draft" | "upload") => {
    if (!dashboardContext?.isPremium) {
      dashboardContext?.setOpenUpgradePopUp(true);
      return;
    }
    if (isDistributing || isSubmittingForm) return;

    // 1. Validate everything BEFORE uploading a single byte
    for (let i = 0; i < tracks.length; i++) {
      const t = tracks[i];
      const label = "track " + (i + 1) + " ";

      if (t.title.length < 3 || t.title.length > 32) {
        return toast.warn(
          label + "Song title must be longer than 3 not more than 32",
        );
      } else if (containsEmoji(t.title)) {
        return toast.warn(label + "Song title can not contain emojis");
      } else if (!t.trackNumber || !numRegex.test(t.trackNumber)) {
        return toast.warn(
          label + "Track number is required and must be a number.",
        );
      }

      if (action === "upload") {
        if (!t.songAudio && !t.s3key && !t.oldAudio) {
          return toast.warn(label + "audio is required.");
        }
        // The audio may not be uploaded yet, so give the validator a stand-in key
        const validForm = isTrackFormValid({
          ...t,
          s3key: t.s3key || "pending-upload",
        });
        if (validForm != "true") {
          return toast.warn(label + validForm);
        }
      }
    }

    try {
      let finalTracks: TrackForm[] = tracks;

      if (action === "upload") {
        // 2. Upload every track that still needs it, two at a time
        setIsDistributing(true);
        const pending = tracks.filter(
          (t) => t.songAudio && t.uploadStatus !== "completed",
        );

        const uploaded = await runWithConcurrency(pending, 2, async (t) => ({
          id: t.id,
          s3key: await uploadTrackAudio(t),
        }));

        const failedCount = uploaded.filter((u) => !u.s3key).length;
        if (failedCount > 0) {
          toast.error(
            `${failedCount} track(s) failed to upload. Check the tabs marked with "!", then press Distribute again. Finished tracks won't upload twice.`,
          );
          return;
        }

        // `tracks` above is a snapshot from before the uploads, so merge in the new keys
        const keyById = new Map(uploaded.map((u) => [u.id, u.s3key as string]));
        finalTracks = tracks.map((t) => ({
          ...t,
          s3key: keyById.get(t.id) ?? t.s3key,
          songAudio: null,
        }));
      }

      // 3. Save everything
      setIsSubmittingForm(true);
      const res = await api.put(
        action === "upload"
          ? "v1/music/album/track"
          : "v1/music/album/track/draft",
        JSON.stringify({ tracks: finalTracks, albumId: data.album._id }),
        { headers: { "Content-Type": "application/json" } },
      );

      toast.success(res?.data?.msg);
      refetch();
      router.back();
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error);
        return;
      }
      toast.error("something went wrong.");
    } finally {
      setIsDistributing(false);
      setIsSubmittingForm(false);
    }
  };

  return !activeTrack || !activeTrackId || isSubmittingForm ? (
    <InlineLoadingScreen />
  ) : (
    <div className="bg-main-white  max-sm:min-h-[90dvh] min-h-[90dvh] h-full w-full flex flex-col pb-20 lg:pb-5">
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
              {track.uploadStatus === "uploading" && (
                <span className="ml-1 text-xs">({track.uploadProgress}%)</span>
              )}
              {track.uploadStatus === "completed" && (
                <span className="ml-1">✓</span>
              )}
              {track.uploadStatus === "failed" && (
                <span className="ml-1 text-red-500">!</span>
              )}
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
          onUpload={() => handleManualUpload(activeTrack)}
          track={activeTrack}
          onChange={(patch) => updateTrack(activeTrack.id, patch)}
          onRemove={() => removeTrack(activeTrack.id)}
          album={data.album}
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
          {/* <button
            type="button"
            disabled={isSubmittingForm}
            onClick={() => {
              handleSubmit("draft");
            }}
            className="font-bold text-xs sm:text-sm rounded-xl px-4 py-2.5 border-2 border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 disabled:hover:bg-white transition-all flex items-center justify-center"
          >
            Save as Draft
          </button> */}

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
