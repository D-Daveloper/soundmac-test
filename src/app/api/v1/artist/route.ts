import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import Artist, { IArtist } from "@/util/models/artistModel";
import type { SortOrder } from "mongoose";
import { handleMongooseValidationError } from "@/util/customError/error";
import { buildSort, uploadImage } from "@/util/middleware/functions";
import { authenticate } from "@/util/middleware/authMiddleware";
import mongoose from "mongoose";
import EntityDeactivation from "@/util/models/deactivateEntity";
import SongModel from "@/util/models/songModel";
import AlbumModel from "@/util/models/AlbumModel";
import TrackModel from "@/util/models/trackModel";
import { requireActiveSubscription } from "@/util/middleware/subscription";


export async function POST(req: Request) {
  let artist = null;
  try {
    const userJwt = await authenticate(req);

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
        { status: 400 },
      );
    } else if (!["image/jpeg", "image/png"].includes(file.type)) {
      return NextResponse.json(
        {
          msg: "Invalid Image format.",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid User." }, { status: 404 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address." },
        { status: 400 },
      );
    } else if (user.otp !== null) {
      return NextResponse.json({ msg: "Please Login" }, { status: 401 });
    } else {
      const subError = requireActiveSubscription(user)
      if(subError) {
        return NextResponse.json({ msg: subError.msg }, { status: subError.status });
      }
    }
    //  else if (user.premium !== true) {
    //   return NextResponse.json(
    //     { msg: "Please upgrade your account." },
    //     { status: 402 },
    //   );
    // } else if (user.premium && new Date() > new Date(user.premiumExpiration!)) {
    //   user.premium = false;
    //   user.premiumExpiration = null;
    //   await user.save();
    //   return NextResponse.json(
    //     { msg: "Please upgrade your account." },
    //     { status: 402 },
    //   );
    // } 
     {
      artist = await Artist.find({
        user: user._id,
        artistName: artistName,
      }).lean();
      // .explain("executionStats");
    }

    if (artist.length > 0) {
      return NextResponse.json(
        { msg: "Artist already exists" },
        { status: 400 },
      );
    }
    const total_artists = await Artist.countDocuments({ user: user._id });
    let total_artists_allowed = 1;
    switch (user.type) {
      case "EMERGING_ARTIST":
        total_artists_allowed = 1;
        break;
      case "INDEPENDENT_ARTIST":
        total_artists_allowed = 1;
        break;
      case "INDIE_LABEL":
        total_artists_allowed = 10;
        break;
      case "MAJOR_LABEL":
        total_artists_allowed = 100;
        break;

      default:
        total_artists_allowed = 1;
        break;
    }

    if (total_artists >= total_artists_allowed) {
      return NextResponse.json(
        { msg: "Artist creation limit reached, please upgrade your account." },
        { status: 402 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageType = file.type.split("/")[1];
    const imageStorageLocation = `userImages/${user?.email}/${artistName.trim().replaceAll(" ", "_")}.${imageType}`; //reconstruct the s3 key for the image using the upc as the name and adding the jpg extension
    const selectedImage = await uploadImage(
      imageType,
      buffer,
      imageStorageLocation,
    );
    if (selectedImage.coverUrl === null) {
      return NextResponse.json(
        {
          msg: selectedImage.error,
        },
        { status: 500 },
      );
    }
    artist = new Artist({
      user: user._id,
      artistName: artistName.toLocaleLowerCase(),
      artistImage: selectedImage.coverUrl,
      appleId: appleId,
      spotifyId: spotifyId,
    });
    await artist.save();
    return NextResponse.json(
      { msg: "Artist created successfully", artist },
      { status: 201 },
    );
  } catch (error: unknown) {
    return handleMongooseValidationError(error);
  }
}

export async function PATCH(req: Request) {

  try {
    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }

    const body = await req.json();

    if (body.artist_name.trim() === "" || !body.artist_name) {
      return NextResponse.json({ msg: "Invalid Request" }, { status: 401 });
    }

    await dbConnect();
    const user = userJwt.user ? await User.findById(userJwt.user).lean() : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid User" }, { status: 401 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address" },
        { status: 401 }
      );
    } else if (user.otp !== null) {
      return NextResponse.json({ msg: "Please Login" }, { status: 401 });
    } else {
      // Find and verify artist belongs to user before deleting
      const artist = await Artist.findOne({
        user: user._id,
        artistName: body.artist_name,
      });

      if (!artist || artist.artistStatus === "inactive") {
        return NextResponse.json({
          msg: "Invalid Artist"
        }, { status: 400 })
      }

      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        await Artist.updateOne({
          user: user._id,
          artistName: body.artist_name,
        }, { artistStatus: "inactive" }, { session });

        await EntityDeactivation.create([{
          entityType: "artist",
          entityId: artist._id,
          deactivationType: "user",
          deactivationReason: "user",
          additionalNotes: "user",
          deactivatedBy: user._id,
          entityStatus: "deactivated",
        }], { session });

        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction()
      } finally {
        await session.endSession()
      }
    }

    return NextResponse.json({ msg: "Artist Deactivated" }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);
    return handleMongooseValidationError(error);
  }
}


