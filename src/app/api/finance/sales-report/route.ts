import dbConnect from "@/util/db";
import { NextResponse } from "next/server";
import salesReport from "@/util/models/salesReportModel";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";


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
        } else if (user.role != "user") {
            return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
        }


        const [totals, songs, artists] = await Promise.all([

            //total net amount
            salesReport.aggregate([
                { $match: { matchStatus: "matched", user: user._id } },
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
            // 🎵 Songs
            salesReport.aggregate([
                 { $match: { matchStatus: "matched", user: user._id } },
                {
                    $group: {
                        _id: "$upc",// explaination we use the upc to track the songs so say 10 songs with the same upc appear in the sales report maybe the song was streamed in different places, what we are saying here is give me that song with the same upc let me calculate the total revenue it has generated so kinda like arranging the sales report by upc and getting the top 3 most performing by revenue
                        totalRevenue: { $sum: { $toDouble: "$netAmountUsd" } },
                        trackTitle: { $first: "$trackTitle" },
                        trackArtists: { $first: "$trackArtistsRaw" },
                    }
                },
                { $sort: { totalRevenue: -1 } },
                { $limit: 3 },

                {
                    $lookup: {
                        from: "songs",
                        localField: "_id",// the id from the group stage the value is the upc
                        foreignField: "upc",// so here we are saying since the value of the id fromt the group stage is the upc, use that id value (which is the upc) use it and search the songs collection to get the full song.
                        as: "song"
                    }
                },

                { $unwind: "$song" }
            ]),

            // 🎤 Artists
            salesReport.aggregate([
                { $match: { matchStatus: "matched", user:user._id } },

                {
                    $group: {
                        _id: "$artist",
                        totalRevenue: { $sum: { $toDouble: "$netAmountUsd" } },
                        totalQuantity: { $sum: "$quantity" },
                    }
                },

                { $sort: { totalRevenue: -1 } },
                { $limit: 3 },

                {
                    $lookup: {
                        from: "artists",
                        localField: "_id",
                        foreignField: "_id",
                        as: "artist"
                    }
                },

                { $unwind: "$artist" }
            ]),

        ]);

        return NextResponse.json({
            totals,
            topSongs: songs,
            topArtists: artists,
        });

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