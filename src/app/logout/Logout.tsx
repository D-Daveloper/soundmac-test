"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import { SyncLoader } from "react-spinners";
import { DotLoader } from "react-spinners";


export default function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [trackLogout, setTrackLogOut] = useState(false)

  const handleLogout = async () => {
    try {
      setTrackLogOut(true)
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Refresh the current route to update UI or redirect
        setTrackLogOut(false)
        queryClient.clear();
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed", error);
    } 
  };

  return (
    <button
      className={
        `px-2 mx-2 py-2 font-bold rounded-lg max-w-full hover:cursor-pointer text-sm hover:bg-error-400/90 bg-error-400 border-2 border-error-400 text-white text-left`
      }
      onClick={handleLogout}
    >
      {trackLogout ?( <div className="mx-auto w-fit"> <DotLoader size={16}  color="#fff" />  </div> ): <p>Log Out</p>}
      {/* Log Out */}
    </button>
  );
}
