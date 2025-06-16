const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const config = require('../config');

passport.use(new GoogleStrategy({
  clientID: config.googleClientId,
  clientSecret: config.googleClientSecret,
  callbackURL: `${config.baseUrl}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    
    // Check if user already exists by googleId OR email
    let user = await User.findOne({ 
      $or: [
        { googleId: profile.id },
        { email: email }
      ]
    });
    
    if (user) {
      // Update user info (including googleId if it wasn't set before)
      user.googleId = profile.id;
      user.name = profile.displayName;
      user.email = email;
      user.picture = profile.photos[0].value;
      await user.save();
      return done(null, user);
    }
    
    // Create new user
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: email,
      picture: profile.photos[0].value
    });
    
    await user.save();
    return done(null, user);
  } catch (error) {
    console.error('Error in Google Strategy:', error);
    
    // Handle duplicate key error gracefully
    if (error.code === 11000) {
      // If it's a duplicate key error, try to find and return the existing user
      try {
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        if (existingUser) {
          // Update the existing user with Google info
          existingUser.googleId = profile.id;
          existingUser.name = profile.displayName;
          existingUser.picture = profile.photos[0].value;
          await existingUser.save();
          return done(null, existingUser);
        }
      } catch (findError) {
        console.error('Error finding existing user:', findError);
      }
    }
    
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport; 