const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  subscriptionDate: {
    type: Date,
    default: null
  },
  first_name: String,
  last_name: String,
  username: String,
  language_code: String,
  lastVisit: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt and lastVisit timestamps before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastVisit = new Date();
  next();
});

// Update lastVisit on user activity
userSchema.methods.updateLastVisit = async function() {
  this.lastVisit = new Date();
  return this.save();
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema); 