// under review
// export async function DELETE(req: Request) {
//   return NextResponse.json(
//     { msg: "Not Available at this time, please try again later" },
//     { status: 400 },
//   );
//   // const session = await mongoose.startSession();

//   // try {
//   //   session.startTransaction();
//   //   const userData = await verifyJWT();
//   //   const userJwt = verifyUser(userData);
//   //   if (userJwt.msg) {
//   //     return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
//   //   }
//   //   const formData = await req.json();
//   //   if (formData.artist_name.trim() === "" || !formData.artist_name) {
//   //     return NextResponse.json({ msg: "Invalid Request" }, { status: 401 });
//   //   }

//   //   await dbConnect();
//   //   const user = userJwt.user ? await User.findById(userJwt.user) : null;
//   //   if (!user) {
//   //     return NextResponse.json({ msg: "Invalid User" }, { status: 401 });
//   //   } else if (!user.confirmed) {
//   //     return NextResponse.json(
//   //       { msg: "Please verify your email address" },
//   //       { status: 401 }
//   //     );
//   //   } else if (user.otp !== null) {
//   //     return NextResponse.json({ msg: "Please Login" }, { status: 401 });
//   //   } else {
//   //     // Find and verify artist belongs to user before deleting
//   //     const artist = await Artist.findOne({
//   //       artistName: formData.artist_name,
//   //       user: user._id,
//   //     }).session(session);

//   //      if (!artist) {
//   //     return NextResponse.json({
//   //       msg:"Invalid Artist"
//   //     },{status:400})}

//   //     const deleteArtistResult = await Artist.deleteOne(
//   //       {
//   //         artistName: formData.artist_name.trim(),
//   //         user: user._id,
//   //       },
//   //       { session }
//   //     )
//   //     // .explain("executionStats");

//   //     if (deleteArtistResult.deletedCount < 1) {
//   //       return NextResponse.json({ msg: "Failed to delete." }, { status: 400 });
//   //     }

//   //     const deleteSongsResult = await SongModel.deleteMany(
//   //       { artistName: formData.artist_name.trim(), user: user._id },
//   //       { session }
//   //     );
//   //   } //test this one then try deleting the songs from s3 bucket too

//   //   // Commit the transaction
//   //   await session.commitTransaction();

//   //   return NextResponse.json({ msg: "Artist Deleted" }, { status: 200 });
//   // } catch (error: unknown) {
//   //   await session.abortTransaction();

//   //   console.log(error);

//   //   return handleMongooseValidationError(error);
//   // } finally {
//   //   // Always end the session
//   //   await session.endSession();
//   // }
// }

