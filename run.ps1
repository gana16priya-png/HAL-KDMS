# HKDMS Automated Installer and Runner

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " HAL Knowledge & Decision Management System (HKDMS) Setup" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check for Node.js
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "[!] Node.js is not detected on your system path." -ForegroundColor Yellow
    Write-Host "    To install Node.js automatically, you can run:" -ForegroundColor Gray
    Write-Host "    winget install OpenJS.NodeJS" -ForegroundColor Cyan
    Write-Host "----------------------------------------------------------"
    $confirm = Read-Host "Would you like to try installing Node.js via Winget now? (Y/N)"
    if ($confirm -eq 'Y' -or $confirm -eq 'y') {
        Write-Host "[*] Executing Winget installer..." -ForegroundColor Green
        winget install OpenJS.NodeJS --silent --accept-package-agreements --accept-source-agreements
        Write-Host "[+] Installation triggered. Please restart this terminal after installation completes and re-run run.ps1." -ForegroundColor Green
        Exit
    } else {
        Write-Host "[-] Aborting setup. Node.js is required to compile React and execute Express." -ForegroundColor Red
        Exit
    }
}

Write-Host "[+] Node.js detected: $(node -v)" -ForegroundColor Green
Write-Host "[+] npm detected: $(npm -v)" -ForegroundColor Green
Write-Host "----------------------------------------------------------"

# 2. Install Backend Dependencies
Write-Host "[*] Configuring HKDMS Backend Service..." -ForegroundColor Yellow
cd backend
Write-Host "[*] Installing backend packages (express, cors, jwt, mongoose)..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[-] Failed to install backend dependencies." -ForegroundColor Red
    Exit
}

# 3. Seed Database
Write-Host "[*] Seeding default records (LCA Tejas, AMCA stealth, admin profiles)..." -ForegroundColor Yellow
npm run seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "[-] Database seeding aborted." -ForegroundColor Red
    Exit
}
cd ..

# 4. Install Frontend Dependencies
Write-Host "[*] Configuring HKDMS Frontend Client..." -ForegroundColor Yellow
cd frontend
Write-Host "[*] Installing frontend packages (react, tailwindcss, framer-motion)..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[-] Failed to install frontend dependencies." -ForegroundColor Red
    Exit
}
cd ..

# 5. Spawn Concurrent Servers
Write-Host "[+] Dependencies resolved successfully." -ForegroundColor Green
Write-Host "[*] Launching HKDMS Backend on Port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "node server.js" -WorkingDirectory "backend"

Write-Host "[*] Launching HKDMS Frontend Client on Port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "npm run dev" -WorkingDirectory "frontend"

# 6. Launch Browser
Write-Host "----------------------------------------------------------"
Write-Host "[+] HKDMS Portal launched successfully!" -ForegroundColor Green
Write-Host "[+] Opening browser gateway: http://localhost:3000" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"
