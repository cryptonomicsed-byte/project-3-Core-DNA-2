# Core DNA AI Agency Platform

A self-hosted, unified platform for AI-powered brand intelligence, automation, and agent orchestration. Merges the best of **n8n** (workflows), **CrewAI** (agent swarms), and **Langflow** (visual AI logic) into one seamless interface.

## What It Does

- **Extract Brand DNA** → Analyze websites with Gemini, extract brand identity, colors, fonts, messaging
- **Automate Workflows** → n8n embedded workflows for email, PDFs, social posting
- **Run AI Agent Swarms** → CrewAI-powered teams (Researcher, Writer, Closer) for lead outreach
- **Build Visual Flows** → Langflow drag-and-drop flows for complex AI logic
- **RLM Mode (♾️)** → Recursive Language Model for infinite context processing on long-form content
- **Unified Dashboard** → All features under one Core DNA-branded interface

## Features

### 1. **Automations (n8n Embedded)**
Pre-configured workflows:
- Extract DNA from URL → Calls Gemini
- Send Closer Report → Generate PDF, email via Resend/Gmail
- Auto-Post Scheduler → Push to Twitter, Facebook, Instagram

### 2. **AI Agents (CrewAI)**
Closer Swarm with 3 roles:
- **Researcher**: Scrape lead site, identify pain points
- **Writer**: Draft personalized outreach email
- **Closer**: Refine email, add urgency, pricing, CTA

Store conversation logs locally (mock Firestore) or in Firestore.

### 3. **Flows (Langflow)**
Two pre-built templates:
- **Brand DNA → Campaign Generator** → DNA → posts + visuals
- **Review → Social Graphic** → Scrape review → AI image → post

Duplicate, edit, export—all in-app.

### 4. **RLM Mode (Pro/Hunter Only)**
Recursive Language Model processing for unbounded context:
- **Smart Chunking**: Intelligently splits large content into manageable chunks with configurable overlap
- **Recursive Processing**: Each chunk processed independently, then synthesized into coherent results
- **Context Preservation**: Overlap between chunks maintains narrative flow and semantic continuity
- **Multi-Model Support**: Use different models for root and recursive processing
- **Configurable**: Adjust chunk size, overlap %, and max tokens per chunk
- **Unlocked Features**:
  - Extract DNA: Full website crawl with infinite context
  - Battle Mode: Deep competitive analysis across large datasets
  - Closer Agent: Complete conversation history analysis

### 5. **UI/UX**
- **New sidebar** with Automations, AI Agents, Flows, RLM Settings (separated by dividers)
- **Keep existing features** (Extract DNA, Dashboard, Campaigns, Battle, Sonic, Agent Forge)
- **Freemium**: Lock RLM behind Pro/Agency tiers
- **RLM Indicator**: Visual badge shows "RLM Active" with chunk processing progress
- **Dark mode** by default

## Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/jbino85/CoreDNA.git
   cd CoreDNA
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys:
   # - GEMINI_API_KEY
   # - OPENAI_API_KEY (for CrewAI)
   # - RESEND_API_KEY or GMAIL credentials
   # - TWITTER_API_KEY, META_APP_ID, etc.
   ```

3. **Run Frontend**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173`

4. **Run Backend** (in a separate terminal)
   ```bash
   npx tsx server.ts
   ```
   Backend runs at `http://localhost:3001`

5. **Test Health Check**
   ```bash
   curl http://localhost:3001/api/health
   ```

## Architecture

```
Core DNA Platform
├── Frontend (React + Vite)
│   ├── Pages
│   │   ├── ExtractPage (existing)
│   │   ├── DashboardPage (existing)
│   │   ├── WorkflowsPage (NEW - n8n)
│   │   ├── AgentsPage (NEW - CrewAI)
│   │   └── FlowsPage (NEW - Langflow)
│   └── Services
│       ├── n8nService.ts
│       ├── crewaiService.ts
│       └── langflowService.ts
├── Backend (Express)
│   ├── POST /api/agents/closer-swarm/execute
│   ├── POST /api/workflows/:workflowId/execute
│   ├── POST /api/flows/:flowId/execute
│   └── GET /api/health
└── Storage
    ├── localStorage (flows, conversations)
    ├── Firestore (optional - conversations)
    └── Qdrant (existing - semantic search)
```

## API Endpoints

### Health
- `GET /api/health` → Server status

### CrewAI Agents
- `POST /api/agents/closer-swarm/execute` → Run sales swarm
- `POST /api/agents/conversations` → Log conversation
- `GET /api/agents/executions/:executionId` → Get swarm status

### n8n Workflows
- `POST /api/workflows/:workflowId/execute` → Run workflow
- `GET /api/executions/:executionId` → Get workflow status

### Langflow Flows
- `POST /api/flows/:flowId/execute` → Run flow

## Environment Setup

See `.env.example` for full list. Key variables:

```env
# Frontend
VITE_API_BASE_URL=http://localhost:3001

# AI Providers
GEMINI_API_KEY=...
OPENAI_API_KEY=...

# Automation
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=...

# Agents
CREWAI_MODEL=gpt-4-turbo

# Flows
LANGFLOW_BASE_URL=http://localhost:7860

# Email
RESEND_API_KEY=...

# Social Media
TWITTER_API_KEY=...
META_APP_ID=...
```

## Deployment

### Fly.io (Recommended)

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create Fly App**
   ```bash
   fly auth login
   fly launch
   ```

