import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const handleMongooseValidationError = (error: unknown) => {
console.log(error);

  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((err) => {
      if (err.path === "password") {
        return "Password must be at least 6 characters long.";
      } else {
        return err.message;
      }
    });
    return NextResponse.json(
      { success: false, validationErrors: errors },
      { status: 400 }
    );
  }
  // if (error instanceof Error) {
  //   // Regular Error object (includes .message)
  //   return NextResponse.json({ msg: error.message }, { status: 500 });
  // }

  return NextResponse.json(
    { success: false, message: "Internal server error" },
    { status: 500 }
  );
};
