# Deploy to Netlify (FREE)

## Option 1: Using Turso (Free SQLite in the Cloud)

Turso offers free SQLite hosting perfect for demos!

### Step 1: Install Turso CLI
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### Step 2: Create Turso Database
```bash
# Login
turso auth login

# Create database
turso db create prd-collab

# Get connection URL
turso db show prd-collab --url
# Copy this URL

# Get auth token
turso db tokens create prd-collab
# Copy this token
```

### Step 3: Update for Turso
Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Your `.env` for Turso:
```bash
DATABASE_URL="libsql://prd-collab-[your-username].turso.io?authToken=your-token-here"
```

### Step 4: Push Schema to Turso
```bash
npm run db:push
npm run db:seed
```

### Step 5: Deploy to Netlify

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Build the app**:
```bash
npm run build
```

3. **Login to Netlify**:
```bash
netlify login
```

4. **Initialize Netlify**:
```bash
netlify init
```

5. **Set environment variables**:
```bash
netlify env:set DATABASE_URL "your-turso-url-here"
netlify env:set GEMINI_API_KEY "your-gemini-key-here"
netlify env:set JWT_SECRET "your-jwt-secret-here"
netlify env:set NEXT_PUBLIC_APP_URL "https://your-app.netlify.app"
```

6. **Deploy**:
```bash
netlify deploy --prod
```

---

## Option 2: Using Neon (Free PostgreSQL)

Neon offers free PostgreSQL hosting.

### Step 1: Create Neon Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up (free)
3. Create a new project
4. Copy the connection string

### Step 2: Update Schema for PostgreSQL

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 3: Add `@db.Text` back for large fields

Since PostgreSQL supports it, update the schema:
```prisma
model PRD {
  content   String    @db.Text
  // ... rest
}

model Comment {
  content      String    @db.Text
  selectedText String?   @db.Text
  // ... rest
}
```

### Step 4: Deploy Schema
```bash
npm run db:push
npm run db:seed
```

### Step 5: Deploy to Netlify (same as above)

---

## Option 3: Quick Deploy with Netlify Button

### Step 1: Create netlify.toml

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
```

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - PRD Collab Platform"
git branch -M main
git remote add origin https://github.com/yourusername/prd-collab.git
git push -u origin main
```

### Step 3: Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repo
4. Add environment variables:
   - `DATABASE_URL` (from Turso or Neon)
   - `GEMINI_API_KEY`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL`
5. Deploy!

---

## Recommended: Turso for Free Demo

**Why Turso?**
- ✅ Free forever (500 databases, 9GB storage)
- ✅ Zero configuration
- ✅ Built for edge (fast globally)
- ✅ SQLite (same as local dev)
- ✅ No credit card required

**Free Tier Limits:**
- 500 databases
- 9 GB total storage
- 1 billion row reads/month
- 25 million row writes/month
- 3 locations

Perfect for your POC demo!

---

## Testing Your Deployed App

After deployment, test:
1. Login with demo accounts
2. View PRDs
3. Add comments
4. Test AI features
5. Share URL with interviewers!

---

## Troubleshooting

### Build fails on Netlify
- Check environment variables are set
- Verify DATABASE_URL is correct
- Ensure all dependencies are in package.json

### Database connection error
- Verify DATABASE_URL format
- For Turso: include `?authToken=...`
- For Neon: ensure IP allowlist is set to `0.0.0.0/0`

### AI features not working
- Verify GEMINI_API_KEY is set in Netlify
- Check API key is valid
- Check browser console for errors

---

## Cost Estimate

**Total Monthly Cost: $0.00**

- Netlify: Free (100GB bandwidth, 300 build minutes)
- Turso: Free (9GB storage, 1B reads)
- Gemini API: Free tier (60 requests/minute)

Perfect for a POC demo! 🎉
