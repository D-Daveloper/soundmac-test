import {
  AlbumForm,
  CreateArtistForm,
  FeaturedArtist,
  NonRetryableErrorCode,
  Performer,
  Producer,
  SongForm,
  SongWriter,
} from "@/app/type";
import axios from "axios";
import { addWeeks, subWeeks } from "date-fns";
import { toast } from "react-toastify";
import { deleteSongsFromS3WithRetry, s3 } from "./aws";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { genreList, RETRY_CONFIG } from "@/app/utils/constants";
import mongoose from "mongoose";
import Artist from "../models/artistModel";
import SongModel from "../models/songModel";
import { languagesList } from "@/app/constant";
// import sharp from "sharp";
// import { s3 } from "./aws";
// import { PutObjectCommand } from "@aws-sdk/client-s3";

const OtpCharacters = (process.env.OTP_CHARACTERS as string) || "1234567890";
const otpLength = process.env.OTP_LENGTH as unknown as number;
export const generateOtp = () => {
  let otp = "";
  for (let i = 0; i < otpLength; i++) {
    const randomIndex = Math.floor(Math.random() * OtpCharacters.length);
    otp += OtpCharacters.charAt(randomIndex);
  }
  return otp;
};

export const isSongFormValid = (form: SongForm): string => {
  console.log(form);
  const twoWeeks = addWeeks(new Date(), 2);
  let oneWeek = null;

  if (form.release_date != undefined)
    oneWeek = subWeeks(new Date(form.release_date), 1);
  if (form.title === "") {
    return "Song title is required";
  } else if (form.title.length < 3 || form.title.length > 32) {
    return "Song title must be longer than 3 not more than 32";
  } else if (containsEmoji(form.title)) {
    return "Song title can not contain emojis";
  } else if (form.genre === "") {
    return "Genre is required";
  } else if (form.language === "") {
    return "language is required";
  } else if (form.artist === "") {
    return "artist is required";
  } else if (
    form.song_writer.some((artist) => artist.first_name === "") ||
    form.song_writer.some((artist) => artist.last_name === "")
  ) {
    return "song writer is required";
  } else if (
    form.performer.some((artist) => artist.name === "") ||
    form.performer.some((artist) => artist.role === "")
  ) {
    return "performer is required";
  } else if (form.producer.some((artist) => artist.name === "")) {
    return "producer is required";
  } else if (form.release_date === undefined) {
    return "Release date is required";
  } else if (new Date(form.release_date) < twoWeeks) {
    return "Release date must be at least two weeks ahead of the upload date";
  } else if (form.territories.length <= 0) {
    return "Territories is required";
  } else if (form.pre_order_check && form.preOrderDate === undefined) {
    return "Pre order date is required";
  } else if (oneWeek && form.preOrderDate! > oneWeek) {
    return "Pre order date must be at least one week before the release date";
  } else if (form.dsp.length <= 0) {
    return "DSP is required";
  } else if (form.song_audio == null) {
    return "Audio is required";
  } else if (form.start_clip == "" || !parseFloat(form.start_clip)) {
    return "Starting Clip is required and must be a valid number";
  } else if (form.music_image == null) {
    return "Image is required";
  } else if (
    form.another_distribution_check &&
    (form.isrc === "" || form.upc === "")
  ) {
    return "ISRC and UPC is required";
  } else if (form.copyRightHolder === "" || form.copyRightYear === "") {
    return "Copy right holder and year is required";
  } else {
    return "true";
  }
};

