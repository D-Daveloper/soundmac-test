// app/api/api-keys/route.js

import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import { generateApiKey, hashApiKey } from "@/util/lib/apikey/apiKey";
import { authenticate } from "@/util/middleware/authMiddleware";
import ApiKeyModel from "@/util/models/apiKeyModel";
import User from "@/util/models/userModel";
import { addYears } from "date-fns";
import { NextResponse } from "next/server";

// Create a new key
export async function POST(req: Request) {
    try {

        await dbConnect();

        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { msg: "Email and password are required" },
                { status: 400 }
            );
        }
        if (!name) return NextResponse.json({ msg: "Name is Required" }, { status: 401 });

        const user = await User.findOne({ email: email.trim() });

        if (!user) {
            return NextResponse.json({ msg: "User Not Found" }, { status: 404 });
        }

        const isMatch = await user.comparePassword(password.trim());

        if (!isMatch) {
            return NextResponse.json({ msg: "Invalid credentials" }, { status: 400 });
        }

        // Invalidate all existing keys first
        await ApiKeyModel.updateMany(
            { userId: user._id, isActive: true },
            { isActive: false }
        );

        const rawKey = generateApiKey();

        await ApiKeyModel.create({
            name,
            hashedKey: hashApiKey(rawKey),
            userId: user._id,
            expiresAt: addYears(new Date(), 1)
        });

        // ⚠️ Return the raw key ONCE — never again after this
        return Response.json({ key: rawKey, name, msg: "This can only be viewed once." });
    } catch (error) {
        return handleMongooseValidationError(error);
    }
}

// List keys (hashed/metadata only)
export async function GET(req: Request) {

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const password = searchParams.get("password");

    if (!email || !password) {
        return NextResponse.json(
            { msg: "Email and password are required" },
            { status: 400 }
        );
    }

    const user = await User.findOne({ email: email.trim() });

    if (!user) {
        return NextResponse.json({ msg: "User Not Found" }, { status: 404 });
    }

    const isMatch = await user.comparePassword(password.trim());

    if (!isMatch) {
        return NextResponse.json({ msg: "Invalid credentials" }, { status: 400 });
    }
    const keys = await ApiKeyModel.find({
        userId: user._id
    },
        { name: 1, lastUsedAt: 1, createdAt: 1, isActive: 1 },
    );

    return Response.json(keys);
}