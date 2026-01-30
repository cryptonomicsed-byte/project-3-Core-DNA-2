# Core DNA AI Agency - Architecture

Full system design for the unified AI agency platform.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Core DNA Platform                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   n8n        │  │   CrewAI     │  │  Langflow    │      │
│  │ Workflows    │  │  Agents      │  │  Flows       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           │                                 │
│                     ┌─────▼──────┐                         │
│                     │   Backend   │                         │
│                     │  Express    │                         │
│                     └─────┬──────┘                         │
│                           │                                 │
│       ┌───────────────────┼───────────────────┐            │
│       │                   │                   │            │
│  ┌────▼──┐         ┌──────▼──┐        ┌──────▼──┐        │
│  │ n8n   │         │ CrewAI  │        │Langflow│        │
│  │ APIs  │         │ Agents  │        │ APIs   │        │
│  └───────┘         └─────────┘        └────────┘        │
│       │                   │                   │            │
│       └───────────────────┼───────────────────┘            │
│                           │                                 │
│         ┌─────────────────┴──────────────────┐            │
│         │                                    │            │
│    ┌────▼────┐    ┌─────────┐    ┌────────┐│            │
│    │ Frontend │    │Firebase │    │External││            │
│    │ (React)  │    │Firestore│    │ APIs  ││            │
│    └──────────┘    └─────────┘    └────────┘│            │
│                                              │            │
└──────────────────────────────────────────────┘            │
```

## Frontend Architecture

### Technology Stack
- **Framework**: React 19.2.3
- **Bundler**: Vite 6.2.0
- **Routing**: React Router 7.11.0
- **Styling**: Tailwind CSS 3.4.1
- **Charts**: Recharts 3.6.0
- **Animations**: Framer Motion 12.23.26
- **PDF Generation**: jsPDF + html2canvas
- **HTTP Client**: Native Fetch API

### Page Structure

```
App.tsx (routes)
│
├── Layout.tsx (header + nav)
│   ├── Navigation Menu
│   │   ├── Extract DNA
│   │   ├── Dashboard
│   │   ├── Campaigns
│   │   ├── [Divider]
│   │   ├── ⚙️ Automations (NEW)
│   │   ├── 🤖 AI Agents (NEW)
│   │   ├── 🔀 Flows (NEW)
│   │   ├── [Divider]
│   │   ├── ⚔️ Battle
│   │   ├── 🔊 Sonic
│   │   └── Agent Forge
│   └── User Menu / Settings / Dark Mode
│
└── Pages
    ├── LandingPage.tsx
    ├── ExtractPage.tsx (existing - brand DNA extraction)
    ├── DashboardPage.tsx (existing - analytics)
    ├── CampaignsPage.tsx (existing - multi-asset campaigns)
    ├── BrandSimulatorPage.tsx (existing)
    ├── BattleModePage.tsx (existing - A/B brand comparison)
    ├── SonicLabPage.tsx (existing - audio branding)
    ├── AgentForgePage.tsx (existing - custom agent builder)
    ├── LiveSessionPage.tsx (existing)
    ├── SettingsPage.tsx (existing)
    ├── WorkflowsPage.tsx (NEW - n8n workflows)
    ├── AgentsPage.tsx (NEW - CrewAI swarms)
    ├── FlowsPage.tsx (NEW - Langflow flows)
    └── SharedProfilePage.tsx (public share)
```

### Service Layer

```
pages/services/
├── geminiService.ts (existing)
│   ├── extractBrandDNA()
│   ├── analyzeBrand()
│   └── generateVisuals()
│
├── pdfService.ts (existing)
│   ├── generateReport()
│   └── exportCampaign()
│
├── n8nService.ts (NEW)
│   ├── createWorkflow()
│   ├── executeWorkflow()
│   ├── getExecutionStatus()
│   └── PRE_CONFIGURED_NODES
│       ├── extractDNA
│       ├── sendCloserReport
│       └── autoPostScheduler
│
├── crewaiService.ts (NEW)
│   ├── executeCloserSwarm()
│   ├── logConversation()
│   ├── getConversationLogsLocal()
│   └── CLOSER_SWARM (pre-configured)
│       ├── Researcher agent
│       ├── Writer agent
│       └── Closer agent
│
└── langflowService.ts (NEW)
    ├── createFlowFromTemplate()
    ├── executeFlow()
    ├── duplicateFlow()
    ├── exportFlowAsJSON()
    ├── importFlowFromJSON()
    └── FLOW_TEMPLATES
        ├── Brand DNA → Campaign Generator
        └── Review → Social Graphic
