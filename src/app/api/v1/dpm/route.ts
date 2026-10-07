import { getDsps } from "@/services/dsp/dsp.service";
import dbConnect from "@/util/db";
import { authenticate } from "@/util/middleware/authMiddleware";
import User from "@/util/models/userModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const userJwt = await authenticate(req);

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

        const dsps = await getDsps();
        return NextResponse.json({ dsps, msg: "Request Successful." }, {
            status: 200, headers: {
                'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
            },
        });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ msg: "Internal Server Error." }, { status: 500 });
    }
}