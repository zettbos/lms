@echo off
echo ===================================================
echo   ZETTBOS LMS - PUSH TO GITHUB AUTOMATION
echo ===================================================
echo.

echo 1. Inisialisasi Git Lokal...
git init
git config user.name "Farhan"
git config user.email "farhan@zettbos.com"
git branch -M main

echo.
echo 2. Menambahkan file ke staging...
git add .

echo.
echo 3. Membuat Commit...
git commit -m "feat: initial release lms zettbos production with supabase"

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
