# Setup Instructions for Investor CRM

## Prerequisites

1. **Install Node.js** (includes npm)
   - Download from: https://nodejs.org/
   - Install the LTS version (18 or higher)
   - Verify installation: Open a new terminal and run `node --version`

2. **Install PostgreSQL Database**
   - Download from: https://www.postgresql.org/download/
   - Or use a cloud service like Supabase, Railway, or Neon
   - Note the connection string for your database

## Quick Setup

### Option 1: Use the Setup Script (Windows PowerShell)

1. Open PowerShell in the project directory
2. Run: `.\setup.ps1`
3. Follow the prompts

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file** in the project root:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/investor_crm"
   AUTH_SECRET="generate-a-random-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   APP_ADMIN_EMAIL="admin@example.com"
   APP_ADMIN_PASSWORD="changeme"
   AIRTABLE_API_KEY=""
   AIRTABLE_BASE_ID=""
   AIRTABLE_TABLE_NAME="Investors"
   ```

   **To generate AUTH_SECRET:**
   - On Windows PowerShell: `[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid + (New-Guid).Guid))`
   - Or use: https://generate-secret.vercel.app/32

3. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

4. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

5. **(Optional) Seed the database with sample data:**
   ```bash
   npm run db:seed
   ```

## Running the Application

Start the development server:
```bash
npm run dev
```

Then open:
- Landing page: http://localhost:3000
- Investor CRM: http://localhost:3000/investors (requires login)

Login credentials:
- Email: (value from `APP_ADMIN_EMAIL` in `.env.local`)
- Password: (value from `APP_ADMIN_PASSWORD` in `.env.local`)

## Troubleshooting

### "Node.js is not recognized"
- Make sure Node.js is installed
- Restart your terminal after installing Node.js
- Verify installation: `node --version`

### "Cannot connect to database"
- Check that PostgreSQL is running
- Verify `DATABASE_URL` in `.env.local` is correct
- Test connection: `psql -U user -d investor_crm`

### "Prisma client not generated"
- Run: `npm run db:generate`
- Make sure `node_modules` exists (run `npm install` first)

### Port 3000 already in use
- Change the port: `npm run dev -- -p 3001`
- Or stop the process using port 3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with sample data
- `npm run import:airtable` - Import investors from Airtable
