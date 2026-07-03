import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import jwt from "jsonwebtoken";
import appleSignIn from "apple-signin-auth";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { identityToken, user: appleUserData } = await req.json();

    if (!identityToken) {
      return NextResponse.json({ msg: "Identity token is required" }, { status: 400 });
    }

    const payload = await appleSignIn.verifyIdToken(identityToken, {
      audience: process.env.APPLE_CLIENT_ID!,
    });

    if (!payload?.sub || !payload?.email) {
      return NextResponse.json({ msg: "Invalid Apple token" }, { status: 401 });
    }

    const email = payload.email;
    const appleId = payload.sub;

    const firstName = appleUserData?.name?.firstName || "User";
    const lastName = appleUserData?.name?.lastName || "";

    let user = await User.findOne({ email }).select(
      "-password -otp -otpExpires -refreshToken"
    );

    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase().trim(),
        password: `APPLE_OAUTH_${Date.now()}`,
        confirmed: true,
        country: "Not Provided",
        profilePic: null,
        oauthProvider: "apple",
        appleId,
        twoFactorAuthentication: "false",
        otp: null,
        otpExpires: null,
      });
    } else if (appleUserData?.name?.firstName) {
      // Update name if provided
      user.firstName = firstName;
      user.lastName = lastName;
      await user.save();
    }

    const accessToken = jwt.sign (
      { userId: user._id, name: user.firstName, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_LIFETIME || "15m" } as any
    );

    const refreshToken = jwt.sign(
      { userId: user._id, name: user.firstName, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_LIFETIME_REFRESH_TOKEN || "1d" } as any
    );

    const res = NextResponse.json({ 
      msg: "successful", 
      user: { ...user.toObject(), password: undefined } 
    });

    const cookieConfig = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
    };

    res.cookies.set("accessToken", accessToken, { ...cookieConfig, maxAge: 15 * 60 });
    res.cookies.set("refreshToken", refreshToken, { ...cookieConfig, maxAge: 24 * 60 * 60 });

    return res;
  } catch (error: any) {
    console.error("Apple auth error:", error);
    return NextResponse.json(
      { msg: "Apple authentication failed. Please try again." },
      { status: 401 }
    );
  }
}