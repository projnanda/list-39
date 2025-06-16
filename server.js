const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config');
const passport = require('./config/passport');
const { redirectIfAuthenticated } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const publicRoutes = require('./routes/public');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: config.baseUrl,
  credentials: true
}));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for secure cookies behind reverse proxy
app.set('trust proxy', 1);

// Session configuration
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.mongodbUri,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/', publicRoutes);

// Home page route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>List39 — Agent Facts Registry</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="description" content="Standardized agent identity infrastructure for the agentic web. Open registry for AI agent discovery and interoperability.">
      <style>
        :root {
          --color-primary: #2563eb;
          --color-primary-light: #3b82f6;
          --color-text: #1f2937;
          --color-text-secondary: #6b7280;
          --color-border: #e5e7eb;
          --color-bg: #ffffff;
          --color-bg-secondary: #f9fafb;
          --color-accent: #0ea5e9;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          line-height: 1.6;
          color: var(--color-text);
          background: var(--color-bg);
        }
        
        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }
        
        .header {
          padding: 32px 0 48px;
          border-bottom: 1px solid var(--color-border);
        }
        
        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 48px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: var(--color-text);
        }
        
        .logo-mark {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .logo-text {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.025em;
        }
        
        .auth-section a {
          margin-left: 12px;
          padding: 8px 16px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background: var(--color-primary);
          color: white;
        }
        
        .btn-primary:hover {
          background: var(--color-primary-light);
        }
        
        .btn-secondary {
          color: var(--color-text-secondary);
        }
        
        .btn-secondary:hover {
          color: var(--color-text);
          background: var(--color-bg-secondary);
        }
        
        .hero {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .hero h1 {
          font-size: 48px;
          font-weight: 700;
          letter-spacing: -0.025em;
          margin-bottom: 16px;
          background: linear-gradient(135deg, var(--color-text) 0%, var(--color-primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hero-subtitle {
          font-size: 20px;
          color: var(--color-text-secondary);
          margin-bottom: 32px;
          font-weight: 400;
        }
        
        .hero-description {
          font-size: 18px;
          color: var(--color-text);
          max-width: 680px;
          margin: 0 auto 40px;
          line-height: 1.7;
        }
        
        .main-content {
          padding: 80px 0;
        }
        
        .section {
          margin-bottom: 80px;
        }
        
        .section-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--color-text);
        }
        
        .section-description {
          font-size: 18px;
          color: var(--color-text-secondary);
          max-width: 700px;
          margin-bottom: 48px;
          line-height: 1.7;
        }
        
        .architecture-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
          margin-bottom: 64px;
        }
        
        .architecture-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 32px;
          transition: all 0.2s;
        }
        
        .architecture-card:hover {
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
        }
        
        .card-icon {
          width: 48px;
          height: 48px;
          background: var(--color-primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 20px;
        }
        
        .card-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--color-text);
        }
        
        .card-description {
          color: var(--color-text-secondary);
          line-height: 1.6;
        }
        
        .code-example {
          background: #1f2937;
          border-radius: 8px;
          padding: 24px;
          margin: 32px 0;
          overflow-x: auto;
        }
        
        .code-example pre {
          color: #e5e7eb;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .specs-section {
          background: var(--color-bg-secondary);
          border-radius: 12px;
          padding: 48px;
          margin: 64px 0;
        }
        
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 32px;
        }
        
        .spec-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .spec-icon {
          width: 20px;
          height: 20px;
          background: var(--color-accent);
          border-radius: 4px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .spec-content h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--color-text);
        }
        
        .spec-content p {
          color: var(--color-text-secondary);
          font-size: 14px;
        }
        
        .footer {
          border-top: 1px solid var(--color-border);
          padding: 48px 0;
          text-align: center;
          color: var(--color-text-secondary);
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .hero h1 { font-size: 36px; }
          .hero-subtitle { font-size: 18px; }
          .hero-description { font-size: 16px; }
          .section-title { font-size: 24px; }
          .section-description { font-size: 16px; }
          .architecture-grid { grid-template-columns: 1fr; }
          .specs-grid { grid-template-columns: 1fr; }
          .specs-section { padding: 32px; }
        }
      </style>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body>
      <div class="container">
        <header class="header">
          <nav class="nav">
            <a href="/" class="logo">
              <div class="logo-mark">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                  <circle cx="16" cy="16" r="15" fill="url(#gradient)" stroke="none"/>
                  <circle cx="10" cy="8" r="2.5" fill="white" opacity="0.9"/>
                  <circle cx="22" cy="8" r="2.5" fill="white" opacity="0.9"/>
                  <circle cx="16" cy="16" r="3" fill="white"/>
                  <circle cx="8" cy="22" r="2" fill="white" opacity="0.9"/>
                  <circle cx="24" cy="22" r="2" fill="white" opacity="0.9"/>
                  <line x1="10" y1="8" x2="16" y2="16" stroke="white" stroke-width="1.5" opacity="0.7"/>
                  <line x1="22" y1="8" x2="16" y2="16" stroke="white" stroke-width="1.5" opacity="0.7"/>
                  <line x1="16" y1="16" x2="8" y2="22" stroke="white" stroke-width="1.5" opacity="0.7"/>
                  <line x1="16" y1="16" x2="24" y2="22" stroke="white" stroke-width="1.5" opacity="0.7"/>
                  <line x1="10" y1="8" x2="22" y2="8" stroke="white" stroke-width="1" opacity="0.5"/>
                  <line x1="8" y1="22" x2="24" y2="22" stroke="white" stroke-width="1" opacity="0.5"/>
                </svg>
              </div>
              <div class="logo-text">List39</div>
            </a>
            <div class="auth-section">
              ${req.user ? 
                `<a href="/dashboard" class="btn-primary">Dashboard</a>
                 <a href="/auth/logout" class="btn-secondary">Sign Out</a>` :
                `<a href="/auth/google" class="btn-primary">Get Started</a>`
              }
            </div>
          </nav>
          
          <div class="hero">
            <h1>Agent Facts Registry</h1>
            <p class="hero-subtitle">Standardized identity infrastructure for autonomous agents</p>
            <p class="hero-description">
              As the web evolves toward autonomous agent interactions, standardized identity becomes critical infrastructure. 
              List39 provides a vendor-neutral registry enabling agent discovery, capability declaration, and trust establishment 
              in distributed agentic systems.
            </p>
          </div>
        </header>
        
        <main class="main-content">
          <section class="section">
            <h2 class="section-title">Architecture & Interoperability</h2>
            <p class="section-description">
              Agent Facts establish a common protocol for agent identity, similar to how domain names enable web discovery. 
              Each agent receives a structured JSON endpoint facilitating programmatic discovery and capability negotiation.
            </p>
            
            <div class="architecture-grid">
              <div class="architecture-card">
                <div class="card-icon">🔍</div>
                <h3 class="card-title">Discovery Protocol</h3>
                <p class="card-description">Standardized JSON-LD schemas enable automated agent discovery and capability matching across heterogeneous systems.</p>
              </div>
              
              <div class="architecture-card">
                <div class="card-icon">🤝</div>
                <h3 class="card-title">Interoperability Layer</h3>
                <p class="card-description">Vendor-neutral specifications ensure agents from different providers can establish communication protocols and trust relationships.</p>
              </div>
              
              <div class="architecture-card">
                <div class="card-icon">📡</div>
                <h3 class="card-title">Endpoint Resolution</h3>
                <p class="card-description">Distributed endpoint architecture supports both static declarations and dynamic capability resolution via adaptive resolvers.</p>
              </div>
            </div>
            
            <div class="code-example">
              <pre>GET https://list39.org/@agent-name.json

