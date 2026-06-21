import axios from "axios";
import { inngest } from "../inngest";
import sendEmail from "@/util/sendMail/sendEmail";
import { NonRetriableError } from "inngest";
import mongoose from "mongoose";
import SongModel from "@/util/models/songModel";
import DpmMetaData from "@/util/models/DpmCallBackModel";
import AlbumModel from "@/util/models/AlbumModel";
import TrackModel from "@/util/models/trackModel";

export const releaseDelivery = inngest.createFunction(
    { id: "deliver-release", triggers: { event: "release/deliver" } },

    async ({ event, step }) => {
        const { upc, listDspId, releaseId, isSingle } = event.data as { upc: string; listDspId: number[], releaseId: string, isSingle: boolean }

        // Wrap the external API call in a step
        const apiResponse = await step.run("request-release-delivery", async () => {
            // const token = Buffer.from(`${process.env.DPM_USERNAME_V1}:${process.env.DPM_PASSWORD_V1}`).toString('base64');
            try {
                const response = await axios.post(`${process.env.DPM_HOST_V1}requestdelivery`, {
                    upc: upc,
                    dspids: listDspId,
                    delivery_type: "initialDelivery"
                }, {
                    headers: {
                        'Authorization': `Basic ${process.env.DPM_HOST_V1_AUTH}`,
                        'Content-Type': 'application/json',
                        'Accept-Language': 'en-US',
                        'Host': 'api.dpmnetworks.com',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
                    }
                });

                if (response.status == 401) throw new NonRetriableError("request-release-delivery failed due to Authorized");

                if (response.status != 201) throw new Error("api call for request delivery failed");

                return { success: true, status: response.status };

            } catch (error: any) {
                await sendEmail("davidmuoegbunam@gmail.com", "failed to deliver the release", error?.message ?? "check the step function in request-release-delivery")
                console.log(error);
                // If it's already an Inngest NonRetriableError, keep passing it up
                if (error instanceof NonRetriableError) throw error;

                // Return a failure state instead of undefined so the next step knows it failed
                return { success: false, status: error?.response?.status ?? 500 };
            }
        });

        // Use the data in a subsequent step
        await step.run("process-delivery-response", async () => {
            console.log("Data received:", apiResponse);

            if (!apiResponse || !apiResponse.success) {
                const session = await mongoose.startSession();
                try {
                    session.startTransaction();
                    if (isSingle) {
                        await SongModel.findByIdAndUpdate(releaseId, { releaseStatus: "pending" }, { session });
                        await DpmMetaData.findOneAndDelete({ upc }, { session });
                    } else {
                        await AlbumModel.findByIdAndUpdate(releaseId, { releaseStatus: "completed" }, { session });
                        await TrackModel.updateMany({ upc }, { releaseStatus: "completed" }, { session });
                        await DpmMetaData.deleteMany({ upc }, { session });
                    }
                    await session.commitTransaction()
                } catch (error) {
                    if (session.inTransaction()) {
                        await session.abortTransaction();
                    }
                    console.log("db roll back failed",error);
                    
                    throw error; // Rethrow so the step is marked as failed in Inngest UI
                } finally {
                    await session.endSession();
                }
            }
        });
    }
);
