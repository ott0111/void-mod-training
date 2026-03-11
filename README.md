# Void Mod Training

A comprehensive esports moderator training system with Discord integration for Void Esports.

## 🚀 Features

### Frontend
- **Premium Dark UI**: Futuristic purple neon theme with glowing borders and smooth animations
- **Interactive Dashboard**: Modern sidebar navigation with organized content sections
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Glassmorphism Effects**: Advanced UI with blur effects and depth
- **Animated Elements**: Floating particles, gradient shifts, and smooth transitions

### Backend
- **Discord OAuth2 Authentication**: Secure login using Discord accounts
- **Automated Quiz System**: 29-question certification quiz with automatic grading
- **Role Assignment**: Automatic Discord role assignment upon quiz completion
- **SQLite Database**: Lightweight, reliable data storage for user progress
- **Google Forms Integration**: Optional integration with existing Google Forms quiz
- **RESTful API**: Clean, well-documented API endpoints

### Discord Integration
- **Discord Bot**: Automated role management and user notifications
- **Slash Commands**: `/verify`, `/quiz-status`, `/mod-help`
- **DM Notifications**: Automatic messages for quiz results
- **Role Management**: Assigns Trial Mod, Staff Access, and Ticket Support roles

## 📋 Training Sections

1. **Overview**: Program introduction and training path
2. **Ticket Types**: General and Roster ticket handling protocols
3. **Roster Categories**: Requirements for all Void Esports roles
4. **Mod Commands**: Warning, reporting, and LOA procedures
5. **Performance Metrics**: Weekly activity requirements
6. **Guidelines**: Professional communication standards
7. **Role Instructions**: Specific responses for each role type
8. **Closing Tickets**: Final steps and role assignment
9. **Certification**: Quiz completion and certification

## 🛠 Tech Stack

### Frontend
- **HTML5**, **Tailwind CSS**, **Vanilla JavaScript**
- **Custom Purple Theme**: Advanced gradient system with animations
- **Glassmorphism UI**: Modern blur effects and depth

### Backend
- **Node.js**, **Express.js**, **Discord.js**
- **SQLite Database**: User data and quiz results
- **Passport.js**: Discord OAuth2 authentication
- **Rate Limiting**: Security and abuse prevention

### Integration
- **Google Forms API**: Optional quiz integration
- **Discord Bot API**: Role management and notifications
- **REST API**: Clean endpoint design

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Discord server with bot permissions
- Discord Developer Portal application

### Frontend Only (Quick Demo)
```bash
# Open the website directly
open index.html
# or serve with a simple web server
npx serve .
```

### Full System (Backend + Frontend)
```bash
# Clone the repository
git clone <repository-url>
cd void-mod-training

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your Discord credentials

# Run setup wizard
node setup.js

# Start the server
npm start
```

### Environment Configuration
```env
# Discord Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_GUILD_ID=your_discord_guild_id

# Discord Role IDs
ROLE_TRIAL_MOD_ID=your_trial_mod_role_id
ROLE_STAFF_ACCESS_ID=your_staff_access_role_id
ROLE_TICKET_SUPPORT_ID=your_ticket_support_role_id

# Server Configuration
PORT=3000
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:5500
```

## 📊 Project Structure

```
void-mod-training/
├── index.html                 # Frontend dashboard
├── README.md                  # This file
├── .gitignore                 # Git ignore file
├── INTEGRATION_GUIDE.md       # Detailed integration guide
├── backend/                   # Backend server
│   ├── server.js              # Main server file
│   ├── config.js              # Configuration management
│   ├── database.js            # SQLite database operations
│   ├── discordBot.js          # Discord bot implementation
│   ├── package.json           # Backend dependencies
│   ├── .env.example           # Environment template
│   ├── auth/
│   │   └── discordAuth.js     # Discord OAuth strategy
│   ├── routes/
│   │   ├── quiz.js           # Quiz API routes
│   │   └── verify.js         # Verification API routes
│   ├── services/
│   │   ├── discordService.js  # Discord role management
│   │   ├── quizService.js     # Quiz logic and scoring
│   │   └── googleFormsService.js # Google Forms integration
│   ├── scripts/
│   │   ├── setup.bat         # Windows setup script
│   │   └── start-dev.bat     # Development start script
│   └── setup.js              # Setup wizard
├── api/                      # Legacy placeholder files
├── services/                 # Legacy placeholder files
└── discord/                  # Legacy placeholder files
```

