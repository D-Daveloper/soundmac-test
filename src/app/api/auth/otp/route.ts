import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import sendEmail from "@/util/sendMail/sendEmail";
import { generateOtp } from "@/util/middleware/functions";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logAdminActivity } from "@/util/lib/adminActivityLog/adminActivityLogHelper";

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
        { status: 404 },
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
          { status: 400 },
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

      if(!user.confirmed) {
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
    }};
    //   create token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        name: user.firstName,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_LIFETIME || "15m",
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
        expiresIn: process.env.JWT_LIFETIME_REFRESH_TOKEN || "1d",
      } as jwt.SignOptions,
    );

    if (user.role === "admin" || user.role === "super_admin") {
      await logAdminActivity({
        adminId: user._id.toString(),
        adminName: `${user.firstName} ${user.lastName}`,
        action: "admin.logged_in",
        entityType: "session",
        entityId: user._id.toString(),
        entityLabel: `${user.firstName} ${user.lastName} logged in`,
      });
    }

    const res = NextResponse.json({ msg: "successful", user });

    const cookieConfig = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
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
        { status: 500 },
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
        { status: 404 },
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
        },
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
            `,
        );
        if (!mailRes) {
          return NextResponse.json(
            { msg: "Failed to send OTP. Please try again later." },
            { status: 500 },
          );
        }
        return NextResponse.json(
          { msg: "An otp has been sent to your email", otp: true },
          { status: 200 },
        );
      } catch (error) {
        console.log(error);
        return NextResponse.json(
          { msg: "Failed to send OTP. Please try again later." },
          { status: 500 },
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
        { status: 500 },
      );
    }
  }
}
