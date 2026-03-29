import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import mongoose from "mongoose";
import User from "@/util/models/userModel";
import Artist from "@/util/models/artistModel";

export async function GET(req: Request) {
  try {
    let artists = [];
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

    const artistStatus = searchParams.get("artistStatus");
    const artistName = searchParams.get("artistName");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const query: any = {
      artistStatus: artistStatus == "active" ? "active" : "inactive",
    };

    // If cursor exists, fetch items AFTER it
    if (cursor && !artistName) {
      query._id = { $lte: new mongoose.Types.ObjectId(cursor) };
    }
    if (artistName) {
      query.artistName = { $regex: `^${artistName}`, $options: "i" };
    }
    console.log(query);

    artists = await Artist.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate("user", "email firstName lastName")
      .lean();

    let nextCursor = null;
    let hasMore = false;

    if (artists.length > limit) {
      hasMore = true;
      const nextItem = artists.pop(); // remove extra
      nextCursor = nextItem!._id;
    }

    return NextResponse.json(
      {
        data: artists,
        nextCursor,
        hasMore,
        msg: artists.length > 0 ? "Successful" : "No artists found",
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
