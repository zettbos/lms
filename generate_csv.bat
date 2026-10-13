@echo off
echo ==================================================================
echo   ZETTBOS LMS - GENERATOR CSV WHITELIST UNTUK SUPABASE
echo ==================================================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0generate_csv.ps1"
echo.
pause