export const isAlbumFormValid = (form: AlbumForm): string => {
  console.log(form);
  const twoWeeks = addWeeks(new Date(), 2);
  let oneWeek = null;

  if (form.release_date != undefined)
    oneWeek = subWeeks(new Date(form.release_date), 1);
  if (form.title === "") {
    return "Album title is required";
  } else if (form.title.length < 3 || form.title.length > 32) {
    return "Album title must be longer than 3 not more than 32";
  } else if (form.genre === "") {
    return "Genre is required";
  } else if (form.language === "") {
    return "language is required";
  } else if (form.artist === "") {
    return "artist is required";
  } else if (form.release_date === undefined) {
    return "Release date is required";
  } else if (new Date(form.release_date) < twoWeeks) {
    return "Release date must be at least two weeks ahead of the upload date";
  } else if (form.territories.length <= 0) {
    return "Territories is required";
  } else if (form.pre_order_check && form.preOrderDate === undefined) {
    return "Pre order date is required";
  } else if (oneWeek && form.preOrderDate! > oneWeek) {
    return "Pre order date must be at least one week before the release date";
  } else if (form.dsp.length <= 0) {
    return "DSP is required";
  } else if (form.music_image == null) {
    return "Image is required";
  } else if (form.copyRightHolder === "" || form.copyRightYear === "") {
    return "Copy right holder and year is required";
  } else {
    return "true";
  }
};
export const isArtistFormValid = (form: CreateArtistForm): string => {
  console.log(form);

  if (!form.artist_name) {
    return "Artist name is required";
  } else if (form.artist_name.length < 3 || form.artist_name.length > 32) {
    return "Artist name must be longer than 3 not more than 32";
  } else if (
    form.hasPlatformId &&
    (form.apple_id === "" || form.spotify_id === "")
  ) {
    return "Apple ID and or Spotify ID is required";
  } else if (form.artist_image == null) {
    return "Image is required";
  } else {
    return "true";
  }
};

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export const buildSort = (sort: string) => {
  if (sort.startsWith("-")) {
    return { [sort.substring(1)]: -1 }; // descending
  }
  return { [sort]: 1 }; // ascending
};

export const handleCopy = async (text: string) => {
  await navigator.clipboard.writeText(text);
  toast.info("copied");
};

export const uploadTrack = async (
  file: File,
  upc: string,
  artist: string,
  isFromAnotherDistributor: boolean,
) => {
  try {
    // 1. Ask for permission
    const res = await fetch("/api/createawssignedurl", {
      method: "POST",
      body: JSON.stringify({
        fileType: file.type,
        fileSize: file.size,
        upcFromClient: upc, //the initial upc the user inputed if any. it serves as the file name in aws
        artist,
        isFromAnotherDistributor,
      }),
    });

    const { uploadUrl, s3Key, upcFromServer, uploadId } = await res.json();

    // 2. Upload directly to S3
    await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type },
    });
    return { upc: upcFromServer, songS3Key: s3Key, error: null, uploadId };
  } catch (error) {
    console.log("upload track error function line 181", error);

    return {
      upc: null,
      songS3Key: null,
      error: "Something went wrong please try again later!",
    };
  }
};

export const uploadImage = async (
  fileType: string,
  buffer: Buffer<ArrayBuffer>,
  key: string,
): Promise<{ error: string | null; coverUrl: string | null }> => {
  try {
    // const buffer = Buffer.from(await file.arrayBuffer());

    // const key = `soundmac4/${folderName}/${fileName}.${
    //   file.type.split('/')[1]
    // }`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: fileType,
        ACL: "public-read", // OK for Images
      }),
    );
    return {
      error: null,
      coverUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  } catch (error) {
    console.log("upload image error", error);

    return { error: "Internal Server Error", coverUrl: null };
  }
};

export const numRegex = /^\d+$/;

export function containsEmoji(text: any) {
  const textToCheck = String(text);
  return /[\p{Emoji}]/u.test(textToCheck);
}
/**
 * Main function to delete artist and associated songs
 */
