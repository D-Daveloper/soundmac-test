import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import AlbumModel from "@/util/models/AlbumModel";
import SongModel from "@/util/models/songModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const releaseTitle = searchParams.get("releaseTitle") || "";
    const artist = searchParams.get("artist") || "none";
    const releaseType = searchParams.get("releaseType") === "album" ? "album" : "single";

    const Model = releaseType === "album" ? AlbumModel : SongModel;

    const query: any = { releaseStatus: "approved" };
    if (releaseTitle) {
      query.releaseTitle = { $regex: releaseTitle, $options: "i" };
    }
    if (artist && artist !== "none") {
      query.artistName = artist;
    }

    const projection = {
      releaseTitle: 1,
      artistName: 1,
      releaseImage: 1,
      releaseDate: 1,
      createdAt: 1,
      approvedAt: 1,
      platformDelivery: 1,
    };

    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      Model.find(query, projection)
        .collation({ locale: "en", strength: 2 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Model.countDocuments(query),
    ]);

    const defaultPlatforms = [
      { platform: "spotify", status: "pending", lastCheckedAt: null },
      { platform: "apple_music", status: "pending", lastCheckedAt: null },
    ];

    const releases = data.map((release: any) => ({
      ...release,
      platformDelivery:
        release.platformDelivery && release.platformDelivery.length > 0
          ? release.platformDelivery
          : defaultPlatforms,
    }));

    return NextResponse.json({
      data: releases,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ msg: error.message }, { status: 500 });
    }
    return NextResponse.json({ msg: "An unknown error occurred" }, { status: 500 });
  }
}