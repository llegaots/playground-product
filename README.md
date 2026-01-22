# Horizon Park Apartments - Landing Page

A beautiful, modern landing page for the Horizon Park Apartments investment opportunity, built in Harmozi style. This single-page application showcases the 36-unit apartment complex investment in Edmonds, WA, offered by Veritas Equity Partners.

## Overview

This landing page is designed to convert qualified accredited investors by providing clear information about the investment opportunity, transparent risk/benefit analysis, social proof, and an easy-to-use contact form.

## Features

- **Hero Section**: Eye-catching property introduction with key investment metrics ($50K min, 2.22x equity multiple, 18.1% IRR)
- **Value Proposition**: Clear investment structure and projected returns
- **Problem/Solution**: Harmozi-style investor pain points and Veritas solutions
- **Case Studies**: Social proof with testimonials and team credentials
- **Benefits vs Risks**: Transparent breakdown of investment pros and cons
- **Process Section**: 4-step investment flow explanation
- **Team Section**: Veritas team overview with credentials
- **FAQ Section**: Comprehensive answers to common investor questions
- **Contact Form**: Embedded form for scheduling investor calls

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom components with Radix UI primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
veritas-horizon-park/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main landing page
│   └── globals.css         # Global styles and theme
├── components/
│   ├── landing/            # Landing page sections
│   │   ├── HeroSection.tsx
│   │   ├── ValuePropositionSection.tsx
│   │   ├── ProblemSection.tsx
│   │   ├── SolutionSection.tsx
│   │   ├── CaseStudiesSection.tsx
│   │   ├── BenefitsRisksSection.tsx
│   │   ├── ProcessSection.tsx
│   │   ├── TeamSection.tsx
│   │   ├── FAQSection.tsx
│   │   └── CTASection.tsx
│   └── ui/                 # Reusable UI components
│       ├── button.tsx
│       └── accordion.tsx
├── lib/
│   └── utils.ts            # Utility functions
└── public/
    └── images/             # Static assets
```

## Key Investment Details

- **Property**: Horizon Park Apartments
- **Location**: Edmonds, Washington
- **Units**: 36-unit workforce housing complex
- **Minimum Investment**: $50,000
- **Equity Multiple**: 2.22x
- **Target Annual IRR**: 18.1%
- **Offering Type**: 506(c) - Accredited investors only

## Design Principles

- **Harmozi Style**: Bold headlines, clear value propositions, transparent risk framing
- **Professional**: Trust-building color scheme (blues, whites)
- **Responsive**: Mobile-first design with generous whitespace
- **Accessible**: Clear typography and semantic HTML
- **Performant**: Optimized animations and static generation

## Contact Information

- **Phone**: 425-231-9008
- **Email**: 
  - alex@veritasequitypartners.com
  - lauren@veritasequitypartners.com
- **Address**: 1018 Market St, Kirkland, WA 98033

## License

Private project for Veritas Equity Partners.

---

# Investor CRM System

This project now includes a comprehensive investor CRM system with LinkedIn intent tracking, accessible at `/investors`.

## Features

- **Investor Management**: Full CRUD operations for investor records
- **LinkedIn Intent Tracking**: Track engagement signals from LinkedIn (connection requests, DMs, profile views, link clicks)
- **Tracked Links**: Create short, trackable links for LinkedIn outreach that log clicks and UTM parameters
- **Intent Scoring**: Rules-based intent scoring system that calculates engagement scores based on recent touchpoints
- **Airtable Import**: Migrate existing investor data from Airtable

## Database Setup

### Prerequisites

- PostgreSQL database (local or hosted)
- Node.js 18+
- pnpm (package manager)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables. Create a `.env.local` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/investor_crm"
AUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
APP_ADMIN_EMAIL="admin@example.com"
APP_ADMIN_PASSWORD="changeme"

# Optional: For Airtable import
AIRTABLE_API_KEY=""
AIRTABLE_BASE_ID=""
AIRTABLE_TABLE_NAME="Investors"
```

3. Generate Prisma client:
```bash
pnpm db:generate
```

4. Run database migrations:
```bash
pnpm db:migrate
```

