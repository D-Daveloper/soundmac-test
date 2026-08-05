import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import sendEmail from "@/util/sendMail/sendEmail";
import { handleMongooseValidationError } from "@/util/customError/error";
import { generateOtp } from "@/util/middleware/functions";
import { generateReferralCode } from "@/util/referrals";
import Referral from "@/util/models/ReferralModel";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    await dbConnect();
    // Check if the email already exists
    const existingUser = await User.findOne({ email: body.email,});
    if (existingUser) {
      return NextResponse.json(
        { success: false, msg: "Email already exists" },
        { status: 400 },
      );
    }
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    try {
      const mailRes = await sendEmail(
        `${body.email}`,
        "Your SoundMac Verification Code",
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
				width: 100%;
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
					Hello ${body.first_name}, <br /><br />

					Your one-time verification code is: <br /><br />

					<div style="text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px;">
						${otp}
					</div>
					<br />

					This code will expire in five minutes. <br /><br />

					For your security, never share this code with anyone. SoundMac will never ask you for your verification code by email, phone, or message. <br /><br />

					If you didn't request this code, you can safely ignore this email. <br /><br />

					Best,<br />
					SoundMac Security Team
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
    `,
      );

      if (!mailRes) {
        return NextResponse.json(
          { success: false, msg: "Failed to send otp email" },
          { status: 500 },
        );
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { success: false, msg: "Failed to send verification email" },
        { status: 500 },
      );
    }

    let referrer = null;
    const enteredReferralCode = body.referralCode?.trim();
    console.log(body);
    // console.log("enteredReferralCode:", enteredReferralCode);
    if (enteredReferralCode) {
      //  console.log("Looking for referral:", enteredReferralCode);
      referrer = await User.findOne({
        referralCode: enteredReferralCode,
      });
      console.log("Referrer found:", referrer);
      if (!referrer) {
        return NextResponse.json(
          {
            success: false,
            msg: "Invalid referral code",
          },
          { status: 400 },
        );
      }
    }

    let referralCode = generateReferralCode();
    // check if the referral code generated already belongs to a previous user
    while (await User.findOne({ referralCode })) {
      referralCode = generateReferralCode();
    }
    const user = new User({
      ...body,
      firstName: body.first_name,
      lastName: body.last_name,
      otp,
      otpExpires,
      referralCode,
      referredBy: referrer?._id ?? null,
    });
    // console.log("referral code:", referralCode);

    await user.save();
    if (referrer) {
      // 		console.log({
      //   referrer: referrer._id,
      //   referred: user._id,
      //   referralCode: referrer.referralCode,
      // });
      const referral = await Referral.create({
        referrer: referrer?._id,
        referred: user._id,
        referralCode: referrer?.referralCode,
        status: "pending",
        conversionType: null,
        planName: null,
        commissionAmount: 0,
        commissionPaid: false,
        completedAt: null,
        expiresAt: null,
      });
      console.log("Created referral:", referral);
      // const allReferrals = await Referral.find();

      // console.log("All referrals:", allReferrals);
    }
    return NextResponse.json({
      msg: `Please enter the otp sent to ${user.email}`,
      email: user.email,
    });
  } catch (error: unknown) {
    console.error(error);
    return handleMongooseValidationError(error);
  }
}
// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     console.log("Received body:", body);

//     await dbConnect();
//     // Check if the email already exists
//     const existingUser = await User.findOne({ email: body.email });
//     if (existingUser) {
//       return NextResponse.json(
//         { success: false, msg: "Email already exists" },
//         { status: 400 }
//       );
//     }
//     const user = new User(body);
//     await user.save();
//     try {
//       const mailRes = await sendEmail(
//         `${user.email}`,
//         "Welcome to SOUNDMAC!",
//         `

//         <!DOCTYPE html>
// <html lang="en">
// 	<head>
// 		<meta charset="UTF-8" />
// 		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
// 		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
// 		<title>Account Verification</title>
// 	</head>
// 	<body>
// 		<div
// 			style="
// 				width: 400px;
// 				height: 100%;
// 				text-align: center;
// 				justify-self: center;
// 				margin: auto;
// 			"
// 		>
// 			<img
// 				src="https://sconchun.sirv.com/welcome%20mail%20header.png"
// 				width="400"
// 				alt=""
// 			/>

// 			<div style="width: 100%">
// 				<div style="width: 400px; display: inline-block; text-align: justify">
// 					Dear ${user.first_name}, <br />
// 					<br />

// 					Thank you for choosing us as your music distribution platform. Our
// 					goal is to provide the best experience and support. If you have any
// 					questions, our team is here to assist you. <br /><br />

// 					To complete your registration process, please click the following
// 					button: <br /><br />
// 					<div style="width: 100%; margin: auto">
// 						<a
// 							style="
// 								display: inline-block;
// 								background: rgb(54, 2, 47);
// 								color: white;
// 								padding: 10px 25px;
// 								border-radius: 10px;
// 								cursor: pointer;
// 								text-decoration: none;
// 							"
// 							href="${process.env.FRONTEND_URL}/signup/${user._id}"
// 						>
// 							Verify Account
// 						</a>
// 					</div>
// 					<br />

// 					If that doesn't work, copy and past the following link in your
// 					browser: <br />
// 					<a
//           style="
//           display: inline-block;
// 								background: blue;
// 								color: white;
// 								padding: 3px 5px;
// 								border-radius: 10px;
// 								cursor: pointer;
// 								text-decoration: none;
//                 "
// 						href="${process.env.BACKEND_API_URL}/signup/${user._id}"
// 						>Click Here</a
// 					>
// 					<br />
// 					Best regards,<br />
// 					SOUNDMAC Team
// 				</div>
// 			</div>
// 			<img
// 				src="https://sconchun.sirv.com/welcome%20mail%20footer.png"
// 				width="400"
// 				alt=""
// 			/>
// 		</div>
// 	</body>
// </html>
//             `
//       );
//       if (!mailRes) {
//         return NextResponse.json(
//           { success: false, msg: "Failed to send verification email" },
//           { status: 500 }
//         );
//       }
//     } catch (error) {
//       console.log(error);
//       return NextResponse.json(
//         { success: false, msg: "Failed to send verification email" },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({
//       msg: `Please enter the otp sent to ${user.email}`,email: user.email,
//     });
//   } catch (error: unknown) {
//     return handleMongooseValidationError(error);
//   }
// }

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
					Dear ${user.firstName}, <br />
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
            `,
      );
      if (!mailRes) {
        return NextResponse.json(
          { success: false, msg: "Failed to send verification email" },
          { status: 500 },
        );
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { success: false, msg: "Failed to send verification email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ msg: "Please check your mailbox to verify." });
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
