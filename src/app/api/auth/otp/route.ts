import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import sendEmail from "@/util/sendMail/sendEmail";
import { generateOtp } from "@/util/middleware/functions";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//validate OTP
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    await dbConnect();
    // Check if the email already exists
    const user = await User.findOne({ email: body.email });
    if (!user) {
      return NextResponse.json(
        { success: false, msg: "Invalid email." },
        { status: 404 }
      );
    }
    if (!user.confirmed) {
      user.confirmed = true;
    }
    if (process.env.NODE_ENV !== "development") {
      if (!user.otp || !user.otpExpires) {
        return NextResponse.json({ msg: "Please Login" }, { status: 400 });
      }
      if (user.otp !== body.otp || new Date() >= user.otpExpires) {
        return NextResponse.json({ msg: "Invalid OTP" }, { status: 400 });
      }
    }
    if (body.type === "forgotPassword") {
      if (!body.password) {
        return NextResponse.json(
          { msg: "Password is required" },
          { status: 400 }
        );
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(body.password, salt);
      user.otp = null; // Clear the OTP after successful verification
      user.otpExpires = null; // Reset otpExpires to null
      user.updatedAt = new Date(); // Update the updatedAt field
      await user.save();
      return NextResponse.json({ msg: "Please login" }, { status: 200 });
    } else {
      user.otp = null; // Clear the OTP after successful verification
      user.otpExpires = null; // Reset otpExpires to null
      user.updatedAt = new Date(); // Update the updatedAt field
      await user.save();
    }
    //   create token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        name: user.firstName,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_LIFETIME || '15m',
      } as jwt.SignOptions,
    );
    //   create token
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        name: user.firstName,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_LIFETIME_REFRESH_TOKEN || '1d',
      } as jwt.SignOptions,
    );

    const res = NextResponse.json({ msg: "successful", user });

    const cookieConfig = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/"
    };
    // Access token → 15 minutes
    res.cookies.set("accessToken", accessToken, {
      ...cookieConfig,
      expires: new Date(Date.now() + 15 * 60 * 1000),
      maxAge: 15 * 60,
    });

    // Refresh token → 1 day
    res.cookies.set("refreshToken", refreshToken, {
      ...cookieConfig,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      maxAge: 24 * 60 * 60,
    });
    return res;
  } catch (error: unknown) {
    console.error(error);

    if (error instanceof Error) {
      return NextResponse.json({ msg: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { msg: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

//resend OTP
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    await dbConnect();

    // Find the user by ID and update the isVerified field
    const user = await User.findOne({ email: body.email });

    if (!user) {
      return NextResponse.json(
        { success: false, msg: "User not found" },
        { status: 404 }
      );
    }
    if (user.otp !== null) {
      const otp = generateOtp();
      // update user
      const updatedUser = await User.findByIdAndUpdate(
        {
          _id: user._id.toString(),
        },
        {
          otp: otp,
          otpExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes in milliseconds (1 minute = 60,000 milliseconds)
        },
        {
          new: true,
          runValidators: true,
          select:
            "-password -otp -otpExpires -refreshToken -refreshTokenExpires",
        }
      );

      try {
        const mailRes = await sendEmail(
          `${updatedUser?.email}`,
          "OTP!",
          `
        
        <!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>User Verification</title>
	</head>
	<body>
		<div>
			Here is your otp ${otp}
			<p>Expires in 5 mins </p>

		</div>
	</body>
</html>
            `
        );
        if (!mailRes) {
          return NextResponse.json(
            { msg: "Failed to send OTP. Please try again later." },
            { status: 500 }
          );
        }
        return NextResponse.json(
          { msg: "An otp has been sent to your email", otp: true },
          { status: 200 }
        );
      } catch (error) {
        console.log(error);
        return NextResponse.json(
          { msg: "Failed to send OTP. Please try again later." },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({ msg: "Please login." }, { status: 400 });
    }

    // return NextResponse.json({ msg: "Please check your mailbox to verify." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ msg: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { msg: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}