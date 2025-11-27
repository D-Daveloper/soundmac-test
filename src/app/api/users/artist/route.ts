import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import Artist, { IArtist } from "@/util/models/artistModel";
import type { SortOrder } from "mongoose";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import { handleMongooseValidationError } from "@/util/customError/error";
import { buildSort } from "@/util/middleware/functions";

const limit = parseInt(process.env.ARTIST_LIMIT || "6", 10);

export async function POST(req: Request) {
  let artist = null;
  let selectedImage = "";
  try {
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);
    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const formData = await req.formData();

    // Get the file
    const file = formData.get("artist_image") as File | null;
    const artistName = formData.get("artist_name") as string | null;
    const appleId = formData.get("apple_id") as string | null;
    const spotifyId = formData.get("spotify_id") as string | null;

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

    selectedImage = "data:image/png;base64," + buffer.toString("base64");
    await dbConnect();

    // console.log("File name:", selectedImage);
    // console.log("File type:", file.type);
    // console.log("File size:", file.size);

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "User not found" }, { status: 404 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address" },
        { status: 400 }
      );
    } else if (user.otp !== null) {
      return NextResponse.json({ msg: "Please Login" }, { status: 400 });
    } else {
      artist = await Artist.find({
        artistName: artistName,
      });
      // .explain("executionStats");
    }

    if (artist.length > 0) {
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
    return handleMongooseValidationError(error);
  }
}

export async function GET(req: Request) {
  try {
    let artists: IArtist[] = [];
    let totalCount = 0;
    await dbConnect();
    const userData = await verifyJWT();
    const userJwt = verifyUser(userData);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const sort = searchParams.get("sort") || "createdAt";
    const name = searchParams.get("artistName");
    const sortQuery = buildSort(sort) as {
      [key: string]: SortOrder | { $meta: any };
    };//this is use to format the sort query for mongodb.

    if (name && name.trim() !== "") {
      const query = { artistName: { $regex: "^" + name, $options: "i" },user: userJwt.user };

      artists = await Artist.find(query)
      .collation({ locale: "en", strength: 2 })
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit);
        totalCount = await Artist.countDocuments(query);
      // return NextResponse.json({artists,msg:artists.  > 0?"Successful":"No artists found" }, { status:artists.length > 0? 200 : 404 });
    } else {
      artists = await Artist.find({ user: userJwt.user })
        .collation({ locale: "en", strength: 2 })
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit);
      totalCount = await Artist.countDocuments({ user: userJwt.user });
      // totalCount = 0;
      // artists = [];
    }

    return NextResponse.json(
      {
        data: artists,
        page,
        skip: (page - 1) * limit,
        sort,
        limit,
        hasNextPage: artists.length === limit,
        totalCount: totalCount,
        totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
        msg: totalCount > 0 ? "Successful" : "No artists found",
      },
      { status: 200}
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
