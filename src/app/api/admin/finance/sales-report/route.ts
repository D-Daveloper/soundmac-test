import dbConnect from "@/util/db";
import { NextRequest, NextResponse } from "next/server";
import salesReportBatch from "@/util/models/saleReportBatchModel";
import salesReportLedger from "@/util/models/saleReportLedgerModel";
import salesReport from "@/util/models/salesReportModel";
import { handleMongooseValidationError } from "@/util/customError/error";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import { inngest } from "@/util/lib/inngest/inngest";
import * as xlsx from "@e965/xlsx";


export async function POST(req: NextRequest) {
    try {

        const userData = await verifyJWT();
        const userJwt = verifyUser(userData);

        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }
        const formData = await req.formData();
        const file = formData.get("sales_report") as File;
        const royalty_source = formData.get("royalty_source");
        const sales_period = formData.get("sales_period");
        const accounting_period = formData.get("accounting_period");

        if (!file) {
            return NextResponse.json({ msg: "No file uploaded" }, { status: 400 });
        } else if (!royalty_source || typeof royalty_source != "string") {
            return NextResponse.json({ msg: "Please indicate the source of the report" }, { status: 400 });
        } else if (!sales_period || typeof sales_period != "string") {
            return NextResponse.json({ msg: "Please indicate the sales period" }, { status: 400 });
        } else if (!accounting_period || typeof accounting_period != "string") {
            return NextResponse.json({ msg: "Please indicate the upload date" }, { status: 400 });
        }
        await dbConnect();

        const admin = userJwt.user ? await User.findById(userJwt.user).lean() : null;
        if (!admin) {
            return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
        } else if (admin.role != "admin" && admin.role != "super_admin") {
            return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
        }
        const batch: any = await salesReportBatch.findOne({ fileName: file.name }).lean();
        if (batch && batch.status === "processing") {
            return NextResponse.json({ msg: "Sales report is being processed. Should be done shortly." });
        } else if (batch && batch.status === "completed") {
            return NextResponse.json({ msg: "Sales report has been uploaded" });
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = xlsx.read(buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data: {
            ReportingPeriod: string;
            SaleMonth: string;
            RevenueReceivedByDsp: string;
            ContentType: string;
            Upc: string;
            Iswc: string;
            CatalogNumber: string;
            AlbumName: string;
            Isrc: string;
            ClientNameReported: string;
            TrackArtists: string;
            Label: string;
            WriterComposer: string;
            PublisherAdminSubPublisher: string;
            ProductType: string;
            TrackTitle: string;
            Quantity: string;
            ClientId: string;
            SourceCurrency: string;
            CurrencyRate: string;
            AmtRxBeforeDeductions: string;
            AdminFeePc: string;
            AdminFee: string;
            NetReceivable: string;
            ClientPercentage: string;
            RoyaltyArrangement: string;
            TotalUsd: string;
            DigitalServiceProvider: string;
            Territory: string;
            AggregatorLicensor: string;
            Yr: string;
            Qtr: string;
            Mth: string;

        }[] = xlsx.utils.sheet_to_json(sheet);

        const newBatch = await salesReportBatch.create({
            fileName: file.name,
            fileSource: royalty_source,
            status: "processing",
            uploadDate: new Date(accounting_period)
        });

        // 3. Trigger background job
        await inngest.send({
            name: "report/upload",
            data: {
                data,
                sales_period,
                batchId: newBatch._id
            },
        });
        return NextResponse.json({ msg: "Sales report is being processed. Should be done shortly." });
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


        const [totalWithdrawn, totals, songs, artists, labels] = await Promise.all([
            salesReportLedger.aggregate([
                {
                    $group: {
                        _id: null,
                        totalWithdrawals: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$type", "withdrawal"] },
                                    { $toDouble: "$amountUsd" },
                                    0
                                ]
                            }
                        },
                    }
                }
            ]),
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
            // 🎵 Songs
            salesReport.aggregate([
                { $match: { matchStatus: "matched" } },
                {
                    $group: {
                        _id: "$upc",
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
                        localField: "_id",
                        foreignField: "upc",
                        as: "song"
                    }
                },

                { $unwind: "$song" }
            ]),

            // 🎤 Artists
            salesReport.aggregate([
                { $match: { matchStatus: "matched", artist: { $ne: null } } },

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

            // 🏷️ Labels
            salesReport.aggregate([
                { $match: { matchStatus: "matched", label: { $ne: null } } },
                {
                    $group: {
                        _id: "$label",
                        totalRevenue: { $sum: { $toDouble: "$netAmountUsd" } },
                    }
                },
                { $sort: { totalRevenue: -1 } },
                { $limit: 3 },
                {
                    $lookup: {
                        from: "labels",
                        localField: "_id",
                        foreignField: "labelName",
                        as: "label"
                    }
                },

                { $unwind: "$label" }
            ])

        ]);

        return NextResponse.json({
            totalWithdrawn,
            totals,
            topSongs: songs,
            topArtists: artists,
            topLabels: labels
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







//without inngest working
// export async function POST(req: NextRequest) {
//     try {

//         const userData = await verifyJWT();
//         const userJwt = verifyUser(userData);

//         if (userJwt.msg) {
//             return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
//         }
//         const formData = await req.formData();
//         const file = formData.get("sales_report") as File;
//         const royalty_source = formData.get("royalty_source");
//         const sales_period = formData.get("sales_period");
//         const accounting_period = formData.get("accounting_period");

//         if (!file) {
//             return NextResponse.json({ msg: "No file uploaded" }, { status: 400 });
//         } else if (!royalty_source || typeof royalty_source != "string") {
//             return NextResponse.json({ msg: "Please indicate the source of the report" }, { status: 400 });
//         } else if (!sales_period || typeof sales_period != "string") {
//             return NextResponse.json({ msg: "Please indicate the sales period" }, { status: 400 });
//         } else if (!accounting_period || typeof accounting_period != "string") {
//             return NextResponse.json({ msg: "Please indicate the upload date" }, { status: 400 });
//         }
//         await dbConnect();

//         const admin = userJwt.user ? await User.findById(userJwt.user).lean() : null;
//         if (!admin) {
//             return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
//         } else if (admin.role != "admin" && admin.role != "super_admin") {
//             return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
//         }

//         const buffer = Buffer.from(await file.arrayBuffer());
//         const workbook = xlsx.read(buffer);
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const data: {
//             ReportingPeriod: string;
//             SaleMonth: string;
//             RevenueReceivedByDsp: string;
//             ContentType: string;
//             Upc: string;
//             Iswc: string;
//             CatalogNumber: string;
//             AlbumName: string;
//             Isrc: string;
//             ClientNameReported: string;
//             TrackArtists: string;
//             Label: string;
//             WriterComposer: string;
//             PublisherAdminSubPublisher: string;
//             ProductType: string;
//             TrackTitle: string;
//             Quantity: string;
//             ClientId: string;
//             SourceCurrency: string;
//             CurrencyRate: string;
//             AmtRxBeforeDeductions: string;
//             AdminFeePc: string;
//             AdminFee: string;
//             NetReceivable: string;
//             ClientPercentage: string;
//             RoyaltyArrangement: string;
//             TotalUsd: string;
//             DigitalServiceProvider: string;
//             Territory: string;
//             AggregatorLicensor: string;
//             Yr: string;
//             Qtr: string;
//             Mth: string;

//         }[] = xlsx.utils.sheet_to_json(sheet);
//         const session = await mongoose.startSession();
//         session.startTransaction();

//         const [batch] = await salesReportBatch.create([{
//             fileName: file.name,
//             fileSource: royalty_source,
//             totalRows: data.length,
//             status: "processing",
//             uploadDate: new Date(accounting_period)
//         }],{session});

//         // console.log(data);
//         let sales = [];
//         let ledgers = [];//save everything in memory then save to the db at the end
//         for (const row of data) {
//             const isrc = row["Isrc"]?.toString().trim();
//             const amount = parseFloat(row["TotalUsd"]) || 0;
//             const saleMonth = row["SaleMonth"];
//             const trackTitle = stripQuotes(row["TrackTitle"]);
//             const quantity = parseInt(row["Quantity"]) || 0;
//             const rawAmountUsd = amount;
//             const netAmountUsd = amount;
//             const dsp = row["DigitalServiceProvider"];
//             const territory = row["Territory"];
//             const upc = row["Upc"]?.toString().trim();
//             const trackArtistsRaw = row["TrackArtists"] || "";
//             const productType = row["ProductType"];
//             const revenueReceivedByDsp = row["RevenueReceivedByDsp"];
//             const contentType = row["ContentType"];
//             const catalogNumber = row["CatalogNumber"];
//             const label = row["Label"];
//             const sourceCurrency = row["SourceCurrency"];
//             const year = row["Yr"];
//             // normalize artist string
//             const normalizedArtist = normalize(trackArtistsRaw);

//             // 🔍 find by UPC first
//             const songPromise: any = SongModel.findOne({
//                 releaseStatus: "approved", $or: [
//                     { upc: upc },
//                     { isrc: isrc },
//                     { catalogNumber },
//                 ]
//             }).lean();
//             const albumPromise: any = AlbumModel.findOne({
//                 releaseStatus: "approved", $or: [
//                     { upc: upc },
//                     { catalogNumber },
//                 ]
//             }).lean();

//             // 🔍 fallback artist search
//             const artistPromise: any = Artist.findOne({
//                 artistName: normalizedArtist, // 🔥 see note below
//             }).lean();

//             const [songResult, albumResult, artistResult] = await Promise.all([
//                 songPromise,
//                 albumPromise,
//                 artistPromise,
//             ]);

//             // 🎯 resolve user
//             let userId = null;
//             let userUpc = upc;
//             let userIsrc = isrc;
//             let userTrackTitle = trackTitle;
//             let userTrackArtist = normalizedArtist;
//             let artistId = null;
//             let userCatalogNumber = catalogNumber
//             if (songResult?.user) {
//                 userId = songResult.user;
//                 userUpc = songResult.upc
//                 userIsrc = songResult.isrc
//                 userTrackTitle = songResult.releaseTitle
//                 userTrackArtist = songResult.artistName
//                 artistId = songResult.artist
//                 userCatalogNumber = songResult.catalogNumber
//             } else if (albumResult?.user) {
//                 userId = albumResult.user;
//                 userUpc = albumResult.upc
//                 userIsrc = albumResult.isrc
//                 userTrackTitle = albumResult.releaseTitle
//                 userTrackArtist = albumResult.artistName
//                 artistId = albumResult.artist
//                 userCatalogNumber = albumResult.catalogNumber
//             } else if (artistResult?.user) {
//                 userId = artistResult.user;
//                 artistId = artistResult.artist
//                 userTrackArtist = artistResult.artistName
//             }
//             const saleId = new mongoose.Types.ObjectId(); // Generate ID locally
//             sales.push({
//                 _id: saleId,
//                 saleMonth,
//                 reportperiod: new Date(sales_period),
//                 isrc: userIsrc,
//                 upc: userUpc,
//                 trackTitle: userTrackTitle,
//                 trackArtistsRaw: userTrackArtist,
//                 artist: artistId,
//                 quantity,
//                 rawAmountUsd,
//                 netAmountUsd,
//                 dsp,
//                 territory,
//                 productType,
//                 revenueReceivedByDsp,
//                 contentType,
//                 catalogNumber: userCatalogNumber,
//                 label: label,
//                 sourceCurrency,
//                 year,
//                 user: userId,
//                 reportBatch: batch._id,
//                 matchStatus: userId ? "matched" : "unmatched",
//             });

//             // 💰 create ledger entry ONLY if matched
//             if (userId) {
//                 ledgers.push({
//                     user: userId,
//                     type: "sale",
//                     amountUsd: amount,
//                     direction: "credit",
//                     reference: saleId,
//                 });
//             }
//         }

//         // batch.status = "completed";
//         // await Promise.all([
//         //     salesReport.insertMany(sales,{session}),
//         //     salesReportLedger.insertMany(ledgers,{session}),
//         //     batch.save({session}),
//         // ])
//         try {
//             // Pass the session to every operation
//             batch.status = "completed";
//             await Promise.all([
//                 salesReport.insertMany(sales, { session }),
//                 salesReportLedger.insertMany(ledgers, { session }),
//                 batch.save({ session }),
//             ])

//             await session.commitTransaction();
//         } catch (error) {
//             await session.abortTransaction();
//             throw error;
//         } finally {
//             session.endSession();
//         }


//         return NextResponse.json({ msg: "successful" });
//     } catch (error) {
//         console.log(error);
//         return handleMongooseValidationError(error);
//     }
// }