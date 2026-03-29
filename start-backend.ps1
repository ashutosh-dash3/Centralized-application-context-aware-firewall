# Start Backend Server Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting Backend Server            " -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Set-Location $PSScriptRoot\backend

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

Write-Host "Starting backend server on http://localhost:5000...`n" -ForegroundColor Green

# Start the server
npm start
