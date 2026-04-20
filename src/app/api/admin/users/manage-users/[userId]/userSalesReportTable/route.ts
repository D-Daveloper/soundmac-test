import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import salesReport from "@/util/models/salesReportModel";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> },
) {
    try {
        const { userId } = await params;

        // Validate input before hitting auth/DB
        if (!userId || !Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
        }

        const userData = await verifyJWT();
        const userJwt = verifyUser(userData);
        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }

        await dbConnect();

        const admin = userJwt.user
            ? await User.findById(userJwt.user).lean()
            : null;
        if (!admin) {
            return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
        }
        if (admin.role !== "admin" && admin.role !== "super_admin") {
            return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
        }
        const { searchParams } = new URL(req.url);
        console.log(searchParams);

        let page = parseInt(searchParams.get("page") || "1", 10);
        const upc = searchParams.get("upc");
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const userSalesReportProjection = {
            trackTitle: 1, trackArtistRaw: 1, netAmountUsd: 1, upc: 1, dsp: 1, territory: 1,label:1
        };

        const query: any = {
            user: userId
        }
        if (upc) {
            query.upc = { $regex: `^${upc}`, $options: "i" }
        }

        const usersalesReportQuery = salesReport.find(query, userSalesReportProjection)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit).lean();

        const totalEarningsQuery = salesReport.countDocuments(query)

        const [earningsArray, totalSales] = await Promise.all([

            usersalesReportQuery,
            totalEarningsQuery,

        ]);
        return NextResponse.json({
            earningsArray,
            totalCount:totalSales,
            page,
            limit,
            totalPages: totalSales > 0 ? Math.ceil(totalSales / limit) : 0,
            msg: "User data fetched successfully.",
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json(
            { msg: "Failed to fetch user data." },
            { status: 500 },
        );
    }
}