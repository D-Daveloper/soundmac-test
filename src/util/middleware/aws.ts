import { S3Client } from "@aws-sdk/client-s3";

/**
 * Centralized S3 client
 * This file MUST only be imported in server files
 */
export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
