import { inngest } from "../inngest";
import { s3 } from "@/util/middleware/aws";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import AlbumModel from "@/util/models/AlbumModel";
import dbConnect from "@/util/db";
import TrackModel from "@/util/models/trackModel";
import mongoose from "mongoose";

const Bucket = process.env.AWS_S3_BUCKET!;
export const deleteAlbumData = inngest.createFunction(
    { id: "delete-album-data", triggers: { event: "delete/album" } },
    async ({ event, step }) => {
        const { albumId, s3Keys } = event.data as { albumId: string; s3Keys: string[] }

        // Delete each track individually so partial failures are tracked
        const results = await step.run('delete-s3-files', async () => {
            return Promise.allSettled(
                s3Keys.map(key => s3.send(new DeleteObjectCommand({ Bucket, Key: key })))
            )
        })
        console.log(results);
        

        const failed = results.filter(r => r.status === 'rejected')

        if (failed.length > 0) {
            throw new Error(`${failed.length} files failed`) // Inngest will retry
        }

        // Only hard delete from DB after S3 is fully clean
        await step.run('delete-from-db', async () => {
            await dbConnect();
            const session = await mongoose.startSession();
            try {
                 session.startTransaction();
                await AlbumModel.findByIdAndDelete(albumId)
                await TrackModel.deleteMany({ album: albumId })
                await session.commitTransaction();
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                await session.endSession();
            }
        })


        return { success: true };

    }
);