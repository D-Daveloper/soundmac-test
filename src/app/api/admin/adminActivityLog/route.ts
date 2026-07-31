import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import AdminActivityLogModel from "@/util/models/adminActivityModel";
import User from "@/util/models/userModel";
import { NextResponse } from "next/server";

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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const adminFilter = searchParams.get("admin") || "none";
    const action = searchParams.get("action") || "none";
    const entityType = searchParams.get("entityType") || "none";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: any = {};

    // Role-based scoping — the core access rule
    if (admin.role === "admin") {
      query.admin = admin._id;
    } else if (adminFilter !== "none") {
      // super_admin can optionally filter down to one admin
      query.admin = adminFilter;
    }

    if (action !== "none") {
      query.action = action;
    }
    if (entityType !== "none") {
      query.entityType = entityType;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      AdminActivityLogModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminActivityLogModel.countDocuments(query),
    ]);

    return NextResponse.json({
      data,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ msg: error.message }, { status: 500 });
    }
    return NextResponse.json({ msg: "An unknown error occurred" }, { status: 500 });
  }
}