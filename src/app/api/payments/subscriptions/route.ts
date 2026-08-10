import dbConnect from "@/util/db";
import { requireActiveSubscription } from "@/util/middleware/subscription";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import User, { IUser } from "@/util/models/userModel";
import { Types } from "mongoose";
import { Document } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = await User.findById(userJwt.user);
    if (!user || !user.confirmed || user.otp !== null) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    } else {
      const subError = requireActiveSubscription(user);
      if (subError) {
        return NextResponse.json(
          { msg: subError.msg },
          { status: subError.status },
        );
      }
      if (!user.subscriptionDetails?.subscriptionCode) {
        return NextResponse.json(
          { msg: "No active card subscription to manage." },
          { status: 400 },
        );
      }
    }

    // else if (user.premium !== true) {
    //   return NextResponse.json(
    //     { msg: "Please upgrade your account." },
    //     { status: 402 },
    //   );
    // } else if (user.premium && new Date() > new Date(user.premiumExpiration!)) {
    //   user.premium = false;
    //   user.premiumExpiration = null;
    //   await user.save();
    //   return NextResponse.json(
    //     { msg: "Please upgrade your account." },
    //     { status: 402 },
    //   );
    // }

    const res = await fetch(
      `https://api.paystack.co/subscription/${user.subscriptionDetails.subscriptionCode}/manage/link`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = await res.json();

    if (!data.status)
      return NextResponse.json({ msg: data.message }, { status: 400 });

    return NextResponse.json(
      {
        msg: data.message,
        url: data.data.link,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("jjjj", err);
    return NextResponse.json(
      { msg: "Payment verification failed" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = await User.findById(userJwt.user).select(
      "+subscriptionDetails.subscriptionCode +subscriptionDetails.emailToken",
    );
    if (!user || !user.confirmed || user.otp !== null) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }
    // else if (user.premium !== true) {
    //   return NextResponse.json(
    //     { msg: "Please upgrade your account." },
    //     { status: 402 },
    //   );
    // }

     const subError = requireActiveSubscription(user);
    if (subError) {
      return NextResponse.json({ msg: subError.msg }, { status: subError.status });
    }
    
    const { type } = await req.json();

    if (!type)
      return NextResponse.json({ msg: "Missing fields" }, { status: 400 });
    let res;
    if (type === "disable") {
      res = await handleDisableSubscription(user);
      return NextResponse.json({ msg: res.msg }, { status: res.status });
    } else if (type === "enable") {
      res = await handleEnableSubscription(user);
      return NextResponse.json({ msg: res.msg }, { status: res.status });
    }

    return NextResponse.json({ msg: "Invalid request" }, { status: 400 });
  } catch (err) {
    console.error("jjjj", err);
    return NextResponse.json(
      { msg: "Unexpected error occured" },
      { status: 500 },
    );
  }
}

async function handleDisableSubscription(
  user: Document<unknown, {}, IUser, {}, {}> &
    IUser &
    Required<{
      _id: Types.ObjectId;
    }> & {
      __v: number;
    },
): Promise<{ msg: string; status: number }> {
  console.log(user);

  const res = await fetch("https://api.paystack.co/subscription/disable", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
    body: JSON.stringify({
      code: user.subscriptionDetails.subscriptionCode,
      token: user.subscriptionDetails.emailToken,
    }),
  });

  const data = await res.json();

  if (!data.status) {
    return { msg: data.message, status: 400 };
  }

  return { msg: data.message, status: 200 };
}

async function handleEnableSubscription(
  user: IUser,
): Promise<{ msg: string; status: number }> {
  const res = await fetch("https://api.paystack.co/subscription/enable", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
    body: JSON.stringify({
      code: user.subscriptionDetails.subscriptionCode,
      token: user.subscriptionDetails.emailToken,
    }),
  });

  const data = await res.json();

  if (!data.status) {
    return { msg: data.message, status: 400 };
  }

  return { msg: data.message, status: 200 };
}
