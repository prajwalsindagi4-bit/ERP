@echo off
title Mini ERP + CRM System
echo =======================================================
echo           Starting Mini ERP + CRM System...
echo =======================================================
echo.

echo [1/2] Starting Backend Server...
start "ERP Backend (Node.js)" cmd /c "cd server && npm run dev"

echo [2/2] Starting Frontend Client...
start "ERP Frontend (Vite)" cmd /c "cd client && npm run dev"

echo.
echo =======================================================
echo Both servers have been launched in separate windows!
echo.
echo Backend API : http://localhost:5000
echo Frontend UI : http://localhost:5173
echo.
echo You can safely close this terminal.
echo =======================================================
pause
