require('dotenv').config();

module.exports = {
  // MongoDB Configuration
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/list39',
  
  // Server Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Session Configuration
  sessionSecret: process.env.SESSION_SECRET || 'list39-super-secret-session-key-change-in-production',
  
  // Google OAuth Configuration
  googleClientId: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'list39-jwt-secret-key-change-in-production',
  
  // Domain Configuration
  domain: process.env.DOMAIN || 'localhost:3000',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000'
}; 