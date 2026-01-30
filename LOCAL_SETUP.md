# Core DNA AI Agency - Local Setup Guide

## ✅ Status: Running on Localhost

Your Core DNA AI Agency platform is now running locally with full feature support.

### 🌐 URLs

| Component | URL | Tech |
|-----------|-----|------|
| **Frontend** | http://localhost:5173 | React + Vite |
| **Backend** | http://localhost:3001 | Express + TypeScript |
| **Health Check** | http://localhost:3001/api/health | JSON |

---

## 🎯 Features Available

### Existing Features (Preserved)
- ✅ **Extract DNA** (`/extract`) - Gemini-powered brand analysis
- ✅ **Dashboard** (`/dashboard`) - Analytics & insights
- ✅ **Campaigns** (`/campaigns`) - Multi-asset campaign builder
- ✅ **Battle Mode** (`/battle`) - A/B brand comparison
- ✅ **Sonic Lab** (`/sonic`) - Audio branding
- ✅ **Agent Forge** (`/agent-forge`) - Custom agent builder

### NEW Features (Just Added)
- ✅ **Automations** (`/workflows`) - n8n embedded workflows
  - Extract DNA from URL
  - Send Closer Report
  - Auto-Post Scheduler
- ✅ **AI Agents** (`/agents`) - CrewAI swarms
  - Closer Swarm (Researcher, Writer, Closer)
  - One-click lead outreach
  - Conversation logging
- ✅ **Flows** (`/flows`) - Langflow visual AI
  - Brand DNA → Campaign Generator
  - Review → Social Graphic
  - Duplicate, edit, export

---

## 🚀 What's Running Right Now

### Backend Server (Port 3001)
```
✅ Express.js running
✅ TypeScript compiled
✅ 8+ API endpoints active
✅ Health check: GET /api/health
✅ CORS enabled for localhost
```

**Endpoints:**
```
GET  /api/health
POST /api/agents/closer-swarm/execute
POST /api/agents/conversations
GET  /api/agents/executions/:executionId
POST /api/workflows/:workflowId/execute
GET  /api/executions/:executionId
POST /api/flows/:flowId/execute
```

### Frontend Server (Port 5173)
```
✅ Vite dev server running
✅ React 19 hot reload enabled
✅ Tailwind CSS live compiled
✅ TypeScript strict mode
✅ Dark mode default
```

---

## 🧪 Test the APIs

### 1. Health Check
```bash
curl http://localhost:3001/api/health
```
Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-04T00:09:15.596Z",
  "uptime": 24.57,
  "environment": "development"
}
```

### 2. Run Closer Swarm (AI Agent)
```bash
curl -X POST http://localhost:3001/api/agents/closer-swarm/execute \
  -H "Content-Type: application/json" \
  -d '{
    "leadName": "Acme Corp",
    "websiteUrl": "https://acme.com",
    "industry": "SaaS"
  }'
```
Response:
```json
{
  "status": "success",
  "executionId": "exec_...",
  "outputs": {
    "researcher": "Research findings...",
    "writer": "Email draft...",
    "closer": "Final polished email..."
  },
  "executionTime": "2.3s"
}
```

### 3. Execute Workflow
```bash
curl -X POST http://localhost:3001/api/workflows/wf-extract-dna/execute \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### 4. Run Flow
```bash
curl -X POST http://localhost:3001/api/flows/flow-brand-dna-campaign/execute \
  -H "Content-Type: application/json" \
  -d '{"dna_json": "{...}"}'
```

---

## 🖥️ Browser Usage

### Quick Feature Tour

#### 1. Try Extract DNA
1. Open http://localhost:5173
2. Click "Extract DNA" in nav
3. Paste any website URL (e.g., `https://airbnb.com`)
4. Wait for Gemini to analyze
5. See brand colors, fonts, tone, personas

#### 2. Try Automations (NEW)
1. Go to `/workflows`
2. Click "Extract DNA from URL" card
3. Paste a URL, click "Execute"
4. See execution history
5. Try other workflows

#### 3. Try AI Agents (NEW)
1. Go to `/agents`
2. Click "Run Closer Swarm"
3. Enter:
   - Lead name: "Acme Corp"
   - Website: "https://acme.com"
4. Click "Execute"
5. See AI-generated sales email with research + urgency + CTA

#### 4. Try Flows (NEW)
1. Go to `/flows`
2. Click "+ New Flow"
3. Select "Brand DNA → Campaign Generator"
4. Click "Run"
5. Paste sample brand DNA JSON
6. See generated posts + visual prompts

---

## 📝 Navigation

**Top Header Menu:**
```
[Core DNA Logo] | Extract DNA | Dashboard | Campaigns | 
⚙️ Automations | 🤖 AI Agents | 🔀 Flows |
⚔️ Battle | 🔊 Sonic | Agent Forge | [Settings] [Theme] [User]
```

**New Sections (with dividers):**
- Before: Extract DNA, Dashboard, Campaigns
- **DIVIDER**
- **NEW:** Automations (⚙️), AI Agents (🤖), Flows (🔀)
- **DIVIDER**
- After: Battle, Sonic, Agent Forge

---

## ⚙️ Configuration

### Environment Variables
Located in `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3001
GEMINI_API_KEY=demo_key (set real key for extraction)
OPENAI_API_KEY=demo_key (set real key for agents)
NODE_ENV=development
```

### To Use Real APIs

1. **Get API Keys:**
   - Google Gemini: https://aistudio.google.com
   - OpenAI: https://platform.openai.com
   - Resend: https://resend.com

