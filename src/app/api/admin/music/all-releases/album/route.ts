import { albumFromApi, rejectEmailProps } from "@/app/type";
import dbConnect from "@/util/db";
import { releaseApprovalEmail, releaseRejectionEmail, replaceTemplatePlaceholders } from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import sendEmail from "@/util/sendMail/sendEmail";
import mongoose, { Types } from "mongoose";
import { NextResponse } from "next/server";
import AlbumModel from "@/util/models/AlbumModel";
import TrackModel from "@/util/models/trackModel";
import { inngest } from "@/util/lib/inngest/inngest";

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
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }
    const release = await AlbumModel.findById<
      albumFromApi & { user: { email: string } }
    >(body.albumId)
      .populate("user", "email")
      .lean();

    if (!release || release.unassignedNumbers.length > 0) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    } else if (release.releaseStatus != "completed") {
      return NextResponse.json(
        { msg: "Only completed albums can be " + body.requestType },
        { status: 400 },
      );
    }

    const userEmail = release.user.email;
    let emailHtml = null;
    let emailTitle = null

    const session = await mongoose.startSession();
    let albumUpdate = null;
    let trackUpdate = null

    if (body.requestType == "approved") {

      // create the dpm callback here
      albumUpdate = AlbumModel.findByIdAndUpdate(
        body.albumId,
        { releaseStatus: body.requestType },
        { runValidators: true, session },
      );

      trackUpdate = TrackModel.updateMany(
        {
          album: body.albumId,
        },
        {
          releaseStatus: body.requestType,
        }, { session }
      );

      const approvalEmailData = {
        artistName: release.artistName,
        releaseTitle: release.releaseTitle,
        releaseDate: new Date(release.releaseDate).toDateString(),
        releaseUrl: process.env.FRONTEND_URL + "/dashboard/music/manageRelease?type=single",
        supportEmail: "",
        company_name: "Soundmac",
        year: new Date().getFullYear().toString(),
        company_address: "",
        website_url: process.env.FRONTEND_URL!,
        help_center_url: "",
        terms_url: "",
        unsubscribe_url: "",
      };

      emailTitle = "Release Approval";

      emailHtml = replaceTemplatePlaceholders(
        releaseApprovalEmail(),
        approvalEmailData,
      );

    } else if (body.requestType == "rejected") {

      albumUpdate = AlbumModel.findByIdAndUpdate(
        body.albumId,
        { releaseStatus: body.requestType },
        { runValidators: true, session },
      );

      trackUpdate = TrackModel.updateMany(
        {
          album: body.albumId,
        },
        {
          releaseStatus: body.requestType,
        }, { session }
      );
      
      const rejectEmailData: rejectEmailProps = {
        artistName: release.artistName,
        releaseTitle: release.releaseTitle,
        rejectionReason: body.message?.trim(),
        dashboardUrl: "release",
        supportEmail: "release",
      };
      ///prepare email body
      emailHtml = releaseRejectionEmail(rejectEmailData);
      emailTitle = "Release Rejection";

    }
    try {
      session.startTransaction()
      await albumUpdate
      await trackUpdate
      await session.commitTransaction();
      //  background job
      await inngest.send({
        name: "send-email",
        data: {
          html: emailHtml,
          emailTo: userEmail,
          title: emailTitle
        },
      });
    } catch (error) {
      await session.abortTransaction();
      return NextResponse.json(`Failed to ${body.requestType === "approved" ? "approve" : 'reject'} release`)

    } finally {
      await session.endSession()
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
    }).populate("artist", "spotifyId appleId -_id").lean();
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
        lyrics:1
      },
    ).lean();
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
