import { albumFromApi } from "@/app/type";
import { generateUPC } from "@/services/dsp/dsp.service";
import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import { authenticate } from "@/util/middleware/authMiddleware";
import {
  parseAlbumFormData,
  validateDraftAlbums,
} from "@/util/middleware/functions";
import { requireActiveSubscription } from "@/util/middleware/subscription";
import AlbumModel from "@/util/models/AlbumModel";
import Artist from "@/util/models/artistModel";
import User from "@/util/models/userModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    let userArtist = null;
    let release = null;

    const formData = await req.formData();
    console.log({ ...formData });
    const payload = parseAlbumFormData(formData);

    if (
      !payload.artist ||
      payload.artist.trim() === "" ||
      typeof payload.artist !== "string"
    ) {
      return NextResponse.json({ msg: "Artist is required" }, { status: 400 });
    }

    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    const subError = user ? requireActiveSubscription(user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 404 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address" },
        { status: 400 },
      );
    } else if (user.otp !== null) {
      return NextResponse.json({ msg: "Please Login" }, { status: 400 });
    } else if (subError) {
      return NextResponse.json({ msg: subError.msg }, { status: subError.status });
    } else {
      const isAlbumForValid = validateDraftAlbums(payload, user.type.includes("LABEL"));

      if (isAlbumForValid != null) {
        return NextResponse.json({ msg: isAlbumForValid }, { status: 400 });
      }

      const userArtistQuery = Artist.findOne({
        user: userJwt.user,
        artistName: (payload.artist as string).trim(),
      });

      const releaseQuery = AlbumModel.findOne({
        user: user._id,
        artistName: (payload.artist as string).trim(),
        releaseTitle: payload.title!.trim(),
      }).lean<albumFromApi>();

      [userArtist, release] = await Promise.all([
        userArtistQuery, releaseQuery
      ]).catch(err => { throw err; });
    }

    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    } else if (release) {
      return NextResponse.json({ msg: "You already have a release with the same title, please change the title and try again." }, { status: 400 });
    }

    if (user!.type === "EMERGING_ARTIST") {
      return NextResponse.json(
        { msg: "Emerging artists can not upload Album" },
        { status: 403 },
      );
    }

    let number_of_track_array: number[] = [];

    if (payload.numberOfTracks) {
      const num = parseInt(payload.numberOfTracks as string, 10); // Convert string to number
      if (isNaN(num) || num < 1) {
        return NextResponse.json(
          { msg: "No. of tracks must greater than 0" },
          { status: 400 },
        );
      }
      number_of_track_array = Array.from({ length: num }, (_, i) => i + 1);
    }

    if (user?.type.includes("LABEL")) {
      if (!payload.providedBy) {
        payload.providedBy = user.label
      }
    } else {
      payload.providedBy = "SoundMac"
    }

    if (user?.type.includes("LABEL")) {
      if (!payload.courtesyLine) {
        payload.courtesyLine = user.label
      }
    } else {
      payload.courtesyLine = "SoundMac"
    }

    const album = new AlbumModel({
      _id: new mongoose.Types.ObjectId(),
      releaseTitle: payload.title,
      genre: payload.genre,
      releaseLanguage: payload.language,
      preOrderCheck: payload.preOrderCheck,
      anotherDistributionCheck: payload.anotherDistributionCheck,
      releaseDate: payload.releaseDate == 'undefined' ? null : payload.releaseDate,
      preOrderDate:
        payload.preOrderDate == "undefined" ? null : payload.preOrderDate,
      copyRightHolder: payload.copyRightHolder,
      copyRightYear: payload.copyRightYear,
      dsp: payload.dsp,
      upc: payload.upc || await generateUPC(),
      territories: payload.territories,
      releaseImage: undefined,
      artist: userArtist._id,
      numberOfTracks: payload.numberOfTracks,
      unassignedNumbers: number_of_track_array,
      user: user._id,
      releaseStatus: "draft",
      timeZone: payload.timeZone || { label: "", value: "", name: "" },
      providedBy: payload.providedBy || "",
      courtesyLine: payload.courtesyLine || "",
      description: payload.description || "",
    });
    await album.save();

    return NextResponse.json({ msg: "Release Uploaded Successfully.", release: album }, { status: 201 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}

export async function PUT(req: Request) {
  try {
    let userArtist = null;

    const formData = await req.formData();
    console.log({ ...formData });
    const payload = parseAlbumFormData(formData);
    let release = null;

    if (
      !payload.artist ||
      payload.artist.trim() === "" ||
      typeof payload.artist !== "string"
    ) {
      return NextResponse.json({ msg: "Artist is required" }, { status: 400 });
    }

    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 404 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address" },
        { status: 400 },
      );
    } else if (user.otp !== null) {
      return NextResponse.json({ msg: "Please Login" }, { status: 400 });
    } else {
      const isAlbumForValid = validateDraftAlbums(payload, user.type.includes("LABEL"));

      if (isAlbumForValid != null) {
        return NextResponse.json({ msg: isAlbumForValid }, { status: 400 });
      }

      const userArtistQuery = Artist.findOne({
        user: userJwt.user,
        artistName: (payload.artist as string).trim(),
      });

      const releaseQuery = AlbumModel.findOne({
        upc: payload.upc,
      });

      [userArtist, release] = await Promise.all([
        userArtistQuery, releaseQuery
      ]).catch(err => { throw err; });
    }
    console.log(release);

    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    }
    
    if (!release) {
      return NextResponse.json({ msg: "Invalid Release" }, { status: 400 });
    } else if (release.releaseStatus !== "draft") {
      return NextResponse.json(
        { msg: "Only drafts can be saved as drafts" },
        { status: 400 },
      );
    } else if (release.releaseTitle != payload.title) {
      const checkReleaseTitle = await AlbumModel.find({
        user: user!._id,
        artistName: userArtist.artistName,
        releaseTitle: payload.title
      }).lean();
      if (checkReleaseTitle.length > 0) {
        return NextResponse.json(
          { msg: "Release title already exists" },
          { status: 400 },
        );
      }
    }



    const num = parseInt(payload.numberOfTracks as string, 10); // Convert string to number
    if (isNaN(num) || num < 1) {
      return NextResponse.json(
        { msg: "No. of tracks must greater than 0" },
        { status: 400 },
      );
    }
    const number_of_track_array = Array.from({ length: num }, (_, i) => i + 1);

    const album = await AlbumModel.findByIdAndUpdate(
      { _id: release._id },
      {
        releaseTitle: payload.title,
        genre: payload.genre,
        releaseLanguage: payload.language,
        preOrderCheck: payload.preOrderCheck,
        anotherDistributionCheck: payload.anotherDistributionCheck,
        releaseDate: payload.releaseDate == 'undefined' ? null : payload.releaseDate,
        preOrderDate:
          payload.preOrderDate == "undefined" ? null : payload.preOrderDate,
        copyRightHolder: payload.copyRightHolder,
        copyRightYear: payload.copyRightYear,
        dsp: payload.dsp,
        upc: release.upc,
        territories: payload.territories,
        artist: userArtist._id,
        numberOfTracks: payload.numberOfTracks,
        unassignedNumbers: number_of_track_array,
        user: user._id,
        releaseStatus: "draft",
        timeZone: payload.timeZone || release.timeZone || { label: "", value: "", name: "" },
        description: payload.description || release.description || "",
        providedBy: payload.providedBy || release.providedBy || "",
        courtesyLine: payload.courtesyLine || release.courtesyLine || "",
      },
      { runValidators: true, returnDocument: "after" },
    );
    // release.save();
    return NextResponse.json({ msg: "Release edited successfully.", release: album }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}