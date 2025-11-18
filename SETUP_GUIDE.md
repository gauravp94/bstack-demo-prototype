# Quick Setup Guide

## Step 1: Database Setup

You have three options:

### Option A: Use SQLite (Easiest - No PostgreSQL needed!)

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. Update `.env`:
```bash
DATABASE_URL="file:./prisma/dev.db"
```

3. Run:
```bash
npx prisma db push
npm run db:seed
```

### Option B: Use Vercel Postgres (Free, Hosted)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Create database:
```bash
vercel postgres create
```

3. Copy the `DATABASE_URL` from Vercel to your `.env` file

4. Run:
```bash
npm run db:push
npm run db:seed
```

### Option C: Local PostgreSQL

1. Install PostgreSQL:
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql
sudo service postgresql start
```

2. Create database:
```bash
createdb prd_collab
```

3. Update `.env` with your credentials:
```bash
DATABASE_URL="postgresql://yourusername@localhost:5432/prd_collab"
```

4. Run:
```bash
npm run db:push
npm run db:seed
```

## Step 2: Get Google Gemini API Key (For AI Features)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key
4. Copy it to your `.env` file:
```bash
GEMINI_API_KEY="your-actual-api-key-here"
```

**Note**: AI features will show errors if the API key is missing, but the core app will still work!

## Step 3: Start the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 4: Login

Use any of these demo accounts (no password needed):
- `pm@vstag.com` (Product Manager)
- `dev@vstag.com` (Developer)
- `design@vstag.com` (Designer)

## Troubleshooting

### "Prisma Client Not Found"
```bash
npx prisma generate
```

### Database Connection Error
Check your `DATABASE_URL` in `.env` and ensure the database exists.

### AI Features Not Working
Verify your `GEMINI_API_KEY` is set in `.env` and is valid.

### Port 3000 Already in Use
```bash
# Use a different port
PORT=3001 npm run dev
```

## Quick Test Checklist

- [ ] Login with `pm@vstag.com`
- [ ] See the dashboard with 1 sample PRD
- [ ] Open the PRD (click "View PRD")
- [ ] See split-view: markdown left, comments right
- [ ] Scroll and see synchronized movement (if implemented)
- [ ] Click "+ New Comment"
- [ ] Type a comment and try "✨ Fun Mode"
- [ ] See SOP checker validate your comment
- [ ] Submit comment with traffic light category
- [ ] Try to approve PRD (should be blocked)
- [ ] Mark a comment as resolved
- [ ] Try approval again

## For Demo Video

1. Clear browser cache/cookies
2. Open in incognito/private window
3. Follow the demo script in README.md
4. Record at 1080p resolution
5. Use Loom/OBS/QuickTime for recording