3. **Set Secrets**
   ```bash
   fly secrets set GEMINI_API_KEY=xxx
   fly secrets set OPENAI_API_KEY=xxx
   # ... set all variables from .env.example
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

### Vercel (Frontend only)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

Backend should run on Fly.io or another server.

## Project Structure

```
CoreDNA/
├── pages/
│   ├── ExtractPage.tsx
│   ├── DashboardPage.tsx
│   ├── WorkflowsPage.tsx (NEW)
│   ├── AgentsPage.tsx (NEW)
│   ├── FlowsPage.tsx (NEW)
│   └── services/
│       ├── geminiService.ts
│       ├── n8nService.ts (NEW)
│       ├── crewaiService.ts (NEW)
│       └── langflowService.ts (NEW)
├── components/
│   └── Layout.tsx (updated with new nav)
├── contexts/
│   └── AuthContext.tsx
├── App.tsx (updated with new routes)
├── server.ts (NEW)
├── .env.example (NEW)
└── package.json (updated deps)
```

## Development

### Add a New Workflow Node
Edit `pages/services/n8nService.ts` → `PRE_CONFIGURED_NODES`:
```typescript
const PRE_CONFIGURED_NODES = {
  yourNode: {
    id: 'your-node',
    type: 'http.request',
    name: 'Your Node Name',
    config: { /* ... */ }
  }
};
```

### Add a New Agent Role
Edit `pages/services/crewaiService.ts` → `CLOSER_SWARM.agents`:
```typescript
{
  role: 'your_role',
  model: 'gpt-4-turbo',
  systemPrompt: 'Your system prompt...',
  temperature: 0.5,
  maxTokens: 2000
}
```

### Add a New Flow Template
Edit `pages/services/langflowService.ts` → `FLOW_TEMPLATES`:
```typescript
yourFlow: {
  id: 'flow-your-flow',
  name: 'Your Flow Name',
  nodes: [ /* ... */ ],
  connections: [ /* ... */ ]
}
```

## Feature Flags

Control which features are available by tier:

```env
UNLOCK_AUTOMATIONS_TIER=pro      # n8n workflows
UNLOCK_AGENTS_TIER=pro          # CrewAI swarms
UNLOCK_FLOWS_TIER=agency        # Langflow flows
```

## Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001
# Kill process if needed
kill -9 <PID>
```

### Frontend can't reach backend
```bash
# Ensure VITE_API_BASE_URL is correct
echo $VITE_API_BASE_URL
# Default: http://localhost:3001
```

### Workflow execution fails
```bash
# Check n8n is running
curl http://localhost:5678/api/v1/health
# Verify N8N_API_KEY is valid
```

## Performance & Scaling

- **Workflows**: Direct n8n API calls (scales with n8n)
- **Agents**: Queue-based execution (add Bull/RabbitMQ for production)
- **Flows**: Async with WebSocket updates (optional)
- **Storage**: localStorage → Firestore/PostgreSQL

## Security

- [ ] Add JWT authentication to backend
- [ ] Hash sensitive config in .env
- [ ] Rate limit API endpoints
- [ ] CORS whitelist in production
- [ ] Encrypt conversation logs

## Roadmap

- [ ] Real-time flow visualization editor
- [ ] Advanced agent prompt customization
- [ ] Multi-user workspace support
- [ ] Workflow version control
- [ ] Integration marketplace
- [ ] Advanced analytics & reporting
- [x] RLM Mode for infinite context processing (v1 - basic implementation)
- [ ] RLM streaming responses
- [ ] RLM cost estimation before processing
- [ ] RLM result caching and versioning

## RLM Configuration

### Enabling RLM Mode

1. Navigate to **Settings** → **RLM Mode** tab
2. Toggle **RLM Mode (Infinite Context)** ON
3. Configure:
   - **Root Model**: LLM for initial context decomposition
   - **Recursive Model**: LLM for chunk processing and synthesis
   - **Chunk Size (KB)**: 256-2048 KB (default: 512)
   - **Context Overlap (%)**: 0-50% (default: 10%)
   - **Max Tokens/Chunk**: 2000-32000 (default: 8000)

### How RLM Works

1. **Chunking**: Content is split into overlapping chunks (overlap maintains narrative flow)
2. **Recursive Processing**: Each chunk is analyzed independently using the recursive model
3. **Synthesis**: Results from all chunks are combined into a coherent, unified output
4. **Context Preservation**: Overlap between chunks prevents information loss at boundaries

### Best Practices

- **Chunk Size**: Larger chunks = fewer API calls but higher latency. Start with 512 KB.
- **Overlap**: 10-15% overlap is usually sufficient. Higher overlap = higher cost.
- **Token Budget**: Higher tokens improve quality but increase cost. Budget accordingly.
- **Model Selection**: Use faster/cheaper models for chunking, quality models for synthesis.

### Example Use Case

**Task**: Extract brand DNA from a 50-page website

1. Website content: ~500 KB
2. Split into 5 overlapping chunks of 512 KB each
3. Each chunk processed by Claude → 5 API calls
4. Results synthesized into single, coherent DNA report
5. **Benefit**: Process entire site without context window limitations

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add feature'`
4. Push: `git push origin feature/your-feature`
5. Open a PR

## License

MIT

## Support

- GitHub Issues: Report bugs
- Docs: [in-repo DEPLOYMENT.md]
- Discord: [join community]

---

**Built with:**
- React + Vite
- n8n (workflow automation)
- CrewAI (agent orchestration)
- Langflow (visual AI)
- Express (backend)
- Tailwind CSS (styling)

**Deploy now:** `npm run build && fly deploy`
