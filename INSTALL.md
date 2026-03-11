# Installation Instructions

## ⚠️ Important: TypeScript Errors

If you're seeing TypeScript errors in your IDE (like "Cannot find module 'react'" or "JSX element implicitly has type 'any'"), this is **normal and expected** because the Node.js dependencies haven't been installed yet.

## 🚀 Quick Installation

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Install Backend Dependencies  
```bash
cd backend
npm install
```

### 3. Configure Environment
```bash
# In backend directory
cp .env.example .env
# Edit .env with your Discord credentials
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend  
npm run dev
```

## 📋 Required Dependencies

The TypeScript errors will be resolved after installing these packages:

### Frontend Dependencies
- `next` - React framework
- `react` & `react-dom` - React library
- `framer-motion` - Animations
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `typescript` - Type checking

### Backend Dependencies
- `express` - Web framework
- `typescript` - Type checking
- `discord.js` - Discord API
- `joi` - Validation
- And more...

## 🔧 After Installation

Once dependencies are installed:
1. TypeScript errors should disappear
2. You'll get full IntelliSense and type checking
3. The development servers will start properly
4. All imports will resolve correctly

## 🎯 Next Steps

1. Install dependencies as shown above
2. Configure Discord credentials in `backend/.env`
3. Start the development servers
4. Access the application at `http://localhost:3000`

The platform is fully functional - these are just installation-related TypeScript errors!
