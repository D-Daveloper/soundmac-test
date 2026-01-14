import { AlbumForm, CreateArtistForm, SongForm } from "@/app/type";
import axios from "axios";
import { addWeeks, subWeeks } from "date-fns";
import { toast } from "react-toastify";
import { s3 } from "./aws";
import { PutObjectCommand } from "@aws-sdk/client-s3";
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
  } else if (
    form.producer.some((artist) => artist.first_name === "") ||
    form.producer.some((artist) => artist.last_name === "")
  ) {
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

export const uploadTrack = async (file: File, upc: string) => {
  // 1. Ask for permission
  const res = await fetch("/api/createawssignedurl", {
    method: "POST",
    body: JSON.stringify({
      fileType: file.type,
      fileSize: file.size,
      upcFromClient: upc, //the initial upc the user inputed if any. it serves as the file name in aws
    }),
  });

  const { uploadUrl, s3Key, upcFromServer } = await res.json();

  // 2. Upload directly to S3
  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
  });
  return { upc: upcFromServer, songS3Key: s3Key };
};

export const uploadImage = async (
  fileType:string,
  buffer:Buffer<ArrayBuffer>,
  key:string
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
      })
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

export function containsEmoji(text:any) {
  const textToCheck = String(text)
  return /[\p{Emoji}]/u.test(textToCheck);
}