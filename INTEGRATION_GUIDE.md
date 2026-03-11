# Void Mod Training - Integration Guide

## Complete System Overview

The Void Mod Training system now consists of:
- **Frontend**: Modern dashboard website with purple neon theme
- **Backend**: Node.js server with Discord integration
- **Database**: SQLite for user data and quiz results
- **Discord Bot**: Automated role assignment
- **Quiz System**: 29-question certification with Google Forms fallback

## Quick Integration Steps

### 1. Frontend Integration

The frontend website is already complete and ready to connect to the backend. Simply update the API calls in the frontend to point to your backend server.

```javascript
// Update API base URL in frontend
const API_BASE_URL = 'http://localhost:3000/api';
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Discord credentials
npm start
```

### 3. Discord Bot Configuration

1. Create Discord Application: https://discord.com/developers/applications
2. Add bot with "Manage Roles" permission
3. Get role IDs from your Discord server
4. Update `.env` with Discord credentials

### 4. Test the Integration

1. Visit: `http://localhost:3000/health`
2. Login with Discord OAuth
3. Take the certification quiz
4. Verify automatic role assignment

## User Flow

### Complete Moderator Training Journey

1. **Login**: User clicks "Login with Discord" on website
2. **Authentication**: Discord OAuth redirects back to website
3. **Training**: User studies all training materials on website
4. **Quiz**: User takes 29-question certification quiz
5. **Evaluation**: Backend scores quiz (20/29 to pass)
6. **Role Assignment**: Bot automatically assigns Discord roles if passed
7. **Notification**: User receives DM with results and welcome message

### Failed Quiz Flow

1. User scores < 20/29 on quiz
2. Backend records failed attempt
3. User receives failure DM with study tips
4. 24-hour cooldown prevents immediate retakes
5. User can retry after cooldown period

## API Integration Points

### Frontend → Backend

```javascript
// Check authentication
GET /api/user

// Generate quiz
POST /api/quiz/generate
Response: { quiz: { questions: [...], totalQuestions: 29 } }

// Submit quiz
POST /api/quiz/submit
Body: { answers: [0, 1, 2, ...], sessionId: "quiz_123", quizStartTime: "2024-01-01T12:00:00Z" }
Response: { results: { score: 25, passed: true, roleAssignment: {...} } }

// Check verification status
GET /api/verify/status
Response: { hasRoles: true, userRoles: [...], latestAttempt: {...} }
```

### Backend → Discord

```javascript
// Assign roles when user passes quiz
await discordService.assignModeratorRoles(discordUserId);

// Send congratulatory DM
await discordService.sendCongratulatoryMessage(discordUserId);

// Send failure DM with retry info
await discordService.sendFailureMessage(discordUserId, score, totalQuestions);
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    discord_id TEXT UNIQUE,
    discord_username TEXT,
    discord_discriminator TEXT,
    discord_avatar TEXT,
    access_token TEXT,
    refresh_token TEXT,
    created_at DATETIME,
    last_login DATETIME
);
```

### Quiz Attempts Table
```sql
CREATE TABLE quiz_attempts (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    score INTEGER,
    total_questions INTEGER,
    passed BOOLEAN,
    attempt_date DATETIME,
    quiz_data TEXT
);
```

### Role Assignments Table
```sql
CREATE TABLE role_assignments (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    role_id TEXT,
    role_name TEXT,
    assigned_at DATETIME,
    assignment_source TEXT
);
```

## Security Implementation

### Rate Limiting
- 100 requests per 15 minutes per IP
- Quiz attempts limited to once per 24 hours on failure
- Session-based authentication

### Data Protection
- Discord OAuth2 for secure authentication
- Encrypted session storage
- Input validation and sanitization
- CORS protection for API endpoints

### Access Control
- Only authenticated users can take quiz
- Role assignment requires Discord server membership
- Admin endpoints require elevated permissions

## Discord Bot Commands

### Slash Commands
- `/verify <discord-id>` - Manual verification (admin)
- `/quiz-status` - Check quiz completion status
- `/mod-help` - Show help information

### Automated Actions
- Role assignment on quiz completion
- DM notifications for pass/fail
- Staff notifications for new moderators

## Google Forms Integration (Optional)

### Setup Requirements
1. Google Service Account credentials
2. Google Sheet with form responses
3. Configure `GOOGLE_SHEET_ID` in environment

### Sync Process
```javascript
// Manual sync endpoint
POST /api/verify/sync-google-forms

// Automatic sync (if implemented)
await googleFormsService.syncResponsesToDatabase(database);
```

### Fallback Behavior
- If Google Forms unavailable → Use internal quiz
- If sync fails → Continue with internal system
- Users can still complete training via internal quiz

## Monitoring and Maintenance

### Health Checks
```bash
curl http://localhost:3000/health
```

Response includes:
- Database connection status
- Discord bot status
- Google Forms availability

### Log Monitoring
Key events to monitor:
- Authentication attempts
- Quiz submissions and scores
- Role assignments
- API errors and rate limits
- Discord bot disconnections

### Database Maintenance
- Regular backups of SQLite database
- Clean up old failed attempts
- Monitor quiz completion rates
- Track role assignment success

## Troubleshooting Guide

### Common Issues

#### Discord Bot Not Connecting
```bash
# Check bot token
echo $DISCORD_BOT_TOKEN

# Verify bot permissions
# Bot needs: Manage Roles, Read Messages, Send Messages
```

#### Role Assignment Failing
```bash
# Check role IDs in .env
# Verify bot has "Manage Roles" permission
# Ensure user is in Discord server
```

#### Quiz Not Working
```bash
# Check database connection
curl http://localhost:3000/health

# Verify quiz questions exist
sqlite3 database.sqlite "SELECT COUNT(*) FROM quiz_questions;"
```

#### Frontend Not Connecting
```bash
# Check CORS settings
# Verify FRONTEND_URL in .env
# Check API endpoint URLs
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check database
sqlite3 database.sqlite ".tables"

# Test Discord connection
node -e "const DiscordBot = require('./discordBot'); const bot = new DiscordBot(); bot.start();"
```

## Production Deployment

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
PORT=3000
SESSION_SECRET=strong-random-string
```

### Process Management
```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name "void-mod-training"
pm2 startup
pm2 save
```

### Reverse Proxy (nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL Configuration
```bash
# Use Let's Encrypt for SSL
certbot --nginx -d your-domain.com
```

## Performance Optimization

### Database Optimization
- Add indexes on frequently queried columns
- Regular database maintenance
- Connection pooling for high traffic

### Caching Strategy
- Cache quiz questions in memory
- Session caching for authenticated users
- API response caching where appropriate

### Load Balancing
- Multiple server instances behind load balancer
- Database replication for read operations
- CDN for static assets

## Scaling Considerations

### Horizontal Scaling
- Stateless server design
- Shared database storage
- Session storage in Redis

### Vertical Scaling
- Monitor resource usage
- Optimize database queries
- Implement caching layers

## Future Enhancements

### Planned Features
- Advanced analytics dashboard
- Custom quiz categories
- Multi-language support
- Advanced role management
- Integration with other platforms

### API Extensions
- Webhook support for external integrations
- GraphQL API for complex queries
- Real-time notifications via WebSocket
- Mobile app API endpoints

---

## Support and Maintenance

For technical support:
1. Check the troubleshooting guide above
2. Review server logs for error details
3. Verify all configuration values
4. Test individual components separately

The system is designed to be modular and maintainable, with clear separation of concerns between the frontend, backend, and Discord integration components.
