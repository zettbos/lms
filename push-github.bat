@echo off
echo ===================================================
echo   ZETTBOS LMS - PUSH TO GITHUB AUTOMATION
echo ===================================================
echo.

echo 1. Inisialisasi Git Lokal...
git init
git config user.name "Zettbos Admin"
git config user.email "zettbos2025@gmail.com"
git branch -M main

echo.
echo 2. Menambahkan file ke staging...
git add .

echo.
git commit -m "feat: replace whitelist with 2318 students, update cache version v31, seed supabase"

echo.
echo 4. Menghubungkan remote GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/zettbos/lms.git

echo.
echo 5. Melakukan Push ke branch main...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [INFO] Jika ditolak karena ada file README di GitHub, mencoba push force...
    git push -u origin main --force
)

echo.
echo ===================================================
echo   Push ke GitHub Selesai!
echo ===================================================
pause
