# Start Frontend Development Server Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting Frontend Dashboard        " -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Set-Location $PSScriptRoot\frontend

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

Write-Host "Starting frontend development server on http://localhost:5173...`n" -ForegroundColor Green

# Start the dev server
npm run dev
