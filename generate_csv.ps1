# ==============================================================================
# ZETTBOS LMS - GENERATOR CSV WHITELIST UNTUK SUPABASE TABLE EDITOR
# File: generate_csv.ps1
# ==============================================================================

$txtFile = Join-Path $PSScriptRoot "whitelist.txt"
$csvFile = Join-Path $PSScriptRoot "whitelist_members.csv"

if (-not (Test-Path $txtFile)) {
    Write-Host "[ERROR] Berkas whitelist.txt tidak ditemukan di: $txtFile" -ForegroundColor Red
    exit 1
}

Write-Host "Sedang membaca dan memformat 2.318 email dari whitelist.txt..." -ForegroundColor Cyan

$emails = Get-Content $txtFile | Where-Object { $_.Trim() -ne '' }
$lines = [System.Collections.Generic.List[string]]::new()

# Header kolom sesuai skema tabel whitelist_members di Supabase
$lines.Add("id,email,full_name,role,is_active")

$i = 1
foreach ($email in $emails) {
    $cleanEmail = $email.Trim().ToLower()
    $lines.Add("wl-$i,$cleanEmail,Siswa Zettbos,member,true")
    $i++
}

[System.IO.File]::WriteAllLines($csvFile, $lines, [System.Text.Encoding]::UTF8)

Write-Host "==================================================================" -ForegroundColor Green
Write-Host " [SUKSES] Berkas whitelist_members.csv berhasil dibuat!" -ForegroundColor Green
Write-Host " Total Siswa : $($i - 1) email unik terdaftar" -ForegroundColor Yellow
Write-Host " Lokasi File : $csvFile" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Green
