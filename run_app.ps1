# Campus Event Manager - Integrated Startup Script

$mysqlServiceName = "MySQL80" # Default for MySQL 8.0 installer
$mysqlAltName = "MySQL"

# Function to check and start service
function Ensure-MySQL-Service {
    $service = Get-Service -Name $mysqlServiceName -ErrorAction SilentlyContinue
    if ($null -eq $service) {
        $service = Get-Service -Name $mysqlAltName -ErrorAction SilentlyContinue
    }

    if ($null -eq $service) {
        Write-Warning "MySQL Service not found (tried '$mysqlServiceName' and '$mysqlAltName'). Please ensure MySQL is installed."
        return $false
    }

    if ($service.Status -ne 'Running') {
        Write-Host "MySQL Service is $($service.Status). Attempting to start..." -ForegroundColor Yellow
        try {
            Start-Service -InputObject $service -ErrorAction Stop
            Write-Host "MySQL Service started successfully." -ForegroundColor Green
            Start-Sleep -Seconds 3 # Give it a moment to initialize
        }
        catch {
            Write-Warning "Failed to start MySQL Service. You may need Administrator privileges."
            $choice = Read-Host "Do you want to attempt to restart this script as Administrator? (Y/N)"
            if ($choice -eq 'Y' -or $choice -eq 'y') {
                Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
                exit
            }
            else {
                return $false
            }
        }
    }
    else {
        Write-Host "MySQL Service is running." -ForegroundColor Green
    }
    return $true
}

# 1. Ensure Database Service is Running
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   🚀 Starting Campus Event Manager...    " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Ensure-MySQL-Service)) {
    Write-Warning "Proceeding without verifying database service..."
}

# 2. (Optional) MySQL CLI can be launched manually if needed
# Write-Host "Launching MySQL CLI..." -ForegroundColor Magenta
# Start-Process powershell -ArgumentList '-NoExit', '-Command', '& { mysql -u root -proot; }'

# 3. Start Spring Boot Application
Write-Host "Starting Spring Boot Application..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the application." -ForegroundColor Gray
Write-Host ""

& .\mvnw.cmd spring-boot:run
