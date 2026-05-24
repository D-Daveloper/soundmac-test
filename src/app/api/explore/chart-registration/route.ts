import {
    boomplayPackages,
    deezerPackages,
    onlinePressPackages,
    radioPromotionPackages,
    shazamPackages,
} from "@/app/constant";
import dbConnect from "@/util/db";
import {
    parseChartRegistrationFormData,
} from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AlbumModel from "@/util/models/AlbumModel";
import Artist from "@/util/models/artistModel";
import ChartRegistrationModel from "@/util/models/chartRegistrationModel";
import Promotion, { IPromotion } from "@/util/models/promotionModel";
import SongModel from "@/util/models/songModel";
import User from "@/util/models/userModel";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

const chartRegistrationConstants = [

    {
        title: "United States – Billboard Charts",
        description: "Official music charts in the United States, including the Billboard Hot 100 and Billboard 200. Chart rankings are based on U.S. streaming, digital sales, and radio airplay data collected through authorized reporting systems.",
        amount: 25,
        country: "us",
        slug: "united-states-billboard-charts"
    },
    {
        title: "United Kingdom – Official Charts",
        description: "Compiled by the Official Charts Company, these are the UK’s recognized national music charts. Rankings are based on UK streaming, digital downloads, and physical sales from official reporting retailers.",
        amount: 25,
        country: "gb",
        slug: "united-kingdom-official-charts"
    },
    {
        title: "Australia – ARIA Charts",
        description: "The official Australian music charts, compiled by ARIA (Australian Recording Industry Association). Rankings are based on Australian streaming and sales data.",
        amount: 25,
        country: "au",
        slug: "australia-aria-charts"
    },
    {
        title: "Nigeria – TurnTable Charts",
        description: "Nigeria’s recognized national music charts. Rankings are based on streaming, radio airplay, and television data across Nigeria.",
        amount: 25,
        country: "ng",
        slug: "nigeria-turntable-charts"
    },
    {
        title: "Germany – GfK Entertainment Charts",
        description: "Germany’s official music charts, compiled by GfK Entertainment. Rankings are determined by verified German streaming and sales data from authorized retailers and platforms.",
        amount: 25,
        country: "de",
        slug: "germany-gfk-entertainment-charts"
    },
    {
        title: "France – SNEP Charts",
        description: "France’s official music charts, published by SNEP (Syndicat National de l’Édition Phonographique). Rankings are based on French streaming, digital downloads, and physical sales.",
        amount: 25,
        country: "fr",
        slug: "france-s nep -charts"
    },
]

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const payload = parseChartRegistrationFormData(formData);
        const {
            artist,
            releaseTitle,
            chartSlug,
        } = payload;

        await dbConnect();
        let userArtist = null;
        let userSong: any | null = null;
        let userAlbum: any | null = null;
        let userTrack: any | null = null;
        let Uploaderror: { msg: string; status: number } | null = null;

        const chartInfo = chartRegistrationConstants.find((chart) => chart.slug === chartSlug);

        if (!chartInfo) {
            return NextResponse.json({ msg: "Invalid chart selection" }, { status: 400 });
        };

        const userData = await verifyJWT();
        const userJwt = verifyUser(userData);
        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }
        const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
        if (!user) {
            Uploaderror = { msg: "Invalid Request", status: 401 };
        } else if (!user.confirmed) {
            Uploaderror = { msg: "Please verify your email address", status: 400 };
        } else if (user.otp !== null) {
            Uploaderror = { msg: "Please login", status: 400 };
        } else if (
            artist == null ||
            releaseTitle == null ||
            chartSlug == null
        ) {
            Uploaderror = { msg: "Please provide all required fields", status: 400 };
        } else {
            const userArtistQuery = await Artist.findOne({
                user: userJwt.user,
                artistName: (artist as string)?.trim(),
            }).lean();
            const userSongQuery = await SongModel.findOne({
                releaseTitle: (releaseTitle as string)?.trim(),
                user: userJwt.user,
            }).lean();
            const userAlbumQuery = await AlbumModel.findOne({
                releaseTitle: (releaseTitle as string)?.trim(),
                user: userJwt.user,
            }).lean();

            [userArtist, userAlbum, userSong] = await Promise.all([
                userArtistQuery,
                userAlbumQuery,
                userSongQuery
            ]);
        }

        if (Uploaderror != null) {
            return NextResponse.json(
                { msg: Uploaderror.msg },
                { status: Uploaderror.status },
            );
        }


        if (!userArtist) {
            return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
        } else if (!userAlbum && !userSong) {
            return NextResponse.json(
                { msg: "Invalid Release Title." },
                { status: 400 },
            );
        }

        const releaseType = userAlbum ? "Album" : "Song";

        const chart = await ChartRegistrationModel.findOne({
            user: user!._id,
            releaseTitle: (releaseTitle as string)?.trim(),
            artist: userArtist._id,
            chartName: chartInfo.title,
        });

        if (chart && chart.chartStatus === "pending") {
            return NextResponse.json(
                { msg: "Your Chart is under review." },
                { status: 400 },
            );
        } else if (chart && chart.chartStatus === "approved") {
            return NextResponse.json(
                { msg: "Your Chart Registration has been approved." },
                { status: 400 },
            );
        } else if (chart && chart.chartStatus === "awaiting_payment") {
            return NextResponse.json(
                { msg: "We are confirming your payment." },
                { status: 200 },
            );
        } else {
            const newChartRegistration = await ChartRegistrationModel.findOneAndUpdate({
                user: user!._id,
                releaseTitle: (releaseTitle as string)?.trim(),
                artist: userArtist._id,
                chartName: chartInfo.title,
            }, {
                $set: {
                    user: user!._id,
                    releaseTitle: (releaseTitle as string)?.trim(),
                    artist: userArtist._id,
                    chartName: chartInfo.title,
                    releaseId: userAlbum ? userAlbum._id : userSong!._id,
                    onModel: releaseType,
                    chartStatus: "awaiting_payment"
                }
            }, { upsert: true, new: true, runValidators: true });
            console.log(newChartRegistration);


            const res = await fetch("https://api.paystack.co/transaction/initialize", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: user!.email,
                    amount: (chartInfo.amount * parseInt(process.env.DOLLAR_EXCHANGE_RATE || "1500")) * 100,
                    callback_url: `${process.env.FRONTEND_URL}/dashboard/explore/promotion/payment-callback?isChartRegistration=true`,
                    channels: ["card", "bank", "ussd"],
                    metadata: {
                        email: user!.email,
                        first_name: user!.firstName,
                        last_name: user!.lastName,
                        artistName: artist,
                        artistId: userArtist._id.toString(),
                        releaseTitle,
                        isChartRegistration: true,
                        chartId: newChartRegistration._id.toString(),
                    },
                }),
            });

            const data = await res.json();
            console.log(data);

            if (!data.status) {
                return NextResponse.json({ error: data.message }, { status: 400 });
            }

            return NextResponse.json({
                url: data.data.authorization_url,
                msg: "You're getting redirected to the payment gateway.",
            });
        }
    } catch (err) {
        console.error("payment error", err);
        return NextResponse.json(
            { msg: "Payment initialization failed" },
            { status: 500 },
        );
    }
}

