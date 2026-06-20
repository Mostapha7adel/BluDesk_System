@echo off
echo Starting BlueDesk ERP Backend...
start "BlueDesk Backend" /B node src/app.js
timeout /t 3 /nobreak > nul
echo Backend started on http://localhost:5000

echo Starting BlueDesk Frontend...
cd /d "%~dp0bluedesk-frontend"
start "BlueDesk Frontend" /B npm run dev
timeout /t 4 /nobreak > nul
echo Frontend started on http://localhost:5173

echo.
echo ========================================
echo  BlueDesk ERP is running!
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:5000
echo ========================================
echo.
pause
