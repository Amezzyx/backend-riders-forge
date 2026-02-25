Write-Host "Creating PostgreSQL database 'riders_forge'..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Please enter your PostgreSQL password when prompted." -ForegroundColor Yellow
Write-Host ""

# Try to run psql
try {
    $env:PGPASSWORD = Read-Host "Enter PostgreSQL password for user 'postgres'" -AsSecureString
    $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($env:PGPASSWORD))
    $env:PGPASSWORD = $password
    
    psql -U postgres -c "CREATE DATABASE riders_forge;"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Database created successfully!" -ForegroundColor Green
        Write-Host "You can now run: npm run seed" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Failed to create database. Trying alternative method..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Please run this command manually:" -ForegroundColor Yellow
        Write-Host 'psql -U postgres -c "CREATE DATABASE riders_forge;"' -ForegroundColor White
    }
} catch {
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Open pgAdmin or psql manually and run:" -ForegroundColor Yellow
    Write-Host "CREATE DATABASE riders_forge;" -ForegroundColor White
}







