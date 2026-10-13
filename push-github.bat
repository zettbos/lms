@echo off
echo ========================================================
echo  ZETTBOS LMS - AUTO PUSH TO GITHUB ^& VERCEL
echo ========================================================
git add .
git commit -m "Update LMS Zettbos: Revisi 42 (Format ID Database, Google Drive lh3, Profile Settings, OTP Spam Notice)"
git push origin main
echo ========================================================
echo  SUKSES DI-PUSH KE GITHUB! VERCEL SEDANG AUTO-DEPLOY.
echo ========================================================
pause
