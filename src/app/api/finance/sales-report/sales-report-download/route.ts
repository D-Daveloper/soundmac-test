import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/util/db";
import salesReportDownload from "@/util/models/salesReportDownloadModel";
import { inngest } from "@/util/lib/inngest/inngest";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User from "@/util/models/userModel";
import salesReport from "@/util/models/salesReportModel";

function generateReportKey(userId: string, filters: any) {
    const raw = JSON.stringify({ userId, ...filters });
    return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function POST(req: Request) {
    try {
        const userData = await verifyJWT();
        const userJwt = verifyUser(userData);

        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }
        await dbConnect();

        const user = userJwt.user
            ? await User.findById(userJwt.user, {
                role: 1,
                email: 1,
                firstName: 1,
            }).lean()
            : null;
        if (!user) {
            return NextResponse.json({ msg: "Invalid Request." }, { status: 401 });
        }
        else if (user.role != "user") {
          return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
        }

        const body = await req.json();
        const filters = body.filters || {};

        const reportKey = generateReportKey(user._id?.toString(), filters);

        const salesReportNumber = await salesReport.countDocuments({ user: user._id });//check if the user has sales report first
        console.log(salesReportNumber);

        if (salesReportNumber < 1) {
            return NextResponse.json({
                msg: "No sales report Found"
            });
        }
        // 1. Check if report already exists
        let report = await salesReportDownload.findOne({ reportKey });

        // ✅ If exists and still valid → return existing link
        if (report && report.status === "ready" && report.expiresAt > new Date()) {
            return NextResponse.json({
                status: "ready",
                downloadUrl: report.fileUrl,
            });
        }

        // ✅ If processing → don't duplicate job
        if (report && report.status === "processing") {
            return NextResponse.json({
                status: "processing",
                msg: "Report is being generated. Check your email shortly.",
            });
        }

        // 2. Create or update report
        report = await salesReportDownload.findOneAndUpdate(
            { reportKey },
            {
                userId: user._id,
                filters,
                status: "processing",
            },
            { upsert: true, new: true },
        );

        // 3. Trigger background job
        await inngest.send({
            name: "report/generate",
            data: {
                reportId: report._id.toString(),
                userId: user._id,
                email: user.email,
                filters,
            },
        });

        return NextResponse.json({
            status: "processing",
            msg: "Report is being generated. Check your email shortly.",
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ msg: "Error" }, { status: 500 });
    }
}