export async function PUT(req: Request) {
    try {
        const { promotionId } = await req.json();

        await dbConnect();
        let promotion = null;
        let userSong = null;
        let userAlbum = null;
        let userArtist = null;
        let Uploaderror: { msg: string; status: number } | null = null;
        const userData = await verifyJWT();
        const userJwt = verifyUser(userData);
        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }
        const user = userJwt.user ? await User.findById(userJwt.user) : null;
        if (!user) {
            Uploaderror = { msg: "Invalid Request", status: 401 };
        } else if (!user.confirmed) {
            Uploaderror = { msg: "Please verify your email address", status: 400 };
        } else if (user.otp !== null) {
            Uploaderror = { msg: "Please login", status: 400 };
        } else if (!promotionId || !Types.ObjectId.isValid(promotionId)) {
            Uploaderror = {
                msg: "Promotion ID must be a valid ObjectId",
                status: 400,
            };
        } else {
            promotion = await Promotion.findById(promotionId);
        }
        if (!promotion) {
            Uploaderror = { msg: "Promotion not found", status: 404 };
        }

        if (Uploaderror != null) {
            return NextResponse.json(
                { msg: Uploaderror.msg },
                { status: Uploaderror.status },
            );
        }
        if (
            promotion!.artist == null ||
            promotion!.releaseTitle == null ||
            promotion!.releaseDescription == null ||
            promotion!.packageName == null ||
            promotion!.category == null
        ) {
            Uploaderror = { msg: "Please provide all required fields", status: 400 };
        } else if (typeof promotion!.artistName != "string") {
            Uploaderror = { msg: "Artist must be a string", status: 400 };
        } else if (typeof promotion!.releaseTitle != "string") {
            Uploaderror = { msg: "Release title must be a string", status: 400 };
        } else if (typeof promotion!.releaseDescription != "string") {
            Uploaderror = {
                msg: "Release description must be a string",
                status: 400,
            };
        } else if (typeof promotion!.packageName != "string") {
            Uploaderror = { msg: "Promotion package must be a string", status: 400 };
        } else if (
            typeof promotion!.category != "string" ||
            ![
                "Online-Press",
                "Playlist-Pitch",
                "Radio-Promotion",
                "Shazam",
                "Deezer",
                "Boomplay",
            ].includes(promotion!.category)
        ) {
            Uploaderror = { msg: "Promotion type must be a string", status: 400 };
        } else {
            userArtist = (await Artist.findOne({
                user: userJwt.user,
                artistName: promotion!.artistName?.trim(),
            })) as any;
            userSong = await SongModel.findOne({
                release: promotion!.releaseTitle?.trim(),
                user: userJwt.user,
            });
            userAlbum = await AlbumModel.findOne({
                release: promotion!.releaseTitle?.trim(),
                user: userJwt.user,
            });
        }

        if (!userArtist) {
            return NextResponse.json({ msg: "Invalid Artist" }, { status: 400 });
        }

        switch (promotion!.category) {
            case "Boomplay":
                if (!boomplayPackages.includes(promotion!.packageName)) {
                    return NextResponse.json(
                        { msg: "Invalid Boomplay Package" },
                        { status: 400 },
                    );
                }
                break;
            case "Deezer":
                if (!deezerPackages.includes(promotion!.packageName)) {
                    return NextResponse.json(
                        { msg: "Invalid Deezer Package" },
                        { status: 400 },
                    );
                }
                break;
            case "Online-Press":
                if (!onlinePressPackages.includes(promotion!.packageName)) {
                    return NextResponse.json(
                        { msg: "Invalid Online Press Package" },
                        { status: 400 },
                    );
                }
            case "Shazam":
                if (!shazamPackages.includes(promotion!.packageName)) {
                    return NextResponse.json(
                        { msg: "Invalid Shazam Package" },
                        { status: 400 },
                    );
                }
                break;
            case "Radio-Promotion":
                if (!radioPromotionPackages.includes(promotion!.packageName)) {
                    return NextResponse.json(
                        { msg: "Invalid Radio Promotion Package" },
                        { status: 400 },
                    );
                }
                break;

            default:
                return NextResponse.json(
                    { msg: "Invalid Pr5omotion Type" },
                    { status: 400 },
                );
                break;
        }

        if (Uploaderror != null) {
            return NextResponse.json(
                { msg: Uploaderror.msg },
                { status: Uploaderror.status },
            );
        }

        // const reference = `promo_${Date.now()}_${Math.random().toString(36).substring(2, 15)}` // generate a unique transaction reference for this promotion.

        const res = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: user!.email,
                amount: promotion!.amount * 100,
                callback_url: `${process.env.FRONTEND_URL}/dashboard/explore/promotion/payment-callback`,
                channels: ["card", "bank", "ussd"],
                // reference: reference, // use the generated unique transaction reference
                metadata: {
                    email: user!.email,
                    first_name: user!.firstName,
                    last_name: user!.lastName,
                    artistName: promotion?.artistName,
                    artistId: promotion?.artist.toString(),
                    releaseTitle: promotion?.releaseTitle,
                    releaseDescription: promotion?.releaseDescription,
                    promotionPackage: promotion?.packageName,
                    promotionType: promotion?.category,
                    isPromotion: true,
                    transactionReference: promotion!.transactionReference,
                },
            }),
        });

        const data = await res.json();
        console.log(data);

        if (!data.status)
            return NextResponse.json({ error: data.message }, { status: 400 });

        return NextResponse.json({
            url: data.data.authorization_url,
            msg: "You're getting redirected to the payment gateway.",
        });
    } catch (err) {
        console.error("payment error", err);
        return NextResponse.json(
            { msg: "Payment initialization failed" },
            { status: 500 },
        );
    }
}


