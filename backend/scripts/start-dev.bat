@echo off
echo Starting Void Mod Training Backend in Development Mode...
echo.

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Edit .env file with your Discord credentials before starting!
    echo.
    pause
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)

REM Start the development server
echo Starting development server...
npm run dev

pause
