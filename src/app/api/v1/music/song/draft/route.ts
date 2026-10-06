import { generateCatalogNumber, generateISRC, generateUPC } from "@/services/dsp/dsp.service";
import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import { authenticate } from "@/util/middleware/authMiddleware";
import {
  getYearRange,
  parseSongFormData,
  validateDraftSongs,
} from "@/util/middleware/functions";
import { requireActiveSubscription } from "@/util/middleware/subscription";
import { withIdempotency } from "@/util/middleware/withIdempotency";
import Artist from "@/util/models/artistModel";
import SongModel from "@/util/models/songModel";
import User from "@/util/models/userModel";
import { addWeeks } from "date-fns";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {

    const formData = await req.clone().formData();

    const payload = parseSongFormData(formData);

    if (!payload) {
      return NextResponse.json({ msg: "Invalid form data" }, { status: 400 });
    }

    payload.upc = formData.get("upc")?.toString() ?? null;
    if (
      !payload.artist ||
      payload.artist.trim() === "" ||
      typeof payload.artist !== "string"
    ) {
      return NextResponse.json({ msg: "Artist is required" }, { status: 400 });
    }

    const isDraftSongValid = validateDraftSongs(payload, false);// check if the album is valid for the user type, i hard coded false because the user type is not available at this point, so i will check it later after authentication

    if (isDraftSongValid != null) {
      return NextResponse.json({ msg: isDraftSongValid }, { status: 400 });
    }
    let Uploaderror: { msg: string; status: number } | null = null; //saying what every errors occurs during upload so i can track the error then return it and also delete the uploaded song
    await dbConnect();

    const userJwt = await authenticate(req);

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
      Uploaderror = requireActiveSubscription(user);
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    } // return any errors up to this point and delete the song


    return withIdempotency(req, user!._id, async () => {

      let userArtist = null;
      let release = null;

      if (user!.type === "EMERGING_ARTIST") {
        const { startOfYear, endOfYear } = getYearRange();

        const releasesThisYear = await SongModel.countDocuments({
          user: user!._id,
          createdAt: {
            $gte: startOfYear,
            $lt: endOfYear,
          },
        });

        if (releasesThisYear >= 2) {
          return NextResponse.json(
            { msg: "Emerging artists can only upload 2 releases per year" },
            { status: 403 },
          );
        }
      }
      const userArtistQuery = Artist.findOne({
        user: userJwt.user,
        artistName: (payload.artist as string).trim(),
      }).lean();

      const releaseQuery = SongModel.findOne({
        user: user!._id,
        artistName: (payload.artist as string).trim(),
        releaseTitle: payload.title!.trim(),
      }).lean();

      [userArtist, release] = await Promise.all([
        userArtistQuery, releaseQuery
      ]).catch(err => { throw err; });



      if (!userArtist) {
        return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
      } else if (release) {
        return NextResponse.json({ msg: "You already have a release with the same title, please change the title and try again." }, { status: 400 });
      }


      if (
        payload.songWriter &&
        (!(payload.songWriter instanceof Array) ||
          (payload.songWriter.length > 0 &&
            payload.songWriter.some((artist) => artist.first_name === "" && artist.last_name === "")))
      ) {
        payload.songWriter = [];
      }
      if (
        payload.performer &&
        (!(payload.performer instanceof Array) ||
          (payload.performer.length > 0 &&
            payload.performer.some((artist) => artist.name === "" && artist.role === "")))
      ) {
        payload.performer = [];
      }
      if (
        payload.featuredArtist &&
        (!(payload.featuredArtist instanceof Array) ||
          (payload.featuredArtist.length > 0 &&
            payload.featuredArtist.some((artist) => artist.artistName === "" && artist.role === "")))
      ) {
        payload.featuredArtist = [];
      }
      if (
        payload.producer &&
        (!(payload.producer instanceof Array) ||
          (payload.producer.length > 0 &&
            payload.producer.some((artist) => artist.name === "" && artist.role === "")))
      ) {
        payload.producer = [];
      }
      console.log({ ...payload });

      if (!payload.isrc) {
        payload.isrc = await generateISRC()
      }

      if (user?.type.includes("LABEL")) {
        if (!payload.providedBy) {
          payload.providedBy = user.label
        }
        if (!payload.courtesyLine) {
          payload.courtesyLine = user.label
        }
      } else {
        payload.providedBy = "SoundMac"
        payload.courtesyLine = "SoundMac"
      }

      const savedSong = new SongModel({
        _id: new mongoose.Types.ObjectId(),
        releaseTitle: payload.title,
        genre: payload.genre,
        releaseLanguage: payload.language,
        songWriter: payload.songWriter,
        producer: payload.producer,
        performer: payload.performer,
        featuredArtist: payload.featuredArtist,
        preOrderCheck: payload.preOrderCheck,
        anotherDistributionCheck: payload.anotherDistributionCheck,
        explicitContent: payload.explicitContent,
        releaseDate:
          user!.type === "EMERGING_ARTIST"
            ? addWeeks(new Date(), 2)
            : payload.releaseDate == 'undefined' ? null : new Date(payload.releaseDate!),
        preOrderDate:
          payload.preOrderDate == "undefined" ? null : payload.preOrderDate,
        copyRightHolder:
          user!.type === "EMERGING_ARTIST"
            ? "Distributed by SoundMac"
            : payload.copyRightHolder,
        copyRightYear: user!.type === "EMERGING_ARTIST"
          ? new Date().getFullYear()
          : payload.copyRightYear,
        lyrics: payload.lyrics,
        startClip: payload.startClip,
        dsp: payload.dsp,
        upc: payload.upc,
        isrc: payload.isrc,
        territories: payload.territories,
        artistName: userArtist.artistName,
        artist: userArtist._id,
        user: user!._id,
        releaseStatus: "draft",
        timeZone: payload?.timeZone,
        isCoverSong: payload.isCoverSong,
        compositionType: payload.compositionType,
        instrumentalSource: payload.instrumentalSource,
        countryOfRecording: payload.countryOfRecording,
        providedBy: payload.providedBy,
        courtesyLine: payload.courtesyLine,
      });

      await savedSong.save();

      return NextResponse.json({ msg: "Release uploaded successfull", release: savedSong }, { status: 201 });
    })
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
    } else if (!payload.upc) {
      return NextResponse.json({ msg: "UPC is required" }, { status: 400 });
    }

    await dbConnect();

    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;

    if (!user) {
      Uploaderror = { msg: "Invalid Request", status: 404 };
    } else if (!user.confirmed) {
      Uploaderror = { msg: "Please verify your email address", status: 400 };
    } else if (user.otp !== null) {
      Uploaderror = { msg: "Please login", status: 400 };
    }

    if (Uploaderror != null) {
      return NextResponse.json(
        { msg: Uploaderror.msg },
        { status: Uploaderror.status },
      );
    } // return any errors up to this point and delete the song

    userArtist = await Artist.findOne({
      user: userJwt.user,
      artistName: (payload.artist as string)?.trim(),
    }).lean()

    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    }
    let release = null;

    release = await SongModel.findOne({
      upc: payload.upc
    }).lean();

    if (!release) {
      return NextResponse.json({ msg: "Invalid Release" }, { status: 400 })
    }

    if (release.releaseStatus != "draft") {
      return NextResponse.json({ msg: "Only draft Release can be edited here." }, { status: 400 })
    }

    if (release.releaseTitle != payload.title) {
      const checkReleaseTitle = await SongModel.find({
        user: user!._id,
        artist: userArtist._id,
        releaseTitle: payload.title
      }).lean();
      if (checkReleaseTitle.length > 0) {
        return NextResponse.json(
          { msg: "Release title already exists" },
          { status: 400 },
        );
      }
    }


    if (
      payload.songWriter &&
      (!(payload.songWriter instanceof Array) ||
        (payload.songWriter.length > 0 &&
          payload.songWriter.some((artist) => artist.first_name === "" && artist.last_name === "")))
    ) {
      payload.songWriter = [];
    }
    if (
      payload.performer &&
      (!(payload.performer instanceof Array) ||
        (payload.performer.length > 0 &&
          payload.performer.some((artist) => artist.name === "" && artist.role === "")))
    ) {
      payload.performer = [];
    }
    if (
      payload.featuredArtist &&
      (!(payload.featuredArtist instanceof Array) ||
        (payload.featuredArtist.length > 0 &&
          payload.featuredArtist.some((artist) => artist.artistName === "" && artist.role === "")))
    ) {
      payload.featuredArtist = [];
    }
    if (
      payload.producer &&
      (!(payload.producer instanceof Array) ||
        (payload.producer.length > 0 &&
          payload.producer.some((artist) => artist.name === "" && artist.role === "")))
    ) {
      payload.producer = [];
    }
    console.log({ ...payload });

    const isDraftSongValid = validateDraftSongs(payload, user?.type.includes("LABEL") ?? false);

    if (isDraftSongValid != null) {
      return NextResponse.json({ msg: isDraftSongValid }, { status: 400 });
    }

      if (user?.type.includes("LABEL")) {
      if (!payload.providedBy) {
        payload.providedBy = release.providedBy
      }
      if (!payload.courtesyLine) {
        payload.courtesyLine = release.courtesyLine
      }
      } else {
        payload.providedBy = "SoundMac"
        payload.courtesyLine = "SoundMac"
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
        songWriter: payload.songWriter,
        producer: payload.producer,
        performer: payload.performer,
        featuredArtist: payload.featuredArtist,
        preOrderCheck: payload.preOrderCheck,
        anotherDistributionCheck: payload.anotherDistributionCheck,
        explicitContent: payload.explicitContent,
        releaseDate:
          user!.type === "EMERGING_ARTIST"
            ? addWeeks(new Date(), 2)
            : payload.releaseDate == 'undefined' || !payload.releaseDate ? null : payload.releaseDate,
        preOrderDate:
          payload.preOrderDate == "undefined" || !payload.preOrderDate ? null : payload.preOrderDate,
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
        releaseStatus: "draft",
        compositionType: payload.compositionType,
        instrumentalSource: payload.instrumentalSource,
        countryOfRecording: payload.countryOfRecording,
        providedBy: payload.providedBy,
        courtesyLine: payload.courtesyLine,
      },
      { runValidators: true, returnDocument: "after" },
    );

    return NextResponse.json({ msg: "Release edited successfully", release: savedSong }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}
