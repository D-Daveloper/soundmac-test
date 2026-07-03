import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ msg: "Token is required" }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.sub) {
      return NextResponse.json(
        { msg: "Invalid Google token" },
        { status: 401 },
      );
    }

    // // Verify Google token with Google's API
    // const googleRes = await fetch(
    //   `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
    // );
    // const googleData = await googleRes.json();

    // if (!googleRes.ok || googleData.error) {
    //   return NextResponse.json(
    //     { msg: "Invalid Google token" },
    //     { status: 401 },
    //   );
    // }

    // // Verify the token was issued for your app
    // if (googleData.aud !== process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    //   return NextResponse.json(
    //     { msg: "Token audience mismatch" },
    //     { status: 401 },
    //   );
    // }

    const { email, given_name, family_name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email: email.trim() }).select(
      "-password -otp -otpExpires -refreshToken",
    );

    if (!user) {
      user = await User.create({
        firstName: given_name || "User",
        lastName: family_name || "",
        email: email.toLowerCase().trim(),
        password: `GOOGLE_OAUTH_${Date.now()}`,
        confirmed: true,
        country: "Not Provided",
        profilePic: picture || null,
        oauthProvider: "google",
        googleId,
        twoFactorAuthentication: "false",
        otp: null,
        otpExpires: null,
      });
    }

    if (!user) {
      return NextResponse.json(
        { msg: "Failed to create user" },
        { status: 500 },
      );
    }

    // Generate tokens — same as OTP route
    const accessToken = jwt.sign(
      { userId: user._id, name: user.firstName, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_LIFETIME || "15m" } as any,
    );

    const refreshToken = jwt.sign(
      { userId: user._id, name: user.firstName, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_LIFETIME_REFRESH_TOKEN || "1d" } as any,
    );

    const res = NextResponse.json({
      msg: "successful",
      user: {
        ...user.toObject(),
        password: undefined,
      },
    });

    const cookieConfig = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
    };

    res.cookies.set("accessToken", accessToken, {
      ...cookieConfig,
      expires: new Date(Date.now() + 15 * 60 * 1000),
      maxAge: 15 * 60,
    });

    res.cookies.set("refreshToken", refreshToken, {
      ...cookieConfig,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      maxAge: 24 * 60 * 60,
    });

    return res;
  } catch (error: any) {
    console.error("Google auth error:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { msg: error.message || "Validation failed" },
        { status: 400 },
      );
    }

    if (
      error.message?.includes("Invalid token") ||
      error.message?.includes("audience")
    ) {
      return NextResponse.json(
        { msg: "Invalid Google token" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { msg: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