```

### State Management

**Using**: React Context + Hooks + localStorage

```
App.tsx
├── darkMode (state)
├── toggleDarkMode (function)
│
└── AuthContext.tsx
    ├── user (current user)
    ├── tier (free/pro/agency)
    ├── login() / logout()
    └── features (feature flags)
```

**Local Storage Keys:**
```
n8n_workflows           → Saved n8n workflows
langflow_flows          → Saved Langflow flows
crewai_conversations    → Conversation history
core_dna_cache          → Cached extractions
```

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js 20+
- **Framework**: Express 4.19.2
- **Type Safety**: TypeScript
- **CLI**: tsx (for TypeScript execution)
- **Port**: 3001

### Server Structure

```
server.ts
├── Express app setup
│   ├── Middleware (JSON, CORS)
│   ├── Health check endpoint
│   │
│   ├── CrewAI Agent Routes
│   │   ├── POST /api/agents/closer-swarm/execute
│   │   │   └── Execute 3-agent swarm
│   │   ├── POST /api/agents/conversations
│   │   │   └── Log conversation
│   │   └── GET /api/agents/executions/:id
│   │       └── Get swarm status
│   │
│   ├── n8n Workflow Routes
│   │   ├── POST /api/workflows/:workflowId/execute
│   │   │   └── Run n8n workflow
│   │   └── GET /api/executions/:id
│   │       └── Get workflow status
│   │
│   ├── Langflow Routes
│   │   └── POST /api/flows/:flowId/execute
│   │       └── Run Langflow flow
│   │
│   ├── Error handler
│   └── Server startup (port 3001)
```

### API Endpoint Details

#### 1. Health Check
```
GET /api/health
Response: {
  status: "healthy",
  timestamp: "2025-01-03T...",
  uptime: 1234.5,
  environment: "production"
}
```

#### 2. CrewAI Closer Swarm
```
POST /api/agents/closer-swarm/execute
Body: {
  leadName: "Acme Corp",
  websiteUrl: "https://acme.com",
  industry?: "SaaS",
  context?: "Additional notes"
}

Response: {
  status: "success",
  executionId: "exec_123456",
  outputs: {
    researcher: "Research findings...",
    writer: "Email draft...",
    closer: "Final polished email..."
  },
  executionTime: "2.3s"
}
```

#### 3. Workflow Execution
```
POST /api/workflows/:workflowId/execute
Body: {
  url?: "https://example.com",
  recipient_email?: "user@example.com",
  content?: "Email content",
  platform?: "twitter"
}

Response: {
  status: "success",
  executionId: "exec_789...",
  result: { ... }
}
```

#### 4. Flow Execution
```
POST /api/flows/:flowId/execute
Body: {
  dna_json?: "{...}",
  review_text?: "Great product!"
}

Response: {
  status: "success",
  executionId: "exec_...",
  output: { ... }
}
```

## Data Flow

### 1. Brand DNA Extraction Flow

```
User Input (URL)
    │
    ├─→ ExtractPage.tsx
    │      │
    │      └─→ geminiService.extractBrandDNA(url)
    │             │
    │             └─→ Gemini API
    │                   │
    │                   └─→ Returns brand analysis
    │
    └─→ Store in localStorage/Context
         │
         └─→ Display in Dashboard
