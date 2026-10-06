import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../db";
import { IdempotencyKey } from "../models/IdempotencyKey";
import mongoose from "mongoose";
// import { dbConnect } from "@/lib/dbConnect";
// import { IdempotencyKey } from "@/models/IdempotencyKey";

const LOCK_TIMEOUT_MS = 60_000; // if a "processing" record is older than this, assume the server crashed

function jsonError(status: number, message: string) {
  return NextResponse.json({ msg: message }, { status });
}

export async function withIdempotency(
  req: NextRequest,
  user: mongoose.Types.ObjectId,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const key = req.headers.get("Idempotency-Key");

  // Header is optional: without it the request just runs normally
  if (!key) return handler();
  if (key.length > 255) return jsonError(400, "Idempotency-Key must be 255 characters or fewer");

  await dbConnect();

  const path = new URL(req.url).pathname;
  const body = await req.clone().text(); // clone so the handler can still read the body
  const requestHash = createHash("sha256")
    .update(`${req.method}:${path}:${body}`)
    .digest("hex");

  try {
    await IdempotencyKey.create({ user, key, method: req.method, path, requestHash });
  } catch (err: any) {
    if (err?.code !== 11000) throw err; // not a duplicate key error

    const existing = await IdempotencyKey.findOne({ user, key });
    if (!existing) return jsonError(409, "Please retry the request");

    if (existing.requestHash !== requestHash) {
      return jsonError(422, "Idempotency-Key was already used with a different request");
    }

    if (existing.status === "completed") {
      return NextResponse.json(existing.responseBody, {
        status: existing.responseStatus,
        headers: { "Idempotent-Replayed": "true" },
      });
    }

    // Still processing: only take over if the original attempt looks dead
    const isStale = Date.now() - existing.lockedAt.getTime() > LOCK_TIMEOUT_MS;
    if (!isStale) return jsonError(409, "A request with this Idempotency-Key is still in progress");

    const taken = await IdempotencyKey.findOneAndUpdate(
      { _id: existing._id, status: "processing", lockedAt: existing.lockedAt },
      { lockedAt: new Date() }
    );
    if (!taken) return jsonError(409, "A request with this Idempotency-Key is still in progress");
  }

  try {
    const response = await handler();

    // Server errors aren't saved, so the client can safely retry and re-execute
    if (response.status >= 500) {
      await IdempotencyKey.deleteOne({ user, key });
      return response;
    }

    const responseBody = await response.clone().json();
    await IdempotencyKey.updateOne(
      { user, key },
      { status: "completed", responseStatus: response.status, responseBody }
    );
    return response;
  } catch (err) {
    await IdempotencyKey.deleteOne({ user, key });
    throw err;
  }
}