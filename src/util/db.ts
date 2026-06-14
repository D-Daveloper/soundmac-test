import mongoose from "mongoose";
import { Counter } from "./models/CounterModel";

const dbConnect = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    await ensureCounters();
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export default dbConnect;


async function ensureCounters() {
  const ids = ["isrc", "catalog"];

  await Promise.all(
    ids.map((id) =>
      Counter.findOneAndUpdate(
        { _id: id },
        { $setOnInsert: { value: 0 } },
        { upsert: true, new: true }
      )
    )
  );
}