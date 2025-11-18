# PRD Collab - Smart PRD Collaboration Platform

A modern, AI-powered Product Requirements Document (PRD) collaboration platform designed to streamline engineering alignment and reduce meeting overhead.

## 🎯 Key Features

### Core Functionality
- **Split-View Interface**: Markdown PRD on the left, comments on the right with synchronized scrolling
- **Traffic Light Comment System**: Red (Blockers), Yellow (Discussions), Green (Questions)
- **Approval Workflow**: Can only approve when all red/yellow comments are resolved
- **Reading Tracker**: Tracks time spent reading and version history
- **Catch-up Diff View**: Shows what changed since you last read the PRD

### AI-Powered Features (Google Gemini)
- **Fun Mode**: Automatically rephrases crude/informal comments professionally
- **Comment SOP Checker**: Real-time validation that feedback is actionable
- **PRD Summaries**: AI-generated executive summaries for stakeholders
- **Smart Reply Suggestions**: Context-aware reply recommendations

### Additional Features
- **Keyboard-First Navigation**: Optimized for developers
- **Version Tracking**: Auto-saves PRD versions for diff comparison
- **Multi-Persona Support**: PM, Designer, Developer roles
- **Assimilate**: Capture discussions from anywhere and add to PRD

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Google Gemini API key (for AI features)

### Installation

1. **Clone and install dependencies**
```bash
cd bstack-demo-prototype
npm install
```

2. **Set up environment variables**
Create a `.env` file:
```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/prd_collab"

# Google Gemini AI (required for AI features)
GEMINI_API_KEY="your-gemini-api-key-here"

# JWT Secret
JWT_SECRET="your-secret-key-here"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. **Set up the database**

Option A: Using PostgreSQL locally
```bash
# Install PostgreSQL if not already installed
# macOS: brew install postgresql
# Start PostgreSQL service

# Create the database
createdb prd_collab

# Push schema and seed data
npm run db:push
npm run db:seed
```

Option B: Using Docker
```bash
# Run PostgreSQL in Docker
docker run --name prd-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=user \
  -e POSTGRES_DB=prd_collab \
  -p 5432:5432 \
  -d postgres:15

# Then run migrations
npm run db:push
npm run db:seed
```

Option C: Using Vercel Postgres (easiest)
```bash
# Install Vercel CLI
npm i -g vercel

# Create a Vercel Postgres database
vercel postgres create

# Copy the DATABASE_URL to your .env file

