const crypto = require("crypto");

class TelegramAuth {
  static validateInitData(initData) {
    // For development, directly parse user data from initData
    if (process.env.NODE_ENV === "development") {
      const urlParams = new URLSearchParams(initData);
      const user = JSON.parse(urlParams.get("user"));
      return {
        isValid: true,
        user: {
          id: user.id.toString(),
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          language_code: user.language_code,
          is_premium: user.is_premium,
        },
      };
    }

    try {
      // Get the bot token from environment variables
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        throw new Error("TELEGRAM_BOT_TOKEN is not defined");
      }

      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get("hash");

      if (!hash) {
        throw new Error("Hash not found in init data");
      }

      urlParams.delete("hash");
      urlParams.sort();

      let dataCheckString = "";
      for (const [key, value] of urlParams.entries()) {
        dataCheckString += `${key}=${value}\n`;
      }
      dataCheckString = dataCheckString.slice(0, -1);

      // Calculate HMAC-SHA256 signature using bot token
      const secret = crypto
        .createHmac("sha256", "WebAppData")
        .update(botToken)
        .digest();

      const expectedHash = crypto
        .createHmac("sha256", secret)
        .update(dataCheckString)
        .digest("hex");

      // Verify the signature
      if (expectedHash !== hash) {
        throw new Error("Invalid hash");
      }

      // Extract user data
      const user = JSON.parse(urlParams.get("user"));
      if (!user?.id) {
        throw new Error("User ID not found in init data");
      }

      return {
        isValid: true,
        user: {
          id: user.id.toString(),
          first_name: user.firstName || user.first_name,
          last_name: user.lastName || user.last_name,
          username: user.username,
          language_code: user.languageCode || user.language_code,
          is_premium: user.isPremium || user.is_premium,
        },
      };
    } catch (error) {
      console.error("Telegram auth validation error:", error);
      return {
        isValid: false,
        error: error.message,
      };
    }
  }

  static validateHash(hash, data, botToken) {
    try {
      const secret = crypto
        .createHmac("sha256", "WebAppData")
        .update(botToken)
        .digest();
      const signature = crypto
        .createHmac("sha256", secret)
        .update(data)
        .digest("hex");

      return signature === hash;
    } catch (error) {
      console.error("Hash validation error:", error);
      return false;
    }
  }
}

module.exports = { TelegramAuth };
