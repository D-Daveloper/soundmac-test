import { NextResponse } from "next/server";
import dbConnect from "@/util/db";
import User from "@/util/models/userModel";
import Artist, { IArtist } from "@/util/models/artistModel";
import { verifyJWT, verifyUser } from "@/util/middleware/verifyJwt";
import { NextApiRequest, NextApiResponse } from "next";

const limit = parseInt(process.env.ARTIST_LIMIT || "10", 10);

// export async function POST(req: Request) {
//   let artist = null;
//   let selectedImage = "";
//   try {
//     const formData = await req.formData();

//     // Get the file
//     const file = formData.get("selectedImage") as File | null;
//     const artistName = formData.get("artistName") as string | null;
//     const appleId = formData.get("appleId") as string | null;
//     const spotifyId = formData.get("spotifyId") as string | null;

//     if (!file) {
//       return NextResponse.json({ msg: "No file uploaded" }, { status: 400 });
//     } else if (!artistName || artistName.trim() === "") {
//       return NextResponse.json(
//         { msg: "Artist name is required" },
//         { status: 400 }
//       );
//     }
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

    
//     selectedImage = "data:image/png;base64,"+buffer.toString("base64");
//     await dbConnect();

//     console.log("File name:", selectedImage);
//     console.log("File type:", file.type);
//     console.log("File size:", file.size);
//     const userData = await verifyJWT(req);
//     const userJwt = verifyUser(userData);
//     if (userJwt.msg) {
//       return NextResponse.json({ msg: userJwt.msg }, { status: 401 });
//     }

//     const user = userJwt.user ? await User.findById(userJwt.user) : null;
//     if (!user) {
//       return NextResponse.json({ msg: "User not found" }, { status: 404 });
//     } else if (!user.confirmed) {
//       return NextResponse.json(
//         { msg: "Please verify your email address" },
//         { status: 400 }
//       );
//     } else if (user.otp !== null && user.twoFactorAuthentication === "true") {
//       return NextResponse.json({ msg: "Please Login" }, { status: 400 });
//     } else {
//       artist = await Artist.findOne({
//         name: artistName,
//       });
//     }
//     if (artist) {
//       return NextResponse.json(
//         { msg: "Artist already exists" },
//         { status: 400 }
//       );
//     }
//     artist = new Artist({
//       user: user._id,
//       artistName: artistName,
//       artistImage: selectedImage,
//       appleId: appleId,
//       spotifyId: spotifyId,
//     });
//     await artist.save();
//     return NextResponse.json(
//       { msg: "Artist created successfully", artist },
//       { status: 201 }
//     );
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       return NextResponse.json({ msg: error.message }, { status: 500 });
//     } else {
//       return NextResponse.json(
//         { msg: "An unknown error occurred" },
//         { status: 500 }
//       );
//     }
//   }
// }

export async function POST(req:NextApiRequest,res:NextApiResponse) {
    console.log(req.body);
    res.status(200).json({msg:"success"})
}