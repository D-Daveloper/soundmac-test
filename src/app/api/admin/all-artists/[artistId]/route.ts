import { rejectEmailProps } from "@/app/type";
import dbConnect from "@/util/db";
import { releaseRejectionEmail } from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import sendEmail from "@/util/sendMail/sendEmail";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import SongModel from "@/util/models/songModel";
import Artist from "@/util/models/artistModel";
import AlbumModel from "@/util/models/AlbumModel";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ artistId: string }> },
) {
  const { artistId } = await params; // Access the dynamic 'id' parameter
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

    if (!artistId || !Types.ObjectId.isValid(artistId)) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    }
    const { searchParams } = new URL(req.url);
    let page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const releaseTitle = searchParams.get("releaseTitle");
    const releaseStatusFilter = searchParams.get("releaseStatusFilter");
    const query: any = { artist: artistId };
    if (releaseTitle?.trim()) {
      query.releaseTitle = { $regex: `^${releaseTitle}`, $options: "i" };
      // page = 1;
    }
    const projection = {
      releaseTitle: 1,
      releaseStatus: 1,
      artistName: 1,
      releaseDate: 1,
      upc: 1,
      isrc: 1,
      catalogNumber: 1,
      // genre: 1,
      // releaseAudio: 1,
      // featuredArtist: 1,
      // songWriter: 1,
      // producer: 1,
      // explicitContent: 1,
    };
    let totalCountSingles;
    let totalCountAlbums;
    try {
      const release = SongModel.find(query, projection)
        .collation({ locale: "en", strength: 2 })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      totalCountSingles = SongModel.countDocuments(query);


      const album = AlbumModel.find(query, projection)
        .collation({ locale: "en", strength: 2 })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      totalCountAlbums = AlbumModel.countDocuments(query);


      const artist = Artist.findById(artistId);

      const result = await Promise.all([release, album, artist,totalCountSingles,totalCountAlbums]);

      const totalCount = result[3] + result[4];

      return NextResponse.json({
        data: [...result[0], ...result[1]],
        artist: result[2],
        page,
        limit,
        totalCount: totalCount,
        totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
        msg: "Link generated Successfully.",
      });
    } catch (error) {
      return NextResponse.json({
        msg: "Failed to get artist data.",
      });
    }
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ artistId: string }> },
) {
  const { artistId } = await params; // Access the dynamic 'id' parameter
  try {
    const body: {
      requestType: "approved" | "rejected";
      message?: string;
      artistId: string;
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
    } else if (!artistId || !Types.ObjectId.isValid(artistId)) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 400 });
    }
    const release = await SongModel.findById(artistId).populate(
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
        artistId,
        { releaseStatus: body.requestType },
        { runValidators: true },
      );
    } else if (body.requestType == "rejected") {
      const updateRelease = SongModel.findByIdAndUpdate(
        artistId,
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
