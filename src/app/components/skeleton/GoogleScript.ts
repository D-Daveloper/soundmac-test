// import { useEffect, useState } from "react";

// export function useGoogleScriptLoaded() {
//   const [isLoaded, setIsLoaded] = useState(
//     typeof window !== "undefined" && !!(window as any).google?.accounts?.id
//   );

//   useEffect(() => {
//     if (isLoaded) return;

//     const interval = setInterval(() => {
//       if ((window as any).google?.accounts?.id) {
//         setIsLoaded(true);
//         clearInterval(interval);
//       }
//     }, 50);

//     // safety timeout so you don't poll forever
//     const timeout = setTimeout(() => clearInterval(interval), 10000);

//     return () => {
//       clearInterval(interval);
//       clearTimeout(timeout);
//     };
//   }, [isLoaded]);

//   return isLoaded;
// }