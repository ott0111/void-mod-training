require('dotenv').config();

module.exports = {
  // Discord Configuration
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
  DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/discord/callback',
  
  // Discord Role IDs
  ROLES: {
    TRIAL_MOD: process.env.ROLE_TRIAL_MOD_ID,
    STAFF_ACCESS: process.env.ROLE_STAFF_ACCESS_ID,
    TICKET_SUPPORT: process.env.ROLE_TICKET_SUPPORT_ID
  },
  
  // Server Configuration
  PORT: process.env.PORT || 3000,
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-here',
  
  // Database Configuration
  DATABASE_PATH: process.env.DATABASE_PATH || './database.sqlite',
  
  // Quiz Configuration
  QUIZ_PASSING_SCORE: 20,
  QUIZ_TOTAL_QUESTIONS: 29,
  QUIZ_RETRY_COOLDOWN: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  
  // Google Forms Configuration (Optional)
  GOOGLE_FORM_ID: process.env.GOOGLE_FORM_ID || '1FAIpQLSdwhpQEk86xNvnqB84vLrpB17GhCTHmw1Tu-YmUwoQ23rw8bQ',
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
  GOOGLE_CREDENTIALS_PATH: process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json',
  
  // Security Configuration
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5500'
};
