# Void Mod Training Backend

A comprehensive backend system for the Void Esports Moderator Training website with Discord bot integration.

## Features

- **Discord OAuth2 Authentication**: Secure login using Discord accounts
- **Automated Quiz System**: 29-question certification quiz with internal fallback
- **Google Forms Integration**: Optional integration with existing Google Forms quiz
- **Automatic Role Assignment**: Assign Discord roles upon quiz completion
- **Rate Limiting & Security**: Built-in protection against abuse
- **SQLite Database**: Lightweight, reliable data storage
- **RESTful API**: Clean, well-documented API endpoints

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your Discord credentials:

```env
# Discord Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
DISCORD_GUILD_ID=your_discord_guild_id_here
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback

# Discord Role IDs
ROLE_TRIAL_MOD_ID=your_trial_mod_role_id_here
ROLE_STAFF_ACCESS_ID=your_staff_access_role_id_here
ROLE_TICKET_SUPPORT_ID=your_ticket_support_role_id_here

# Server Configuration
PORT=3000
SESSION_SECRET=your_session_secret_here

# Frontend URL
FRONTEND_URL=http://localhost:5500
```

### 3. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3000`

## Discord Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Add a bot to the application
4. Copy the Bot Token and Client ID to your `.env`

### 2. Configure OAuth2

1. In your Discord application, go to "OAuth2" → "General"
2. Add a redirect URI: `http://localhost:3000/auth/discord/callback`
3. Set scopes: `identify`, `guilds.join`

### 3. Get Role IDs

1. Enable Developer Mode in Discord (Settings → Advanced)
2. Right-click on the roles in your server and "Copy ID"
3. Add the role IDs to your `.env`

### 4. Invite Bot to Server

Generate an invite link with these permissions:
- `Manage Roles`
- `Read Messages/View Channels`
- `Send Messages`
- `Embed Links`
- `Read Message History`

## API Endpoints

### Authentication

- `GET /auth/discord` - Initiate Discord OAuth
- `GET /auth/discord/callback` - OAuth callback
- `GET /auth/logout` - Logout user
- `GET /api/user` - Get current user info

### Quiz System

- `POST /api/quiz/generate` - Generate new quiz
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/history` - Get user's quiz history
- `GET /api/quiz/latest` - Get latest quiz attempt
- `GET /api/quiz/can-retake` - Check if user can retake quiz

### Verification System

- `POST /api/verify/quiz-completion` - Verify quiz and assign roles
- `GET /api/verify/status` - Check verification status
- `POST /api/verify/manual` - Manual role assignment (admin)
- `POST /api/verify/revoke` - Revoke roles (admin)

### System

- `GET /health` - Health check and service status

## Quiz System

### Internal Quiz (Default)

The backend includes a comprehensive quiz system with 29 questions covering:

- **Ticket Types** (5 questions)
- **Roster Categories** (8 questions)  
- **Moderator Commands** (4 questions)
- **Performance Metrics** (3 questions)
- **Guidelines** (6 questions)
- **Role Instructions** (3 questions)

### Google Forms Integration (Optional)

If you have an existing Google Forms quiz:

1. Set up Google Service Account credentials
2. Add `GOOGLE_SHEET_ID` to your `.env`
3. Place credentials file at `./credentials.json`
4. The system will automatically sync responses

## Role Assignment

When a user passes the quiz (20/29 correct), the system automatically assigns:

- **Trial Mod** - Entry-level moderator role
- **Staff Access** - Access to staff channels
- **Ticket Support** - Permission to handle tickets

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Session Management**: Secure session handling
- **CORS Protection**: Configurable cross-origin requests
- **Helmet.js**: Security headers and protections
- **Input Validation**: Comprehensive input sanitization

## Database Schema

### Users Table
- Discord user information
- OAuth tokens
- Login tracking

### Quiz Attempts Table
- Quiz scores and results
- Attempt timestamps
- Pass/fail status

### Role Assignments Table
- Role assignment history
- Assignment source (quiz/manual)
- Timestamps

### Quiz Questions Table
- 29 default questions
- Categorized by training section
- Multiple choice format

## Development

### Project Structure

```
backend/
├── server.js              # Main server file
├── config.js              # Configuration management
├── database.js            # SQLite database operations
├── discordBot.js          # Discord bot implementation
├── auth/
│   └── discordAuth.js     # Discord OAuth strategy
├── routes/
│   ├── quiz.js           # Quiz API routes
│   └── verify.js         # Verification API routes
├── services/
│   ├── discordService.js  # Discord role management
│   ├── quizService.js     # Quiz logic and scoring
│   └── googleFormsService.js # Google Forms integration
└── package.json
```

### Adding New Questions

```javascript
// Use the API to add questions
POST /api/quiz/questions
{
  "category": "Ticket Types",
  "question": "What is the primary purpose of a General Ticket?",
  "options": [
    "User applications",
    "Community support inquiries",
    "Staff communications",
    "Tournament registrations"
  ],
  "correctAnswer": 1,
  "explanation": "General Tickets are for community support..."
}
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_BOT_TOKEN` | Discord bot token | Yes |
| `DISCORD_CLIENT_ID` | Discord application ID | Yes |
| `DISCORD_CLIENT_SECRET` | Discord application secret | Yes |
| `DISCORD_GUILD_ID` | Discord server ID | Yes |
| `ROLE_TRIAL_MOD_ID` | Trial Mod role ID | Yes |
| `ROLE_STAFF_ACCESS_ID` | Staff Access role ID | Yes |
| `ROLE_TICKET_SUPPORT_ID` | Ticket Support role ID | Yes |
| `SESSION_SECRET` | Session encryption secret | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |
| `GOOGLE_SHEET_ID` | Google Sheet ID (optional) | No |
| `GOOGLE_CREDENTIALS_PATH` | Google credentials path (optional) | No |

## Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "services": {
    "database": "connected",
    "discordBot": "connected",
    "googleForms": "available"
  }
}
```

### Logs

The server provides detailed logging for:
- Authentication attempts
- Quiz submissions
- Role assignments
- API requests
- Errors and warnings

## Deployment

### Production Setup

1. Set `NODE_ENV=production`
2. Use HTTPS for Discord redirect URI
3. Configure reverse proxy (nginx/Apache)
4. Set up process manager (PM2/systemd)
5. Configure database backups

### Docker Support

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **"Discord bot not connected"**
   - Check bot token in `.env`
   - Verify bot is invited to server
   - Check bot permissions

2. **"Role assignment failed"**
   - Verify role IDs in `.env`
   - Check bot has "Manage Roles" permission
   - Ensure user is in the server

3. **"Google Forms not available"**
   - Check credentials file path
   - Verify Google Service Account setup
   - Ensure Sheet ID is correct

4. **"Database connection failed"**
   - Check file permissions
   - Verify database path
   - Ensure SQLite is installed

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## Support

For issues and questions:
1. Check the logs for error details
2. Verify all environment variables are set
3. Ensure Discord bot has proper permissions
4. Test API endpoints individually

---

**Void Esports Moderator Training System**  
*Automating moderator certification with Discord integration*