export async function deleteArtistAndSongs(artistId: string, userId: string) {
  // Validate inputs
  if (!artistId || !userId) {
    throw new Error("Artist ID and User ID are required");
  }

  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    throw new Error("Invalid artist ID format");
  }

  try {
    // 1. Verify artist exists and belongs to user
    const artist = await Artist.findOne({
      _id: artistId,
      user: userId,
    });

    if (!artist) {
      throw new Error(
        "Artist not found or you do not have permission to delete it",
      );
    }

    // 2. Get all songs BEFORE deleting (need S3 keys)
    const songs = await SongModel.find({ artist: artistId });

    console.log(
      `Found ${songs.length} songs to delete for artist: ${artist.artistName}`,
    );

    // 3. Delete from S3 FIRST with retry logic
    let s3DeletedCount = 0;
    if (songs.length > 0) {
      s3DeletedCount = await deleteSongsFromS3WithRetry(songs);
      console.log(`Successfully deleted ${s3DeletedCount} files from S3`);
    }

    // 4. Delete from database (only after S3 success)
    const deleteArtistResult = await Artist.deleteOne({
      _id: artistId,
      user: userId,
    });

    if (deleteArtistResult.deletedCount === 0) {
      throw new Error("Failed to delete artist from database");
    }

    const deleteSongsResult = await SongModel.deleteMany({ artist: artistId });

    return {
      success: true,
      message: "Artist, songs, and files deleted successfully",
      data: {
        artistId: artist._id,
        artistName: artist.artistName,
        songsDeleted: deleteSongsResult.deletedCount,
        filesDeleted: s3DeletedCount,
      },
    };
  } catch (error) {
    console.error("Error deleting artist and songs:", error);
    throw error;
  }
}

export async function retryWithBackoff(
  operation: () => Promise<any>,
  config = RETRY_CONFIG,
  operationName = "Operation",
) {
  let lastError;
  let delay = config.initialDelayMs;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      console.log(
        `${operationName} - Attempt ${attempt}/${config.maxAttempts}`,
      );

      const result = await operation();

      if (attempt > 1) {
        console.log(`${operationName} succeeded on attempt ${attempt}`);
      }

      return result;
    } catch (error: any) {
      lastError = error;

      console.error(
        `${operationName} - Attempt ${attempt}/${config.maxAttempts} failed:`,
        error?.message,
      );

      // Don't retry on certain errors
      if (isNonRetryableError(error)) {
        console.error(`${operationName} - Non-retryable error, aborting`);
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === config.maxAttempts) {
        console.error(
          `${operationName} - All ${config.maxAttempts} attempts failed`,
        );
        throw new Error(
          `${operationName} failed after ${config.maxAttempts} attempts. Last error: ${error?.message}`,
        );
      }

      // Wait before retrying with exponential backoff
      console.log(`${operationName} - Waiting ${delay}ms before retry...`);
      await sleep(delay);

      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
    }
  }

  throw lastError;
}

function isNonRetryableError(error: NonRetryableErrorCode): boolean {
  // Don't retry on these error codes
  const nonRetryableCodes: string[] = [
    "NoSuchBucket",
    "AccessDenied",
    "InvalidAccessKeyId",
    "SignatureDoesNotMatch",
    "NoSuchKey", // File doesn't exist (already deleted is OK)
  ];

  if (error.name && nonRetryableCodes.includes(error.name)) {
    return true;
  }

  if (error.Code && nonRetryableCodes.includes(error.Code)) {
    return true;
  }

  // Don't retry on 4xx errors (except 429 - rate limit)
  if (error.$metadata?.httpStatusCode) {
    const statusCode: number = error.$metadata.httpStatusCode;
    if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
      return true;
    }
  }

  return false;
}