5. (Optional) Seed the database with sample data:
```bash
pnpm db:seed
```

## Running the Application

1. Start the development server:
```bash
pnpm dev
```

2. Access the application:
   - Landing page: [http://localhost:3000](http://localhost:3000)
   - Investor CRM: [http://localhost:3000/investors](http://localhost:3000/investors)
   - Login with the credentials from `APP_ADMIN_EMAIL` and `APP_ADMIN_PASSWORD`

## Airtable Import

To import existing investor data from Airtable:

1. Set the Airtable environment variables in `.env.local`
2. Run the import script:
```bash
pnpm import:airtable
```

The script will:
- Fetch all records from the specified Airtable table
- Map Airtable fields to the database schema
- Upsert investors by email (creates new or updates existing)
- Preserve created timestamps
- Display a summary of created/updated/skipped records

### Airtable Field Mapping

- `Investor Name` → `name`
- `Email Address` → `email` (used for upsert)
- `Phone Number` → `phone`
- `Status` → `status`
- `Amount$` → `amountCommitted`
- `Investor Notes` → `notes`
- `Deal` → `deal`
- `Source` → `source`
- `Investor Type` → `investorType`
- `Liquid Ready` → `liquidReady` (boolean)
- `Created Time` → `createdAt`

## Intent Scoring System

The intent scoring system calculates engagement scores based on touchpoints from the last 14 days:

### Base Scores
- Link Click: +3 points
- Website Visit: +2 points
- DM Replied: +8 points
- Connection Accepted: +4 points
- Profile Viewed (Manual): +2 points
- Post Engaged (Manual): +2 points
- Calendar Booked: +5 points

### Momentum Bonuses
- 2+ link clicks in last 72 hours: +5 points
- Any event in last 24 hours: +3 points

### Age Decay
- 0-2 days old: 100% of score
- 3-7 days old: 60% of score
- 8-14 days old: 30% of score
- Older than 14 days: 0% (excluded)

Scores are computed automatically when touchpoints are created and stored in the `InvestorIntentDaily` table. The top 3 reasons for the score are displayed for explainability.

## Tracked Links

Create short, trackable links for LinkedIn outreach:

1. Navigate to `/investors/tracked-links`
2. Create a new tracked link with:
   - Optional investor association
   - Destination URL
   - Campaign name
   - Deal name
3. Use the generated link (e.g., `https://yourdomain.com/t/AbC123`) in LinkedIn messages or posts
4. Clicks are automatically logged with:
   - IP address
   - User agent
   - Referrer
   - UTM parameters
   - Timestamp
5. If the link is associated with an investor, a `LINK_CLICK` touchpoint is automatically created

## API Endpoints

- `GET /api/investors` - List investors (with filters)
- `POST /api/investors` - Create investor
- `GET /api/investors/[id]` - Get investor details
- `PATCH /api/investors/[id]` - Update investor
- `DELETE /api/investors/[id]` - Delete investor
- `GET /api/touchpoints?investorId=...` - List touchpoints
- `POST /api/touchpoints` - Create touchpoint
- `GET /api/tracked-links` - List tracked links
- `POST /api/tracked-links` - Create tracked link
- `POST /api/intent` - Recompute intent scores
- `GET /t/[code]` - Redirect endpoint for tracked links

## Database Schema

The system uses the following main tables:

- `Investor` - Core investor information
- `LinkedInProfile` - Optional LinkedIn profile data
- `Touchpoint` - All engagement events (LinkedIn, email, etc.)
- `TrackedLink` - Short links for tracking
- `TrackedLinkClick` - Click logs with metadata
- `InvestorIntentDaily` - Materialized intent scores

## Development Tools

- `pnpm db:studio` - Open Prisma Studio to browse/edit database
- `pnpm db:migrate` - Create new migration after schema changes
- `pnpm db:generate` - Regenerate Prisma client after schema changes

## Authentication

The system uses NextAuth.js with a simple credentials provider. For MVP, authentication is handled via environment variables (`APP_ADMIN_EMAIL` and `APP_ADMIN_PASSWORD`). All `/investors/*` routes are protected and require authentication.
