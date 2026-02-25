# Check Products Script
Write-Host "=== Riders Forge - Product Check ===" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "1. Checking if backend is running..." -ForegroundColor Yellow
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/products" -Method GET -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        $backendRunning = $true
        $productData = $response.Content | ConvertFrom-Json
        Write-Host "   ✓ Backend is running" -ForegroundColor Green
        Write-Host "   ✓ Found $($productData.Count) products in API" -ForegroundColor Green
        Write-Host ""
        Write-Host "   First 5 products:" -ForegroundColor Cyan
        $productData | Select-Object -First 5 | ForEach-Object {
            Write-Host "   - $($_.name) (ID: $($_.id))" -ForegroundColor White
        }
    }
} catch {
    Write-Host "   ✗ Backend is NOT running or not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. To fix the issue:" -ForegroundColor Yellow
if (-not $backendRunning) {
    Write-Host "   a) Start the backend:" -ForegroundColor White
    Write-Host "      cd backend" -ForegroundColor Gray
    Write-Host "      npm run start:dev" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "   b) Run the seed script to populate products:" -ForegroundColor White
Write-Host "      cd backend" -ForegroundColor Gray
Write-Host "      npm run seed" -ForegroundColor Gray
Write-Host ""

Write-Host "   c) Check browser console (F12) for:" -ForegroundColor White
Write-Host "      'Loaded X products from backend'" -ForegroundColor Gray
Write-Host ""

Write-Host "   d) Hard refresh browser: Ctrl+Shift+R" -ForegroundColor White
Write-Host ""






