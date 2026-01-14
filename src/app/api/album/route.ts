import { languagesList } from "@/app/constant";
import { genreList } from "@/app/utils/constants";
import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import {
  containsEmoji,
  numRegex,
  uploadImage,
} from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumDraftModel from "@/util/models/AlbumDraftModel";
import AlbumModel from "@/util/models/AlbumModel";
import Artist from "@/util/models/artistModel";
import SongDraftModel from "@/util/models/songDraftModel";
import SongModel from "@/util/models/songModel";
import User from "@/util/models/userModel";
import { addWeeks, subWeeks } from "date-fns";
import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    let userArtist = null;

    const twoWeeks = addWeeks(new Date(), 2); //to check if the upload date is two or more
    let oneWeek = null; //variable to check for the pre order date
    const formData = await req.formData();
    console.log({ ...formData });

    const actionType = formData.get("action");
    const album_title = formData.get("title");
    const genre = formData.get("genre");
    const language = formData.get("language");
    const preOrderDate = formData.get("preOrderDate");
    const artist = formData.get("artist");
    const pre_order_check = formData.get("pre_order_check");
    const another_distribution_check = formData.get(
      "another_distribution_check"
    );
    const territories = formData
      .getAll("territories")
      .map((item) => JSON.parse(item as string));
    const dsp = formData
      .getAll("dsp")
      .map((item) => JSON.parse(item as string));
    // const upc = formData.get("upc");
    const upc = "upc";
    const release_date = formData.get("release_date");
    const music_image = formData.get("music_image");
    const copyRightYear = formData.get("copyRightYear");
    const copyRightHolder = formData.get("copyRightHolder");
    const number_of_track = formData.get("number_of_track");

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 404 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address" },
        { status: 400 }
      );
    } else if (user.otp !== null) {
      return NextResponse.json({ msg: "Please Login" }, { status: 400 });
    } else {
      userArtist = await Artist.findOne({
        user: userJwt.user,
        artistName: (artist as string).trim(),
      });
    }
    console.log("eet", userArtist, artist);

    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    }
    if (
      !album_title ||
      typeof album_title !== "string" ||
      album_title.length <= 3
    ) {
      return NextResponse.json(
        {
          msg: "Song title is required and must be longer than 3 letters.",
        },
        { status: 400 }
      );
    }
    if (actionType === "upload") {
      //pre order date is derived from release date
      if (
        (release_date != undefined && typeof release_date == "string") ||
        typeof release_date == "number"
      ) {
        oneWeek = subWeeks(new Date(release_date), 1);
      }
      if (containsEmoji(album_title)) {
        return NextResponse.json(
          {
            msg: "Song title can not contain emojis",
          },
          { status: 400 }
        );
      } else if (
        !genre ||
        typeof genre != "string" ||
        !genreList.includes(genre)
      ) {
        return NextResponse.json(
          {
            msg: "Genre is required.",
          },
          { status: 400 }
        );
      } else if (
        !language ||
        typeof language != "string" ||
        !languagesList.includes(language)
      ) {
        return NextResponse.json(
          {
            msg: "language is required.",
          },
          { status: 400 }
        );
      } else if (!artist || typeof artist != "string") {
        return NextResponse.json(
          {
            msg: "Artist is required.",
          },
          { status: 400 }
        );
      } else if (!release_date) {
        return NextResponse.json(
          {
            msg: "Release Date is required.",
          },
          { status: 400 }
        );
      } else if (
        typeof release_date != "string" ||
        new Date(release_date) < twoWeeks
      ) {
        return NextResponse.json(
          {
            msg: "Release Date must be plus 2 weeks ahead of upload date. ",
          },
          { status: 400 }
        );
      } else if (!(territories instanceof Array) || territories.length <= 0) {
        return NextResponse.json(
          {
            msg: "Please select territories.",
          },
          { status: 400 }
        );
      } else if (pre_order_check && preOrderDate === undefined) {
        return NextResponse.json(
          {
            msg: "Pre order Date is required.",
          },
          { status: 400 }
        );
      } else if (
        pre_order_check === "true" &&
        (!(preOrderDate instanceof Date) ||
          (oneWeek && preOrderDate! > oneWeek))
      ) {
        return NextResponse.json(
          {
            msg: "Pre Order Date must be 1 week from release date.",
          },
          { status: 400 }
        );
      } else if (!(dsp instanceof Array) || dsp.length <= 0) {
        return NextResponse.json(
          {
            msg: "Please select a Dsp.",
          },
          { status: 400 }
        );
        //   } else if (another_distribution_check === "true" && upc === "") {
      } else if (another_distribution_check === "true") {
        return NextResponse.json(
          {
            msg: "UPC is required when transferring from another distributor.",
          },
          { status: 400 }
        );
      } else if (copyRightHolder === "" || copyRightYear === "") {
        return NextResponse.json(
          {
            msg: "Copy Right Holder and Copy Right Year is required.",
          },
          { status: 400 }
        );
      } else if (!music_image || !(music_image instanceof File)) {
        return NextResponse.json({
          msg: "Music image is required and must be a file",
        });
      } else if (!["image/jpeg", "image/png"].includes(music_image.type)) {
        return NextResponse.json({ msg: "Invalid image format" });
      } else if (
        !number_of_track ||
        !numRegex.test(number_of_track as string)
      ) {
        return NextResponse.json({
          msg: "No. of tracks is required and must be a positive number",
        });
      }

      const num = parseInt(number_of_track as string, 10); // Convert string to number
      if (isNaN(num) || num < 1) {
        return NextResponse.json({ msg: "No. of tracks must greater than 1" });
      }
      const number_of_track_array = Array.from(
        { length: num },
        (_, i) => i + 1
      );

      const buffer = Buffer.from(await (music_image as File).arrayBuffer());
      // ---- Resize to distributor standard ----
      const resized = await sharp(buffer)
        .resize(3000, 3000, { fit: "cover" })
        .jpeg({ quality: 90 })
        .toBuffer(); //resize the image for dpm
      const imageType = music_image.type.split("/")[1];
      const imageStorageLocation = `testing/${upc}/${upc}.${imageType}`;
      const imageUrl = await uploadImage(
        imageType,
        resized as Buffer<ArrayBuffer>,
        imageStorageLocation
      );
      if (imageUrl.coverUrl == null) {
        return NextResponse.json({ msg: imageUrl.error }, { status: 500 });
      }
      await dbConnect();

      const album = new AlbumModel({
        albumTitle: album_title,
        genre: genre,
        songLanguage: language,
        pre_order_check,
        another_distribution_check,
        release_date,
        preOrderDate: preOrderDate == "undefined" ? null : preOrderDate,
        copyRightHolder,
        copyRightYear,
        dsp: dsp,
        upc,
        isrc: "isrc",
        territories: territories,
        song_image: imageUrl.coverUrl,
        artistName: userArtist.artistName,
        artist: userArtist._id,
        NumberOfTracks: number_of_track,
        UnassignedNumbers: number_of_track_array,
      });
      await album.save();
      return NextResponse.json({ msg: "success" }, { status: 200 });
    } else {
      const saveDraft = new AlbumDraftModel({
        albumTitle: album_title,
        genre: genre,
        songLanguage: language,
        pre_order_check,
        another_distribution_check,
        release_date,
        preOrderDate: preOrderDate == "undefined" ? null : preOrderDate,
        copyRightHolder,
        copyRightYear,
        dsp: dsp,
        upc,
        isrc: "isrc",
        territories: territories,
        // song_image: imageUrl.coverUrl,
        artistName: userArtist.artistName,
        artist: userArtist._id,
        NumberOfTracks: number_of_track,
        // UnassignedNumbers:number_of_track_array
      });
      await saveDraft.save();
      return NextResponse.json({ msg: "Draft saved" }, { status: 200 });
    }

    // return NextResponse.json({ msg: "success" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}
