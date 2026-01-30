# Core DNA AI Agency Platform - Quick Start

Get up and running in 3 minutes.

## 1. Install & Configure

```bash
# Clone and install
git clone https://github.com/jbino85/CoreDNA.git
cd CoreDNA
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your API keys:
# - GEMINI_API_KEY (https://aistudio.google.com)
# - OPENAI_API_KEY (https://platform.openai.com)
# - RESEND_API_KEY (https://resend.com) [optional, for email]
```

## 2. Run Locally

```bash
# Option A: Frontend only (mock backend)
npm run dev
# Open http://localhost:5173

# Option B: Frontend + Backend
npm run dev:both
# Frontend: http://localhost:5173
# Backend: http://localhost:3001

# Option C: Just Backend
npm run dev:server
# Backend: http://localhost:3001
```

## 3. Test Features

### Extract DNA
1. Go to `/extract`
2. Paste a website URL
3. Watch Gemini extract brand identity

### Automations (n8n)
1. Go to `/workflows`
2. Click a workflow (Extract DNA, Send Report, Auto-Post)
3. Fill in inputs and execute
4. See execution history

### AI Agents (CrewAI)
1. Go to `/agents`
2. Click "Run Closer Swarm"
3. Enter lead name and website
4. Get AI-generated sales email with research + urgency + CTA

### Flows (Langflow)
1. Go to `/flows`
2. Create from template (Brand DNA→Campaign or Review→Social Graphic)
3. Duplicate, edit, export
4. Run with your data

## 4. Deploy to Production

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login and deploy
fly auth login
fly launch
fly deploy

# Set environment variables
fly secrets set GEMINI_API_KEY=your_key
fly secrets set OPENAI_API_KEY=your_key
# ... (see DEPLOYMENT.md for full list)

# View live
fly open
```

Live at: `https://core-dna-agency.fly.dev`

---

## Project Structure

```
CoreDNA/
├── pages/
│   ├── ExtractPage.tsx       ← Existing: extract brand DNA
│   ├── DashboardPage.tsx     ← Existing: analytics
│   ├── CampaignsPage.tsx     ← Existing: create campaigns
│   ├── WorkflowsPage.tsx     ← NEW: n8n workflows
│   ├── AgentsPage.tsx        ← NEW: CrewAI swarms
│   ├── FlowsPage.tsx         ← NEW: Langflow flows
│   └── services/
│       ├── geminiService.ts
│       ├── n8nService.ts     ← NEW
│       ├── crewaiService.ts  ← NEW
│       └── langflowService.ts ← NEW
├── components/
│   └── Layout.tsx            ← Updated nav
├── App.tsx                   ← Updated routes
├── server.ts                 ← NEW: Express backend
├── .env.example              ← NEW: Config template
├── Dockerfile                ← NEW: Docker build
├── fly.toml                  ← NEW: Fly.io config
├── README.md                 ← Updated
├── DEPLOYMENT.md             ← Detailed deployment guide
└── package.json              ← Updated deps
```

## Key Features

### 1. Extract DNA (Existing)
- Paste website URL
- Gemini extracts: colors, fonts, mission, tone, personas, competitors
- Visual identity analysis
- Confidence scores

### 2. Automations (n8n)
Pre-built workflows:
- **Extract DNA from URL** → Calls Gemini API
- **Send Closer Report** → Generate PDF, email via Resend
- **Auto-Post Scheduler** → Post to Twitter, Facebook, Instagram

Execute, see history, save locally.

### 3. AI Agents (CrewAI)
**Closer Swarm** (3-agent team):
- **Researcher**: Analyzes lead website, finds pain points
- **Writer**: Drafts personalized outreach email
- **Closer**: Adds urgency, pricing, Calendly link, CTA

Input: Lead name + website
Output: Ready-to-send email
Storage: localStorage (mock Firestore)

### 4. Flows (Langflow)
Drag-and-drop visual AI:
- **Brand DNA → Campaign Generator**
  - Input: Brand DNA JSON
  - Output: 3 social posts + visual prompts
- **Review → Social Graphic**
  - Input: Customer review text
  - Output: AI image + Instagram caption

Duplicate, edit, export as JSON.

### 5. Dashboard (Existing)
Analytics, brand metrics, KPIs.

### 6. Campaigns (Existing)
Create multi-asset campaigns from brand DNA.

---

## API Endpoints

Backend (Express on port 3001):

```bash
# Health check
GET /api/health

# CrewAI Agents
POST /api/agents/closer-swarm/execute
  Body: { leadName, websiteUrl, industry?, context? }
  Returns: { status, executionId, outputs }

POST /api/agents/conversations
  Body: { userId, leadInfo, initialMessage, swarmResponse, executionId }

GET /api/agents/executions/:executionId

# n8n Workflows
POST /api/workflows/:workflowId/execute
  Body: { url?, recipient_email?, content?, platform? }

GET /api/executions/:executionId

# Langflow Flows
POST /api/flows/:flowId/execute
  Body: { dna_json?, review_text? }

GET /api/flows/:flowId
```

---

## Configuration

All settings in `.env.local`:

```env
# Frontend API
VITE_API_BASE_URL=http://localhost:3001

# AI Providers
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key

# Automation
N8N_API_KEY=your_key
CREWAI_MODEL=gpt-4-turbo

# Email
RESEND_API_KEY=your_key

# Social Media
TWITTER_API_KEY=your_key
META_APP_ID=your_id
```

See `.env.example` for complete list.

---

## Troubleshooting

**Frontend won't load?**
```bash
npm install
npm run dev
# Check http://localhost:5173
```

**Backend won't start?**
```bash
npm install
npm run dev:server
# Check http://localhost:3001/api/health
```

**API calls failing?**
```bash
# Test backend directly
curl http://localhost:3001/api/health

# Check environment variables
cat .env.local | grep API_KEY
```

**Port already in use?**
```bash
# Kill process on port 5173 (frontend)
lsof -i :5173 | grep -v COMMAND | awk '{print $2}' | xargs kill -9

# Kill process on port 3001 (backend)
lsof -i :3001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
```

---

## Next Steps

1. ✅ Clone and install
2. ✅ Set API keys in `.env.local`
3. ✅ Run `npm run dev:both`
4. ✅ Test each feature (/extract → /workflows → /agents → /flows)
5. ✅ Deploy to Fly.io: `fly deploy`
6. 📊 Add your branding (colors, logo, etc.)
7. 🔐 Set up authentication
8. 🗄️ Connect to database (Firestore/PostgreSQL)
9. 📈 Enable advanced analytics

---

## Docs

- **[README.md](./README.md)** - Full documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment guide
- **[.env.example](./.env.example)** - All environment variables

## Support

- GitHub Issues: Report bugs/feature requests
- GitHub Discussions: Q&A
- Direct: Create an issue with `[HELP]` prefix

---

**Ready?** → `npm run dev:both` 🚀