```

### 2. Automation Workflow Flow

```
User selects Workflow (WorkflowsPage)
    │
    └─→ Fill inputs (URL, email, content, etc.)
         │
         └─→ n8nService.executeWorkflow(id, input)
              │
              └─→ POST /api/workflows/:id/execute
                   │
                   └─→ Backend calls n8n API
                        │
                        └─→ Workflow executes
                             │
                             └─→ Return result
                                  │
                                  └─→ Display in UI
                                       │
                                       └─→ Store in executions history
```

### 3. AI Agent Swarm Flow

```
User enters lead info (AgentsPage)
    │
    └─→ crewaiService.executeCloserSwarm(leadInfo)
         │
         └─→ POST /api/agents/closer-swarm/execute
              │
              └─→ Backend orchestrates 3 agents:
                   │
                   ├─→ Researcher agent
                   │      └─→ Research lead site
                   │
                   ├─→ Writer agent (input from Researcher)
                   │      └─→ Draft email
                   │
                   └─→ Closer agent (input from Writer)
                          └─→ Polish email + add urgency
              │
              └─→ Return final email
                   │
                   └─→ Save conversation log (localStorage/Firestore)
                        │
                        └─→ Display in UI
```

### 4. Langflow Visual Flow

```
User creates/duplicates flow (FlowsPage)
    │
    ├─→ LangflowService.createFlowFromTemplate(id)
    │      └─→ Load flow definition
    │
    └─→ User clicks "Run"
         │
         └─→ langflowService.executeFlow(flowId, input)
              │
              └─→ POST /api/flows/:flowId/execute
                   │
                   └─→ Backend calls Langflow API
                        │
                        └─→ Execute flow nodes in sequence
                             │
                             └─→ Return output
                                  │
                                  └─→ Display in UI
```

## Storage Architecture

### Frontend Storage

**localStorage** (Primary for MVP)
```json
{
  "n8n_workflows": [{id, name, nodes, connections, ...}],
  "langflow_flows": [{id, name, nodes, connections, ...}],
  "crewai_conversations": [{id, userId, leadInfo, response, timestamp}],
  "core_dna_cache": [{id, dna, createdAt}]
}
```

### Backend Storage (Optional)

**Firestore** (Recommended for production)
```
├── conversations/
│   ├── {conversationId}
│   │   ├── userId: string
│   │   ├── leadInfo: object
│   │   ├── response: string
│   │   ├── timestamp: number
│   │   └── executionId: string
│
├── workflows/
│   ├── {workflowId}
│   │   ├── name: string
│   │   ├── executions: [{status, output, timestamp}]
│   │   └── createdAt: number
│
└── flows/
    ├── {flowId}
    │   ├── name: string
    │   ├── executions: [{status, output, timestamp}]
    │   └── createdAt: number
```

## Integration Points

### 1. n8n Integration

**Option A: Headless API**
```typescript
// Embed n8n API calls
POST http://n8n-server:5678/api/v1/workflows/:id/execute
Headers: { Authorization: Bearer API_KEY }
```

**Option B: Self-Hosted n8n**
- Install n8n separately
- Create workflows in n8n UI
- Reference workflow IDs in Core DNA

### 2. CrewAI Integration

**Local Execution** (MVP)
- Run CrewAI agents on backend
- Use OpenAI API for LLM calls
- Mock responses for demo

**Production Setup**
- Queue system (Bull/RabbitMQ) for agent execution
- Persistent agent state tracking
- Retry logic for failed agents

### 3. Langflow Integration

**Option A: Self-Hosted**
```bash
docker run -d -p 7860:7860 langflowai/langflow:latest
```

**Option B: Langflow Cloud**
- Create flows in cloud UI
- Use API to trigger flows

### 4. External APIs

```
┌─────────────────────────────────┐
│     External Services           │
├─────────────────────────────────┤
│                                 │
│  LLM Providers:                 │
│  ├─ Google Gemini (DNA)         │
│  ├─ OpenAI (CrewAI agents)      │
│  └─ Anthropic Claude (alt)      │
│                                 │
│  Automation:                    │
│  ├─ n8n Cloud API               │
│  └─ Make.com (alternative)      │
│                                 │
│  Email:                         │
│  ├─ Resend API                  │
│  └─ Gmail OAuth                 │
│                                 │
│  Social Media:                  │
│  ├─ Twitter API v2              │
│  ├─ Meta/Facebook API           │
│  └─ LinkedIn API                │
│                                 │
│  Image Generation:              │
│  ├─ Ideogram API                │
│  ├─ Midjourney Discord          │
│  └─ Stability AI                │
│                                 │
│  Storage:                       │
│  ├─ Firebase/Firestore          │
│  ├─ Supabase (PostgreSQL)       │
│  └─ AWS S3 (optional)           │
│                                 │
└─────────────────────────────────┘
```

## Deployment Architecture

### Development
```
Local Machine
├── Frontend (Vite dev server :5173)
├── Backend (Express :3001)
└── External APIs (Gemini, OpenAI, etc.)
```

### Production (Fly.io)
```
Fly.io Deployment
│
├── Docker Container
│   ├── Frontend (built with Vite)
│   │   └── dist/ (static files)
│   │
│   └── Backend (Express)
│       └── server.ts
│
├── Volume Storage (/data)
│   └── Optional persistent storage
│
└── Health Check
    └── GET /api/health
