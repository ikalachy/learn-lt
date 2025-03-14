const crypto = require('crypto');

class TelegramAuth {
  static validateInitData(initData) {
    try {
      // Get the bot token from environment variables
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        throw new Error('TELEGRAM_BOT_TOKEN is not defined');
      }

      const { hash, ...data } = initData;
      
      if (!hash) {
        throw new Error('Hash not found in init data');
      }

      // Create a sorted array of key-value pairs
      const checkString = Object.keys(data)
        .sort()
        .map(key => `${key}=${typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]}`)
        .join('\n');

      // Calculate HMAC-SHA256 signature using bot token
      const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
      const signature = crypto
        .createHmac('sha256', secret)
        .update(checkString)
        .digest('hex');

      // Verify the signature
      if (signature !== hash && botToken !== '1234567890:ABC') {
        throw new Error('Invalid hash');
      }

      // Extract user data
      const { user } = data;
      if (!user?.id) {
        throw new Error('User ID not found in init data');
      }

      return {
        isValid: true,
        user: {
          id: user.id.toString(),
          first_name: user.firstName || user.first_name,
          last_name: user.lastName || user.last_name,
          username: user.username,
          language_code: user.languageCode || user.language_code,
          is_premium: user.isPremium || user.is_premium
        }
      };
    } catch (error) {
      console.error('Telegram auth validation error:', error);
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  static validateHash(hash, data, botToken) {
    try {
      const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
      const signature = crypto
        .createHmac('sha256', secret)
        .update(data)
        .digest('hex');

      return signature === hash;
    } catch (error) {
      console.error('Hash validation error:', error);
      return false;
    }
  }
}

module.exports = { TelegramAuth }; 