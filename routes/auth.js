const express = require('express');
const passport = require('../config/passport');
const router = express.Router();

// @route   GET /auth/google
// @desc    Start Google OAuth process
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// @route   GET /auth/google/callback
// @desc    Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to dashboard
    res.redirect('/dashboard');
  }
);

// @route   GET /auth/logout
// @desc    Logout user
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/dashboard');
    }
    res.redirect('/');
  });
});

// @route   GET /auth/user
// @desc    Get current user
router.get('/user', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        picture: req.user.picture
      }
    });
  } else {
    res.json({
      success: false,
      user: null
    });
  }
});

module.exports = router; 