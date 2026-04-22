import { rejectEmailProps } from "@/app/type";
import dbConnect from "@/util/db";
import { releaseRejectionEmail } from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import sendEmail from "@/util/sendMail/sendEmail";
import mongoose, { Types } from "mongoose";
import { NextResponse } from "next/server";
import SongModel from "@/util/models/songModel";

export async function POST(req: Request, { params }: { params: Promise<{ songId: string }> }) {
  const { songId } = await params; // Access the dynamic 'id' parameter
  try {
    const body: {
      requestType: "approved" | "rejected";
      message?: string;
      songId: string;
    } = await req.json();
    console.log(body);

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
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
    } else if (!songId || !Types.ObjectId.isValid(songId)) {
      return NextResponse.json({ msg: "Invalid Request." },{status:400});
    }
    const release = await SongModel.findById(songId).populate(
      "user",
      "email label",
      
    ).lean();

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
      const session = await mongoose.startSession();
  session.startTransaction();
  try {

    // Execute the model method passing the session
    const result = await SongModel.approveAndCreateMetadata(songId,session,release.user.label);

    // If everything is successful, commit the changes
    await session.commitTransaction();

    // const approveSongQuery = SongModel.findByIdAndUpdate(
    //   songId,
    //   { releaseStatus: body.requestType },
    //   { runValidators: true },
    // );
    // const dpmCallBackMetaDataQuery = release.generateDpmCallBackMetaData();

    // await Promise.all([approveSongQuery, dpmCallBackMetaDataQuery]).catch(
    //   (error) => {
    //     console.error("failed to approve release ", error);
    //   }
    // );
    
  } catch (error) {
    console.error("failed to approve release ", error);
    await session.abortTransaction();
    return NextResponse.json(
      { msg: "Failed to approve release." },
      { status: 400 },
    );
  }finally{
    session.endSession();
  }

    } else if (body.requestType == "rejected") {
      const updateRelease = SongModel.findByIdAndUpdate(
        songId,
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
          { status: 400 },
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

export async function GET(req: Request, { params }: { params: Promise<{ songId: string }> }) {
  const { songId } = await params; // Access the dynamic 'id' parameter
  try {
    // Check admin authorization (adjust to your auth system)
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (user.role != "admin" && user.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    if (!songId || !Types.ObjectId.isValid(songId)) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    }
    const projection = {
        releaseTitle: 1,
        releaseAudio: 1,
        releaseStatus: 1,
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
      }
    // Get audio record from database
    const release = await SongModel.findById(songId,projection).populate("artist", "spotifyId appleId -_id").lean();

    if (!release) {
      return NextResponse.json({ msg: "Audio not found" }, { status: 400 });
    }
    // console.log(release);

    return NextResponse.json({
      release,
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
