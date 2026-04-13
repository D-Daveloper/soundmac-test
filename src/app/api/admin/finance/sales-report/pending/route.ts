import dbConnect from "@/util/db";
import { NextRequest, NextResponse } from "next/server";
import salesReportLedger from "@/util/models/saleReportLedgerModel";
import salesReport from "@/util/models/salesReportModel";
import SongModel from "@/util/models/songModel";
import AlbumModel from "@/util/models/AlbumModel";
import { handleMongooseValidationError } from "@/util/customError/error";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";


export async function POST(req: NextRequest) {
    try {

        const userData = await verifyJWT();
        const userJwt = verifyUser(userData);

        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }

        const body: {
            productType: "single" | "album";
            matchParameter: string;
            matchValue: string;
        } = await req.json();
        const { productType, matchValue, matchParameter } = body
        if (!productType) {
            console.log("no product type");

            return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
        } else if (!matchParameter || typeof matchParameter != "string") {
            console.log("no match parameter");

            return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
        } else if (!matchValue || typeof matchValue != "string") {
            console.log("no match value");

            return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
        }
        // else if (! || typeof  != "string") {
        //     return NextResponse.json({ msg: "Please indicate the upload date" }, { status: 400 });
        // }
        await dbConnect();

        const admin = userJwt.user ? await User.findById(userJwt.user).lean() : null;
        if (!admin) {
            return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
        } else if (admin.role != "admin" && admin.role != "super_admin") {
            return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
        }
        let release = null;
        let report = null;
        if (productType.toLowerCase() == "single") {
            release = SongModel.findOne({ [matchParameter]: matchValue })
            report = salesReport.find({ [matchParameter]: matchValue });
        } else {
            release = AlbumModel.findOne({ [matchParameter]: matchValue })
            report = salesReport.find({ [matchParameter]: matchValue });
        };
        const [releaseResult, reportResult] = await Promise.all([
            release, report
        ]);
        const ledgers: {
            user: string,
            type: string,
            amountUsd: number,
            direction: string,
            reference: string,
        }[] = [];
        if (releaseResult && reportResult) {
            reportResult.map((report, index) => {
                ledgers.push({
                    user: releaseResult.user,
                    type: "sale",
                    amountUsd: report.netAmountUsd,
                    direction: "credit",
                    reference: report._id,
                })
            });

            await Promise.all([
                salesReportLedger.insertMany(ledgers),
                salesReport.updateMany({ [matchParameter]: matchValue }, {
                    isrc: releaseResult?.isrc,
                    upc: releaseResult.upc,
                    trackTitle: releaseResult.releaseTitle,
                    trackArtistsRaw: releaseResult.artistName,
                    artist: releaseResult.artist,
                    catalogNumber: releaseResult.catalogNumber,
                    // label: label,
                    user: releaseResult.user,
                    matchStatus: "matched",
                })
            ])
        }
        return NextResponse.json({ msg: "successful" });
    } catch (error) {
        console.log(error);
        return handleMongooseValidationError(error);
    }
}

export async function GET(req: Request) {
    try {
        const userData = await verifyJWT();
        const userJwt = verifyUser(userData);

        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }
        await dbConnect();

        const admin = userJwt.user ? await User.findById(userJwt.user).lean() : null;
        if (!admin) {
            return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
        } else if (admin.role != "admin" && admin.role != "super_admin") {
            return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        console.log(searchParams);

        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const releaseTitle = searchParams.get("releaseTitle");
        const promotionStatus = searchParams.get("promotionStatus");
        const promotionType = searchParams.get("promotionType");

        const query: any = { matchStatus: "unmatched" }
        const results = await salesReport.aggregate([
            // 1. Filter (The "query" part)
            { $match: query },

            // 2. Sort (The "sortQuery" part)
            { $sort: { createdAt: -1 }, },

            // 3. Facet to get both Metadata and Data in one pass
            {
                $facet: {
                    metadata: [{ $group: { _id: null, total: { $sum: 1 }, totalRevenue: { $sum: { $toDouble: "$netAmountUsd" } } } }],
                    data: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        // You can add your $lookup or $project here for the data only
                        {
                            $project: {
                                // This redefines the field as a plain number
                                netAmountUsd: { $toDouble: "$netAmountUsd" },
                                trackTitle: 1, // include other fields as usual
                                upc: 1,
                                isrc: 1,
                                productType: 1,
                                label: 1,
                                reportBatch: 1,
                            }
                        }
                    ]
                }
            },

            // 4. Clean up the output structure
            {
                $project: {
                    data: 1,
                    total: { $arrayElemAt: ["$metadata.total", 0] },
                    totalRevenue: { $arrayElemAt: ["$metadata.totalRevenue", 0] },
                }
            }
        ]);

        // results[0] will look like: { total: 150, data: [...] }
        const { total = 0, data = [], totalRevenue } = results[0] || {};

        return NextResponse.json({
            data,
            page,
            limit,
            totalPages: total > 0 ? Math.ceil(total / limit) : 0,
            totalCount: total,
            totalRevenue,
            msg: "Successful"
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