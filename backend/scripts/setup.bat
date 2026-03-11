@echo off
echo Void Mod Training Backend Setup
echo ================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found

REM Install dependencies
echo Installing dependencies...
npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit .env file with your Discord credentials!
    echo    - DISCORD_BOT_TOKEN
    echo    - DISCORD_CLIENT_ID
    echo    - DISCORD_CLIENT_SECRET
    echo    - DISCORD_GUILD_ID
    echo    - Role IDs
    echo.
    echo The .env file has been created for you.
    pause
) else (
    echo ✅ .env file already exists
)

REM Run setup wizard
echo.
echo Running setup wizard...
node setup.js
if errorlevel 1 (
    echo ERROR: Setup wizard failed
    pause
    exit /b 1
)

echo.
echo ✅ Setup completed successfully!
echo.
echo Next steps:
echo 1. Edit .env file with your Discord credentials (if not done already)
echo 2. Start the server: npm start
echo 3. Visit http://localhost:3000/health to verify
echo.
pause
