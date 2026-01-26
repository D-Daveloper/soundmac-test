import { DeleteObjectCommand, DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { retryWithBackoff } from "./functions";
import { RETRY_CONFIG } from "@/app/utils/constants";

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

/**
 * Delete songs from S3 with retry logic
 */
export async function deleteSongsFromS3WithRetry(s3KeyAudio:string[]) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  
  if (!bucketName) {
    throw new Error('S3 bucket name not configured');
  }

  // // Extract S3 keys from songs
  // const s3Keys = songs
  //   .map(song => extractS3Key(song.fileUrl || song.s3Key || song.filePath))
  //   .filter(key => key);

  if (s3KeyAudio.length === 0) {
    console.log('No S3 files to delete');
    return 0;
  }

  console.log(`Attempting to delete ${s3KeyAudio.length} files from S3`);

  // Use retry wrapper
  return await retryWithBackoff(
    async () => {
      if (s3KeyAudio.length > 1) {
        return await deleteMultipleFromS3(bucketName, s3KeyAudio);
      } else {
        return await deleteSingleFromS3WithError(bucketName, s3KeyAudio[0]);
      }
    },
    RETRY_CONFIG,
    'S3 deletion'
  );
}

/**
 * Delete multiple objects from S3 (up to 1000 at a time)
 */
export async function deleteMultipleFromS3(bucketName:string, s3Keys:string[]) {
  // S3 allows max 1000 objects per batch
  const batchSize = 1000;
  let totalDeleted = 0;

  for (let i = 0; i < s3Keys.length; i += batchSize) {
    const batch = s3Keys.slice(i, i + batchSize);
    
    const command = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: batch.map(key => ({ Key: key })),
        Quiet: false,
      },
    });

    const response = await s3.send(command);
    
    if (response.Errors && response.Errors.length > 0) {
      console.error('Some files failed to delete from S3:', response.Errors);
      
      // If any errors occurred, throw to trigger retry
      throw new Error(
        `Failed to delete ${response.Errors.length} files: ${response.Errors[0].Message}`
      );
    }
    
    const deletedCount = response.Deleted?.length || 0;
    totalDeleted += deletedCount;
    
    console.log(`Deleted batch ${Math.floor(i / batchSize) + 1}: ${deletedCount} files`);
  }

  return totalDeleted;
}// cross check before use

/**
 * Delete single object from S3
 */
export async function deleteSingleFromS3WithError(bucketName:string, s3Key:string) {
  try {
    const command = new DeleteObjectCommand({ Bucket: bucketName, Key: s3Key });
    const response = await s3.send(command);
    
    // Validate response
    if (response.$metadata?.httpStatusCode !== 204 && response.$metadata?.httpStatusCode !== 200) {
      throw new Error(`Unexpected status: ${response.$metadata?.httpStatusCode}`);
    }
    
    return 1;
  } catch (error) {
    if (error instanceof Error && error.name === 'NoSuchKey') return 1; // Already deleted
    throw error; // ✅ Propagate error for retry
  }
}
export async function deleteSingleFromS3(bucketName:string, s3Key:string):Promise<boolean> {
try {
    const command = new DeleteObjectCommand({ Bucket: bucketName, Key: s3Key });
    await s3.send(command);
    return true;
  } catch (err) {
    console.error("S3 cleanup failed", { s3Key, err });
    return false; // 👈 do NOT throw
  }
}