# Push schema and seed
npm run db:push
npm run db:seed
```

4. **Generate Prisma Client**
```bash
npx prisma generate
```

5. **Start the development server**
```bash
npm run dev
```

6. **Access the app**
Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

The seed script creates three demo accounts (no password required):

- **Product Manager**: `pm@vstag.com`
- **Developer**: `dev@vstag.com`
- **Designer**: `design@vstag.com`

## 📖 Usage Guide

### For Product Managers
1. Log in as `pm@vstag.com`
2. View the sample PRD on the dashboard
3. Click to open the PRD viewer
4. Add comments with traffic light categories
5. Use AI Fun Mode to rephrase informal feedback
6. Monitor comment resolution progress

### For Engineers/Designers
1. Log in as `dev@vstag.com` or `design@vstag.com`
2. Review the PRD in split-view
3. Select text to comment on specific sections
4. Add blockers (red), discussions (yellow), or questions (green)
5. Reply to PM comments
6. Approve the PRD once all concerns are addressed

### AI Features Demo

**Fun Mode (Comment Rephrasing)**
1. Write a crude comment like: "this is dumb, why are we even doing this?"
2. Click the "✨ Fun Mode" button
3. AI rephrases it professionally: "I have concerns about the rationale for this approach. Could we explore the underlying assumptions?"

**SOP Checker**
1. Type a vague comment: "this doesn't make sense"
2. See real-time feedback that it's not actionable
3. Get AI suggestions to make it more specific

**PRD Summary**
1. Click the summary button (if added to UI)
2. Get a concise executive summary of the entire PRD

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Google Gemini AI
- **Authentication**: JWT-based sessions
- **Markdown**: react-markdown with remark-gfm

### Database Schema
- `users`: User accounts (pm, dev, design roles)
- `prds`: Product Requirements Documents
- `prd_versions`: Version history for diff tracking
- `comments`: Comments with traffic light categories
- `approvals`: User approvals on PRDs
- `reading_logs`: Track reading progress and time
- `ai_interactions`: Log AI feature usage

### Key Components
```
src/
├── app/                    # Next.js app router
│   ├── dashboard/          # Main dashboard
│   ├── prd/[id]/           # PRD viewer
│   └── api/                # API routes
├── components/
│   ├── prd/                # PRD viewer components
│   │   ├── PRDViewer.tsx   # Main split-view container
│   │   ├── MarkdownPane.tsx # Left pane with markdown
│   │   ├── CommentsPane.tsx # Right pane with comments
│   │   ├── CommentForm.tsx  # Comment creation form
│   │   └── CommentThread.tsx # Comment display + replies
│   ├── ai/                 # AI feature components
│   │   ├── AIFunMode.tsx   # Rephrase button
│   │   └── SOPChecker.tsx  # Actionability validator
│   └── layout/             # Layout components
├── lib/
│   ├── ai/                 # AI utilities
│   │   ├── gemini.ts       # Gemini client
│   │   ├── rephrase.ts     # Fun mode logic
│   │   ├── sop-checker.ts  # SOP validation
│   │   └── summarizer.ts   # PRD summarization
│   ├── auth/               # Authentication
│   └── db/                 # Database client
└── types/                  # TypeScript types
```

## 🎬 Recording the Demo Video

### Demo Script (5-10 minutes)

1. **Introduction** (30s)
   - Show login page
   - Explain the problem: too many meetings, comment hell, misalignment

2. **Login & Dashboard** (1min)
   - Login as PM
   - Show dashboard with PRD list
   - Highlight comment counts and approval status

3. **PRD Viewer** (2min)
   - Open PRD in split-view
   - Scroll through markdown (show sync scrolling)
   - Show existing comments with traffic lights
   - Point out highlighted sections with comments

4. **Adding Comments** (2min)
   - Select text from PRD
   - Add a crude comment
   - Use Fun Mode to rephrase it professionally
   - Show SOP checker validating feedback
   - Submit as yellow (discussion)

5. **Switch User** (2min)
   - Logout and login as Developer
   - Show "catch-up" notification (version changed)
   - View diff of changes
   - Reply to PM's comment
   - Try to approve (blocked by yellow comment)
   - Resolve the comment
   - Successfully approve PRD

6. **AI Features Showcase** (2min)
   - Show Fun Mode transformation
   - Demonstrate SOP checker with good vs bad feedback
   - Show AI summary (if implemented in UI)

7. **Conclusion** (30s)
   - Recap benefits: async alignment, reduced meetings, single source of truth
   - Mention extensibility for BrowserStack's needs

### Recording Tips
- Use screen recording software (Loom, OBS, QuickTime)
- Record at 1920x1080 resolution
- Use a clean browser window (close other tabs)
- Rehearse the flow 2-3 times before recording
- Add voiceover explaining each feature
- Keep it concise (7-10 minutes max)

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio (database GUI)
```

## 🎨 Key Design Decisions

### Why Split-View?
- Eliminates context switching between PRD and comments
- Comments are always visible in context
- Natural reading flow left-to-right

### Why Traffic Light System?
- Clear visual priority (red = urgent, yellow = discuss, green = question)
- Enables smart approval logic (can't approve with red/yellow)
- Reduces ambiguity in feedback categorization

### Why AI Integration?
- **Fun Mode**: Reduces conflict, encourages honest feedback
- **SOP Checker**: Enforces actionable feedback culture
- **Summaries**: Saves time for stakeholders who need quick context

### Why Async-First?
- Engineers hate too many meetings
- Changes and discussions happen async
- Only decisions need to be synchronous
- Reading tracker helps with catch-up

## 🔮 Future Enhancements

### Phase 2 Ideas
- [ ] Real-time collaboration (WebSockets)
- [ ] Slack/Teams integration for notifications
- [ ] Export to PDF/Confluence
- [ ] Advanced diff viewer (side-by-side)
- [ ] @mentions and notifications
- [ ] Comment threading improvements
- [ ] Mobile responsiveness
- [ ] Dark mode
- [ ] Keyboard shortcuts panel (press `?`)
- [ ] Bulk operations on comments
- [ ] Advanced analytics dashboard

### BrowserStack-Specific Extensions
- [ ] Integration with test results
- [ ] Link PRDs to Jira epics
- [ ] Browser compatibility testing notes
- [ ] Screenshot annotations
- [ ] Video embedding for test recordings

## 📝 License

This is a demo project for BrowserStack case assessment.

## 🙏 Acknowledgments

- Built with Next.js 14 and React 19
- UI styled with TailwindCSS
- AI powered by Google Gemini
- Markdown rendering by react-markdown
- Database by Prisma

---

**For Browser Stack Case Assessment** - ISB MBA Placements 2024