/**
 * Sleep utility
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeJsonParse<T>(value: any): T | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getArray<T>(formData: FormData, key: string): T[] {
  return formData
    .getAll(key)
    .map((v) => safeJsonParse<T>(v))
    .filter(Boolean) as T[];
}

export function parseSongFormData(formData: FormData) {
  return {
    uploadId: formData.get("uploadId") as string | null,
    actionType: formData.get("action") as "upload" | "draft" | null,

    title: formData.get("title") as string | null,
    genre: formData.get("genre") as string | null,
    language: formData.get("language") as string | null,

    artist: formData.get("artist") as string | null,

    featured_artist: getArray<FeaturedArtist>(formData, "featured_artist"),
    performer: getArray<Performer>(formData, "performer"),
    song_writer: getArray<SongWriter>(formData, "song_writer"),
    producer: getArray<Producer>(formData, "producer"),

    territories: getArray<string>(formData, "territories"),
    dsp: getArray<string>(formData, "dsp"),

    lyrics: formData.get("lyrics") as string | null,
    startClip: formData.get("start_clip") as string | null,

    isrc: formData.get("isrc") as string | null,
    upc: formData.get("upc2") as string | null,

    releaseDate: formData.get("release_date") as string | null,
    preOrderDate: formData.get("preOrderDate") as string | null,

    preOrderCheck: formData.get("pre_order_check") === "true",
    anotherDistributionCheck:
      formData.get("another_distribution_check") === "true",

    explicitContent: formData.get("explicit_content") === "true",

    s3KeyAudio: formData.get("s3keyAudio") as string | null,
    musicImage: formData.get("music_image") as File | null,

    copyRightYear: formData.get("copyRightYear") as string | null,
    copyRightHolder: formData.get("copyRightHolder") as string | null,
  };
}

export function parseAlbumFormData(formData: FormData) {
  return {
    actionType: formData.get("action") as "upload" | "draft" | null,

    title: formData.get("title") as string | null,
    genre: formData.get("genre") as string | null,
    language: formData.get("language") as string | null,

    artist: formData.get("artist") as string | null,

    territories: getArray<string>(formData, "territories"),
    dsp: getArray<string>(formData, "dsp"),

    isrc: formData.get("isrc") as string | null,
    upc: formData.get("upc") as string | null,

    releaseDate: formData.get("release_date") as string | null,
    preOrderDate: formData.get("preOrderDate") as string | null,

    preOrderCheck: formData.get("pre_order_check") === "true",
    anotherDistributionCheck:
      formData.get("another_distribution_check") === "true",

    musicImage: formData.get("music_image") as File | null,

    copyRightYear: formData.get("copyRightYear") as string | null,
    copyRightHolder: formData.get("copyRightHolder") as string | null,
    numberOfTracks: formData.get("number_of_track") as string | null,
  };
}

export function validateNonDraftSongs(
  payload: ReturnType<typeof parseSongFormData>,
) {
  const twoWeeksFromNow = addWeeks(new Date(), 2);
  let oneWeek = null;

  if (!payload.uploadId || typeof payload.uploadId != "string") {
    return "uploadId is required.";
  }

  if (
    !payload.title ||
    typeof payload.title !== "string" ||
    payload.title.length <= 3 ||
    containsEmoji(payload.title)
  ) {
    return "Song title is required and must be longer than 3 letters.";
  }

  if (!payload.genre || !genreList.includes(payload.genre)) {
    return "Invalid genre";
  }

  if (!payload.language || !languagesList.includes(payload.language)) {
    return "Invalid language";
  }

  if (!payload.releaseDate || typeof payload.releaseDate != "string") {
    return "Release date is required";
  }

  oneWeek = subWeeks(new Date(payload.releaseDate), 1); //used to validate pre order date.

  if (new Date(payload.releaseDate) < twoWeeksFromNow) {
    return "Release date must be at least 2 weeks ahead";
  }

  if (
    !payload.song_writer ||
    !(payload.song_writer instanceof Array) ||
    payload.song_writer.some((artist) => artist.first_name === "") ||
    payload.song_writer.some((artist) => artist.last_name === "")
  ) {
    return "Song writer is required";
  }

  if (
    !payload.producer ||
    !(payload.producer instanceof Array) ||
    payload.producer.some((artist) => artist.name === "")
  ) {
    return "Producer is required";
  }

  if (
    !payload.performer ||
    !(payload.performer instanceof Array) ||
    payload.performer.some((artist) => artist.name === "" || artist.role === "")
  ) {
    return "Performer is required";
  }

  if (
    !(payload.territories instanceof Array) ||
    payload.territories.length <= 0
  ) {
    return "Please Select Territories.";
  }

  if (
    (payload.preOrderCheck && payload.preOrderDate === undefined) ||
    typeof payload.preOrderDate != "string"
  ) {
    return "Pre order Date is required";
  }

  if (oneWeek && new Date(payload.preOrderDate!) >= oneWeek) {
    return "Pre order Date must be 1 week from the release date.";
  }

  if (!(payload.dsp instanceof Array) || payload.dsp.length <= 0) {
    return "Please Select a Dsp.";
  }

  if (
    !payload.startClip ||
    typeof payload.startClip != "string" ||
    !numRegex.test(payload.startClip)
  ) {
    return "Start Clip is required.";
  }

  if (payload.anotherDistributionCheck && payload.isrc === "") {
    return "ISRC is required when transferring from another distributor.";
  }

  if (payload.copyRightHolder === "" || payload.copyRightYear === "") {
    return "Copy write year and Copy write holder is required";
  }

  if (!payload.musicImage) {
    return "Release image is required";
  }

  if (!["image/jpeg", "image/png"].includes(payload.musicImage.type)) {
    return "Invalid image format";
  }

  if (!payload.s3KeyAudio) {
    return "Audio upload is required";
  }

  return null;
}

export function validateNonDraftAlbums(
  payload: ReturnType<typeof parseAlbumFormData>,
) {
  const twoWeeksFromNow = addWeeks(new Date(), 2);
  let oneWeek = null;

  if (
    !payload.title ||
    typeof payload.title !== "string" ||
    payload.title.length <= 3 ||
    containsEmoji(payload.title)
  ) {
    return "Song title is required and must be longer than 3 letters.";
  }

  if (!payload.genre || !genreList.includes(payload.genre)) {
    return "Invalid genre";
  }

  if (!payload.language || !languagesList.includes(payload.language)) {
    return "Invalid language";
  }

  if (!payload.releaseDate || typeof payload.releaseDate != "string") {
    return "Release date is required";
  }

  oneWeek = subWeeks(new Date(payload.releaseDate), 1); //used to validate pre order date.

  if (new Date(payload.releaseDate) < twoWeeksFromNow) {
    return "Release date must be at least 2 weeks ahead";
  }

  if (
    !(payload.territories instanceof Array) ||
    payload.territories.length <= 0
  ) {
    return "Please Select Territories.";
  }

  if (
    (payload.preOrderCheck && payload.preOrderDate === undefined) ||
    typeof payload.preOrderDate != "string"
  ) {
    return "Pre order Date is required";
  }

  if (oneWeek && new Date(payload.preOrderDate!) >= oneWeek) {
    return "Pre order Date must be 1 week from the release date.";
  }

  if (!(payload.dsp instanceof Array) || payload.dsp.length <= 0) {
    return "Please Select a Dsp.";
  }

  if (payload.anotherDistributionCheck && payload.upc === "") {
    return "UPC is required when transferring from another distributor.";
  }

  if (payload.copyRightHolder === "" || payload.copyRightYear === "") {
    return "Copy write year and Copy write holder is required";
  }

  if (!payload.musicImage) {
    return "Release image is required";
  }

  if (!["image/jpeg", "image/png"].includes(payload.musicImage.type)) {
    return "Invalid image format";
  }

  return null;
}

export function validateDraftSongs(
  payload: ReturnType<typeof parseSongFormData>,
) {
  const twoWeeksFromNow = addWeeks(new Date(), 2);
  let oneWeek = null;

  if (
    !payload.title ||
    typeof payload.title !== "string" ||
    payload.title.length <= 3 ||
    containsEmoji(payload.title)
  ) {
    return "Song title is required and must be longer than 3 letters.";
  }

  if (payload.releaseDate && typeof payload.releaseDate != "string") {
    return "Release date is required";
  }

  if (payload.releaseDate && new Date(payload.releaseDate) < twoWeeksFromNow) {
    return "Release date must be at least 2 weeks ahead of upload date";
  }

  if (payload.releaseDate && payload.preOrderDate) {
    oneWeek = subWeeks(new Date(payload.releaseDate), 1); //used to validate pre order date.
  }

  if (
    payload.song_writer &&
    (!(payload.song_writer instanceof Array) ||
      payload.song_writer.some((artist) => artist.first_name === "") ||
      payload.song_writer.some((artist) => artist.last_name === ""))
  ) {
    return "Song writer is required";
  }

  if (
    payload.producer &&
    (!(payload.producer instanceof Array) ||
      payload.producer.some((artist) => artist.name === ""))
  ) {
    return "Producer is required";
  }

  if (
    payload.performer &&
    (!(payload.performer instanceof Array) ||
      payload.performer.some(
        (artist) => artist.name === "" || artist.role === "",
      ))
  ) {
    return "Performer is required";
  }

  if (
    payload.territories &&
    (!(payload.territories instanceof Array) ||
      payload.territories.some((territory) => typeof territory !== "string"))
  ) {
    return "Please Select Territories.";
  }

  if (
    (payload.preOrderCheck && payload.preOrderDate === undefined) ||
    typeof payload.preOrderDate != "string"
  ) {
    return "Pre order Date is required";
  }

  if (oneWeek && new Date(payload.preOrderDate) >= oneWeek) {
    return "Pre order Date must be 1 week from the release date.";
  }

  if (payload.dsp && !(payload.dsp instanceof Array)) {
    return "Please Select a Dsp.";
  }

  if (
    (payload.startClip && typeof payload.startClip != "string") ||
    (payload.startClip &&
      payload.startClip.length > 0 &&
      !numRegex.test(payload.startClip))
  ) {
    return "Start Clip is required.";
  }

  if (payload.anotherDistributionCheck && payload.isrc === "") {
    return "ISRC is required when transferring from another distributor.";
  }
  if (payload.anotherDistributionCheck && payload.upc === "") {
    return "UPC is required when transferring from another distributor.";
  }

  // if (payload.copyRightHolder === "" || payload.copyRightYear === "") {
  //   return "Copy write year and Copy write holder is required";
  // }

  // if (!payload.musicImage) {
  //   return "Release image is required";
  // }

  // if (
  //   payload.musicImage &&
  //   !["image/jpeg", "image/png"].includes(payload.musicImage.type)
  // ) {
  //   return "Invalid image format";
  // }

  // if (!payload.s3KeyAudio) {
  //   return "Audio upload is required";
  // }

  return null;
}

export function validateDraftAlbums(
  payload: ReturnType<typeof parseAlbumFormData>,
) {
  const twoWeeksFromNow = addWeeks(new Date(), 2);
  let oneWeek = null;

  if (
    !payload.title ||
    typeof payload.title !== "string" ||
    payload.title.length <= 3 ||
    containsEmoji(payload.title)
  ) {
    return "Album title is required and must be longer than 3 letters.";
  }

  if (payload.releaseDate && typeof payload.releaseDate != "string") {
    return "Release date is required";
  }

  if (payload.releaseDate && new Date(payload.releaseDate) < twoWeeksFromNow) {
    return "Release date must be at least 2 weeks ahead of upload date";
  }

  if (payload.releaseDate && payload.preOrderDate) {
    oneWeek = subWeeks(new Date(payload.releaseDate), 1); //used to validate pre order date.
  }

  if (
    payload.territories &&
    (!(payload.territories instanceof Array) ||
      payload.territories.some((territory) => typeof territory !== "string"))
  ) {
    return "Please Select valid Territories.";
  }

  if (
    (payload.preOrderCheck && payload.preOrderDate === undefined) ||
    typeof payload.preOrderDate != "string"
  ) {
    return "Pre order Date is required";
  }

  if (oneWeek && new Date(payload.preOrderDate) >= oneWeek) {
    return "Pre order Date must be 1 week from the release date.";
  }

  if (payload.dsp && !(payload.dsp instanceof Array)) {
    return "Please Select a Dsp.";
  }

  if (payload.anotherDistributionCheck && payload.upc === "") {
    return "UPC is required when transferring from another distributor.";
  }

  if (payload.numberOfTracks && (!numRegex.test(payload.numberOfTracks) || parseInt(payload.numberOfTracks,10) <= 0)) {
    return "Number of tracks must be a valid number greater than 0.";
  }

  // if (payload.copyRightHolder === "" || payload.copyRightYear === "") {
  //   return "Copy write year and Copy write holder is required";
  // }

  // if (!payload.musicImage) {
  //   return "Release image is required";
  // }

  // if (
  //   payload.musicImage &&
  //   !["image/jpeg", "image/png"].includes(payload.musicImage.type)
  // ) {
  //   return "Invalid image format";
  // }

  // if (!payload.s3KeyAudio) {
  //   return "Audio upload is required";
  // }

  return null;
}
