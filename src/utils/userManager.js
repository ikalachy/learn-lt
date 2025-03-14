const { connectToDatabase } = require('./mongodb');
const User = require('../models/User');
const { TelegramAuth } = require('./telegramAuth');

class UserManager {
  static async validateAndGetUser(initData) {
    try {
      const validation = TelegramAuth.validateInitData(initData);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid Telegram authentication');
      }

      const telegramUser = validation.user;
      if (!telegramUser.id) {
        throw new Error('Telegram user ID not found');
      }

      await connectToDatabase();
      
      // Try to find existing user
      let user = await User.findOne({ telegramId: telegramUser.id });

      if (user) {
        // Update user data and last visit
        user.first_name = telegramUser.first_name;
        user.last_name = telegramUser.last_name;
        user.username = telegramUser.username;
        user.language_code = telegramUser.language_code;
        await user.updateLastVisit();
      } else {
        // Create new user
        user = new User({
          telegramId: telegramUser.id,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          username: telegramUser.username,
          language_code: telegramUser.language_code,
          isPremium: false
        });
        await user.save();
      }

      return user.toObject();
    } catch (error) {
      console.error('Error in validateAndGetUser:', error);
      return null;
    }
  }

  static async getUser(telegramId) {
    try {
      await connectToDatabase();
      const user = await User.findOne({ telegramId });
      if (user) {
        await user.updateLastVisit();
        return user.toObject();
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  static async createUser(telegramId, data = {}) {
    try {
      await connectToDatabase();
      const user = new User({
        telegramId,
        isPremium: false,
        ...data
      });
      await user.save();
      return user.toObject();
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  static async updateUser(telegramId, updates) {
    try {
      await connectToDatabase();
      const user = await User.findOneAndUpdate(
        { telegramId },
        { ...updates },
        { new: true, runValidators: true }
      );
      if (user) {
        await user.updateLastVisit();
        return user.toObject();
      }
      return null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  static async deleteUser(telegramId) {
    try {
      await connectToDatabase();
      const result = await User.deleteOne({ telegramId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  static async listUsers() {
    try {
      await connectToDatabase();
      const users = await User.find({});
      return users.map(user => user.toObject());
    } catch (error) {
      console.error('Error listing users:', error);
      return [];
    }
  }

  static async getUserCount() {
    try {
      await connectToDatabase();
      return await User.countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
      return 0;
    }
  }
}

module.exports = { UserManager }; 