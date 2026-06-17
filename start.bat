@echo off
title StudyNest Local Server
echo ============================================
echo    StudyNest - Local Server
echo ============================================
echo.
echo   Public portal : http://localhost:3000/papers
echo   Admin  portal : http://localhost:3000/login
echo.
echo Both portals will open in your browser automatically
echo once the server is ready. Next.js takes a few seconds
echo to compile the first time, so please wait...
echo.

:: Open BOTH the public and admin portals after the server has had time
:: to boot. This runs in a separate window so it does not block the dev
:: server started below.
start "" cmd /c "timeout /t 8 /nobreak >nul & start http://localhost:3000/papers & start http://localhost:3000/login"

npm run dev
pause
