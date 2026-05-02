import { getDSPToken } from "./dsp.auth";

export async function dspFetch(url: string, options: RequestInit = {}) {
  let token = await getDSPToken();

  let res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // If unauthorized → retry once with fresh token
  if (res.status === 401) {
    // force refresh
    token = await getDSPToken(); // optional flag

    res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  }
// console.log("client",res);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}