
export async function dspFetch(url: string, options: RequestInit = {}) {
  let token = process.env.DPM_ACCESS_TOKEN;

  let res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // If unauthorized → retry once with fresh token
  // if (res.status === 401) {
  //   // force refresh
  //   token = await getDSPToken(); // optional flag

  //   res = await fetch(url, {
  //     ...options,
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       "Content-Type": "application/json",
  //     },
  //   });
  // }
  
  if (!res.ok) {
    console.log("DPM REQUEST",res);
    throw new Error(await res.text());
  }

  return res.json();
}