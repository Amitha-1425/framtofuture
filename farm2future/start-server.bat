@echo off
cd /d "%~dp0"
echo Starting Farm2Future 3D server...
echo.
echo Open this in your browser:  http://localhost:3000
echo.
echo Press Ctrl+C to stop the server.
echo.
start http://localhost:3000
npx serve . -p 3000
