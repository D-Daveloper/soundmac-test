import { nextReleases } from "@/app/utils/constants";
import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumModel from "@/util/models/AlbumModel";
import Artist from "@/util/models/artistModel";
import SongModel from "@/util/models/songModel";
import User from "@/util/models/userModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const userData = await verifyJWT();

    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();
    const user = await User.findById(userJwt.user);
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 404 });
    } else if (user.role != "admin" && user.role != "super_admin") {
      return NextResponse.json(
        { msg: "Unauthorized for this action" },
        { status: 403 },
      );
    }

    const totalUsers = await User.countDocuments();
    const totalArtists = await Artist.countDocuments();
    const totalSingles = await SongModel.countDocuments();
    const totalApprovedSingles = await SongModel.countDocuments({
      releaseStatus: "approved",
    });
    const totalRejectedSingles = await SongModel.countDocuments({
      releaseStatus: "rejected",
    });
    const totalPendingSingles = await SongModel.countDocuments({
      releaseStatus: "pending",
    });
    const totalAlbums = await AlbumModel.countDocuments();
    const totalApprovedAlbums = await AlbumModel.countDocuments({
      releaseStatus: "approved",
    });
    const totalRejectedAlbums = await AlbumModel.countDocuments({
      releaseStatus: "rejected",
    });
    const totalPendingAlbums = await AlbumModel.countDocuments({
      releaseStatus: "pending",
    });
    const pendingAlbums = await AlbumModel.find(
      {
        releaseStatus: "pending",
      },
      { releaseTitle: 1, releaseDate: 1, artistName: 1, featuredArtist: 1 },
    ).limit(2);
    const pendingSingles = await SongModel.find(
      {
        releaseStatus: "pending",
      },
      { releaseTitle: 1, releaseDate: 1, artistName: 1 },
    ).limit(2);
    let upcomingReleases: typeof nextReleases = [...pendingSingles,...pendingAlbums];
    const totalRelease = totalAlbums + totalSingles;
    const totalApprovedReleases = totalApprovedAlbums + totalApprovedSingles;
    const totalRejectedReleases = totalRejectedAlbums + totalRejectedSingles;
    const totalPendingReleases = totalPendingAlbums + totalPendingSingles;

    const dashboardDate = {
      totalRelease,
      totalApprovedReleases,
      totalRejectedReleases,
      totalPendingReleases,
      totalUsers,
      totalArtists,
      totalSupportRequests: 200,
      totalEarnings: 40000000,
      upcomingReleases,
    };

    return NextResponse.json(
      { ...dashboardDate, msg: "Successful" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      },
    );
    // const artists = await Artist.find({ user: userJwt.user }).populate("user", "email").sort({[sort]:1}).skip((page - 1) * limit).limit(limit);
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
