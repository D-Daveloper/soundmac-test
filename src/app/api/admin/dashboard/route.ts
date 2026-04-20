import { nextReleases } from "@/app/utils/constants";
import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumModel from "@/util/models/AlbumModel";
import Artist from "@/util/models/artistModel";
import salesReport from "@/util/models/salesReportModel";
import SongModel from "@/util/models/songModel";
import supportRequestsModel from "@/util/models/supportRequestsModel";
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

    const totalUsersQuery = User.countDocuments();
    const totalArtistsQuery = Artist.countDocuments();
    const totalSinglesQuery = SongModel.countDocuments();
    const totalApprovedSinglesQuery = SongModel.countDocuments({
      releaseStatus: "approved",
    });
    const totalRejectedSinglesQuery = SongModel.countDocuments({
      releaseStatus: "rejected",
    });
    const totalPendingSinglesQuery = SongModel.countDocuments({
      releaseStatus: "pending",
    });
    const totalAlbumsQuery = AlbumModel.countDocuments();
    const totalApprovedAlbumsQuery = AlbumModel.countDocuments({
      releaseStatus: "approved",
    });
    const totalRejectedAlbumsQuery = AlbumModel.countDocuments({
      releaseStatus: "rejected",
    });
    const totalPendingAlbumsQuery = AlbumModel.countDocuments({
      releaseStatus: "pending",
    });
    const pendingAlbumsQuery = AlbumModel.find(
      {
        releaseStatus: "pending",
      },
      { releaseTitle: 1, releaseDate: 1, artistName: 1, featuredArtist: 1 },
    ).limit(2);
    const pendingSinglesQuery = SongModel.find(
      {
        releaseStatus: "pending",
      },
      { releaseTitle: 1, releaseDate: 1, artistName: 1 },
    ).limit(2);
const totalSupportRequestsQuery = supportRequestsModel.countDocuments({})

    const [totalRevenue, totalUsers,
      totalArtists,
      totalSingles,
      totalApprovedSingles,
      totalRejectedSingles,
      totalPendingSingles,
      totalAlbums,
      totalApprovedAlbums,
      totalRejectedAlbums,
      totalPendingAlbums,
      pendingAlbums,
      pendingSingles,
    totalSupportRequests] = await Promise.all([
        salesReport.aggregate([
          {
            $group: {
              _id: null,
              totalNetAmount: {
                $sum: { $toDouble: "$netAmountUsd" }
              },
              totalDocuments: { $sum: 1 }
            }
          }
        ]),
        totalUsersQuery,
        totalArtistsQuery,
        totalSinglesQuery,
        totalApprovedSinglesQuery,
        totalRejectedSinglesQuery,
        totalPendingSinglesQuery,
        totalAlbumsQuery,
        totalApprovedAlbumsQuery,
        totalRejectedAlbumsQuery,
        totalPendingAlbumsQuery,
        pendingAlbumsQuery,
        pendingSinglesQuery,
        totalSupportRequestsQuery
      ]);

    let upcomingReleases: typeof nextReleases = [...pendingSingles, ...pendingAlbums];
    const totalRelease = totalAlbums + totalSingles;
    const totalApprovedReleases = totalApprovedAlbums + totalApprovedSingles;
    const totalRejectedReleases = totalRejectedAlbums + totalRejectedSingles;
    const totalPendingReleases = totalPendingAlbums + totalPendingSingles;

    const dashboardData = {
      totalRelease,
      totalApprovedReleases,
      totalRejectedReleases,
      totalPendingReleases,
      totalUsers,
      totalArtists,
      totalSupportRequests,
      totalEarnings: totalRevenue.length > 0 ? totalRevenue[0].totalNetAmount : 0,
      upcomingReleases,
    };

    return NextResponse.json(
      { ...dashboardData, msg: "Successful" },
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
