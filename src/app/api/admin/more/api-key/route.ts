// app/api/api-keys/route.js

import { handleMongooseValidationError } from "@/util/customError/error";
import dbConnect from "@/util/db";
import { logAdminActivity } from "@/util/lib/adminActivityLog/adminActivityLogHelper";
import { generateApiKey, hashApiKey } from "@/util/lib/apikey/apiKey";
import { authenticate } from "@/util/middleware/authMiddleware";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import ApiKeyModel from "@/util/models/apiKeyModel";
import User from "@/util/models/userModel";
import { addYears } from "date-fns";
import { NextResponse } from "next/server";

// Create a new key
export async function POST(req: Request) {
  try {
    const { name, email, isNew } = await req.json();

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
    } else if (admin.role != "admin" && admin.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }
    if (!name)
      return NextResponse.json({ msg: "Name is Required" }, { status: 400 });

    if (!email)
      return NextResponse.json({ msg: "Email is Required" }, { status: 400 });

    if (isNew == null)
      return NextResponse.json({ msg: " isNew is Required" }, { status: 400 });

    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      return NextResponse.json({ msg: "User Not Found" }, { status: 404 });
    }

    const latestKey = await ApiKeyModel.findOne({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const rawKey = generateApiKey();
    if (latestKey === null) {
      await ApiKeyModel.create({
        name,
        hashedKey: hashApiKey(rawKey),
        userId: user._id,
        expiresAt: addYears(new Date(), 1),
      });
    }
    console.log(latestKey);

    await ApiKeyModel.updateMany(
      { userId: user._id, isActive: true },
      { isActive: false },
    );
    let createdKey;
    if (!isNew) {
      createdKey = await ApiKeyModel.create({
        name: latestKey!.name,
        hashedKey: hashApiKey(rawKey),
        userId: user._id,
        expiresAt: new Date(latestKey!.expiresAt),
        isActive: true,
      });
    } else if (isNew) {
      createdKey = await ApiKeyModel.create({
        name: latestKey!.name,
        hashedKey: hashApiKey(rawKey),
        userId: user._id,
        expiresAt: addYears(new Date(), 1),
        isActive: true,
      });
    }

    await logAdminActivity({
      adminId: admin._id.toString(),
      adminName: `${admin.firstName} ${admin.lastName}`,
      action: "apikey.created",
      entityType: "apiKey",
      entityId: createdKey?._id?.toString() ?? "unknown",
      entityLabel: `Api key ${createdKey?.name} has been issued for ${user.email}`,
    });

    // ⚠️ Return the raw key ONCE — never again after this
    return Response.json({
      key: rawKey,
      name,
      msg: "This can only be viewed once.",
    });
  } catch (error) {
    return handleMongooseValidationError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const { email } = await req.json();

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
    } else if (admin.role != "admin" && admin.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    if (!email)
      return NextResponse.json({ msg: "Email is Required" }, { status: 400 });

    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      return NextResponse.json({ msg: "User Not Found" }, { status: 404 });
    }

    await ApiKeyModel.updateMany(
      { userId: user._id, isActive: true },
      { isActive: false },
    );
    await logAdminActivity({
      adminId: admin._id.toString(),
      adminName: `${admin.firstName} ${admin.lastName}`,
      action: "apiKey.revoked",
      entityType: "apiKey",
      entityId: user._id.toString(),
      entityLabel: `API key(s) revoked for ${user.email}`,
    });

    // ⚠️ Return the raw key ONCE — never again after this
    return Response.json({ msg: "Successfully Revoked." });
  } catch (error) {
    return handleMongooseValidationError(error);
  }
}

export async function GET(req: Request) {
  try {
    let keys: any[] = [];
    let totalCount = 0;
    await dbConnect();
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid Request." }, { status: 404 });
    } else if (user.role != "admin" && user.role != "super_admin") {
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    let page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const name = searchParams.get("name");

    const query: any = {};

    if (name?.trim()) {
      query.name = { $regex: `^${name}`, $options: "i" };
    }

    console.log("the queries", query);

    keys = await ApiKeyModel.find(query)
      .populate("userId", "email")
      .lean()
      .collation({ locale: "en", strength: 2 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    totalCount = await ApiKeyModel.countDocuments(query);

    return NextResponse.json(
      {
        data: keys,
        page,
        // exec,
        // skip: (page - 1) * limit,
        // sort,
        limit,
        // hasNextPage: songs.length === limit,
        totalCount: totalCount,
        totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
        msg: totalCount > 0 ? "Successful" : "No songs found",
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
