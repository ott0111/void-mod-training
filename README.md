# Void Mod Training Platform

An enterprise-level esports moderator training and certification platform built with modern full-stack TypeScript architecture. Features a premium UI inspired by Stripe, Linear, and Vercel with Discord integration and comprehensive quiz system.

## 🚀 Features

### Frontend (Next.js 14)
- **Enterprise UI**: Premium dark futuristic design with purple gradient theme
- **Glassmorphism**: Modern glass UI panels with backdrop blur effects
- **Framer Motion**: Smooth animations and micro-interactions
- **Discord Verification**: Server membership validation before quiz access
- **Interactive Quiz**: 10-question certification with premium card UI
- **Training Modules**: 8 comprehensive moderator training modules
- **Responsive Design**: Fully responsive across all devices
- **TypeScript**: Full type safety throughout the application

### Backend (Express.js)
- **TypeScript Backend**: Modern Express.js with full type safety
- **Discord API Integration**: Real Discord server verification
- **Quiz System**: Question generation, grading, and attempt tracking
- **Rate Limiting**: Advanced protection against spam and abuse
- **Security**: Input validation, CORS, and security headers
- **Modular Architecture**: Clean separation of concerns
- **API Documentation**: Well-structured RESTful endpoints

### Integration Features
- **Discord Bot Ready**: Complete role assignment system
- **Supabase Support**: Optional database integration prepared
- **JWT Authentication**: Secure session management
- **Admin Dashboard**: Trainee management and analytics

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling with custom purple theme
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library
- **Supabase Client** - Optional database integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework with TypeScript
- **Discord.js** - Discord API integration
- **JWT** - Authentication and session management
- **Joi** - Input validation
- **Winston** - Logging system
- **Rate Limiting** - Abuse prevention

## 📋 Project Structure

```
void-mod-training/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   │   ├── page.tsx    # Landing page
│   │   │   ├── verification/ # Discord verification
│   │   │   ├── quiz/        # Certification quiz
│   │   │   ├── training/    # Training modules
│   │   │   ├── layout.tsx   # Root layout
│   │   │   └── globals.css  # Global styles
│   │   ├── components/      # Reusable UI components
│   │   ├── ui/             # UI primitives
│   │   ├── animations/     # Animation utilities
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── styles/         # Style utilities
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── next.config.js
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── server.ts       # Main server file
│   │   ├── routes/         # API routes
│   │   │   ├── auth.ts     # Authentication
│   │   │   ├── discord.ts  # Discord verification
│   │   │   ├── quiz.ts     # Quiz system
│   │   │   ├── training.ts # Training content
│   │   │   └── admin.ts    # Admin dashboard
│   │   ├── services/       # Business logic
│   │   ├── discord/        # Discord integration
│   │   ├── quiz/           # Quiz questions & logic
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── shared/                  # Shared TypeScript types
│   └── types/
│       └── index.ts        # Type definitions
├── README.md
└── .gitignore
```

## 🚀 Quick Start

### ⚠️ Important Note
If you see TypeScript errors in your IDE (like "Cannot find module 'react'"), this is **normal** - the dependencies just need to be installed first. See [INSTALL.md](./INSTALL.md) for detailed instructions.

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Discord Bot Token (for verification)

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend  
cd ../backend
npm install
```

### 2. Configure Environment

```bash
# In backend directory
cp .env.example .env
# Edit .env with your Discord credentials
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### Discord Configuration

1. **Create Discord Application**
   - Go to Discord Developer Portal
   - Create new application with bot
   - Enable Server Members Intent

2. **Environment Variables**
```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_server_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
```

3. **Role IDs (Optional)**
```env
ROLE_TRIAL_MOD_ID=trial_mod_role_id
ROLE_STAFF_ACCESS_ID=staff_access_role_id
ROLE_TICKET_SUPPORT_ID=ticket_support_role_id
```

## 📚 Training Content

The platform includes exact moderator training content:

### Training Modules
1. **Program Overview** - Introduction and requirements
2. **Ticket Types** - General and Roster ticket handling
3. **Roster Categories** - Requirements for all Void Esports roles
4. **Mod Commands** - Warning, reporting, and LOA procedures
5. **Performance Metrics** - Weekly activity requirements
6. **Guidelines** - Professional communication standards
7. **Role Instructions** - Specific responses for each role type
8. **Closing Tickets** - Final steps and role assignment

