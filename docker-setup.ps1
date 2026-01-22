# Docker Setup Script for Investor CRM
# This script sets up and runs the application using Docker

Write-Host "Setting up Investor CRM with Docker..." -ForegroundColor Green

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "Docker version: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://docker.com/get-started/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nPulling Node.js Docker image..." -ForegroundColor Cyan
docker pull node:24-alpine

Write-Host "`nBuilding application..." -ForegroundColor Cyan
docker-compose build

Write-Host "`nStarting services (PostgreSQL + App)..." -ForegroundColor Cyan
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Start PostgreSQL database" -ForegroundColor Gray
Write-Host "  2. Run database migrations" -ForegroundColor Gray
Write-Host "  3. Start the Next.js development server" -ForegroundColor Gray
Write-Host "`nThe application will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "Login credentials:" -ForegroundColor Yellow
Write-Host "  Email: admin@example.com" -ForegroundColor Gray
Write-Host "  Password: changeme" -ForegroundColor Gray
Write-Host "`nPress Ctrl+C to stop the services" -ForegroundColor Cyan

docker-compose up
