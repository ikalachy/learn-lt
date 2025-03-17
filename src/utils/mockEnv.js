"use client";
import {
  mockTelegramEnv,
  isTMA,
  parseInitData,
  retrieveLaunchParams,
} from "@telegram-apps/sdk";
import { useEffect } from "react";

const isDevelopment = process.env.NODE_ENV === "development";

export function useMockEnv() {
  useEffect(() => {
    if (isDevelopment) {
      (async () => {
        if (await isTMA()) {
          return;
        }

        // Determine which launch params should be applied.
        let lp;
        try {
          lp = retrieveLaunchParams();
        } catch (e) {
          const initDataRaw = new URLSearchParams([
            [
              "user",
              JSON.stringify({
                id: 99281932,
                first_name: "Andrew",
                last_name: "Rogue",
                username: "rogue",
                language_code: "en",
                is_premium: true,
                allows_write_to_pm: true,
              }),
            ],
            [
              "hash",
              "89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31",
            ],
            ["auth_date", "1716922846"],
            ["start_param", "debug"],
            ["chat_type", "sender"],
            ["chat_instance", "8428209589180549439"],
            ["signature", "6fbdaab833d39f54518bd5c3eb3f511d035e68cb"],
          ]).toString();

          lp = {
            themeParams: {
              accentTextColor: "#6ab2f2",
              bgColor: "#17212b",
              buttonColor: "#5288c1",
              buttonTextColor: "#ffffff",
              destructiveTextColor: "#ec3942",
              headerBgColor: "#17212b",
              hintColor: "#708499",
              linkColor: "#6ab3f3",
              secondaryBgColor: "#232e3c",
              sectionBgColor: "#17212b",
              sectionHeaderTextColor: "#6ab3f3",
              subtitleTextColor: "#708499",
              textColor: "#f5f5f5",
            },
            initData: parseInitData(initDataRaw),
            initDataRaw,
            version: "8",
            platform: "tdesktop",
          };
        }

        mockTelegramEnv(lp);
        console.warn(
          "⚠️ As long as the current environment was not considered as the Telegram-based one, it was mocked. Take a note, that you should not do it in production and current behavior is only specific to the development process. Environment mocking is also applied only in development mode. So, after building the application, you will not see this behavior and related warning, leading to crashing the application outside Telegram."
        );
      })();
    }
  }, []);
}
