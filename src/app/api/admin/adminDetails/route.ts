import dbConnect from "@/util/db";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
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
    } else if (admin.role !== "super_admin") {
      // only super_admin ever needs this dropdown — regular admins are locked to their own data
      return NextResponse.json({ msg: "Request Forbidden." }, { status: 403 });
    }

    const admins = await User.find(
      { role: { $in: ["admin", "super_admin"] } },
      { firstName: 1, lastName: 1 }
    ).lean();

    return NextResponse.json({
      admins: admins.map((a) => ({ id: a._id, name: `${a.firstName} ${a.lastName}`, role: a.role  })),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ msg: error.message }, { status: 500 });
    }
    return NextResponse.json({ msg: "An unknown error occurred" }, { status: 500 });
  }
}