# Quick Start Script for Endpoint Firewall System
# This script helps you set up and run all components

Write-Host "==============================================`n" -ForegroundColor Cyan
Write-Host "   Endpoint Firewall Management System      `n" -ForegroundColor Cyan
Write-Host "==============================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please download and install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if MongoDB is installed
Write-Host "`n[2/5] Checking MongoDB installation..." -ForegroundColor Yellow
try {
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService) {
        if ($mongoService.Status -eq "Running") {
            Write-Host "✓ MongoDB service is running" -ForegroundColor Green
        } else {
            Write-Host "⚠ MongoDB service is installed but not running. Starting..." -ForegroundColor Yellow
            Start-Service -Name "MongoDB"
            Write-Host "✓ MongoDB started successfully" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠ MongoDB service not found. Please ensure MongoDB is installed and running." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not check MongoDB status. Please ensure MongoDB is running manually." -ForegroundColor Yellow
}

# Install backend dependencies
Write-Host "`n[3/5] Setting up Backend..." -ForegroundColor Yellow
Set-Location backend
if (Test-Path "node_modules") {
    Write-Host "✓ Backend dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Backend setup complete" -ForegroundColor Green
    } else {
        Write-Host "✗ Backend setup failed" -ForegroundColor Red
    }
}

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file from template" -ForegroundColor Green
}
Set-Location ..

# Install agent dependencies
Write-Host "`n[4/5] Setting up Agent..." -ForegroundColor Yellow
Set-Location agent
if (Test-Path "node_modules") {
    Write-Host "✓ Agent dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "Installing agent dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Agent setup complete" -ForegroundColor Green
    } else {
        Write-Host "✗ Agent setup failed" -ForegroundColor Red
    }
}

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file from template" -ForegroundColor Green
}
Set-Location ..

# Install frontend dependencies
Write-Host "`n[5/5] Setting up Frontend..." -ForegroundColor Yellow
Set-Location frontend
if (Test-Path "node_modules") {
    Write-Host "✓ Frontend dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend setup complete" -ForegroundColor Green
    } else {
        Write-Host "✗ Frontend setup failed" -ForegroundColor Red
    }
}

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file from template" -ForegroundColor Green
}
Set-Location ..

Write-Host "`n==============================================`n" -ForegroundColor Cyan
Write-Host "   Setup Complete!                            `n" -ForegroundColor Green
Write-Host "==============================================`n" -ForegroundColor Cyan

Write-Host "`nNext Steps:`n" -ForegroundColor Yellow
Write-Host "1. Start Backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Cyan
Write-Host "`n2. Start Agent (new terminal):" -ForegroundColor White
Write-Host "   cd agent" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Cyan
Write-Host "`n3. Start Frontend (new terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host "`n4. Open browser: http://localhost:5173`n" -ForegroundColor Cyan

Write-Host "Or use the start-*.ps1 scripts for individual components.`n" -ForegroundColor Yellow
