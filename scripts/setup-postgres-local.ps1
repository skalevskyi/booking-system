# Script to help set up PostgreSQL locally on Windows
Write-Host "PostgreSQL Local Setup Helper" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking for PostgreSQL installation..." -ForegroundColor Yellow
try {
    $psqlVersion = psql --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] PostgreSQL found: $psqlVersion" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Create database: psql -U postgres -c 'CREATE DATABASE booking;'" -ForegroundColor White
        Write-Host "2. Copy backend/.env.example to backend/.env" -ForegroundColor White
        Write-Host "3. Update DATABASE_URL in backend/.env with your PostgreSQL credentials" -ForegroundColor White
        Write-Host "4. Run: cd backend && npm run prisma:generate && npm run prisma:migrate" -ForegroundColor White
        exit 0
    }
} catch {
    Write-Host "[INFO] PostgreSQL not found in PATH" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "PostgreSQL Installation Options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Download PostgreSQL Installer" -ForegroundColor Yellow
Write-Host "  https://www.postgresql.org/download/windows/" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Use EnterpriseDB Installer (Recommended)" -ForegroundColor Yellow
Write-Host "  https://www.enterprisedb.com/downloads/postgres-postgresql-downloads" -ForegroundColor White
Write-Host ""
Write-Host "During installation:" -ForegroundColor Yellow
Write-Host "  - Port: 5432 (default)" -ForegroundColor White
Write-Host "  - Superuser password: postgres (or your choice)" -ForegroundColor White
Write-Host "  - Make sure to add PostgreSQL to PATH" -ForegroundColor White
Write-Host ""
Write-Host "After installation:" -ForegroundColor Yellow
Write-Host "  1. Restart PowerShell" -ForegroundColor White
Write-Host "  2. Run this script again" -ForegroundColor White
Write-Host "  3. Create database: psql -U postgres -c 'CREATE DATABASE booking;'" -ForegroundColor White
Write-Host "  4. Copy backend/.env.example to backend/.env and update DATABASE_URL" -ForegroundColor White


