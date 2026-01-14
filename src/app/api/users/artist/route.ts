import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import Artist, { IArtist } from "@/util/models/artistModel";
import type { SortOrder } from "mongoose";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import { handleMongooseValidationError } from "@/util/customError/error";
import { buildSort, uploadImage } from "@/util/middleware/functions";

const limit = parseInt(process.env.ARTIST_LIMIT || "6", 10);

export async function POST(req: Request) {
  let artist = null;
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
    } else if (!["image/jpeg", "image/png"].includes(file.type)) {
      return NextResponse.json(
        {
          msg: "Invalid Image format.",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid User." }, { status: 404 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address." },
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
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageType = file.type.split("/")[1];
    const imageStorageLocation = `testing/artistImages/${artistName}.${imageType}`; //reconstruct the s3 key for the image using the upc as the name and adding the jpg extension
    const selectedImage = await uploadImage(
      imageType,
      buffer,
      imageStorageLocation
    );
    if (selectedImage.coverUrl === null) {
      return NextResponse.json(
        {
          msg: selectedImage.error,
        },
        { status: 500 }
      );
    }
    artist = new Artist({
      user: user._id,
      artistName: artistName,
      artistImage: selectedImage.coverUrl,
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

// under review
export async function DELETE(req: Request) {
  return NextResponse.json({ msg: "Not Available at this time, please try again later" }, { status: 400 });
  // const session = await mongoose.startSession();

  // try {
  //   session.startTransaction();
  //   const userData = await verifyJWT();
  //   const userJwt = verifyUser(userData);
  //   if (userJwt.msg) {
  //     return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
  //   }
  //   const formData = await req.json();
  //   if (formData.artist_name.trim() === "" || !formData.artist_name) {
  //     return NextResponse.json({ msg: "Invalid Request" }, { status: 401 });
  //   }

  //   await dbConnect();
  //   const user = userJwt.user ? await User.findById(userJwt.user) : null;
  //   if (!user) {
  //     return NextResponse.json({ msg: "Invalid User" }, { status: 401 });
  //   } else if (!user.confirmed) {
  //     return NextResponse.json(
  //       { msg: "Please verify your email address" },
  //       { status: 401 }
  //     );
  //   } else if (user.otp !== null) {
  //     return NextResponse.json({ msg: "Please Login" }, { status: 401 });
  //   } else {
  //     // Find and verify artist belongs to user before deleting
  //     const artist = await Artist.findOne({
  //       artistName: formData.artist_name,
  //       user: user._id,
  //     }).session(session);

  //      if (!artist) {
  //     return NextResponse.json({
  //       msg:"Invalid Artist"
  //     },{status:400})}

  //     const deleteArtistResult = await Artist.deleteOne(
  //       {
  //         artistName: formData.artist_name.trim(),
  //         user: user._id,
  //       },
  //       { session }
  //     )
  //     // .explain("executionStats");

  //     if (deleteArtistResult.deletedCount < 1) {
  //       return NextResponse.json({ msg: "Failed to delete." }, { status: 400 });
  //     }

  //     const deleteSongsResult = await SongModel.deleteMany(
  //       { artistName: formData.artist_name.trim(), user: user._id },
  //       { session }
  //     );
  //   } //test this one then try deleting the songs from s3 bucket too

  //   // Commit the transaction
  //   await session.commitTransaction();

  //   return NextResponse.json({ msg: "Artist Deleted" }, { status: 200 });
  // } catch (error: unknown) {
  //   await session.abortTransaction();

  //   console.log(error);

  //   return handleMongooseValidationError(error);
  // } finally {
  //   // Always end the session
  //   session.endSession();
  // }
}
// export async function PATCH(req: Request) {
//   let artist = null;
//   let selectedImage = "";
//   try {
//     const userData = await verifyJWT();
//     const userJwt = verifyUser(userData);
//     if (userJwt.msg) {
//       return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
//     }
//     const formData = await req.formData();

//     // Get the file
//     const file = formData.get("artist_image") as File | null;
//     const artistName = formData.get("artist_name") as string;
//     const old_name = formData.get("old_name") as string;

//     if (!file && !artistName && artistName.trim() === "") {
//       return NextResponse.json({ msg: "Invalid request" }, { status: 400 });
//     } else if (!old_name) {
//       return NextResponse.json(
//         { msg: "Invalid name is required" },
//         { status: 400 }
//       );
//     }
//     if(file){
//       const bytes = await file.arrayBuffer();
//       const buffer = Buffer.from(bytes);

//       selectedImage = "data:image/png;base64," + buffer.toString("base64");
//     }
//     await dbConnect();

//     const user = userJwt.user ? await User.findById(userJwt.user) : null;
//     if (!user) {
//       return NextResponse.json({ msg: "Invalid User" }, { status: 404 });
//     } else if (!user.confirmed) {
//       return NextResponse.json(
//         { msg: "Please verify your email address" },
//         { status: 400 }
//       );
//     } else if (user.otp !== null) {
//       return NextResponse.json({ msg: "Please Login" }, { status: 401 });
//     } else {
//       artist = await Artist.find({
//         artistName: old_name,
//         user:user._id
//       }).explain("executionStats");
//     }

//     if (artist.length > 0) {
//       return NextResponse.json(
//         { msg: "Artist already exists" },
//         { status: 400 }
//       );
//     }
//     artist = new Artist({...artist,artistName:artistName,
//     });
//     await artist.save();
//     return NextResponse.json(
//       { msg: "Artist created successfully", artist },
//       { status: 201 }
//     );
//   } catch (error: unknown) {
//     return handleMongooseValidationError(error);
//   }
// }

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
    }; //this is use to format the sort query for mongodb.

    if (name && name.trim() !== "") {
      const query = {
        artistName: { $regex: "^" + name, $options: "i" },
        user: userJwt.user,
      };

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
      { status: 200 }
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
