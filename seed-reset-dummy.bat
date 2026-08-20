@echo off
setlocal

cd /d "%~dp0"

echo [1/3] prisma migrate reset...
call npx prisma migrate reset --force --skip-seed
if errorlevel 1 goto :err

echo [2/3] prisma generate...
call npx prisma generate
if errorlevel 1 goto :err

echo [3/3] seed dummy data...
node prisma\seed.js
if errorlevel 1 goto :err

echo.
echo DONE.
pause
exit /b 0

:err
echo.
echo FAILED with exit code %errorlevel%
pause
exit /b %errorlevel%

