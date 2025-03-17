"use client";
import { init } from "@telegram-apps/sdk";
import { useEffect } from "react";

/**
 * Initializes the application and configures its dependencies.
 */
export function useInitApp(debug = false) {
  useEffect(() => {
    // Only run in browser environment
    // if (typeof window === "undefined") return;

    // Initialize special event handlers for Telegram Desktop, Android, iOS, etc.
    // Also, configure the package.
    try {
      init();

      // Add Eruda if needed.
      debug &&
        import("eruda")
          .then((lib) => lib.default.init())
          .catch(console.error);
    } catch (error) {
      console.warn("Telegram SDK initialization failed:", error);
      // In development, we might want to continue even if initialization fails
      if (process.env.NODE_ENV === "production") {
        throw error;
      }
    }
  }, [debug]);
}
