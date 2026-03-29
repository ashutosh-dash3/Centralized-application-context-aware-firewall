# Test Script for Endpoint Firewall System
# This script tests all components and APIs

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Testing Endpoint Firewall System  " -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$backendUrl = "http://localhost:5000"

# Test 1: Backend Health Check
Write-Host "[Test 1] Backend Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get -ErrorAction Stop
    Write-Host "✓ Backend is running" -ForegroundColor Green
    Write-Host "  Response: $($response.message)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend health check failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 2: API Root Endpoint
Write-Host "`n[Test 2] API Root Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/" -Method Get -ErrorAction Stop
    Write-Host "✓ API root accessible" -ForegroundColor Green
    Write-Host "  Version: $($response.version)" -ForegroundColor Gray
} catch {
    Write-Host "✗ API root endpoint failed" -ForegroundColor Red
}

# Test 3: Endpoints List
Write-Host "`n[Test 3] Fetching Endpoints..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/api/endpoints" -Method Get -ErrorAction Stop
    Write-Host "✓ Fetched endpoints successfully" -ForegroundColor Green
    Write-Host "  Total endpoints: $($response.stats.total)" -ForegroundColor Gray
    if ($response.data.Count -gt 0) {
        Write-Host "  First endpoint: $($response.data[0].hostname)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Failed to fetch endpoints" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 4: Logs Statistics
Write-Host "`n[Test 4] Fetching Logs Statistics..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/api/logs/stats" -Method Get -ErrorAction Stop
    Write-Host "✓ Fetched log stats successfully" -ForegroundColor Green
    Write-Host "  Total logs: $($response.data.totalLogs)" -ForegroundColor Gray
    Write-Host "  Anomalies: $($response.data.anomalyLogs)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to fetch log stats" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 5: Recent Logs
Write-Host "`n[Test 5] Fetching Recent Logs..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/api/logs?limit=5" -Method Get -ErrorAction Stop
    Write-Host "✓ Fetched recent logs successfully" -ForegroundColor Green
    Write-Host "  Logs returned: $($response.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to fetch logs" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 6: Policies List
Write-Host "`n[Test 6] Fetching Policies..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/api/policies" -Method Get -ErrorAction Stop
    Write-Host "✓ Fetched policies successfully" -ForegroundColor Green
    Write-Host "  Total policies: $($response.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to fetch policies" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Test Summary                      " -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "All API tests completed!" -ForegroundColor Green
Write-Host "Frontend should be accessible at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`n"
