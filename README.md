# Void Mod Training Platform

A comprehensive esports moderator training system with modern React frontend and Node.js backend, featuring Discord integration preparation and optional Supabase database support.

## 🚀 Features

### Frontend (React)
- **Premium Dark UI**: Futuristic purple neon theme with glassmorphism effects
- **Interactive Dashboard**: Modern sidebar navigation with animated transitions
- **Training Modules**: Comprehensive moderator training with exact content
- **Internal Quiz System**: 10-question certification quiz with automatic grading
- **Certification Management**: Track and display user achievements
- **Admin Panel**: Manage trainees and view analytics
- **Responsive Design**: Works seamlessly on desktop and mobile

### Backend (Node.js)
- **RESTful API**: Clean, well-documented endpoints
- **Quiz System**: Question generation, grading, and attempt tracking
- **User Management**: Profile management and certification tracking
- **Admin Analytics**: Statistics and trainee management
- **Rate Limiting**: Protection against abuse
- **Security**: Input validation and error handling

### Integration Ready
- **Discord Bot**: Prepared structure for role assignment
- **Supabase**: Optional database integration
- **Scalable Architecture**: Modular design for easy expansion

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first styling with custom purple theme
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library
- **Supabase Client** - Optional database integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Rate Limiting** - Abuse prevention
- **Helmet.js** - Security headers
- **Discord.js Ready** - Prepared for bot integration

## 📋 Project Structure

```
void-mod-training/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── styles/         # Global styles
│   ├── public/
│   └── package.json
├── backend/                 # Node.js API
│   ├── routes/            # API routes
│   ├── services/          # Business logic (prepared)
│   ├── discord/           # Discord integration (prepared)
│   ├── quiz/              # Quiz system
│   └── server.js
├── README.md
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials (optional)
npm start
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

The backend API will be available at `http://localhost:3001`

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
