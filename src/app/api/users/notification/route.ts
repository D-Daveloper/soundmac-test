import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import UserNotification from "@/util/models/userNotification";
import { handleMongooseValidationError } from "@/util/customError/error";
import mongoose from "mongoose";

export async function GET(req: Request) {
    try {
        await dbConnect();

        const userData = await verifyJWT();
        const userJwt = verifyUser(userData);
        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }
        const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;

        if (!user) {
            return NextResponse.json(
                { success: false, msg: "Invalid Request" },
                { status: 401 },
            );
        }
        const notificationsQuery = UserNotification.find({ userId: userJwt.user }).sort({ statusWeight: 1 }).lean()
        const unDeliveredNotificationsQuery = UserNotification.findOne({ userId: userJwt.user, statusWeight: 1 })
        const [notifications, unDeliveredNotifications] = await Promise.all([
            notificationsQuery, unDeliveredNotificationsQuery
        ])
        return NextResponse.json({ notifications, hasNewNotification: unDeliveredNotifications ? true : false }, { status: 200 })
    } catch (error: unknown) {
        console.log(error);

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

export async function PATCH(req: Request) {
    try {
        const userData = await verifyJWT();
        const userJwt = verifyUser(userData);
        if (userJwt.msg) {
            return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
        }

        const { id } = await req.json();
        await dbConnect();
        console.log(id);

        const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
        if (!user) {
            return NextResponse.json({ msg: "Invalid User." }, { status: 401 });
        } else if (!user.confirmed) {
            return NextResponse.json(
                { msg: "Please verify your email address." },
                { status: 400 },
            );
        } else if (user.otp !== null) {
            return NextResponse.json({ msg: "Please Login" }, { status: 401 });
        }

        if (!id) {
            await UserNotification.updateMany({
                userId: user._id,
            }, { status: "read", }, { runValidators: true });
        } else {
            await UserNotification.findOneAndUpdate({
                _id: id,
                userId: user._id,
            }, { status: "read", }, { runValidators: true });
        }

        return NextResponse.json(
            { msg: "Notifications updated." },
            { status: 201 },
        );
    } catch (error: unknown) {
        return handleMongooseValidationError(error);
    }
}