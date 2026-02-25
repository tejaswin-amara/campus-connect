# Campus Event Manager - Force Stop Script

$port = 9090

Write-Host "Attempting to stop application running on port $port..." -ForegroundColor Cyan

# Find process ID listening on the configured port
$netstatOutput = netstat -ano | findstr ":$port"

if (-not $netstatOutput) {
    Write-Warning "No process found running on port $port. The application might already be stopped."
    exit
}

# Extract PID (last token in the line)
# Expected format: TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING       12345
$pidFound = $null
foreach ($line in $netstatOutput) {
    if ($line -match "LISTENING") {
        $parts = $line -split '\s+'
        $pidFound = $parts[-1]
        break
    }
}

if ($pidFound) {
    Write-Host "Found process with PID: $pidFound" -ForegroundColor Yellow
    try {
        Stop-Process -Id $pidFound -Force -ErrorAction Stop
        Write-Host "Application (PID $pidFound) has been stopped successfully." -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to stop process $pidFound. Access denied or process not found."
    }
}
else {
    Write-Warning "Could not determine PID from netstat output."
}
