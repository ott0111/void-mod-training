const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const config = require('./config');
const Database = require('./database');
const DiscordBot = require('./discordBot');
const DiscordService = require('./services/discordService');
const QuizService = require('./services/quizService');
const GoogleFormsService = require('./services/googleFormsService');
const createQuizRoutes = require('./routes/quiz');
const createVerifyRoutes = require('./routes/verify');
const initializeDiscordAuth = require('./auth/discordAuth');

class VoidModTrainingServer {
  constructor() {
    this.app = express();
    this.database = null;
    this.discordBot = null;
    this.discordService = null;
    this.quizService = null;
    this.googleFormsService = null;
    this.rateLimiter = new RateLimiterMemory({
      keyGenerator: (req) => req.ip,
      points: config.RATE_LIMIT_MAX_REQUESTS,
      duration: config.RATE_LIMIT_WINDOW / 1000,
    });
  }

  async initialize() {
    try {
      console.log('Initializing Void Mod Training Server...');

      // Initialize database
      await this.initializeDatabase();

      // Initialize Discord bot
      await this.initializeDiscordBot();

      // Initialize services
      await this.initializeServices();

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup error handling
      this.setupErrorHandling();

      console.log('Server initialized successfully');
    } catch (error) {
      console.error('Failed to initialize server:', error);
      throw error;
    }
  }

  async initializeDatabase() {
    console.log('Initializing database...');
    this.database = new Database();
    await this.database.initialize();
    console.log('Database initialized');
  }

  async initializeDiscordBot() {
    console.log('Initializing Discord bot...');
    this.discordBot = new DiscordBot();
    await this.discordBot.start();
    console.log('Discord bot initialized');
  }

  async initializeServices() {
    console.log('Initializing services...');

    // Initialize Discord service
    this.discordService = new DiscordService(this.discordBot, this.database);

    // Initialize Quiz service
    this.quizService = new QuizService(this.database);

    // Initialize Google Forms service (optional)
    this.googleFormsService = new GoogleFormsService();
    const googleFormsInitialized = await this.googleFormsService.initialize();
    
    if (googleFormsInitialized) {
      console.log('Google Forms service initialized');
    } else {
      console.log('Google Forms service not available - using internal quiz system');
    }

    console.log('Services initialized');
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
        },
      },
    }));

    // CORS middleware
    this.app.use(cors({
      origin: config.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Session middleware
    this.app.use(session({
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));

    // Passport middleware
    const passportInstance = initializeDiscordAuth(this.database);
    this.app.use(passportInstance.initialize());
    this.app.use(passportInstance.session());

    // Rate limiting middleware
    this.app.use(async (req, res, next) => {
      try {
        await this.rateLimiter.consume(req.ip);
        next();
      } catch (rejRes) {
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        res.set('Retry-After', String(secs));
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: secs
        });
      }
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: this.database ? 'connected' : 'disconnected',
          discordBot: this.discordBot?.isLoggedIn ? 'connected' : 'disconnected',
          googleForms: this.googleFormsService?.isAvailable() ? 'available' : 'unavailable'
        }
      });
    });

    // Authentication routes
    this.app.get('/auth/discord', passport.authenticate('discord'));

    this.app.get('/auth/discord/callback', 
      passport.authenticate('discord', { failureRedirect: `${config.FRONTEND_URL}/login?failed=true` }),
      (req, res) => {
        // Successful authentication
        res.redirect(`${config.FRONTEND_URL}/dashboard`);
      }
    );

    this.app.get('/auth/logout', (req, res) => {
      req.logout((err) => {
        if (err) {
          console.error('Logout error:', err);
        }
        res.redirect(`${config.FRONTEND_URL}/`);
      });
    });

    // Current user endpoint
    this.app.get('/api/user', (req, res) => {
      if (req.isAuthenticated()) {
        res.json({
          success: true,
          user: {
            id: req.user.id,
            discord_id: req.user.discord_id,
            username: req.user.discord_username,
            discriminator: req.user.discord_discriminator,
            avatar: req.user.discord_avatar,
            isAuthenticated: true
          }
        });
      } else {
        res.json({
          success: false,
          user: null,
          isAuthenticated: false
        });
      }
    });

    // Protected routes
    this.app.use('/api/quiz', this.ensureAuthenticated, 
      createQuizRoutes(this.quizService, this.discordService));

    this.app.use('/api/verify', this.ensureAuthenticated, 
      createVerifyRoutes(this.discordService, this.quizService, this.googleFormsService));

    // Admin routes (placeholder for future implementation)
    this.app.get('/api/admin/dashboard', this.ensureAuthenticated, this.ensureAdmin, (req, res) => {
      res.json({
        success: true,
        message: 'Admin dashboard - coming soon'
      });
    });

    // Static files and frontend
    this.app.use(express.static('../'));

    // Catch-all handler for SPA
    this.app.get('*', (req, res) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      res.sendFile('index.html', { root: '../' });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
      });
    });

    // Global error handler
    this.app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      
      res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      });
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('Received SIGINT, shutting down gracefully...');
      this.shutdown();
    });

    process.on('SIGTERM', () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      this.shutdown();
    });
  }

  ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
  }

  async ensureAdmin(req, res, next) {
    try {
      // Check if user has admin roles in Discord
      const hasAdminRoles = await this.discordService.hasRequiredRoles(req.user.discord_id);
      
      if (!hasAdminRoles) {
        return res.status(403).json({ error: 'Insufficient privileges' });
      }
      
      next();
    } catch (error) {
      console.error('Admin check error:', error);
      res.status(500).json({ error: 'Failed to verify admin privileges' });
    }
  }

  async start() {
    try {
      await this.initialize();
      
      this.app.listen(config.PORT, () => {
        console.log(`
🚀 Void Mod Training Server Started Successfully!

📡 Server: http://localhost:${config.PORT}
🔗 Frontend: ${config.FRONTEND_URL}
🤖 Discord Bot: ${this.discordBot?.isLoggedIn ? 'Connected' : 'Disconnected'}
📊 Google Forms: ${this.googleFormsService?.isAvailable() ? 'Available' : 'Unavailable'}
🗄️  Database: Connected

📋 Available Endpoints:
  • GET  /health - Health check
  • GET  /auth/discord - Discord OAuth
  • GET  /api/user - Current user info
  • POST /api/quiz/generate - Generate quiz
  • POST /api/quiz/submit - Submit quiz
  • GET  /api/quiz/history - Quiz history
  • POST /api/verify/quiz-completion - Verify and assign roles

🎯 Ready to train new Void Esports moderators!
        `);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    console.log('Shutting down server...');
    
    if (this.discordBot) {
      this.discordBot.shutdown();
    }
    
    if (this.database) {
      this.database.close();
    }
    
    process.exit(0);
  }
}

// Start the server
const server = new VoidModTrainingServer();
server.start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = VoidModTrainingServer;
