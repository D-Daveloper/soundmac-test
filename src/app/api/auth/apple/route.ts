import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import jwt from "jsonwebtoken";
import sendEmail from "@/util/sendMail/sendEmail";
import appleSignIn from "apple-signin-auth";

import Referral from "@/util/models/ReferralModel";
import { generateReferralCode } from "@/util/referrals";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const {
      identityToken,
      user: appleUserData,
      referralCode: enteredReferralCode,
    } = await req.json();
    if (!identityToken) {
      return NextResponse.json(
        { msg: "Identity token is required" },
        { status: 400 },
      );
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

    let user = await User.findOne({ email: email.trim() }).select(
      "-password -otp -otpExpires -refreshToken",
    );

    const isNewUser = !user;
    let referrer = null;

    if (isNewUser && enteredReferralCode?.trim()) {
      referrer = await User.findOne({
        referralCode: enteredReferralCode.trim(),
      });

      if (!referrer) {
        return NextResponse.json(
          { msg: "Invalid referral code" },
          { status: 400 },
        );
      }
    }

    if (isNewUser) {
      let referralCode = generateReferralCode();

      while (await User.findOne({ referralCode })) {
        referralCode = generateReferralCode();
      }
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
        referralCode,
        referredBy: referrer?._id ?? null,
        twoFactorAuthentication: "false",
        otp: null,
        otpExpires: null,
      });
      if (referrer) {
        await Referral.create({
          referrer: referrer._id,
          referred: user._id,
          referralCode: referrer.referralCode,
          status: "pending",
          conversionType: null,
          planName: null,
          commissionAmount: 0,
          commissionPaid: false,
          completedAt: null,
          expiresAt: null,
        });
      }
    }
    if (referrer?.email === email) {
      return NextResponse.json(
        { msg: "You cannot refer yourself" },
        { status: 400 },
      );
    }
    if (!user) {
      return NextResponse.json(
        { msg: "Failed to create user" },
        { status: 500 },
      );
    }
    if (isNewUser) {
      try {
        await sendEmail(
          user.email,
          "Welcome to SoundMac",
          `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Welcome to Soundmac</title>
        </head>
        <body>
          <div style="width: 400px; margin: auto; text-align: center;">
            <img src="https://sconchun.sirv.com/welcome%20mail%20header.png" width="400" alt="" />
            <div style="text-align: justify; width: 400px; margin: 20px auto;">
              Dear ${user.firstName}, <br /><br />

              I'm Micheal, Head of Artist & Label Relations here at SoundMac, and I wanted to personally welcome you. <br /><br />

              We started SoundMac because we believe independent artists and record labels across Africa deserve a distribution partner that genuinely understands the music they're creating and the challenges they face. Every artist who joins us becomes part of that mission, and I'm genuinely glad you're here. <br /><br />

              From this moment, you've got a team that's invested in your success. Whether you're releasing your very first single or managing a growing catalog, we're here to help make the process simple, reliable, and transparent. <br /><br />

              Whenever you're ready, upload your first release and we'll take it from there. Our distribution team will carefully review it before delivering it to stores and streaming platforms around the world. <br /><br />

              If you ever have a question, need advice, or simply aren't sure about something, just send us an email to support@soundmac.co and we are live on WhatsApp +1 (555) 828-4080. It comes straight to our team, and we'll make sure you get the help you need. <br /><br />

              Welcome to SoundMac. We can't wait to be part of your journey. <br /><br />

              Warm regards,<br />
              Micheal<br />
              Head of Artist & Label Relations<br />
              SoundMac Global LTD.
            </div>
            <img src="https://sconchun.sirv.com/welcome%20mail%20footer.png" width="400" alt="" />
          </div>
        </body>
        </html>
      `,
        );
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
    }

    const needsProfileCompletion =
      !user?.country || user.country === "Not Provided" || user.country === "";
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
        needsProfileCompletion,
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
