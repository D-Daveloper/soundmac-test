import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import mongoose from "mongoose";
import SongModel from "@/util/models/songModel";
import User from "@/util/models/userModel";

export async function GET(req: Request) {
  try {
    let release = [];
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

    const cursor = searchParams.get("cursor");

    const releaseTitle = searchParams.get("releaseTitle");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const query: any = { releaseStatus: "pending" };

    // If cursor exists, fetch items AFTER it
    if (cursor && !releaseTitle) {
      query._id = { $lte: new mongoose.Types.ObjectId(cursor) };
    }
    if (releaseTitle) {
      query.releaseTitle = { $regex: `^${releaseTitle}`, $options: "i" };
    }
    console.log(query);
    const projection = {
      releaseTitle: 1,
      releaseImage: 1,
      releaseDate: 1,
    };
    release = await SongModel.find(query, projection)
      .collation({ locale: "en", strength: 2 })
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate("artist", "artistName artistImage");

    let nextCursor = null;
    let hasMore = false;

    if (release.length > limit) {
      hasMore = true;
      const nextItem = release.pop(); // remove extra
      nextCursor = nextItem._id;
    }

    return NextResponse.json(
      {
        data: release,
        nextCursor,
        hasMore,
        msg: release.length > 0 ? "Successful" : "No songsrelease found",
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
