"use client";

import { useEffect } from "react";
import { Spinner } from "./ui/spinner";

export function LoadingScreen({ message }: { message?: string }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center">
        <div className="relative size-24 flex items-center justify-center">
          <Spinner />
        </div>

        {message && (
          <p className="text-sm font-medium text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}