## 🎯 User Flow

1. **Discord Login**: User authenticates via Discord OAuth2
2. **Study Training**: User reviews all training materials on website
3. **Take Quiz**: 29-question certification quiz (20/29 to pass)
4. **Automatic Role Assignment**: Bot assigns Discord roles if passed
5. **Notification**: User receives DM with results and welcome message

## 🤖 Discord Setup

### 1. Create Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Add a bot with "Manage Roles" permission
4. Copy bot token and client ID to `.env`

### 2. Configure OAuth2
1. Set redirect URI: `http://localhost:3000/auth/discord/callback`
2. Add scopes: `identify`, `guilds.join`

### 3. Get Role IDs
1. Enable Developer Mode in Discord
2. Right-click roles and "Copy ID"
3. Add role IDs to `.env`

### 4. Invite Bot to Server
Generate invite link with permissions:
- Manage Roles
- Read Messages/View Channels
- Send Messages
- Embed Links

## 📝 API Endpoints

### Authentication
- `GET /auth/discord` - Initiate Discord OAuth
- `GET /api/user` - Get current user info

### Quiz System
- `POST /api/quiz/generate` - Generate new quiz
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/history` - Get quiz history

### Verification
- `POST /api/verify/quiz-completion` - Verify and assign roles
- `GET /api/verify/status` - Check verification status

### System
- `GET /health` - Health check and service status

## 🔧 Development

### Frontend Development
```bash
# Serve frontend with hot reload
npx serve .

# Or use any web server
python -m http.server 5500
```

### Backend Development
```bash
cd backend
npm run dev  # Development with nodemon
npm start    # Production
```

### Scripts
```bash
# Setup wizard (backend)
node setup.js

# Windows setup scripts
cd backend/scripts
setup.bat      # Complete setup
start-dev.bat  # Start development server
```

## 📊 Quiz System

### Internal Quiz (Default)
- **29 questions** covering all training sections
- **Randomized order** and answer options
- **20/29 correct answers** to pass
- **24-hour cooldown** for failed attempts
- **Detailed analytics** and history tracking

### Categories
- Ticket Types (5 questions)
- Roster Categories (8 questions)
- Mod Commands (4 questions)
- Performance Metrics (3 questions)
- Guidelines (6 questions)
- Role Instructions (3 questions)

### Google Forms Integration (Optional)
- Automatic response retrieval
- Sync with internal database
- Fallback to internal quiz system

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Session Security**: Encrypted session storage
- **Input Validation**: Comprehensive sanitization
- **CORS Protection**: Configurable cross-origin requests
- **Helmet.js**: Security headers and protections

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### Logging
- Authentication attempts
- Quiz submissions and scores
- Role assignments
- API errors and warnings
- Discord bot status

## 🚀 Deployment

### Production Setup
```bash
# Set production environment
NODE_ENV=production

# Use process manager
npm install -g pm2
pm2 start backend/server.js --name "void-mod-training"

# Setup reverse proxy (nginx)
# Configure SSL certificate
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
COPY index.html .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the [Integration Guide](./INTEGRATION_GUIDE.md)
2. Review the troubleshooting section
3. Check server logs for error details
4. Verify Discord bot permissions

## 🎯 Certification

Complete all training sections and pass the quiz (20/29 correct) to become a certified Void Esports moderator with automatic Discord role assignment.

---

**Void Esports Moderator Training System**  
*Professional. Comprehensive. Automated.*
