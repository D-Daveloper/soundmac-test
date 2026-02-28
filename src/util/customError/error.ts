import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const handleMongooseValidationError = (error: any) => {
console.log(error);
  if (error instanceof mongoose.Error.CastError) {
    return NextResponse.json({
      msg: error.path + " " +'Invalid data type sent',
      field: error.path
    }, { status: 400 });
  }
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
  if (error.code && error.code === 11000) {
    // Regular Error object (includes .message)
    return NextResponse.json({ msg: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { success: false, message: "Internal server error" },
    { status: 500 }
  );
};
