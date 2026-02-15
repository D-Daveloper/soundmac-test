import {
  AlbumForm,
  CreateArtistForm,
  FeaturedArtist,
  NonRetryableErrorCode,
  PaymentEmailData,
  Performer,
  Producer,
  SongForm,
  SongWriter,
  TrackForm,
} from "@/app/type";
import axios, { AxiosInstance, isAxiosError } from "axios";
import { addWeeks, subWeeks } from "date-fns";
import { toast } from "react-toastify";
import { deleteSongsFromS3WithRetry, s3 } from "./aws";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { genreList, RETRY_CONFIG } from "@/app/utils/constants";
import mongoose from "mongoose";
import Artist from "../models/artistModel";
import SongModel from "../models/songModel";
import { languagesList } from "@/app/constant";
import transactionModel from "../models/transactionModel";
import User, { IUser } from "../models/userModel";
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
  if (form.title.length < 3 || form.title.length > 32) {
    return "Song title must be longer than 3 not more than 32";
  } else if (containsEmoji(form.title)) {
    return "Song title can not contain emojis";
  } else if (form.genre === "") {
    return "Genre is required";
  } else if (form.language === "") {
    return "language is required";
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
  } else if (
    form.old_audio === null &&
    (form.song_audio == null || !(form.song_audio instanceof File))
  ) {
    return "Audio is required";
  } else if (form.start_clip == "" || !parseFloat(form.start_clip)) {
    return "Starting Clip is required and must be a valid number";
  } else if (
    form.old_image === null &&
    (form.music_image == null || !(form.music_image instanceof File))
  ) {
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
  } else if (form.copyRightHolder === "" || form.copyRightYear === "") {
    return "Copy right holder and year is required";
  } else if (
    (form.old_image === null || form.old_image === undefined) &&
    (form.music_image == null || !(form.music_image instanceof File))
  ) {
    return "Image is required";
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

export const isTrackFormValid = (form: TrackForm): string => {
  console.log(form);

  if (form.artist === "") {
    return "Artist is is required";
  } else if (form.genre === "") {
    return "Genre is required";
  } else if (form.language === "") {
    return "language is required";
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
  } else if (form.old_audio === null && !form.s3key) {
    return "Audio is required";
  } else if (form.start_clip == "" || !parseFloat(form.start_clip)) {
    return "Starting Clip is required and must be a valid number";
  } else if (
    form.another_distribution_check &&
    (form.isrc === "" || form.upc === "")
  ) {
    return "ISRC and UPC is required";
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
  api: AxiosInstance,
) => {
  try {
    // 1. Ask for permission
    const res = await api.post("/createawssignedurl", {
      fileType: file.type,
      fileSize: file.size,
      upcFromClient: upc, //the initial upc the user inputed if any. it serves as the file name in aws
      artist,
      isFromAnotherDistributor,
    });

    const { uploadUrl, s3Key, upcFromServer, uploadId } = await res.data;

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

export const uploadAlbumTrack = async (
  file: File,
  upc: string,
  artist: string,
  api: AxiosInstance,
  track_number: string,
) => {
  try {
    // 1. Ask for permission
    const res = await api.put("/createawssignedurl", {
      fileType: file.type,
      fileSize: file.size,
      upcFromClient: upc, //the initial upc the user inputed if any. it serves as the file name in aws
      artist,
      track_number,
    });

    const { uploadUrl, s3key, upcFromServer, uploadId } = await res.data;

    // 2. Upload directly to S3
    await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type },
    });
    console.log("ressss", res);

    return { upc: upcFromServer, songS3Key: s3key, error: null, uploadId };
  } catch (error) {
    if (isAxiosError(error)) {
      return {
        upc: null,
        songS3Key: null,
        error: "Something went wrong please try again later!",
      };
    }
    console.log("upload track error function line 181", error);
    toast.error("Something went wrong please try again later!");
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
// import { S3Client } from "@aws-sdk/client-s3";
// import { Upload } from "@aws-sdk/lib-storage"; // Recommended for multipart uploads

// // Your existing S3 client configuration
// const s3Client = new S3Client({
//   region: "eu-north-1",
//   // Add your credentials/config as necessary
// });

// async function uploadTrack(file: File) { // Assuming 'file' is a File object from an input
//   const bucketName = "soundmac1";
//   const key = `testing/test_${Date.now()}/${file.name}`; // Generate a unique key

//   try {
//     const parallelUploads3 = new Upload({
//       client: s3Client,
//       params: {
//         Bucket: bucketName,
//         Key: key,
//         Body: file, // The file itself, or a ReadableStream
//         ContentType: file.type, // e.g., "audio/wav"
//         // ACL: 'public-read', // Uncomment if you need public access
//       },
//       queueSize: 4, // optional total of 4 concurrent uploads
//       partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
//       leavePartsOnError: false, // optional manually handle dropped parts
//     });

//     parallelUploads3.on("httpUploadProgress", (progress) => {
//       console.log(`Upload progress: ${Math.round((progress.loaded / progress.total) * 100)}%`);
//       // You can update a UI progress bar here
//     });

//     await parallelUploads3.done();
//     console.log("Upload successful!");
//     // Return the URL or other relevant information
//     return `https://${bucketName}.s3.${s3Client.config.region}.amazonaws.com/${key}`;
//   } catch (error) {
//     console.error("Error during multipart upload:", error);
//     throw error;
//   }
// }

// In your handleSubmit function or wherever you call uploadTrack:
// ...
// const uploadedFileUrl = await uploadTrack(selectedFile);
// ...

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
    upc: formData.get("upc") as string | null,

    releaseDate: formData.get("release_date") as string | null,
    preOrderDate: formData.get("preOrderDate") as string | null,

    preOrderCheck: formData.get("pre_order_check") === "true",
    anotherDistributionCheck:
      formData.get("another_distribution_check") === "true",

    explicitContent: formData.get("explicit_content") === "true",

    s3KeyAudio: formData.get("s3keyAudio") as string | null,
    musicImage: formData.get("music_image") as File | null,
    oldImage: formData.get("old_image") as string | null,
    oldAudio: formData.get("old_audio") as string | null,

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
    oldImage: formData.get("old_image") as string | null,

    copyRightYear: formData.get("copyRightYear") as string | null,
    copyRightHolder: formData.get("copyRightHolder") as string | null,
    numberOfTracks: formData.get("number_of_track") as string | null,
  };
}
export function parseTrackFormData(formData: FormData) {
  return {
    title: formData.get("title") as string | null,
    genre: formData.get("genre") as string | null,
    language: formData.get("language") as string | null,

    artist: formData.get("artist") as string | null,

    isrc: formData.get("isrc") as string | null,
    upc: formData.get("upc") as string | null,

    anotherDistributionCheck:
      formData.get("another_distribution_check") === "true",

    trackNumber: formData.get("trackNumber") as string | null,
    uploadId: formData.get("uploadId") as string | null,
    actionType: formData.get("action") as "upload" | "draft" | null,

    featured_artist: getArray<FeaturedArtist>(formData, "featured_artist"),
    performer: getArray<Performer>(formData, "performer"),
    song_writer: getArray<SongWriter>(formData, "song_writer"),
    producer: getArray<Producer>(formData, "producer"),

    lyrics: formData.get("lyrics") as string | null,
    startClip: formData.get("start_clip") as string | null,

    explicitContent: formData.get("explicit_content") === "true",

    s3KeyAudio: formData.get("s3keyAudio") as string | null,

    oldAudio: formData.get("old_audio") as string | null,
  };
}

export function validateNonDraftSongs(
  payload: ReturnType<typeof parseSongFormData>,
) {
  const twoWeeksFromNow = addWeeks(new Date(), 2);
  let oneWeek = null;

  if (!payload.oldAudio && !payload.uploadId) {
    return "uploadId is required when old audio is not present.";
  }

  if (payload.uploadId && typeof payload.uploadId != "string") {
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

  if (!payload.musicImage && !payload.oldImage) {
    return "Release image is required";
  }

  if (payload.musicImage != null && payload.musicImage instanceof File) {
    const allowed = new Set(["image/jpeg", "image/png"]);
    if (!allowed.has(payload.musicImage.type)) {
      console.log("music image", payload.musicImage);
      return "Invalid image format";
    }
  }

  if (!payload.oldAudio && !payload.s3KeyAudio) {
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

  if (!payload.musicImage && !payload.oldImage) {
    return "Release image is required";
  }

  if (payload.musicImage != null && payload.musicImage instanceof File) {
    const allowed = new Set(["image/jpeg", "image/png"]);
    if (!allowed.has(payload.musicImage.type)) {
      console.log("music image", payload.musicImage);
      return "Invalid image format";
    }
  }

  if (
    !payload.numberOfTracks ||
    !numRegex.test(payload.numberOfTracks as string)
  ) {
    return "No. of tracks is required and must be a positive number";
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

  if (
    payload.numberOfTracks &&
    (!numRegex.test(payload.numberOfTracks) ||
      parseInt(payload.numberOfTracks, 10) <= 0)
  ) {
    return "Number of tracks must be a valid number greater than 0.";
  }

  return null;
}

export function validateDraftTracks(
  payload: TrackForm,
  listOfTrackNumbers: string[],
) {
  if (
    !payload.title ||
    typeof payload.title !== "string" ||
    payload.title.length <= 3 ||
    containsEmoji(payload.title)
  ) {
    return "Song title is required and must be longer than 3 letters.";
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
    (payload.start_clip && typeof payload.start_clip != "string") ||
    (payload.start_clip &&
      payload.start_clip.length > 0 &&
      !numRegex.test(payload.start_clip))
  ) {
    return "Start Clip is required.";
  }

  if (payload.another_distribution_check && payload.isrc === "") {
    return "ISRC is required when transferring from another distributor.";
  }
  if (payload.upc === "") {
    return "UPC is required when transferring from another distributor.";
  }
  if (!payload.track_number || !numRegex.test(payload.track_number)) {
    return "Track number is required.";
  }
  if (!listOfTrackNumbers.includes(payload.track_number)) {
    return "Invalid Track number or Track number already used.";
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

export function validateNonDraftTracks(
  payload: TrackForm,
  listOfTrackNumbers: string[],
) {
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
    !payload.start_clip ||
    typeof payload.start_clip != "string" ||
    !numRegex.test(payload.start_clip)
  ) {
    return "Start Clip is required.";
  }

  if (payload.another_distribution_check && payload.isrc === "") {
    return "ISRC is required when transferring from another distributor.";
  }

  if (!payload.track_number || !numRegex.test(payload.track_number)) {
    return "Track number is required.";
  }
  if (!listOfTrackNumbers.includes(payload.track_number)) {
    return "Invalid Track number or Track number already used.";
  }

  if (!payload.old_audio && !payload.s3key) {
    return "Audio upload is required";
  }

  return null;
}

export const handleReactQueryApiCallError = (
  errorCount: number,
  error: Error,
): boolean => {
  if (isAxiosError(error) && error.status === 401) {
    return false;
  } else if (errorCount < 2) {
    return true;
  }
  return false;
};

export const createEmptyTrack = (): TrackForm => ({
  id: crypto.randomUUID(),
  title: "",
  genre: "",
  track_number: "",
  uploadStatus: "idle",
  language: "",
  artist: "",
  release_date: undefined,
  preOrderDate: undefined,
  featured_artist: [{ artistName: "", spotifyId: "", appleId: "" }],
  performer: [{ name: "", role: "" }],
  song_writer: [{ first_name: "", last_name: "" }],
  producer: [{ name: "" }],
  pre_order_check: false,
  another_distribution_check: false,
  territories: [],
  song_audio: null,
  music_image: null,
  dsp: [],
  lyrics: "",
  start_clip: "",
  isrc: "",
  upc: "",
  copyRightHolder: "",
  copyRightYear: "",
  explicit_content: false,
  old_audio: null,
  old_image: null,
  validationError: null,
  s3key: "",
});

export async function handleChargeSuccess(data: any,user:(mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
})) {
  const email = data.customer.email;

  // Idempotency check
  const existing = await transactionModel.findOne({
    reference: data.reference,
  });

  if (existing) return;

  // const user = await User.findOne({ email });
  // if (!user) return;

  user.premium = true;
  // user.subscriptionStatus = "active";
  user.type = data.plan.name;
  user.premiumExpiration = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  user.authorizationCode = data.authorization.authorization_code;
  user.customerCode = data.customer.customer_code;

  await user.save();

  await transactionModel.create({
    reference: data.reference,
    userEmail: email,
    amount: data.amount / 100,
    status: "success",
    planName: data.plan.name,
    planCode: data.plan.plan_code,
    paidAt: new Date(),
  });


}

export async function handleSubscriptionCreate(data: any) {
  const email = data.customer.email;

  const user = await User.findOne({ email });
  if (!user) return;

  user.subscriptionCode = data.subscription_code;
  await user.save();
}

export async function handleFailedPayment(data: any) {
  const email = data.customer.email;

  await User.updateOne(
    { email },
    {
      premium: false,
      premiumExpiration: null,
    },
  );
}

export const subSuccessEmail = (props: PaymentEmailData) => {

return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; line-height: 1.6;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: #11456B; padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Payment Successful!</h1>
                            <p style="margin: 10px 0 0 0; color: #ffffff; opacity: 0.9; font-size: 16px;">Thank you for your subscription</p>
                        </td>
                    </tr>
                    
                    <!-- Success Icon -->
                    <tr>
                        <td style="padding: 30px; text-align: center;">
                            <div style="width: 64px; height: 64px; margin: 0 auto; background-color: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17L4 12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">Hi <strong>${props.customerName}</strong>,</p>
                            <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">Your payment has been successfully processed. Your subscription is now active!</p>
                        </td>
                    </tr>
                    
                    <!-- Subscription Details -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Plan</td>
                                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${props.planName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Amount</td>
                                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; border-top: 1px solid #e5e7eb;">${props.currency}${props.amount}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Billing Cycle</td>
                                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; border-top: 1px solid #e5e7eb;">${props.billingCycle}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Next Billing Date</td>
                                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; border-top: 1px solid #e5e7eb;">${props.nextBillingDate}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Transaction ID</td>
                                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; border-top: 1px solid #e5e7eb;">${props.transactionId}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px; text-align: center;">
                            <a href="${props.dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #11456B; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View Dashboard</a>
                        </td>
                    </tr>
                    
                    <!-- Footer Info -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Need help? Contact us at <a href="mailto:${props.support_email}" style="color: #667eea; text-decoration: none;">${props.support_email}</a></p>
                            <p style="margin: 0; color: #6b7280; font-size: 14px;">You can manage your subscription anytime from your account settings.</p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-align: center;">© ${new Date().getFullYear()}-${props.company_name}. All rights reserved.</p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">${props.company_address}</p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};
//cancelled sub mail
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Subscription Cancelled</title>
// </head>
// <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; line-height: 1.6;">
//     <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
//         <tr>
//             <td style="padding: 40px 20px;">
//                 <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
//                     <!-- Header -->
//                     <tr>
//                         <td style="background-color: #1f2937; padding: 40px 30px; text-align: center;">
//                             <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Subscription Cancelled</h1>
//                             <p style="margin: 10px 0 0 0; color: #d1d5db; font-size: 16px;">We're sorry to see you go</p>
//                         </td>
//                     </tr>
                    
//                     <!-- Icon -->
//                     <tr>
//                         <td style="padding: 30px; text-align: center;">
//                             <div style="width: 64px; height: 64px; margin: 0 auto; background-color: #ef4444; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
//                                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                     <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
//                                 </svg>
//                             </div>
//                         </td>
//                     </tr>
                    
//                     <!-- Content -->
//                     <tr>
//                         <td style="padding: 0 40px 30px 40px;">
//                             <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">Hi <strong>{{customer_name}}</strong>,</p>
//                             <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">Your subscription has been successfully cancelled. You'll continue to have access until the end of your current billing period.</p>
//                         </td>
//                     </tr>
                    
//                     <!-- Cancellation Details -->
//                     <tr>
//                         <td style="padding: 0 40px 30px 40px;">
//                             <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fef2f2; border-radius: 8px; padding: 20px; border: 1px solid #fecaca;">
//                                 <tr>
//                                     <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Plan</td>
//                                     <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">{{plan_name}}</td>
//                                 </tr>
//                                 <tr>
//                                     <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #fecaca;">Cancellation Date</td>
//                                     <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; border-top: 1px solid #fecaca;">{{cancellation_date}}</td>
//                                 </tr>
//                                 <tr>
//                                     <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #fecaca;">Access Until</td>
//                                     <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; border-top: 1px solid #fecaca;">{{access_until_date}}</td>
//                                 </tr>
//                             </table>
//                         </td>
//                     </tr>
                    
//                     <!-- What Happens Next -->
//                     <tr>
//                         <td style="padding: 0 40px 30px 40px;">
//                             <h2 style="margin: 0 0 15px 0; color: #111827; font-size: 18px; font-weight: 600;">What happens next?</h2>
//                             <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px;">
//                                 <li style="margin-bottom: 10px;">Your subscription will remain active until <strong>{{access_until_date}}</strong></li>
//                                 <li style="margin-bottom: 10px;">You won't be charged again</li>
//                                 <li style="margin-bottom: 10px;">After {{access_until_date}}, you'll lose access to premium features</li>
//                                 <li style="margin-bottom: 0;">Your account data will be retained for {{data_retention_days}} days</li>
//                             </ul>
//                         </td>
//                     </tr>
                    
//                     <!-- CTA Buttons -->
//                     <tr>
//                         <td style="padding: 0 40px 30px 40px; text-align: center;">
//                             <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">Changed your mind? You can reactivate your subscription anytime.</p>
//                             <a href="{{reactivate_url}}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin-right: 10px;">Reactivate Subscription</a>
//                             <a href="{{feedback_url}}" style="display: inline-block; padding: 14px 32px; background-color: #f3f4f6; color: #374151; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; border: 1px solid #d1d5db;">Share Feedback</a>
//                         </td>
//                     </tr>
                    
//                     <!-- Feedback Section -->
//                     <tr>
//                         <td style="padding: 0 40px 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
//                             <h3 style="margin: 20px 0 15px 0; color: #111827; font-size: 16px; font-weight: 600;">We'd love your feedback</h3>
//                             <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">Help us improve by letting us know why you cancelled:</p>
//                             <ul style="margin: 0; padding: 0 0 0 20px; color: #6b7280; font-size: 14px;">
//                                 <li style="margin-bottom: 8px;">Too expensive</li>
//                                 <li style="margin-bottom: 8px;">Not using it enough</li>
//                                 <li style="margin-bottom: 8px;">Missing features</li>
//                                 <li style="margin-bottom: 8px;">Switching to a competitor</li>
//                                 <li style="margin-bottom: 0;">Other reason</li>
//                             </ul>
//                         </td>
//                     </tr>
                    
//                     <!-- Footer Info -->
//                     <tr>
//                         <td style="padding: 30px 40px 20px 40px;">
//                             <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Need help or have questions? Contact us at <a href="mailto:{{support_email}}" style="color: #667eea; text-decoration: none;">{{support_email}}</a></p>
//                         </td>
//                     </tr>
                    
//                     <!-- Footer -->
//                     <tr>
//                         <td style="padding: 20px 40px 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
//                             <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-align: center;">© {{year}} {{company_name}}. All rights reserved.</p>
//                             <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">{{company_address}}</p>
//                         </td>
//                     </tr>
                    
//                 </table>
//             </td>
//         </tr>
//     </table>
// </body>
// </html>
export function getYearRange() {
  const now = new Date();

  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

  return { startOfYear, endOfYear };
}
