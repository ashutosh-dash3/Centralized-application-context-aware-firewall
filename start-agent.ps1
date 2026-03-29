# Start Agent Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting Endpoint Agent            " -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Set-Location $PSScriptRoot\agent

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

Write-Host "Starting endpoint agent...`n" -ForegroundColor Green

# Start the agent
npm start
