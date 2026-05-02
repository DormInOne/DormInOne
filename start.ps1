<#
    DormInOne - Dormitory Management System
    Server Manager v1.0.0
    ==============================================
#>

$ErrorActionPreference = "SilentlyContinue"

function Draw-Separator {
    Write-Host ""
    Write-Host "-----------------------------------------------------------------------------"
    Write-Host ""
}

function Clear-Ports {
    param(
        [int[]]$Ports
    )
    
    foreach ($port in $Ports) {
        $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $processes) {
            try {
                Stop-Process -Id $pid -Force
                Write-Host "        [KILLED] Process on port $port (PID: $pid)" -ForegroundColor Red
            } catch {
                # Ignore errors
            }
        }
    }
}

function Test-CommandExists {
    param(
        [string]$Command
    )
    $exists = $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
    return $exists
}

cls

Write-Host ""
Write-Host "  DormInOne - Dormitory Management System" -ForegroundColor Cyan
Write-Host ""
Write-Host "==============================================" -ForegroundColor Gray
Write-Host "        Server Manager v1.0.0" -ForegroundColor Gray
Write-Host "==============================================" -ForegroundColor Gray
Draw-Separator

Write-Host "[1/4] Cleaning up occupied ports..." -ForegroundColor Yellow

Clear-Ports -Ports @(3000, 5173)
Write-Host "        [OK] Port cleanup completed" -ForegroundColor Green

Draw-Separator

Write-Host "[2/4] Waiting for system to release resources..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Write-Host "        [OK] Ready to proceed" -ForegroundColor Green

Draw-Separator

Write-Host "[3/4] Checking Node.js and npm installation..." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-CommandExists -Command "node")) {
    Write-Host "        [ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "        Please install Node.js from:" -ForegroundColor Red
    Write-Host "        https://nodejs.org/" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit..."
    exit 1
}

if (-not (Test-CommandExists -Command "npm")) {
    Write-Host "        [ERROR] npm is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "        Please install npm with Node.js:" -ForegroundColor Red
    Write-Host "        https://nodejs.org/" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit..."
    exit 1
}

$nodeVersion = (node --version).Trim()
$npmVersion = (npm --version).Trim()

Write-Host "        Node.js Version: $nodeVersion" -ForegroundColor White
Write-Host "        npm Version:     $npmVersion" -ForegroundColor White
Write-Host "        [OK] Dependencies check passed" -ForegroundColor Green

Draw-Separator

Write-Host "[4/4] Starting servers..." -ForegroundColor Yellow
Write-Host ""

Write-Host "        Starting Backend Server (Port: 3000)..." -ForegroundColor White
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d server && npm start" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "        Starting Frontend Server (Port: 5173)..." -ForegroundColor White
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d client && npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

Draw-Separator

Write-Host "==============================================" -ForegroundColor Gray
Write-Host "              SERVERS STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Gray
Write-Host ""
Write-Host "Backend Server:   http://localhost:3000" -ForegroundColor White
Write-Host "Frontend Server:  http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "==============================================" -ForegroundColor Gray
Write-Host "          Press 'Q' to stop all servers" -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Gray
Write-Host ""

while ($true) {
    Write-Host "Press Q to quit: " -ForegroundColor Cyan -NoNewline
    $input = Read-Host
    if ($input.ToUpper() -eq "Q") {
        break
    }
}

cls
Write-Host ""
Write-Host "==============================================" -ForegroundColor Gray
Write-Host "              STOPPING SERVERS..." -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Gray
Write-Host ""

Write-Host "[1/2] Terminating Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "        [OK] Node.js processes terminated" -ForegroundColor Green

Write-Host "[2/2] Final port cleanup..." -ForegroundColor Yellow
Clear-Ports -Ports @(3000, 5173)
Write-Host "        [OK] Additional processes cleaned up" -ForegroundColor Green

Draw-Separator

Write-Host "==============================================" -ForegroundColor Gray
Write-Host "           SERVERS STOPPED SUCCESSFULLY" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Gray
Write-Host ""
Write-Host "All servers have been stopped and ports released." -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit..."
