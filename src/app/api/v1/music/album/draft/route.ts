import { albumFromApi } from "@/app/type";
import { generateUPC } from "@/services/dsp/dsp.service";
import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import { authenticate } from "@/util/middleware/authMiddleware";
import {
  parseAlbumFormData,
  validateDraftAlbums,
} from "@/util/middleware/functions";
import AlbumModel from "@/util/models/AlbumModel";
import Artist from "@/util/models/artistModel";
import User from "@/util/models/userModel";
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
    const isAlbumForValid = validateDraftAlbums(payload);
    if (isAlbumForValid != null) {
      return NextResponse.json({ msg: isAlbumForValid }, { status: 400 });
    }
    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 404 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address" },
        { status: 400 },
      );
    } else if (user.otp !== null) {
      return NextResponse.json({ msg: "Please Login" }, { status: 400 });
    } else if (user.premium !== true) {
      return NextResponse.json(
        { msg: "Please upgrade your account." },
        { status: 402 },
      );
    } else if (user.premium && new Date() > new Date(user.premiumExpiration!)) {
      user.premium = false;
      user.premiumExpiration = null;
      await user.save();
      return NextResponse.json(
        { msg: "Please upgrade your account." },
        { status: 402 },
      );
    } else {
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

    const album = new AlbumModel({
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
      artistName: userArtist.artistName,
      artist: userArtist._id,
      numberOfTracks: payload.numberOfTracks,
      unassignedNumbers: number_of_track_array,
      user: user._id,
      releaseStatus: "draft",
      timeZone: payload.timeZone || { label: "", value: "", name: "" },
    });
    await album.save();

    return NextResponse.json({ msg: "success" }, { status: 200 });
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
    let release: albumFromApi | null = null;

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

      const userArtistQuery = await Artist.findOne({
        user: userJwt.user,
        artistName: (payload.artist as string).trim(),
      });
      const releaseQuery = await AlbumModel.findOne({
        upc: payload.upc,
      }).lean<albumFromApi>();
      
      [userArtist, release] = await Promise.all([
        userArtistQuery, releaseQuery
      ]).catch(err => { throw err; });
    }
    console.log(release);

    if (!release) {
      return NextResponse.json({ msg: "Invalid Release" }, { status: 400 });
    } else if (release.releaseStatus !== "draft") {
      return NextResponse.json(
        { msg: "Only drafts can be saved as drafts" },
        { status: 400 },
      );
    }

    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    }

    const isAlbumForValid = validateDraftAlbums(payload);

    if (isAlbumForValid != null) {
      return NextResponse.json({ msg: isAlbumForValid }, { status: 400 });
    }

    const num = parseInt(payload.numberOfTracks as string, 10); // Convert string to number
    if (isNaN(num) || num < 1) {
      return NextResponse.json(
        { msg: "No. of tracks must greater than 0" },
        { status: 400 },
      );
    }
    const number_of_track_array = Array.from({ length: num }, (_, i) => i + 1);

    await AlbumModel.findByIdAndUpdate(
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
        artistName: userArtist.artistName,
        artist: userArtist._id,
        numberOfTracks: payload.numberOfTracks,
        unassignedNumbers: number_of_track_array,
        user: user._id,
        releaseStatus: "draft",
        timeZone: payload.timeZone || release.timeZone || { label: "", value: "", name: "" },
      },
      { runValidators: true },
    );

    return NextResponse.json({ msg: "success" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}