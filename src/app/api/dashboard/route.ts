import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumModel from "@/util/models/AlbumModel";
import salesReportLedger from "@/util/models/saleReportLedgerModel";
import SongModel from "@/util/models/songModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const userData = await verifyJWT();

    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const ApprovedSinglesQuery = SongModel.find({
      user: userJwt.user,
      releaseStatus: "approved",
    }).limit(1).lean();

    const ApprovedAlbumsQuery = AlbumModel.find({
      user: userJwt.user,
      releaseStatus: "approved",
    }).limit(1).lean();

    const totalSinglesQuery = SongModel.countDocuments({
      user: userJwt.user,
    });

    const totalAlbumsQuery = AlbumModel.countDocuments({
      user: userJwt.user,
    });

    const pendingAlbumsQuery = AlbumModel.find(
      {
        user: userJwt.user,

        releaseStatus: "pending",
      },
      { releaseTitle: 1, releaseDate: 1, artistName: 1, featuredArtist: 1 },
    ).limit(1).lean();

    const pendingSinglesQuery = SongModel.find(
      {
        user: userJwt.user,
        releaseStatus: "pending",
      },
      { releaseTitle: 1, releaseDate: 1, releaseImage: 1, artistName: 1 },
    ).limit(1).lean();

    const userBalanceQuery = salesReportLedger.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userJwt.user!) } },
      {
        $group: {
          _id: null,
          totalNetAmount: {
            $sum: {
              $cond: [
                { $eq: ["$direction", "credit"] },
                { $toDouble: "$amountUsd" },
                { $multiply: [{ $toDouble: "$amountUsd" }, -1] }
              ]
            }
          },
        }
      }
    ]);
    const [single, album, totalSingles, totalAlbums, pendingAlbum, pendingSingle, balance] = await Promise.all([
      ApprovedSinglesQuery,
      ApprovedAlbumsQuery,
      totalSinglesQuery,
      totalAlbumsQuery,
      pendingAlbumsQuery,
      pendingSinglesQuery,
      userBalanceQuery,
    ]);

    let pendingRelease = null;
    if (pendingSingle) {
      pendingRelease = pendingSingle[0];
    } else {
      pendingRelease = pendingAlbum ? pendingAlbum[0] : null;
    }

    let lastRelease = null;
    if (single) {
      lastRelease = single[0];
    } else {
      lastRelease = album ? album[0] : null;
    }


    const artistData = {
      pendingRelease,
      totalAlbums,
      totalSingles,
      totalEarnings: balance.length > 0 ? balance[0].totalNetAmount : 0,
      lastRelease
    };

    return NextResponse.json(
      { ...artistData, msg: "Successful" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ msg: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { msg: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
