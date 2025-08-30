import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import User from "../../../lib/models/userModel";
import sendEmail from "../../../lib/sendMail/sendEmail";
import { Error as MongooseError } from "mongoose";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    await dbConnect();
    // Check if the email already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, msg: "Email already exists" },
        { status: 400 }
      );
    }
    const user = new User(body);
    await user.save();
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

    return NextResponse.json({ msg: "Please check your mailbox to verify." });
  } catch (error: unknown) {
  if (error instanceof Error) {
    // Regular Error object (includes .message)
    return NextResponse.json({ msg: error.message }, { status: 500 });
  }
if (error instanceof MongooseError.ValidationError) {
  const errors = Object.values(error.errors).map((err) => err.message);
  return NextResponse.json(
    { success: false, validationErrs: errors },
    { status: 400 }
  );
}

    return NextResponse.json({ msg: "unknwon error occurred" }, { status: 500 });
  }
}


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

    return NextResponse.json({ msg: "Please check your mailbox to verify." });

  } catch (error: unknown) {
    if (error instanceof Error){
      return NextResponse.json({ msg: error.message }, { status: 500 });
    }else{
      return NextResponse.json({ msg: "An unknown error occurred" }, { status: 500 });
    }
  }
}