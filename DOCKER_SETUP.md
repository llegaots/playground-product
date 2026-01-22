# Docker Setup Instructions

This guide will help you run the Investor CRM application using Docker, which includes both Node.js and PostgreSQL.

## Prerequisites

1. **Install Docker Desktop**
   - Download from: https://docker.com/get-started/
   - Install and start Docker Desktop
   - Verify installation: Open PowerShell and run `docker --version`

## Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script:
```powershell
.\docker-setup.ps1
```

This will:
- Pull the Node.js Docker image
- Build the application
- Start PostgreSQL database
- Run database migrations
- Start the development server

### Option 2: Manual Setup

1. **Pull the Node.js image:**
   ```powershell
   docker pull node:24-alpine
   ```

2. **Start all services (PostgreSQL + App):**
   ```powershell
   docker-compose up
   ```

   This will automatically:
   - Start PostgreSQL database
   - Build the application
   - Run database migrations
   - Start the Next.js dev server

3. **Access the application:**
   - Landing page: http://localhost:3000
   - Investor CRM: http://localhost:3000/investors
   - Login: admin@example.com / changeme

## Running Commands in Docker

### Install dependencies:
```powershell
docker run -it --rm -v ${PWD}:/app -w /app node:24-alpine npm install
```

### Generate Prisma client:
```powershell
docker run -it --rm -v ${PWD}:/app -w /app node:24-alpine npx prisma generate
```

### Run database migrations:
```powershell
docker run -it --rm -v ${PWD}:/app -w /app -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/investor_crm" node:24-alpine npx prisma migrate dev
```

### Seed the database:
```powershell
docker run -it --rm -v ${PWD}:/app -w /app -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/investor_crm" node:24-alpine npm run db:seed
```

### Open a shell in the container:
```powershell
docker run -it --rm -v ${PWD}:/app -w /app node:24-alpine sh
```

## Using Docker Compose

### Start services:
```powershell
docker-compose up
```

### Start in background:
```powershell
docker-compose up -d
```

### Stop services:
```powershell
docker-compose down
```

### View logs:
```powershell
docker-compose logs -f app
```

### Run commands in app container:
```powershell
docker-compose exec app npm run db:seed
docker-compose exec app npx prisma studio
```

## Environment Variables

Edit `docker-compose.yml` to change environment variables, or create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/investor_crm
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
APP_ADMIN_EMAIL=admin@example.com
APP_ADMIN_PASSWORD=changeme
```

## Troubleshooting

### Docker is not recognized
- Make sure Docker Desktop is installed and running
- Restart your terminal after installing Docker

### Port 3000 or 5432 already in use
- Stop other services using these ports
- Or change ports in `docker-compose.yml`

### Database connection errors
- Make sure PostgreSQL container is running: `docker-compose ps`
- Check logs: `docker-compose logs postgres`

### Prisma client not generated
- Run: `docker-compose exec app npx prisma generate`
- Or rebuild: `docker-compose build`

## Database Access

Connect to PostgreSQL from your host machine:
- Host: localhost
- Port: 5432
- User: postgres
- Password: postgres
- Database: investor_crm

Or use Prisma Studio:
```powershell
docker-compose exec app npx prisma studio
```

Then open: http://localhost:5555
