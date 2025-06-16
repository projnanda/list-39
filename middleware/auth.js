// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // If it's an API request, return JSON error
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Otherwise redirect to login
  res.redirect('/login');
};

// Middleware to redirect authenticated users away from login/register pages
const redirectIfAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  next();
};

module.exports = {
  isAuthenticated,
  redirectIfAuthenticated
}; 