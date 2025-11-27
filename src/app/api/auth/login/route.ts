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

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { msg: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email:email.trim() });
    if (!user) {
      return NextResponse.json({ msg: "User Not Found" }, { status: 404 });
    }

    const isMatch = await user.comparePassword(password.trim());
    if (!isMatch) {
      return NextResponse.json({ msg: "Invalid credentials" }, { status: 400 });
    }

    if (!user.confirmed) {
      try {
        const mailRes = await sendEmail(
          `${user.email}`,
          "Welcome to SOUNDMAC!",
          `
              
              <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Account Verification</title>
        </head>
        <body>
          <div
            style="
              width: 400px;
              height: 100%;
              text-align: center;
              justify-self: center;
              margin: auto;
            "
          >
            <img
              src="https://sconchun.sirv.com/welcome%20mail%20header.png"
              width="400"
              alt=""
            />
      
            <div style="width: 100%">
              <div style="width: 400px; display: inline-block; text-align: justify">
                Dear ${user.first_name}, <br />
                <br />
      
                Thank you for choosing us as your music distribution platform. Our
                goal is to provide the best experience and support. If you have any
                questions, our team is here to assist you. <br /><br />
      
                To complete your registration process, please click the following
                button: <br /><br />
                <div style="width: 100%; margin: auto">
                  <a
                    style="
                      display: inline-block;
                      background: rgb(54, 2, 47);
                      color: white;
                      padding: 10px 25px;
                      border-radius: 10px;
                      cursor: pointer;
                      text-decoration: none;
                    "
                    href="${process.env.FRONTEND_URL}/signup/${user._id}"
                  >
                    Verify Account
                  </a>
                </div>
                <br />
      
                If that doesn't work, copy and past the following link in your
                browser: <br />
                <a 
                style="
                display: inline-block;
                      background: blue;
                      color: white;
                      padding: 3px 5px;
                      border-radius: 10px;
                      cursor: pointer;
                      text-decoration: none;
                      "
                  href="${process.env.BACKEND_API_URL}/signup/${user._id}"
                  >Click Here</a
                >
                <br />
                Best regards,<br />
                SOUNDMAC Team
              </div>
            </div>
            <img
              src="https://sconchun.sirv.com/welcome%20mail%20footer.png"
              width="400"
              alt=""
            />
          </div>
        </body>
      </html>
                  `
        );
        if (!mailRes) {
          return NextResponse.json(
            { success: false, msg: "Failed to send verification email" },
            { status: 500 }
          );
        }
      } catch (error) {
        console.log(error);
        return NextResponse.json(
          { success: false, msg: "Failed to send verification email" },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { msg: "Please check your mailbox to verify." },
        { status: 403 }
      );
    }
    if (process.env.NODE_ENV === "development") {
    return NextResponse.json({ msg: "Login successful" }, { status: 200 });

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
        otpExpires: new Date(currentDate.getTime() + 10 * 60000), // 30 minutes in milliseconds (1 minute = 60,000 milliseconds)
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
<p>Expires in 10 mins </p>

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

    // //   create token
    // const token = user.createJWT();

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
