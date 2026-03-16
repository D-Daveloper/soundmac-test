import { rejectEmailProps } from "@/app/type";
import dbConnect from "@/util/db";
import { releaseRejectionEmail } from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import SongModel from "@/util/models/songModel";
import User from "@/util/models/userModel";
import sendEmail from "@/util/sendMail/sendEmail";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import AlbumModel from "@/util/models/AlbumModel";
import TrackModel from "@/util/models/trackModel";

export async function POST(req: Request) {
  try {
    const body: {
      requestType: "approved" | "rejected";
      message?: string;
      albumId: string;
    } = await req.json();
    console.log(body);

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (user.role != "admin" && user.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    if (!body) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (
      body.requestType != "approved" &&
      body.requestType != "rejected"
    ) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (body.requestType == "rejected" && !body.message) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (!body.albumId || !Types.ObjectId.isValid(body.albumId)) {
      return NextResponse.json({ msg: "Invalid Request." });
    }
    const release = await SongModel.findById(body.albumId).populate(
      "user",
      "email",
    );

    if (!release) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (release.releaseStatus != "pending") {
      return NextResponse.json(
        { msg: "Only pending songs can be " + body.requestType },
        { status: 400 },
      );
    }

    if (body.requestType == "approved") {
      // create the dpm callback here
      await SongModel.findByIdAndUpdate(
        body.albumId,
        { releaseStatus: body.requestType },
        { runValidators: true },
      );
    } else if (body.requestType == "rejected") {
      const updateRelease = SongModel.findByIdAndUpdate(
        body.albumId,
        { releaseStatus: body.requestType },
        { runValidators: true },
      );
      const rejectEmailData: rejectEmailProps = {
        artistName: release.artistName,
        releaseTitle: release.releaseTitle,
        rejectionReason: body.message,
        dashboardUrl: "release",
        supportEmail: "release",
      };

      //send mail here
      const rejectionEmail = releaseRejectionEmail(rejectEmailData);
      await Promise.all([
        sendEmail(release.user.email, "Release Rejection", rejectionEmail),
        updateRelease,
      ]).catch((error) => {
        console.error("failed to reject release ", error);

        return NextResponse.json(
          { msg: "Failed to reject release." },
          { status: 200 },
        );
      });
    }

    return NextResponse.json(
      { msg: "Release" + " " + body.requestType + "." },
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

export async function GET(req: Request) {
  try {
    // Check admin authorization (adjust to your auth system)
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (user.role != "admin" && user.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    // console.log(searchParams);

    let albumId = searchParams.get("albumId");
    if (!albumId || !Types.ObjectId.isValid(albumId)) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    }
    // Get audio record from database
    const release = await AlbumModel.findById(albumId, {
      releaseTitle: 1,
      releaseStatus: 1,
      releaseImage: 1,
      artistName: 1,
      genre: 1,
      releaseDate: 1,
      upc: 1,
      catalogNumber: 1,
    }).populate("artist", "spotifyId appleId -_id");
    const tracks = await TrackModel.find(
      { album: albumId },
      {
        releaseTitle: 1,
        releaseAudio: 1,
        releaseStatus: 1,
        trackNumber: 1,
        artistName: 1,
        genre: 1,
        releaseDate: 1,
        upc: 1,
        isrc: 1,
        featuredArtist: 1,
        songWriter: 1,
        producer: 1,
        catalogNumber: 1,
        explicitContent: 1,
      },
    );
    if (!release) {
      return NextResponse.json({ msg: "Audio not found" }, { status: 400 });
    }
    console.log(release);

    return NextResponse.json({
      release,
      tracks,
      msg: "Link generated Successfully.",
    });
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 },
    );
  }
}