export async function PUT(req: Request) {
  let artist = null;
  let artists = [];
  try {
    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const formData = await req.formData();

    // Get the file
    const file = formData.get("artist_image") as File | null;
    const artistName = formData.get("artist_name") as string;
    const artistId = formData.get("artist_id") as string;

    if (file && !(file instanceof File)) {
      return NextResponse.json({ msg: "Invalid request" }, { status: 400 });
    } else if (!artistId) {
      return NextResponse.json(
        { msg: "ID is required" },
        { status: 400 }
      );
    } else if (!artistName) {
      return NextResponse.json(
        { msg: "Artist name cannot be an empty string." },
        { status: 400 }
      );
    }
    await dbConnect();

    const user = userJwt.user ? await User.findById(userJwt.user) : null;
    if (!user) {
      return NextResponse.json({ msg: "Invalid User" }, { status: 404 });
    } else if (!user.confirmed) {
      return NextResponse.json(
        { msg: "Please verify your email address" },
        { status: 400 }
      );
    } else if (user.otp !== null) {
      return NextResponse.json({ msg: "Please Login" }, { status: 401 });
    } else {
      artist = await Artist.findById(artistId);
    }

    if (!artist) {
      return NextResponse.json(
        { msg: "Invalid artist ID." },
        { status: 400 }
      );
    } else if (artist.user.toString() != user._id.toString()) {
      return NextResponse.json({ msg: "Invalid Artist." },
        { status: 400 })
    } else if (artist.artistName.trim() != artistName) {
      const doesArtistNameAlreadyExist = await Artist.find({
        user: user._id,
        artistName: artistName
      }).lean();

      if (doesArtistNameAlreadyExist.length > 0) {
        return NextResponse.json({ msg: "Artist name already exist" }, { status: 400 })
      }
    }
    let selectedImage: { error: string | null, coverUrl: string | null } = { error: null, coverUrl: null };

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const imageType = file.type.split("/")[1];
      const imageStorageLocation = `artistImages/${user.email}/${artistName.trim().replaceAll(" ", "_")}.${imageType}`; //reconstruct the s3 key for the image using the upc as the name and adding the jpg extension
      selectedImage = await uploadImage(
        imageType,
        buffer,
        imageStorageLocation,
      );
      if (selectedImage.coverUrl === null) {
        return NextResponse.json(
          {
            msg: selectedImage.error,
          },
          { status: 500 },
        );
      }
      artist.artistImage = selectedImage.coverUrl
    }

    if (artistName && artist.artistName != artistName) {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        await SongModel.updateMany({ user: user._id, artistName: artist.artistName }, { artistName: artistName }, { session }),
          await AlbumModel.updateMany({ user: user._id, artistName: artist.artistName }, { artistName: artistName }, { session }),
          await TrackModel.updateMany({ user: user._id, artistName: artist.artistName }, { artistName: artistName }, { session }),
          artist.artistName = artistName;
        await artist.save({ session }),

          await session.commitTransaction();
        return NextResponse.json(
          { msg: "Artist Edited successfully", artist },
          { status: 201 }
        );
      } catch (error) {
        console.error("error editing artist", error);
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        return NextResponse.json({ msg: "Failed to edit artist" }, { status: 500 });

      } finally {
        await session.endSession();
      }
    }
    return NextResponse.json(
      { msg: "Artist Edited successfully", artist },
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
    const userJwt = await authenticate(req);

    if (userJwt.msg) {
      return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const sort = searchParams.get("sort") || "-createdAt";
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const name = searchParams.get("artistName");
    const sortQuery = buildSort(sort) as {
      [key: string]: SortOrder | { $meta: any };
    }; //this is use to format the sort query for mongodb.
    let query: any = {
      user: userJwt.user,
    };

    if (name && name.trim() !== "") {
      query.artistName = { $regex: "^" + name, $options: "i" };
    }

    artists = await Artist.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit);
    totalCount = await Artist.countDocuments(query);
    // return NextResponse.json({artists,msg:artists.  > 0?"Successful":"No artists found" }, { status:artists.length > 0? 200 : 404 });

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
      { status: 200 },
    );
    // const artists = await Artist.find({ user: userJwt.user }).populate("user", "email").sort({[sort]:1}).skip((page - 1) * limit).limit(limit);
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

// export async function PATCH(req: Request) {
//   try {
//     const "body = await req.json(");
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