```

### Alternative Deployments

**Vercel (Frontend only)**
```
Vercel
└── React SPA
     └── Calls backend on different domain
```

**Docker Compose (Full stack)**
```
docker-compose.yml
├── core-dna-web (Express + static files)
├── n8n (optional, embedded workflows)
└── postgres (optional, for conversations)
```

## Security Considerations

### Current Implementation
- Environment variables for secrets (.env.local)
- No authentication (MVP)
- CORS enabled for all origins

### Production Checklist
- [ ] Add JWT authentication
- [ ] Implement API rate limiting
- [ ] CORS whitelist specific domains
- [ ] Encrypt sensitive data
- [ ] Use HTTPS everywhere
- [ ] Add request validation
- [ ] Implement error logging (Sentry)
- [ ] Regular security audits

## Performance Optimization

### Frontend
- Code splitting (lazy load routes)
- Image optimization
- Memoization (React.memo)
- LocalStorage caching

### Backend
- Connection pooling
- Response caching
- Batch API requests
- Async/await for non-blocking I/O

### Database
- Indexes on frequently queried fields
- Pagination for large datasets
- Archive old conversation logs

## Monitoring & Logging

### Current
- Console logs in development
- Browser DevTools for frontend debugging

### Production
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Fly.io metrics** for infrastructure
- **Google Analytics** for user behavior

## Future Enhancements

### Phase 2
- [ ] Real-time flow editor (visual canvas)
- [ ] Multi-user collaboration
- [ ] Workflow version control
- [ ] Advanced scheduling (cron)
- [ ] Team workspaces
- [ ] Role-based access control (RBAC)

### Phase 3
- [ ] Integration marketplace
- [ ] Custom node builder
- [ ] Advanced analytics
- [ ] API quota management
- [ ] Webhook system
- [ ] Plugin system

### Phase 4
- [ ] AI-powered flow generation
- [ ] Auto-optimization suggestions
- [ ] Cost analytics
- [ ] Enterprise SSO
- [ ] Multi-region deployment

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `App.tsx` | Routes & app setup |
| `server.ts` | Express backend |
| `pages/services/n8nService.ts` | n8n integration |
| `pages/services/crewaiService.ts` | CrewAI agents |
| `pages/services/langflowService.ts` | Langflow flows |
| `pages/WorkflowsPage.tsx` | Workflow UI |
| `pages/AgentsPage.tsx` | Agent UI |
| `pages/FlowsPage.tsx` | Flow UI |
| `components/Layout.tsx` | Navigation & layout |
| `.env.example` | Config template |
| `Dockerfile` | Container build |
| `fly.toml` | Fly.io config |

---

This architecture is designed to be:
- **Modular**: Each component (n8n, CrewAI, Langflow) is independently pluggable
- **Scalable**: Easy to add new services or features
- **Maintainable**: Clear separation of concerns
- **Production-ready**: Can be deployed as-is or enhanced further
