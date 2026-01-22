# Quick Start Guide - Run with Docker

## Prerequisites
1. **Docker Desktop** must be installed and running
   - Download: https://docker.com/get-started/
   - Start Docker Desktop and wait for it to be ready

## Run the Server (3 steps)

### Step 1: Open PowerShell in this folder
```powershell
cd "C:\Users\l_legato\Desktop\veritas-landing-page-main"
```

### Step 2: Make sure Docker is running
```powershell
docker --version
```
If this works, you're ready!

### Step 3: Run the script
```powershell
.\run-with-docker.ps1
```

That's it! The app will be at **http://localhost:3000**

---

## What You'll See

- **Landing Page** (http://localhost:3000) - Works immediately!
- **Investor CRM** (http://localhost:3000/investors) - Needs database setup

---

## If Docker Commands Don't Work

1. **Restart your terminal** after installing Docker Desktop
2. **Make sure Docker Desktop is running** (check system tray)
3. **Try running Docker commands manually:**

```powershell
# Pull Node.js
docker pull node:24-alpine

# Install dependencies
docker run --rm -v ${PWD}:/app -w /app node:24-alpine npm install

# Generate Prisma
docker run --rm -v ${PWD}:/app -w /app node:24-alpine npx prisma generate

# Start server
docker run --rm -it -v ${PWD}:/app -w /app -p 3000:3000 node:24-alpine npm run dev
```

---

## For Full CRM Features (Database Required)

If you want the Investor CRM to work, you'll need PostgreSQL. Options:

### Option 1: Use Docker Compose (includes database)
```powershell
docker-compose up
```

### Option 2: Use a free cloud database
- **Supabase**: https://supabase.com (free tier)
- **Neon**: https://neon.tech (free tier)

Then update `.env.local` with your database URL.
