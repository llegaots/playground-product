# Start Docker Setup Script
# Make sure Docker Desktop is running before executing this script

Write-Host "Starting Investor CRM with Docker..." -ForegroundColor Green

# Try to find Docker in common locations
$dockerPaths = @(
    "C:\Program Files\Docker\Docker\resources\bin\docker.exe",
    "$env:ProgramFiles\Docker\Docker\resources\bin\docker.exe",
    "$env:LOCALAPPDATA\Docker\resources\bin\docker.exe"
)

$dockerExe = $null
foreach ($path in $dockerPaths) {
    if (Test-Path $path) {
        $dockerExe = $path
        Write-Host "Found Docker at: $dockerExe" -ForegroundColor Green
        break
    }
}

if (-not $dockerExe) {
    # Try to use docker from PATH
    try {
        $null = Get-Command docker -ErrorAction Stop
        $dockerExe = "docker"
        Write-Host "Docker found in PATH" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Docker not found!" -ForegroundColor Red
        Write-Host "Please:" -ForegroundColor Yellow
        Write-Host "  1. Make sure Docker Desktop is installed" -ForegroundColor Yellow
        Write-Host "  2. Start Docker Desktop and wait for it to fully start" -ForegroundColor Yellow
        Write-Host "  3. Restart this PowerShell session" -ForegroundColor Yellow
        Write-Host "  4. Run this script again" -ForegroundColor Yellow
        exit 1
    }
}

# Check if Docker is running
Write-Host "`nChecking if Docker is running..." -ForegroundColor Cyan
try {
    if ($dockerExe -ne "docker") {
        & $dockerExe ps 2>&1 | Out-Null
    } else {
        docker ps 2>&1 | Out-Null
    }
    Write-Host "Docker is running!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and wait for it to fully initialize." -ForegroundColor Yellow
    exit 1
}

# Pull Node.js image
Write-Host "`nPulling Node.js Docker image..." -ForegroundColor Cyan
if ($dockerExe -ne "docker") {
    & $dockerExe pull node:24-alpine
} else {
    docker pull node:24-alpine
}

# Check if docker-compose is available
$composeExe = $null
$composePaths = @(
    "C:\Program Files\Docker\Docker\resources\bin\docker-compose.exe",
    "$env:ProgramFiles\Docker\Docker\resources\bin\docker-compose.exe"
)

foreach ($path in $composePaths) {
    if (Test-Path $path) {
        $composeExe = $path
        break
    }
}

if (-not $composeExe) {
    try {
        $null = Get-Command docker-compose -ErrorAction Stop
        $composeExe = "docker-compose"
    } catch {
        # Try using docker compose (newer syntax)
        try {
            $null = Get-Command docker -ErrorAction Stop
            $composeExe = "docker"
            $composeCmd = "compose"
        } catch {
            Write-Host "ERROR: docker-compose not found!" -ForegroundColor Red
            exit 1
        }
    }
}

# Build and start services
Write-Host "`nBuilding application..." -ForegroundColor Cyan
if ($composeExe -eq "docker" -and $composeCmd) {
    docker compose build
} else {
    & $composeExe build
}

Write-Host "`nStarting services..." -ForegroundColor Cyan
Write-Host "This will start:" -ForegroundColor Yellow
Write-Host "  - PostgreSQL database (port 5432)" -ForegroundColor Gray
Write-Host "  - Next.js application (port 3000)" -ForegroundColor Gray
Write-Host "`nApplication will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "Login: admin@example.com / changeme" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C to stop" -ForegroundColor Cyan

if ($composeExe -eq "docker" -and $composeCmd) {
    docker compose up
} else {
    & $composeExe up
}
