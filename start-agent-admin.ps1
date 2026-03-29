# 🚀 Endpoint Firewall - Quick Start Script
# Run this PowerShell script as Administrator

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║   Endpoint Firewall - Starting...                        ║" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole( `
    [Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: Not running as Administrator!" -ForegroundColor Red
    Write-Host "`n🔧 Please restart PowerShell as Administrator:" -ForegroundColor Yellow
    Write-Host "   1. Right-click PowerShell icon" -ForegroundColor Yellow
    Write-Host "   2. Select 'Run as administrator'" -ForegroundColor Yellow
    Write-Host "   3. Run this script again`n" -ForegroundColor Yellow
    
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green

# Set location
Set-Location "c:\Users\ashut\OneDrive\Desktop\Final Project\agent"

Write-Host "`n📦 Checking dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
}

Write-Host "`n🔥 Starting Endpoint Firewall Agent..." -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop`n" -ForegroundColor Gray

# Start the agent
npm start
