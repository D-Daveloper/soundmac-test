import sendEmail from "@/util/sendMail/sendEmail";
import { inngest } from "../inngest";
import salesReport from "@/util/models/salesReportModel";
import * as xlsx from "@e965/xlsx";
import { s3 } from "@/util/middleware/aws";
import salesReportDownload from "@/util/models/salesReportDownloadModel";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mongoose from "mongoose";
import salesReportBatch from "@/util/models/saleReportBatchModel";
import { stripQuotes, normalize } from "@/util/middleware/functions";
import SongModel from "@/util/models/songModel";
import AlbumModel from "@/util/models/AlbumModel";
import Artist from "@/util/models/artistModel";
import salesReportLedger from "@/util/models/saleReportLedgerModel";
import dbConnect from "@/util/db";

export const uploadSalesReport = inngest.createFunction(
    { id: "upload-report", triggers: { event: "report/upload" } },
    async ({ event, step }) => {

        console.log(event);
        const { batchId, sales_period, data } = event.data;

        await step.run("parse-sales-report", async () => {
            await dbConnect();


            // console.log(data);
            let sales = [];
            let ledgers = [];//save everything in memory then save to the db at the end
            for (const row of data) {
                const isrc = row["Isrc"]?.toString().trim();
                const amount = parseFloat(row["TotalUsd"]) || 0;
                const saleMonth = row["SaleMonth"];
                const trackTitle = stripQuotes(row["TrackTitle"]);
                const quantity = parseInt(row["Quantity"]) || 0;
                const rawAmountUsd = amount;
                const netAmountUsd = amount;
                const dsp = row["DigitalServiceProvider"];
                const territory = row["Territory"];
                const upc = row["Upc"]?.toString().trim();
                const trackArtistsRaw = row["TrackArtists"] || "";
                const productType = row["ProductType"];
                const revenueReceivedByDsp = row["RevenueReceivedByDsp"];
                const contentType = row["ContentType"];
                const catalogNumber = row["CatalogNumber"];
                const label = row["Label"];
                const sourceCurrency = row["SourceCurrency"];
                const year = row["Yr"];
                // normalize artist string
                const normalizedArtist = normalize(trackArtistsRaw);

                // 🔍 find by UPC first
                const songPromise: any = SongModel.findOne({
                    releaseStatus: "approved", $or: [
                        { upc: upc },
                        { isrc: isrc },
                        { catalogNumber },
                    ]
                }).lean();
                const albumPromise: any = AlbumModel.findOne({
                    releaseStatus: "approved", $or: [
                        { upc: upc },
                        { catalogNumber },
                    ]
                }).lean();
                // 🔍 fallback artist search
                const artistPromise: any = Artist.findOne({
                    artistName: normalizedArtist, // 🔥 see note below
                }).lean();

                const [songResult, albumResult, artistResult] = await Promise.all([
                    songPromise,
                    albumPromise,
                    artistPromise,
                ]);

                // 🎯 resolve user
                let userId = null;
                let userUpc = upc;
                let userIsrc = isrc;
                let userTrackTitle = trackTitle;
                let userTrackArtist = normalizedArtist;
                let artistId = null;
                let userCatalogNumber = catalogNumber
                if (songResult?.user) {
                    userId = songResult.user;
                    userUpc = songResult.upc
                    userIsrc = songResult.isrc
                    userTrackTitle = songResult.releaseTitle
                    userTrackArtist = songResult.artistName
                    artistId = songResult.artist
                    userCatalogNumber = songResult.catalogNumber
                } else if (albumResult?.user) {
                    userId = albumResult.user;
                    userUpc = albumResult.upc
                    userIsrc = albumResult.isrc
                    userTrackTitle = albumResult.releaseTitle
                    userTrackArtist = albumResult.artistName
                    artistId = albumResult.artist
                    userCatalogNumber = albumResult.catalogNumber
                } else if (artistResult?.user) {
                    userId = artistResult.user;
                    artistId = artistResult.artist
                    userTrackArtist = artistResult.artistName
                }
                const saleId = new mongoose.Types.ObjectId(); // Generate ID locally
                sales.push({
                    _id: saleId,
                    saleMonth,
                    reportperiod: new Date(sales_period),
                    isrc: userIsrc,
                    upc: userUpc,
                    trackTitle: userTrackTitle,
                    trackArtistsRaw: userTrackArtist,
                    artist: artistId,
                    quantity,
                    rawAmountUsd,
                    netAmountUsd,
                    dsp,
                    territory,
                    productType,
                    revenueReceivedByDsp,
                    contentType,
                    catalogNumber: userCatalogNumber,
                    label: label,
                    sourceCurrency,
                    year,
                    user: userId,
                    reportBatch: batchId,
                    matchStatus: userId ? "matched" : "unmatched",
                });

                // 💰 create ledger entry ONLY if matched
                if (userId) {
                    ledgers.push({
                        user: userId,
                        type: "sale",
                        amountUsd: amount,
                        direction: "credit",
                        reference: saleId,
                    });
                }
            }
            const session = await mongoose.startSession();
            try {

                session.startTransaction();

                // Pass the session to every operation
                await Promise.all([
                    salesReport.insertMany(sales, { session }),
                    salesReportLedger.insertMany(ledgers, { session }),
                    salesReportBatch.findByIdAndUpdate({ _id: batchId }, {
                        $set: {
                            status: "completed",
                            totalRows: data.length
                        }
                    }, { session }),
                ])

                await session.commitTransaction();
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        });

        return { success: true };

    }
);
export const generateReport = inngest.createFunction(
    { id: "generate-report", triggers: { event: "report/generate" } },
    async ({ event, step }) => {
        console.log(event);
        await dbConnect();

        const { reportId, userId, email, filters } = event.data;

        // 1. Fetch data
        const reports = await step.run("fetch-data", async () => {
            return await salesReport.find({ user: userId }).lean();
        });

        // 2. Format + CSV
        const csv = await step.run("generate-csv", async () => {
            const formatted = reports.map(r => ({
                Song: r.trackTitle,
                Artist: r.trackArtistsRaw,
                Revenue: r.netAmountUsd?.toString(),
                Date: r.createdAt,
            }));

            //   const parser = new Parser();
            // 1. Create the worksheet from JSON
            const worksheet = xlsx.utils.json_to_sheet(formatted);

            // 2. Convert the worksheet object into a CSV string
            const csvString = xlsx.utils.sheet_to_csv(worksheet);

            console.log("csv report", csvString);

            return csvString;
            //   const parser = new Parser();
            //   return parser.parse(formatted);
        });

        // 3. Upload to S3
        const { fileKey, fileUrl } = await step.run("upload", async () => {
            const key = `salesReports/${userId}/${reportId}.csv`;

            await s3.send(new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET!,
                Key: key,
                Body: Buffer.from(csv, 'utf-8'),
                ContentType: "text/csv",
            }));
            const getCommand = new GetObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET!,
                Key: key,
            });
            const signedUrl = await getSignedUrl(s3, getCommand, { expiresIn: (60 * 60) }); // 1 hour

            return { fileKey: key, fileUrl: signedUrl };
        });
        console.log("filekey", fileKey, "fileurl", fileUrl);

        // 4. Update DB
        await step.run("update-db", async () => {
            await salesReportDownload.findByIdAndUpdate(reportId, {
                status: "ready",
                fileKey,
                fileUrl,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h validity
            });
        });

        // 5. Email
        await step.run("email", async () => {
            await sendEmail(
                email,
                "Your report is ready",
                `Download here: ${fileUrl}`,
            );
        });

        return { success: true };
    }
);