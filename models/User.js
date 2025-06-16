const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String
  },
  preferredUsername: {
    type: String,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema); 