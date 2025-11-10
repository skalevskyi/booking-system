# Script to check Docker installation
Write-Host "Checking Docker installation..." -ForegroundColor Cyan

try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Docker installed: $dockerVersion" -ForegroundColor Green
        
        try {
            $composeVersion = docker compose version 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Docker Compose installed: $composeVersion" -ForegroundColor Green
                Write-Host "`nYou can use: npm run docker:up" -ForegroundColor Yellow
                exit 0
            }
        } catch {
            Write-Host "[ERROR] Docker Compose not found" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "[ERROR] Docker is not installed or not available in PATH" -ForegroundColor Red
    Write-Host "`nSolutions:" -ForegroundColor Yellow
    Write-Host "1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host "2. Or install PostgreSQL locally (see README.md, Option B)" -ForegroundColor White
    exit 1
}
