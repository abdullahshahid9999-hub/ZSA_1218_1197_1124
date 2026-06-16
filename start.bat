@echo off
title StudyNest Local Server
echo Starting StudyNest Local Server...
echo The admin portal will be available at http://localhost:3000/login
echo The public portal will be available at http://localhost:3000/papers

echo.
echo Please wait while the server starts. Next.js takes a few seconds to compile initially...
echo (If the terminal seems stuck, press "Enter" to make sure it's not paused)
echo.

:: Automatically open the default browser after a short delay (gives Next.js time to boot)
start http://localhost:3000/papers

npm run dev
pause
