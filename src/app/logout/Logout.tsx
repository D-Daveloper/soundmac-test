"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Refresh the current route to update UI or redirect
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
        "px-2 py-2 font-bold rounded-lg max-w-full hover:cursor-pointer text-sm hover:bg-error-400/90 bg-error-400 border-2 border-error-400 text-white text-start"
      }
      onClick={handleLogout}
    >
      Log Out
    </button>
  );
}
