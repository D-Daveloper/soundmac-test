import { albumFromApi } from "@/app/type";
import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import { deleteSingleFromS3 } from "@/util/middleware/aws";
import {
  buildSort,
  numRegex,
  parseAlbumFormData,
  uploadImage,
  validateNonDraftAlbums,
} from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumModel from "@/util/models/AlbumModel";
import Artist from "@/util/models/artistModel";
import AudioUploadTrackerModel from "@/util/models/AudioUploadTrackerModel";
import TrackModel from "@/util/models/trackModel";
import User from "@/util/models/userModel";
import { SortOrder } from "mongoose";
import { NextResponse } from "next/server";
import sharp from "sharp";
const bucketName = process.env.AWS_S3_BUCKET!;

export async function POST(req: Request) {
  try {
    let userArtist = null;

    const formData = await req.formData();
    console.log({ ...formData });
    const number_of_track = formData.get("number_of_track");
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
    if (
      !payload.title ||
      typeof payload.title !== "string" ||
      payload.title.length <= 3
    ) {
      return NextResponse.json(
        {
          msg: "Album title is required and must be longer than 3 letters.",
        },
        { status: 400 },
      );
    }

    const isAlbumForValid = validateNonDraftAlbums(payload);

    if (isAlbumForValid != null) {
      return NextResponse.json({ msg: isAlbumForValid }, { status: 400 });
    }

    if (!number_of_track || !numRegex.test(number_of_track as string)) {
      return NextResponse.json(
        {
          msg: "No. of tracks is required and must be a positive number",
        },
        { status: 400 },
      );
    }

    const num = parseInt(number_of_track as string, 10); // Convert string to number
    if (isNaN(num) || num < 1) {
      return NextResponse.json(
        { msg: "No. of tracks must greater than 0" },
        { status: 400 },
      );
    }
    payload.upc = payload.upc || "upc" + Date.now(); //incase they dont have a upc, generate one for them
    const number_of_track_array = Array.from({ length: num }, (_, i) => i + 1);

    const buffer = Buffer.from(
      await (payload.musicImage as File).arrayBuffer(),
    );
    // ---- Resize to distributor standard ----
    const resized = await sharp(buffer)
      .resize(3000, 3000, { fit: "cover" })
      .jpeg({ quality: 90 })
      .toBuffer(); //resize the image for dpm
    const imageType = payload.musicImage!.type.split("/")[1];
    const imageStorageLocation = `testing/${payload.upc}/${payload.upc}.${imageType}`;
    const imageUrl = await uploadImage(
      imageType,
      resized as Buffer<ArrayBuffer>,
      imageStorageLocation,
    );
    if (imageUrl.coverUrl == null) {
      return NextResponse.json({ msg: imageUrl.error }, { status: 500 });
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
      upc: payload.upc || "upc" + Date.now(),
      territories: payload.territories,
      releaseImage: imageUrl.coverUrl,
      artistName: userArtist.artistName,
      artist: userArtist._id,
      numberOfTracks: number_of_track,
      unassignedNumbers: number_of_track_array,
      user: user._id,
      catalogNumber: "SM" + Date.now(),
    });
    await album.save();

    return NextResponse.json({ msg: "success" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}

const limit = parseInt(process.env.SONG_LIMIT || "6", 10);

export async function GET(req: Request) {
  try {
    let albums: albumFromApi[] = [];
    let totalCount = 0;
    await dbConnect();
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const sort = searchParams.get("sort") || "createdAt";
    const albumTitle = searchParams.get("albumTitle");
    const artist = searchParams.get("artist");
    const albumStatusFilter = searchParams.get("albumStatusFilter");
    const sortQuery = buildSort(sort) as {
      [key: string]: SortOrder | { $meta: any };
    }; //this is use to format the sort query for mongodb.
    const query: any = {};
    if (albumStatusFilter && albumStatusFilter !== "all") {
      query.releaseStatus = albumStatusFilter;
    }
    if (artist) query.artistName = artist;
    if (albumTitle?.trim()) {
      query.releaseTitle = { $regex: `^${albumTitle}`, $options: "i" };
    }
    query.user = userJwt.user
    albums = await AlbumModel.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit);
    totalCount = await AlbumModel.countDocuments(query);

    return NextResponse.json(
      {
        data: albums,
        page,
        skip: (page - 1) * limit,
        sort,
        limit,
        hasNextPage: albums.length === limit,
        totalCount: totalCount,
        totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
        msg: totalCount > 0 ? "Successful" : "No albums found",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ msg: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { msg: "An unknown error occurred" },
        { status: 500 },
      );
    }
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
      release = await AlbumModel.findOne({
        upc: payload.upc,
        user: user._id,
      }).lean<albumFromApi>();
    }

    if (!release) {
      return NextResponse.json({ msg: "Invalid Release" }, { status: 400 });
    } else if (release.releaseStatus === "approved") {
      return NextResponse.json(
        { msg: "Approved albums cannot be edited" },
        { status: 400 },
      );
    }

    if (!userArtist) {
      return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
    }

    const isAlbumForValid = validateNonDraftAlbums(payload);

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

    let imageUrl: {
      error: string | null;
      coverUrl: string | null;
    } = {
      error: null,
      coverUrl: null,
    };

    if (payload.musicImage && payload.musicImage instanceof File) {
      try {
        const buffer = Buffer.from(await payload.musicImage.arrayBuffer());
        // ---- Resize to distributor standard ----
        const resized = await sharp(buffer)
          .resize(3000, 3000, { fit: "cover" })
          .jpeg({ quality: 90 })
          .toBuffer(); //resize the image for dpm
        console.log("buffer", resized);

        const imageType = payload.musicImage!.type.split("/")[1]; //get the image extension

        const imageStorageLocation = `testing/${payload.upc}/${payload.upc}.${imageType}`; //reconstruct the s3 key for the image using the upc as the name and adding the jpg extension

        imageUrl = await uploadImage(
          imageType,
          resized as Buffer<ArrayBuffer>,
          imageStorageLocation,
        ); //send image to aws

        if (imageUrl.coverUrl == null) {
          return NextResponse.json({ msg: imageUrl.error }, { status: 400 });
        }
      } catch (error) {
        console.log("upload image error", error);
        return NextResponse.json(
          { msg: "Failed to upload image" },
          { status: 400 },
        );
      }
    }

    await AlbumModel.findByIdAndUpdate(
      { _id: release._id },
      {
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
        releaseImage: imageUrl.coverUrl || payload.oldImage,
        artistName: userArtist.artistName,
        artist: userArtist._id,
        numberOfTracks: payload.numberOfTracks,
        unassignedNumbers: number_of_track_array,
        user: user._id,
        releaseStatus: "pending",
      },{runValidators:true}
    );
    await TrackModel.updateMany({upc:payload.upc},{$set:{albumName:payload.title}})

    return NextResponse.json({ msg: "success" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);

    return handleMongooseValidationError(error);
  }
}
export async function DELETE(req: Request) {
  // return NextResponse.json({ msg: "Not Available at this time, please try again later" }, { status: 400 });

  try {
    let release: any = null;
    const formData = await req.json();
    if (formData.releaseTitle.trim() === "" || !formData.releaseTitle) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    } else if (formData.artist_name.trim() === "" || !formData.artist_name) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    }
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    await dbConnect();
    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid User" }, { status: 401 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address" },
        { status: 401 },
      );
    } else if (user.otp !== null) {
      return NextResponse.json({ msg: "Please Login" }, { status: 401 });
    } else {
      // Find and verify release belongs to user before deleting
      release = await AlbumModel.findOne({
        releaseTitle: formData.releaseTitle,
        artistName: formData.artist_name.trim(),
        user: user._id,
      });

      if (!release) {
        return NextResponse.json(
          {
            msg: "Invalid Release",
          },
          { status: 400 },
        );
      }

      if (release.releaseStatus === "pending") {
        const isImageDeleted = await deleteSingleFromS3(
          bucketName,
          release.releaseImage,
        );
        if (isImageDeleted) {
          const deleteSongsResult = await AlbumModel.findByIdAndDelete({
            _id: release._id,
          });
          await AudioUploadTrackerModel.findOneAndDelete({
            upc: release.upc,
          });
          if (deleteSongsResult.deletedCount < 1) {
            return NextResponse.json(
              { msg: "Failed to delete." },
              { status: 400 },
            );
          }
          await TrackModel.deleteMany({upc:release.upc});
          return NextResponse.json({ msg: "Album Deleted" }, { status: 200 });
        } else {
          return NextResponse.json(
            { msg: "failed to delete album" },
            { status: 200 },
          );
        }
      } else if (release.releaseStatus === "draft") {
        const deleteSongsResult = await AlbumModel.findByIdAndDelete({
          _id: release._id,
        });

        if (deleteSongsResult.deletedCount < 1) {
          return NextResponse.json(
            { msg: "Failed to delete." },
            { status: 400 },
          );
        }
        return NextResponse.json({ msg: "Album Deleted" }, { status: 200 });
      }
      return NextResponse.json(
        { msg: "Only pending albums or drafts can be deleted!" },
        { status: 400 },
      );
    }
  } catch (error: unknown) {
    console.log("album delete error", error);

    return handleMongooseValidationError(error);
  }
}
