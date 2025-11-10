# Script for creating .env files

Write-Host "Creating .env files..." -ForegroundColor Cyan

# Create .env for API
$apiEnvPath = "apps\api\.env"
if (Test-Path $apiEnvPath) {
    Write-Host "[!] File $apiEnvPath already exists. Skipping..." -ForegroundColor Yellow
} else {
    $apiEnvContent = @"
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booking?schema=public
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-long-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
"@
    $apiEnvContent | Out-File -FilePath $apiEnvPath -Encoding utf8 -NoNewline
    Write-Host "[OK] Created $apiEnvPath" -ForegroundColor Green
}

# Create .env for Web
$webEnvPath = "apps\web\.env"
if (Test-Path $webEnvPath) {
    Write-Host "[!] File $webEnvPath already exists. Skipping..." -ForegroundColor Yellow
} else {
    $webEnvContent = @"
VITE_API_URL=http://localhost:4000
"@
    $webEnvContent | Out-File -FilePath $webEnvPath -Encoding utf8 -NoNewline
    Write-Host "[OK] Created $webEnvPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done! .env files created." -ForegroundColor Green
Write-Host ""
Write-Host "[!] IMPORTANT: Change JWT_SECRET and JWT_REFRESH_SECRET in $apiEnvPath to secure values!" -ForegroundColor Yellow
