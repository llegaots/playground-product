# Setup script for Investor CRM
# Run this after installing Node.js

Write-Host "Setting up Investor CRM..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm is not available" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Cyan
npm install

# Generate Prisma client
Write-Host "`nGenerating Prisma client..." -ForegroundColor Cyan
npm run db:generate

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "`nWARNING: .env.local file not found!" -ForegroundColor Yellow
    Write-Host "Please create .env.local with the following variables:" -ForegroundColor Yellow
    Write-Host "DATABASE_URL=postgresql://user:password@localhost:5432/investor_crm" -ForegroundColor Gray
    Write-Host "AUTH_SECRET=your-secret-key-here" -ForegroundColor Gray
    Write-Host "NEXTAUTH_URL=http://localhost:3000" -ForegroundColor Gray
    Write-Host "APP_ADMIN_EMAIL=admin@example.com" -ForegroundColor Gray
    Write-Host "APP_ADMIN_PASSWORD=changeme" -ForegroundColor Gray
    Write-Host "`nPress any key to continue with database setup (you'll need to configure .env.local first)..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Run database migrations (this will fail if DATABASE_URL is not set)
Write-Host "`nRunning database migrations..." -ForegroundColor Cyan
Write-Host "NOTE: This requires a PostgreSQL database. Update DATABASE_URL in .env.local first." -ForegroundColor Yellow
npm run db:migrate

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "`nTo start the development server, run: npm run dev" -ForegroundColor Cyan
Write-Host "To seed the database with sample data, run: npm run db:seed" -ForegroundColor Cyan