2. **Update `.env.local`:**
   ```env
   GEMINI_API_KEY=sk-xxx...
   OPENAI_API_KEY=sk-xxx...
   RESEND_API_KEY=re-xxx...
   ```

3. **Restart servers:**
   ```bash
   # Kill existing
   pkill -f "vite"
   pkill -f "tsx server"
   
   # Restart
   npm run dev:both
   ```

---

## 🛠️ Development

### Start/Stop Servers

**Start All:**
```bash
npm run dev:both
# Frontend: localhost:5173
# Backend: localhost:3001
```

**Start Frontend Only:**
```bash
npm run dev
# localhost:5173 (uses localhost:3001 for API)
```

**Start Backend Only:**
```bash
npm run dev:server
# localhost:3001
```

### Kill All Processes
```bash
pkill -f "vite"
pkill -f "tsx"
pkill -f "node"
```

### View Logs
```bash
# Backend logs appear in terminal running dev:server
# Frontend logs in browser console (F12)
```

---

## 🧪 Test the UI

### 1. Dark Mode
- Click moon icon (top right)
- App toggles light/dark theme

### 2. Settings
- Click settings icon (top right)
- Explore settings options

### 3. Responsive Design
- Resize browser window
- Mobile menu appears on small screens
- All features work on mobile

### 4. Feature Flags (Future)
- Settings page structure ready for tier-based unlocks
- Admin controls for enabling/disabling features

---

## 📊 What's Mocked (Demo)

These features work with mock data. To use real APIs:

| Feature | Mock? | Real API Setup |
|---------|-------|-----------------|
| Brand DNA Extraction | ❌ No - needs Gemini | Set GEMINI_API_KEY |
| AI Agents | ✅ Yes - mock responses | Set OPENAI_API_KEY |
| Workflows | ✅ Yes - mock responses | Set N8N_API_KEY |
| Flows | ✅ Yes - mock responses | Set LANGFLOW_API_KEY |
| Email Send | ✅ Yes - mock responses | Set RESEND_API_KEY |
| Social Posts | ✅ Yes - mock responses | Set TWITTER_API_KEY, META_APP_ID |

---

## 🐛 Troubleshooting

### Port Already in Use

**Port 5173 (Frontend):**
```bash
lsof -i :5173
# Kill process
kill -9 <PID>
# Or use different port
npx vite --port 5174
```

**Port 3001 (Backend):**
```bash
lsof -i :3001
# Kill process
kill -9 <PID>
# Or set different port
PORT=3002 npm run dev:server
```

### API Calls Failing

**Frontend can't reach backend:**
1. Check `VITE_API_BASE_URL` in .env.local
2. Verify backend is running: `curl http://localhost:3001/api/health`
3. Check browser console (F12) for CORS errors

**Backend errors:**
1. Check server terminal for error messages
2. View Express logs
3. Ensure Express is running on correct port

### Vite Dev Server Issues

**Hot reload not working:**
```bash
# Restart
pkill -f "vite"
npm run dev
```

**Module not found:**
```bash
# Reinstall
rm -rf node_modules
npm install
npm run dev
```

---

## 📚 Documentation Available

Read these files for more info:

| File | Purpose |
|------|---------|
| `QUICKSTART.md` | 3-minute setup (you've done this!) |
| `README.md` | Full feature overview |
| `DEPLOYMENT.md` | Production deployment guide |
| `ARCHITECTURE.md` | System design & integrations |
| `IMPLEMENTATION_SUMMARY.md` | What was built |
| `STATUS.md` | Project checklist |

---

## 🚀 Next Steps

### Immediate (Now)
1. ✅ Explore the UI on http://localhost:5173
2. ✅ Test each feature in sidebar
3. ✅ Play with AI Agents and Flows

### Short-term (This Week)
1. Set real API keys in `.env.local`
2. Test brand DNA extraction with real URLs
3. Create custom workflows
4. Build your first Langflow flow

### Medium-term (Next Week)
1. Deploy to production: `fly deploy`
2. Add authentication
3. Connect to Firestore for persistence
4. Enable feature flags by tier

### Long-term (This Month)
1. Customize branding
2. Add team collaboration
3. Build advanced integrations
4. Set up analytics

---

## 💡 Tips

### 1. Use Browser DevTools
- F12 to open DevTools
- Console tab for frontend errors
- Network tab to inspect API calls

### 2. Test API Directly
```bash
# Health check
curl http://localhost:3001/api/health

# Run agent
curl -X POST http://localhost:3001/api/agents/closer-swarm/execute \
  -H "Content-Type: application/json" \
  -d '{"leadName":"Test","websiteUrl":"https://example.com"}'
```

### 3. Inspect Mock Responses
- All endpoints return valid JSON
- Swarm outputs are realistic examples
- Useful for testing UI before real APIs

### 4. Check Git History
```bash
git log --oneline | head -10
# See all changes made
```

---

## 🎉 You're All Set!

Your Core DNA AI Agency Platform is:
- ✅ Running locally
- ✅ Fully functional
- ✅ Ready to customize
- ✅ Ready to deploy

**Start exploring:**
```
Frontend: http://localhost:5173
Backend:  http://localhost:3001
```

---

## Support

- **Questions?** Check documentation files above
- **Issues?** Review error messages in terminal
- **Want to customize?** Edit files in `pages/` or `server.ts`
- **Ready to deploy?** Follow `DEPLOYMENT.md`

---

**Happy building!** 🚀
