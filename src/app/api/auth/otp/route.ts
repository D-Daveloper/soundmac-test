import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import User from "../../../lib/models/userModel";
import sendEmail from "../../../lib/sendMail/sendEmail";

const OtpCharacters = (process.env.OTP_CHARACTERS as string) || "1234567890";
const otpLength = process.env.OTP_LENGTH as unknown as number;

const generateOtp = () => {
  let otp = "";
  for (let i = 0; i < otpLength; i++) {
    const randomIndex = Math.floor(Math.random() * OtpCharacters.length);
    otp += OtpCharacters.charAt(randomIndex);
  }
  return otp;
};


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
        { success: false, msg: "user not found" },
        { status: 404 }
      );
    }
    if (!user.confirmed) {
        return NextResponse.json({ msg: "Please verify your email address" },{ status: 400 });
    }
    if (!user.otp) {
        return NextResponse.json({ msg: "Please Login" },{ status: 400 });
    }
    if(user.otp !== body.otp || new Date() >= user.otpExpires!) {
        return NextResponse.json({ msg: "Invalid OTP" }, { status: 400 });
    }
    user.otp = null; // Clear the OTP after successful verification
    user.otpExpires = null; // Reset otpExpires to null
    user.updatedAt = new Date(); // Update the updatedAt field  
    await user.save();
    //   create token
    const token = user.createJWT();
    
    return NextResponse.json({ msg: "Login successful" ,token,user});
  } catch (error: unknown) {
    if (error instanceof Error){
      return NextResponse.json({ error: error.message }, { status: 500 });
    }else{
      return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
  }
}



//resend OTP
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
	await dbConnect();

	// Find the user by ID and update the isVerified field
	const user = await User.findOne({email: body.email})

	if (!user) {
	  return NextResponse.json(
		{ success: false, msg: "User not found" },
		{ status: 404 }
	  );
	}
    if (user.twoFactorAuthentication == "true" && user.otp !== null) {
      
        const otp = generateOtp();
        const currentDate = new Date();
      // update user
      const updatedUser = await User.findByIdAndUpdate(
        {
          _id: user._id.toString(),
        },
        {
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
		<title>Account Verification</title>
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
          { msg: "An otp has been sent to your email",otp:true },
          { status: 200 }
        );
      } catch (error) {
        console.log(error);
        return NextResponse.json(
          { msg: "Failed to send OTP. Please try again later." },
          { status: 500 }
        );
      }
    }else {
        return NextResponse.json(
            { msg: "Please login." },
            { status: 400 }
        );
    }

    // return NextResponse.json({ msg: "Please check your mailbox to verify." });

  } catch (error: unknown) {
    if (error instanceof Error){
      return NextResponse.json({ msg: error.message }, { status: 500 });
    }else{
      return NextResponse.json({ msg: "An unknown error occurred" }, { status: 500 });
    }
  }
}