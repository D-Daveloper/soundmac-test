import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import sendEmail from "@/util/sendMail/sendEmail";
import { generateOtp } from "@/util/middleware/functions";

export async function POST(req: Request) {
  try {
    // return NextResponse.json({msg:"login please"}, {status:401});
    await dbConnect();
    const currentDate = new Date();

    let otp = "";

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ msg: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ msg: "Invalid Email" }, { status: 404 });
    }

    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({ msg: "OTP sent" }, { status: 200 });
    }
    otp = generateOtp();

    // update user
    const updatedUser = await User.findByIdAndUpdate(
      {
        _id: user._id.toString(),
      },
      {
        updatedAt: Date.now,
        otp: otp,
        otpExpires: new Date(currentDate.getTime() + 5 * 60000), // 10 minutes in milliseconds (1 minute = 60,000 milliseconds)
      },
      {
        new: true,
        runValidators: true,
        select: "-password -otp -otpExpires -refreshToken -refreshTokenExpires",
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
<title>Forgot Password</title>
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
        { msg: "An otp has been sent to your email"},
        { status: 200 }
      );
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { msg: "Failed to send OTP. Please try again later." },
        { status: 500 }
      );
    }
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
