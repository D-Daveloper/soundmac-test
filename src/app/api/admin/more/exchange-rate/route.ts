import dbConnect from "@/util/db";
import { logAdminActivity } from "@/util/lib/adminActivityLog/adminActivityLogHelper";
import { numRegex } from "@/util/middleware/functions";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import { Counter } from "@/util/models/CounterModel";
import User from "@/util/models/userModel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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

    const rate = await Counter.findById("exchange_rate")
      .select("value -_id")
      .lean();
    console.log(rate);

    return NextResponse.json(
      {
        rate,
        msg: "Successful",
      },
      { status: 200 },
    );
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

export async function POST(req: Request) {
  try {
    await dbConnect();
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

    const body: {
      exchange_rate: string;
    } = await req.json();

    if (!body) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 400 });
    } else if (
      !numRegex.test(body.exchange_rate) ||
      parseInt(body.exchange_rate, 10) <= 0
    ) {
      return NextResponse.json(
        { msg: "Please enter a valid number." },
        { status: 400 },
      );
    }

    await Counter.findByIdAndUpdate("exchange_rate", {
      value: body.exchange_rate?.trim(),
    });

    await logAdminActivity({
      adminId: admin._id.toString(),
      adminName: `${admin.firstName} ${admin.lastName}`,
      action: "exchangeRate.saved",
      entityType: "exchangeRate",
      entityId: "exchange_rate",
      entityLabel: `Exchange rate set to ${body.exchange_rate}`,
    });

    return NextResponse.json({ msg: "Successful" }, { status: 201 });
  } catch (error) {
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
