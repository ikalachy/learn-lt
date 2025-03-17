"use client";

import { openTelegramLink } from "@telegram-apps/sdk";
import { useStore } from "@/contexts/StoreContext";
import { TonConnectButton } from "@/tonconnect";

const BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "LearnLTBot";

export default function PaymentButton() {
  const { user } = useStore();

  return (
    <div className="flex justify-center">
      <TonConnectButton />
    </div>
  );
}
