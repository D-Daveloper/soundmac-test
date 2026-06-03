import axios from "axios";
import { dspFetch } from "./dsp.client";

export async function generateUPC() {
  if (process.env.NODE_ENV === "development") {
    return Math.floor(Math.random() * 9000000000) + 1000000000;
  }
  const data = await dspFetch("https://api.dpmnetworks.com/api/v2/upc/assign/" + process.env.DPM_CLIENT_ID, {
    method: "GET",
  });
  //   console.log("upc",data);

  return data.upc_list[0]
}
export async function generateISRC() {
  if (process.env.NODE_ENV === "development") {
    return Math.floor(Math.random() * 9000000000) + 1000000000;
  }
  const data = await dspFetch("https://api.dpmnetworks.com/api/v2/isrc/assign/" + process.env.DPM_CLIENT_ID, {
    method: "GET",
  });
  //   console.log("upc",data);

  return data.upc_list[0]
}
export async function generateMultipleISRC(amount: number) {
  const data = await dspFetch("https://api.dpmnetworks.com/api/v2/isrc/assign/" + process.env.DPM_CLIENT_ID + "?qty=" + amount, {
    method: "GET",
  });
  //   console.log("upc",data);

  return data.upc_list
}

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

export async function getDsps(){
  try {
    const res = await axios.get(process.env.GET_DSPS_URL!, {
      headers: {
        Authorization: `Basic ${process.env.GET_DSPS_BASIC_AUTH_PASSWORD}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching DSPs:", error);
    throw error;
  }
}