import axios from "axios";
import { dspFetch } from "./dsp.client";
import dbConnect from "@/util/db";
import { Counter } from "@/util/models/CounterModel";

export async function generateUPC() {
  if (process.env.NODE_ENV === "development") {
    return Math.floor(Math.random() * 9000000000) + 1000000000;
  }
  const data = await dspFetch(`${process.env.DPM_HOST}v2/upc/assign/${process.env.DPM_CLIENT_ID}`, {
    method: "GET",
  });
  //   console.log("upc",data);

  return data.upc_list[0]
}

export async function generateISRC() {
  await dbConnect()
  const isrc = await Counter.findOneAndUpdate(
    { _id: "isrc" },
    { $inc: { value: 1 } },
    { returnDocument: "before" }
  );
  if (isrc) {

    return 'NGASN' + new Date().getFullYear().toString().slice(2) + (isrc.value + 1).toString().padStart(5,"0")
  }
  throw Error("Failed to generate isrc")
}

export async function generateCatalogNumber() {
  await dbConnect()
  const catalog = await Counter.findOneAndUpdate(
    { _id: "catalog" },
    { $inc: { value: 1 } },
    { returnDocument: "before" }
  );
  if (catalog) {

    return 'SM' + new Date().getFullYear().toString().slice(2) + catalog.value + 1
  }
  throw Error("Failed to generate catalog number")
}

// export async function generateISRC() {
//   if (process.env.NODE_ENV === "development") {
//     return Math.floor(Math.random() * 9000000000) + 1000000000;
//   }
//   const data = await dspFetch(`${process.env.DPM_HOST}v2/isrc/assign/` + process.env.DPM_CLIENT_ID, {
//     method: "GET",
//   });
//   //   console.log("upc",data);

//   return data.upc_list[0]
// }

export async function generateMultipleCatalogNumber(amount: number) {
  await dbConnect()
  const catalogNumber = await Counter.findOneAndUpdate(
    { _id: "catalog" },
    { $inc: { value: amount } },
    { returnDocument: "before" }
  );
  if (catalogNumber) {
    const catalogNumbers = Array.from({ length: amount },(_,index)=>(
     'SM' + new Date().getFullYear().toString().slice(2) + catalogNumber.value + ( index +1)));
     return catalogNumbers;
  }
  throw Error("Failed to generate catalog number")
}

export async function generateMultipleISRC(amount: number) {
  await dbConnect()
  const isrc = await Counter.findOneAndUpdate(
    { _id: "isrc" },
    { $inc: { value: amount } },
    { returnDocument: "before" }
  );
  if (isrc) {
    const isrcs = Array.from({ length: amount },(_,index)=>(
     'NGASN' + new Date().getFullYear().toString().slice(2) + (isrc.value + ( index +1)).toString().padStart(5,"0")));
     return isrcs;
  }
  throw Error("Failed to generate isrc")
}

// export async function generateMultipleISRC(amount: number) {
//   const data = await dspFetch(`${process.env.DPM_HOST}v2/isrc/assign/` + process.env.DPM_CLIENT_ID + "?qty=" + amount, {
//     method: "GET",
//   });
//   //   console.log("upc",data);

//   return data.upc_list
// }

export async function uploadTrack(payload: any) {
  return dspFetch("https://dsp-api.com/upload", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function approveRelease(releaseId: string) {
  return dspFetch(`https://dsp-api.com/releases/${releaseId}/approve`, {
    method: "POST",
  });
}

export async function getDsps() {
  try {
    const res = await axios.get(process.env.DPM_HOST_V1!+"dsp", {
      headers: {
        Authorization: `Basic ${process.env.DPM_HOST_V1_AUTH}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching DSPs:", error);
    throw error;
  }
}