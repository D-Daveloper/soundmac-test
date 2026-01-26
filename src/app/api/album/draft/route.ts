import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import {
  parseAlbumFormData,
  validateDraftAlbums,
} from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumModel from "@/util/models/AlbumModel";
import Artist from "@/util/models/artistModel";
import User from "@/util/models/userModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    let userArtist = null;

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
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
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
    } else {
      userArtist = await Artist.findOne({
        user: userJwt.user,
        artistName: (payload.artist as string).trim(),
      });
    }
    console.log("eet", userArtist, payload.artist);

    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    }

    const isAlbumForValid = validateDraftAlbums(payload);

    if (isAlbumForValid != null) {
      return NextResponse.json({ msg: isAlbumForValid }, { status: 400 });
    }

    let number_of_track_array:number[]= [];

    if (payload.numberOfTracks){
      const num = parseInt(payload.numberOfTracks as string, 10); // Convert string to number
      if (isNaN(num) || num < 1) {
        return NextResponse.json({ msg: "No. of tracks must greater than 0" }, {status:400});
      }
       number_of_track_array = Array.from({ length: num }, (_, i) => i + 1);
    }

    const album = new AlbumModel({
      releaseTitle: payload.title,
      genre: payload.genre,
      releaseLanguage: payload.language,
      preOrderCheck: payload.preOrderCheck,
      anotherDistributionCheck: payload.anotherDistributionCheck,
      releaseDate: payload.releaseDate,
      preOrderDate:
        payload.preOrderDate == "undefined" ? null : payload.preOrderDate,
      copyRightHolder: payload.copyRightHolder,
      copyRightYear: payload.copyRightYear,
      dsp: payload.dsp,
      upc: payload.upc,
      territories: payload.territories,
      releaseImage: undefined,
      artistName: userArtist.artistName,
      artist: userArtist._id,
      numberOfTracks: payload.numberOfTracks,
      unassignedNumbers: number_of_track_array,
      user: user._id,
    });
    await album.save();

    return NextResponse.json({ msg: "success" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}
