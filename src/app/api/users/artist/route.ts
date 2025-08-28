import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import User from "../../../lib/models/userModel";
// import sendEmail from "../../../lib/sendMail/sendEmail";
import Artist, { IArtist } from "@/app/lib/models/artistModel";
import { verifyJWT, verifyUser } from "@/app/lib/middleware/verifyJwt";

const limit = parseInt(process.env.ARTIST_LIMIT || "10", 10);

export async function POST(req: Request) {
  let artist = null;
  let selectedImage = "";
  try {
    const formData = await req.formData();

    // Get the file
    const file = formData.get("selectedImage") as File | null;
    const artistName = formData.get("artistName") as string | null;
    const appleId = formData.get("appleId") as string | null;
    const spotifyId = formData.get("spotifyId") as string | null;

    if (!file) {
      return NextResponse.json({ msg: "No file uploaded" }, { status: 400 });
    } else if (!artistName || artistName.trim() === "") {
      return NextResponse.json(
        { msg: "Artist name is required" },
        { status: 400 }
      );
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    
    selectedImage = "data:image/png;base64,"+buffer.toString("base64");
    await dbConnect();

    console.log("File name:", selectedImage);
    console.log("File type:", file.type);
    console.log("File size:", file.size);
    const userData = await verifyJWT(req);
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "User not found" }, { status: 404 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address" },
        { status: 400 }
      );
    } else if (user.otp !== null && user.twoFactorAuthentication === "true") {
      return NextResponse.json({ msg: "Please Login" }, { status: 400 });
    } else {
      artist = await Artist.findOne({
        name: artistName,
      });
    }
    if (artist) {
      return NextResponse.json(
        { msg: "Artist already exists" },
        { status: 400 }
      );
    }
    artist = new Artist({
      user: user._id,
      artistName: artistName,
      artistImage: selectedImage,
      appleId: appleId,
      spotifyId: spotifyId,
    });
    await artist.save();
    return NextResponse.json(
      { msg: "Artist created successfully", artist },
      { status: 201 }
    );
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

export async function GET(req: Request) {
  try {
    let artists: IArtist[] = [];
    await dbConnect();
    const userData = await verifyJWT(req);
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const sort = searchParams.get("sort") || "createdAt";
    const name = searchParams.get("artistName");

    if (name && name.trim() !== "") {
      const query = { artistName: { $regex: "^" + name, $options: "i" } };

      artists = await Artist.find(query);
      // return NextResponse.json({artists,msg:artists.length > 0?"Successful":"No artists found" }, { status:artists.length > 0? 200 : 404 });
    } else {
      artists = await Artist.find({ user: userJwt.user })
        .collation({ locale: "en", strength: 2 })
        .sort({ [sort]: 1 })
        .skip((page - 1) * limit)
        .limit(limit);
    }

    return NextResponse.json(
      {
        data: {
          artists,
          pagination: {
            page,
            skip: (page - 1) * limit,
            sort,
            limit,
            hasNextPage: artists.length === limit,
            totalCount: await Artist.countDocuments({ user: userJwt.user }),
          },
        },
        msg: artists.length > 0 ? "Successful" : "No artists found",
      },
      { status: artists.length > 0 ? 200 : 404 }
    );
    // const artists = await Artist.find({ user: userJwt.user }).populate("user", "email").sort({[sort]:1}).skip((page - 1) * limit).limit(limit);
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

// export async function PATCH(req: Request) {
//   try {
//     const body = await req.json();
//     await dbConnect();

//     // Find the user by ID and update the isVerified field
//     const user = await User.findOne({ email: body.email });

//     if (!user) {
//       return NextResponse.json(
//         { success: false, msg: "User not found" },
//         { status: 404 }
//       );
//     }
//     if (user.twoFactorAuthentication == "true" && user.otp !== "") {
//       let otp = generateOtp();
//       const currentDate = new Date();
//       // update user
//       const updatedUser = await User.findByIdAndUpdate(
//         {
//           _id: user._id.toString(),
//         },
//         {
//           otp: otp,
//           otpExpires: new Date(currentDate.getTime() + 10 * 60000), // 30 minutes in milliseconds (1 minute = 60,000 milliseconds)
//         },
//         {
//           new: true,
//           runValidators: true,
//           select:
//             "-password -otp -otpExpires -refreshToken -refreshTokenExpires",
//         }
//       );

//       try {
//         const mailRes = await sendEmail(
//           `${updatedUser.email}`,
//           "OTP!",
//           `

//         <!DOCTYPE html>
// <html lang="en">
// 	<head>
// 		<meta charset="UTF-8" />
// 		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
// 		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
// 		<title>Account Verification</title>
// 	</head>
// 	<body>
// 		<div>
// 			Here is your otp ${otp}
// 			<p>Expires in 10 mins </p>

// 		</div>
// 	</body>
// </html>
//             `
//         );
//         if (!mailRes) {
//           return NextResponse.json(
//             { msg: "Failed to send OTP. Please try again later." },
//             { status: 500 }
//           );
//         }
//         return NextResponse.json(
//           { msg: "An otp has been sent to your email", otp: true },
//           { status: 200 }
//         );
//       } catch (error) {
//         console.log(error);
//         return NextResponse.json(
//           { msg: "Failed to send OTP. Please try again later." },
//           { status: 500 }
//         );
//       }
//     } else {
//       return NextResponse.json({ msg: "Please login." }, { status: 400 });
//     }

//     // return NextResponse.json({ msg: "Please check your mailbox to verify." });
//   } catch (error: any) {
//     return NextResponse.json({ msg: error.message }, { status: 500 });
//   }
// }
