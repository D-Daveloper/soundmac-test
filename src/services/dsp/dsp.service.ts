import { dspFetch } from "./dsp.client";

export async function generateUPC() {
  const data = await dspFetch("https://api.dpmnetworks.com/api/v2/upc/assign/" + process.env.DPM_CLIENT_ID, {
    method: "GET",
  });
//   console.log("upc",data);
  
  return data.upc_list[0]
}
export async function generateISRC() {
  const data = await dspFetch("https://api.dpmnetworks.com/api/v2/isrc/assign/" + process.env.DPM_CLIENT_ID, {
    method: "GET",
  });
//   console.log("upc",data);
  
  return data.upc_list[0]
}
export async function generateMultipleISRC(amount:number) {
  const data = await dspFetch("https://api.dpmnetworks.com/api/v2/isrc/assign/" + process.env.DPM_CLIENT_ID + "qty=" + amount, {
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