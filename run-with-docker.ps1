# Run the Next.js app using Docker (no local Node.js needed!)
# Make sure Docker Desktop is running first

Write-Host "Running Investor CRM with Docker..." -ForegroundColor Green

# Check if Docker is available
try {
    docker --version | Out-Null
    Write-Host "Docker is ready!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker not found!" -ForegroundColor Red
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "  1. Start Docker Desktop" -ForegroundColor Yellow
    Write-Host "  2. Wait for it to fully start" -ForegroundColor Yellow
    Write-Host "  3. Restart this terminal" -ForegroundColor Yellow
    Write-Host "  4. Run this script again" -ForegroundColor Yellow
    exit 1
}

# Pull Node.js image if not already pulled
Write-Host "`nEnsuring Node.js Docker image is available..." -ForegroundColor Cyan
docker pull node:24-alpine

# Install dependencies (if node_modules doesn't exist)
if (-not (Test-Path "node_modules")) {
    Write-Host "`nInstalling dependencies..." -ForegroundColor Cyan
    docker run --rm -v ${PWD}:/app -w /app node:24-alpine npm install
}

# Generate Prisma client
Write-Host "`nGenerating Prisma client..." -ForegroundColor Cyan
docker run --rm -v ${PWD}:/app -w /app node:24-alpine npx prisma generate

# Check if we need a database
Write-Host "`nNOTE: For the full CRM to work, you need a PostgreSQL database." -ForegroundColor Yellow
Write-Host "For now, the landing page will work without a database." -ForegroundColor Yellow
Write-Host "`nStarting development server..." -ForegroundColor Cyan
Write-Host "The app will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Cyan

# Run the dev server
docker run --rm -it `
    -v ${PWD}:/app `
    -w /app `
    -p 3000:3000 `
    node:24-alpine `
    npm run dev