{
  "id": "uuid-v4-identifier",
  "agent_name": "Research Assistant",
  "capabilities": {
    "modalities": ["text", "structured_data"],
    "skills": ["analysis", "synthesis", "research"]
  },
  "endpoints": {
    "static": ["https://api.provider.com/v1/chat"],
    "adaptive_resolver": {
      "url": "https://resolver.provider.com/capabilities",
      "policies": ["capability_negotiation", "load_balancing"]
    }
  },
  "certification": {
    "level": "verified",
    "issuer": "NANDA",
    "attestations": ["privacy_compliant", "security_audited"]
  }
}</pre>
            </div>
          </section>
          
          <section class="section">
            <h2 class="section-title">Implementation Specifications</h2>
            <div class="specs-section">
              <div class="specs-grid">
                <div class="spec-item">
                  <div class="spec-icon"></div>
                  <div class="spec-content">
                    <h4>OpenID Integration</h4>
                    <p>OAuth 2.0 compliant authentication with extensible identity providers</p>
                  </div>
                </div>
                
                <div class="spec-item">
                  <div class="spec-icon"></div>
                  <div class="spec-content">
                    <h4>JSON-LD Schema</h4>
                    <p>Structured data format enabling semantic web integration and linked data applications</p>
                  </div>
                </div>
                
                <div class="spec-item">
                  <div class="spec-icon"></div>
                  <div class="spec-content">
                    <h4>RESTful APIs</h4>
                    <p>Standard HTTP methods for CRUD operations with comprehensive error handling</p>
                  </div>
                </div>
                
                <div class="spec-item">
                  <div class="spec-icon"></div>
                  <div class="spec-content">
                    <h4>Cryptographic Verification</h4>
                    <p>Digital signatures and attestation chains for agent authenticity and capability claims</p>
                  </div>
                </div>
                
                <div class="spec-item">
                  <div class="spec-icon"></div>
                  <div class="spec-content">
                    <h4>Rate Limiting</h4>
                    <p>Production-grade throttling and quota management for registry stability</p>
                  </div>
                </div>
                
                <div class="spec-item">
                  <div class="spec-icon"></div>
                  <div class="spec-content">
                    <h4>Monitoring & Telemetry</h4>
                    <p>Comprehensive observability stack with configurable retention and sampling policies</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section class="section">
            <h2 class="section-title">Registry Operations</h2>
            <p class="section-description">
              The List39 registry operates as distributed infrastructure supporting both centralized discovery and 
              federated resolution patterns. Agents maintain sovereignty over their identity while participating 
              in the broader agentic ecosystem.
            </p>
          </section>
        </main>
        
        <footer class="footer">
          <p>List39 Agent Facts Registry — Open infrastructure for the agentic web</p>
        </footer>
      </div>
    </body>
    </html>
  `);
});

// Login page route
app.get('/login', redirectIfAuthenticated, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login - List39</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          margin: 0;
          padding: 0;
          background: #0f0f0f;
          color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .login-container {
          background: #1a1a1a;
          padding: 40px;
          border-radius: 12px;
          border: 1px solid #333;
          text-align: center;
          max-width: 400px;
          width: 90%;
        }
        .logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: #4dabf7;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 20px;
          font-weight: bold;
        }
        h1 {
          margin: 0 0 10px 0;
          font-size: 32px;
        }
        .subtitle {
          color: #999;
          margin-bottom: 40px;
        }
        .btn {
          display: inline-block;
          padding: 16px 24px;
          background: #4285f4;
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: background-color 0.2s;
          margin-bottom: 20px;
        }
        .btn:hover {
          background: #3367d6;
        }
        .back-link {
          margin-top: 20px;
        }
        .back-link a {
          color: #666;
          text-decoration: none;
        }
        .back-link a:hover {
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <div class="logo">L39</div>
        <h1>Welcome Back</h1>
        <p class="subtitle">Sign in to manage your AI agents</p>
        
        <a href="/auth/google" class="btn">Sign in with Google</a>
        
        <div class="back-link">
          <a href="/">← Back to Home</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Dashboard route (protected)
app.get('/dashboard', require('./middleware/auth').isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Not Found</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 40px; background: #0f0f0f; color: #fff; text-align: center; }
        h1 { color: #ff6b6b; }
        a { color: #4dabf7; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>404 - Page Not Found</h1>
      <p><a href="/">← Back to Home</a></p>
    </body>
    </html>
  `);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: config.nodeEnv === 'production' ? 'Something went wrong!' : err.message
  });
});

// Connect to MongoDB
mongoose.connect(config.mongodbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  // Start server
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Environment: ${config.nodeEnv}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

module.exports = app; 