export async function GET(req: Request) {
    try {
        let charts: any[] = [];
        let totalCount = 0;
        await dbConnect();
        const userData = await verifyJWT();
        const userJwt = verifyUser(userData);

        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }
        const { searchParams } = new URL(req.url);
        console.log(searchParams);

        const page = parseInt(searchParams.get("page") || "1", 10);
        // const sort = searchParams.get("sort") || "createdAt"
        const releaseTitle = searchParams.get("releaseTitle");
        const artist = searchParams.get("artist");
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const chartStatus = searchParams.get("chartStatus");
        // const sortQuery = buildSort(sort) as {
        //   [key: string]: SortOrder | { $meta: any };
        // }; //this is use to format the sort query for mongodb.

        const query: any = {
            user: userJwt.user,
        };

        if (chartStatus && chartStatus !== "all") {
            query.chartStatus = chartStatus;
        }

        if (artist && artist != "none"){
            query.artistName = artist
        };

        if (releaseTitle?.trim()) {
            query.releaseTitle = { $regex: `^${releaseTitle}`, $options: "i" };
        }

        const chartsQuery = ChartRegistrationModel.find(query).populate({path:"releaseId", select: "releaseTitle releaseImage featuredArtist"}).collation({ locale: "en", strength: 2 })
            // .sort(sortQuery)
            .skip((page - 1) * limit)
            .limit(limit);
        const totalCountQuery = ChartRegistrationModel.countDocuments(query);
        
        [charts, totalCount] = await Promise.all([
            chartsQuery,
            totalCountQuery,
        ]);

        return NextResponse.json(
            {
                data: charts,
                page,
                // skip: (page - 1) * limit,
                // sort,
                // limit,
                // hasNextPage: songs.length === limit,
                totalCount: totalCount,
                totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
                msg: totalCount > 0 ? "Successful" : "No Chart Registration found",
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
