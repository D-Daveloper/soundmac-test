import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import { getUPCs } from "@/util/middleware/dpm";
import {
  getYearRange,
  parseSongFormData,
  validateDraftSongs,
} from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import Artist from "@/util/models/artistModel";
import SongModel from "@/util/models/songModel";
import User from "@/util/models/userModel";
import { addWeeks } from "date-fns";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    let userArtist = null;
    let releaseTitleAlreadyExist = null;
    let Uploaderror: { msg: string; status: number } | null = null; //saying what every errors occurs during upload so i can track the error then return it and also delete the uploaded song
    const formData = await req.formData();

    const payload = parseSongFormData(formData);
    payload.upc = formData.get("upc")?.toString() ?? null; //different name for drafts

    if (!payload) {
      return NextResponse.json({ msg: "Invalid form data" }, { status: 400 });
    }

    if (
      !payload.artist ||
      payload.artist.trim() === "" ||
      typeof payload.artist !== "string"
    ) {
      return NextResponse.json({ msg: "Artist is required" }, { status: 400 });
    }

    await dbConnect();

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = userJwt.user ? await User.findById(userJwt.user) : null;

    if (!user) {
      Uploaderror = { msg: "Invalid Request", status: 404 };
    } else if (!user.confirmed) {
      Uploaderror = { msg: "Please verify your email address", status: 400 };
    } else if (user.otp !== null) {
      Uploaderror = { msg: "Please login", status: 400 };
    } else if (user.premium !== true) {
      Uploaderror = { msg: "Please upgrade your account.", status: 402 };
    } else if (user.premium && new Date() > new Date(user.premiumExpiration!)) {
      user.premium = false;
      user.premiumExpiration = null;
      await user.save();
      Uploaderror = { msg: "Please upgrade your account.", status: 402 };
    } else {
      userArtist = await Artist.findOne({
        user: userJwt.user,
        artistName: (payload.artist as string)?.trim(),
      });
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    } // return any errors up to this point and delete the song

    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    }

    const { startOfYear, endOfYear } = getYearRange();

    const releasesThisYear = await SongModel.countDocuments({
      user: user!._id,
      createdAt: {
        $gte: startOfYear,
        $lt: endOfYear,
      },
    });

    if (user!.type === "EMERGING_ARTIST" && releasesThisYear >= 2) {
      return NextResponse.json(
        { msg: "Emerging artists can only upload 2 releases per year" },
        { status: 403 },
      );
    }

    releaseTitleAlreadyExist = await SongModel.find({
      artist: userArtist._id,
      releaseTitle: payload.title,
    });

    if (releaseTitleAlreadyExist && releaseTitleAlreadyExist.length > 0) {
      return NextResponse.json(
        { msg: "Release title already exists" },
        { status: 400 },
      );
    }
    if (
      payload.song_writer &&
      (!(payload.song_writer instanceof Array) ||
        (payload.song_writer.length === 1 &&
          payload.song_writer.some((artist) => artist.first_name === "") &&
          payload.song_writer.some((artist) => artist.last_name === "")))
    ) {
      payload.song_writer = [];
    }
    if (
      payload.performer &&
      (!(payload.performer instanceof Array) ||
        (payload.performer.length === 1 &&
          payload.performer.some((artist) => artist.name === "") &&
          payload.performer.some((artist) => artist.role === "")))
    ) {
      payload.performer = [];
    }
    if (
      payload.featured_artist &&
      (!(payload.featured_artist instanceof Array) ||
        (payload.featured_artist.length === 1 &&
          payload.featured_artist.some((artist) => artist.artistName === "")))
    ) {
      payload.featured_artist = [];
    }
    if (
      payload.producer &&
      (!(payload.producer instanceof Array) ||
        (payload.producer.length === 1 &&
          payload.producer.some((artist) => artist.name === "")))
    ) {
      payload.producer = [];
    }
    console.log({ ...payload });

    const isDraftSongValid = validateDraftSongs(payload);

    if (isDraftSongValid != null) {
      return NextResponse.json({ msg: isDraftSongValid }, { status: 400 });
    }

    const savedSong = new SongModel({
      releaseTitle: payload.title,
      genre: payload.genre,
      releaseLanguage: payload.language,
      songWriter: payload.song_writer,
      producer: payload.producer,
      performer: payload.performer,
      featuredArtist: payload.featured_artist,
      preOrderCheck: payload.preOrderCheck,
      anotherDistributionCheck: payload.anotherDistributionCheck,
      explicitContent: payload.explicitContent,
      releaseDate:
        user!.type === "EMERGING_ARTIST"
          ? addWeeks(new Date(), 2)
          : payload.releaseDate == 'undefined' ? null : payload.releaseDate,
      preOrderDate:
        payload.preOrderDate == "undefined" ? null : payload.preOrderDate,
      copyRightHolder:
        user!.type === "EMERGING_ARTIST"
          ? "Distributed by SoundMac"
          : payload.copyRightHolder,
      copyRightYear: payload.copyRightYear,
      lyrics: payload.lyrics,
      startClip: payload.startClip,
      dsp: payload.dsp,
      upc: payload.upc ? payload.upc : await getUPCs(),
      isrc: payload.isrc ? payload.isrc : "isrc" + Date.now(),
      territories: payload.territories,
      artistName: userArtist.artistName,
      artist: userArtist._id,
      user: user!._id,
      releaseStatus: "draft",
      catalogNumber: "SM" + Date.now(),
    });

    await savedSong.save();

    return NextResponse.json({ msg: "success" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}

export async function PUT(req: Request) {
  try {
    let userArtist = null;
    let Uploaderror: { msg: string; status: number } | null = null; //saying what every errors occurs during upload so i can track the error then return it and also delete the uploaded song
    const formData = await req.formData();

    const payload = parseSongFormData(formData);
    payload.upc = formData.get("upc")?.toString() ?? null; //different name for drafts

    if (!payload) {
      return NextResponse.json({ msg: "Invalid form data" }, { status: 400 });
    }

    if (
      !payload.artist ||
      payload.artist.trim() === "" ||
      typeof payload.artist !== "string"
    ) {
      return NextResponse.json({ msg: "Artist is required" }, { status: 400 });
    }

    await dbConnect();

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = userJwt.user ? await User.findById(userJwt.user) : null;

    if (!user) {
      Uploaderror = { msg: "Invalid Request", status: 404 };
    } else if (!user.confirmed) {
      Uploaderror = { msg: "Please verify your email address", status: 400 };
    } else if (user.otp !== null) {
      Uploaderror = { msg: "Please login", status: 400 };
    } else {
      userArtist = await Artist.findOne({
        user: userJwt.user,
        artistName: (payload.artist as string)?.trim(),
      });
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    } // return any errors up to this point and delete the song

    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    }
    let releaseTitleAlreadyExist = null;

    releaseTitleAlreadyExist = await SongModel.find({
      artist: userArtist._id,
      releaseTitle: payload.title,
    });

    if (releaseTitleAlreadyExist && releaseTitleAlreadyExist.length > 1) {
      return NextResponse.json(
        { msg: "Release title already exists" },
        { status: 400 },
      );
    }
    if (
      payload.song_writer &&
      (!(payload.song_writer instanceof Array) ||
        (payload.song_writer.length === 1 &&
          payload.song_writer.some((artist) => artist.first_name === "") &&
          payload.song_writer.some((artist) => artist.last_name === "")))
    ) {
      payload.song_writer = [];
    }
    if (
      payload.performer &&
      (!(payload.performer instanceof Array) ||
        (payload.performer.length === 1 &&
          payload.performer.some((artist) => artist.name === "") &&
          payload.performer.some((artist) => artist.role === "")))
    ) {
      payload.performer = [];
    }
    if (
      payload.featured_artist &&
      (!(payload.featured_artist instanceof Array) ||
        (payload.featured_artist.length === 1 &&
          payload.featured_artist.some((artist) => artist.artistName === "")))
    ) {
      payload.featured_artist = [];
    }
    if (
      payload.producer &&
      (!(payload.producer instanceof Array) ||
        (payload.producer.length === 1 &&
          payload.producer.some((artist) => artist.name === "")))
    ) {
      payload.producer = [];
    }
    console.log({ ...payload });

    const isDraftSongValid = validateDraftSongs(payload);

    if (isDraftSongValid != null) {
      return NextResponse.json({ msg: isDraftSongValid }, { status: 400 });
    }
    if (!payload.upc) {
      return NextResponse.json({ msg: "UPC is required" }, { status: 400 });
    }
    const savedSong = await SongModel.findOneAndUpdate(
      {
        user: userJwt.user,
        upc: payload.upc,
      },
      {
        releaseTitle: payload.title,
        genre: payload.genre,
        releaseLanguage: payload.language,
        songWriter: payload.song_writer,
        producer: payload.producer,
        performer: payload.performer,
        featuredArtist: payload.featured_artist,
        preOrderCheck: payload.preOrderCheck,
        anotherDistributionCheck: payload.anotherDistributionCheck,
        explicitContent: payload.explicitContent,
        releaseDate:
          user!.type === "EMERGING_ARTIST"
            ? addWeeks(new Date(), 2)
            : payload.releaseDate == 'undefined' ? null : payload.releaseDate,
        preOrderDate:
          payload.preOrderDate == "undefined" ? null : payload.preOrderDate,
        copyRightHolder:
          user!.type === "EMERGING_ARTIST"
            ? "Distributed by SoundMac"
            : payload.copyRightHolder,
        copyRightYear: payload.copyRightYear,
        lyrics: payload.lyrics,
        startClip: payload.startClip,
        dsp: payload.dsp,
        territories: payload.territories,
        artistName: userArtist.artistName,
        artist: userArtist._id,
        user: userJwt.user,
      },
      { runValidators: true },
    );

    return NextResponse.json({ msg: "success" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}
