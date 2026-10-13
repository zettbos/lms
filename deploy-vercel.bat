@echo off
echo ===================================================
echo   ZETTBOS LMS - VERCEL ONE-CLICK DEPLOY SCRIPT
echo ===================================================
echo.
echo 1. Memeriksa instalasi Vercel CLI...
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Vercel CLI belum terpasang. Menjalankan via npx vercel...
    npx vercel
) else (
    echo [INFO] Menjalankan vercel deploy...
    vercel
)
echo.
echo Deployment selesai!
pause