### LOA Format
```
User : ———-
Role : ———-
Start Time : ———-
End Time : ———-
Reason : ———-
```

### Quiz System
- **10 questions** generated from training content
- **Randomized order** and answer options
- **7 correct answers** required to pass (70%)
- **24-hour cooldown** for failed attempts
- **Automatic grading** and feedback

## 🔧 Configuration

### Frontend Environment Variables
```env
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
REACT_APP_API_URL=http://localhost:3001
```

### Backend Environment Variables
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_GUILD_ID=your-discord-guild-id
ROLE_TRIAL_MOD_ID=trial-mod-role-id
ROLE_STAFF_ACCESS_ID=staff-access-role-id
ROLE_TICKET_SUPPORT_ID=ticket-support-role-id
```

## 🎯 User Flow

1. **Dashboard** - Overview and quick actions
2. **Training Modules** - Study all training materials
3. **Quiz** - Take certification quiz (7/10 to pass)
4. **Certification** - View achievements and download certificate
5. **Admin Panel** - Manage trainees (admin only)

## 🤖 Discord Integration (Prepared)

The system is prepared for Discord bot integration:

### Role Assignment Structure
```javascript
const DISCORD_ROLES = {
  trial_mod: process.env.ROLE_TRIAL_MOD_ID,
  staff_access: process.env.ROLE_STAFF_ACCESS_ID,
  ticket_support: process.env.ROLE_TICKET_SUPPORT_ID
};
```

### API Endpoints Ready
- `POST /api/discord/assign-roles` - Assign roles to user
- `POST /api/discord/remove-roles` - Remove roles from user
- `GET /api/discord/user-roles/:userId` - Get user's current roles
- `POST /api/discord/notify` - Send notification to user

### Implementation Steps
1. Set up Discord application and bot
2. Configure environment variables
3. Implement Discord.js bot logic
4. Connect role assignment to quiz completion

## 📊 Supabase Integration (Optional)

The platform supports Supabase for database functionality:

### Tables Structure
```sql
users
- id (uuid, primary key)
- email (text)
- full_name (text)
- role (text)
- created_at (timestamp)
- updated_at (timestamp)

quiz_attempts
- id (uuid, primary key)
- user_id (uuid, foreign key)
- score (integer)
- total_questions (integer)
- passed (boolean)
- answers (json)
- created_at (timestamp)

certifications
- id (uuid, primary key)
- user_id (uuid, foreign key)
- quiz_id (uuid)
- score (integer)
- certificate_id (text)
- created_at (timestamp)
```

## 🎨 UI Features

### Design System
- **Purple Gradient Palette**: #6d28d9, #7c3aed, #8b5cf6, #a78bfa, #c4b5fd
- **Glassmorphism**: Blur effects with transparent backgrounds
- **Neon Glow Effects**: Animated purple glows on interactive elements
- **Smooth Animations**: Page transitions, hover effects, and micro-interactions

### Components
- **Sidebar Navigation**: Collapsible navigation with active indicators
- **Glass Cards**: Modern card design with blur effects
- **Gradient Borders**: Animated gradient borders on elements
- **Particle System**: Floating background particles for depth
- **Loading States**: Smooth loading animations

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive sanitization
- **CORS Protection**: Configurable cross-origin requests
- **Security Headers**: Helmet.js protection
- **Environment Variables**: Secure configuration management

## 📈 Analytics & Monitoring

### Admin Panel Features
- **Trainee Management**: View all users and their progress
- **Quiz Statistics**: Pass rates, category performance, difficulty analysis
- **Certification Tracking**: Monitor issued certifications
- **Export Data**: CSV export for trainees, attempts, and certifications
- **Real-time Stats**: Active users, recent activity

### Metrics Tracked
- Quiz completion rates
- Pass/fail percentages
- Category-wise performance
- Time to complete quizzes
- User engagement metrics
- Certification issuance

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the build/ folder to your hosting service
```

### Backend Deployment
```bash
cd backend
npm start
# Configure your reverse proxy to point to port 3001
```

### Environment Setup
- **Development**: Use `.env` files for configuration
- **Production**: Set environment variables directly
- **Security**: Never commit sensitive data to version control

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
1. Check the troubleshooting section
2. Review the API documentation
3. Verify environment configuration
4. Check console logs for errors

---

**Void Esports Moderator Training Platform**  
*Professional. Comprehensive. Modern.*
