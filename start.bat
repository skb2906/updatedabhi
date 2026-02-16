@echo off
echo ===================================================
echo   Yaha Baat Karo - Starting App...
echo ===================================================

:: 1. Start the Token Server in a new window
echo.
echo [1/2] Starting Token Server...
start "YBK Token Server" cmd /k "cd server && npm install && npm start"

:: 2. Start the Front-end in this window
echo.
echo [2/2] Starting Front-end...
echo.
echo The app will open in your browser shortly!
echo.
call npx vite --host

pause
