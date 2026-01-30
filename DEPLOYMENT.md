# Core DNA AI Agency - Deployment Guide

Deploy Core DNA in 5 minutes to production.

## Quick Start (Fly.io)

### Prerequisites
- GitHub account (with repo pushed)
- Fly.io account (free tier available)

### Step 1: Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
```

### Step 2: Authenticate
```bash
fly auth login
```

### Step 3: Launch App
```bash
cd CoreDNA
fly launch
# When prompted:
# - App name: core-dna-agency
# - Region: iad (or your preference)
# - PostgreSQL: No (we use localStorage + Firestore)
```

### Step 4: Set Secrets
```bash
# Copy from .env.example and set each one:

# AI Providers
fly secrets set GEMINI_API_KEY=your_key_here
fly secrets set OPENAI_API_KEY=your_key_here

# Email
fly secrets set RESEND_API_KEY=your_key_here

# Social Media
fly secrets set TWITTER_API_KEY=your_key_here
fly secrets set TWITTER_BEARER_TOKEN=your_token_here
fly secrets set META_APP_ID=your_id_here
fly secrets set META_APP_SECRET=your_secret_here

# Image Generation
fly secrets set IDEOGRAM_API_KEY=your_key_here

# n8n
fly secrets set N8N_API_KEY=your_key_here

# CrewAI
fly secrets set CREWAI_MODEL=gpt-4-turbo

# Langflow
fly secrets set LANGFLOW_API_KEY=your_key_here

# Firebase (optional, for conversation logs)
fly secrets set FIREBASE_PROJECT_ID=your_project_id
fly secrets set FIREBASE_PRIVATE_KEY='your_private_key'
```

### Step 5: Deploy
```bash
fly deploy
```

### Step 6: Verify Deployment
```bash
# Check status
fly status

# View logs
fly logs

# Test health endpoint
curl https://your-app-name.fly.dev/api/health
```

Your app is now live at `https://core-dna-agency.fly.dev`

---

## Detailed Setup by Component

### Frontend (React + Vite)

**Hosted on:** Fly.io (via Dockerfile)

Environment variables:
```env
VITE_API_BASE_URL=https://your-app-name.fly.dev
```

Build command (automatic):
```bash
npm run build
```

Output: `/dist` (served by Express)

### Backend (Express)

**Runs on:** Port 3001 (inside Docker container)

Endpoints:
- `GET /api/health` → Health check
- `POST /api/agents/closer-swarm/execute` → Run CrewAI swarm
- `POST /api/workflows/:workflowId/execute` → Execute n8n workflow
- `POST /api/flows/:flowId/execute` → Run Langflow flow

Start command:
```bash
npm run start
# or
tsx server.ts
```

### n8n Integration

**Option A: Self-Hosted**
```bash
# Run n8n locally or on separate server
docker run -d \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=your_password \
  n8nio/n8n

# Set in fly secrets:
fly secrets set N8N_BASE_URL=https://your-n8n-server.com
fly secrets set N8N_API_KEY=your_api_key
```

**Option B: n8n Cloud**
1. Go to https://n8n.cloud
2. Create account, get API key
3. Create workflows in cloud UI
4. Reference workflow IDs in Core DNA

### CrewAI Setup

Uses OpenAI's GPT-4 for agent reasoning. Configure in fly secrets:

```bash
fly secrets set OPENAI_API_KEY=your_openai_key
fly secrets set CREWAI_MODEL=gpt-4-turbo
fly secrets set CREWAI_TEMPERATURE=0.5
fly secrets set CREWAI_MAX_TOKENS=2000
```

CrewAI runs on backend—no additional setup needed.

### Langflow Integration

**Option A: Self-Hosted**
```bash
# Run Langflow locally
pip install langflow
langflow run --port 7860

# Set in fly secrets:
fly secrets set LANGFLOW_BASE_URL=https://your-langflow-server.com
fly secrets set LANGFLOW_API_KEY=your_api_key
```

**Option B: Langflow Cloud**
1. Sign up at https://langflow.org
2. Create flows in cloud UI
3. Get API key from dashboard
4. Reference in Core DNA

### Email Configuration

**Option A: Resend (Recommended)**
```bash
# Get API key from https://resend.com
fly secrets set RESEND_API_KEY=your_key_here
fly secrets set RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Option B: Gmail OAuth**
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Set in fly secrets:
   ```bash
   fly secrets set GMAIL_CLIENT_ID=...
   fly secrets set GMAIL_CLIENT_SECRET=...
   ```

### Social Media Setup

**Twitter/X API:**
```bash
fly secrets set TWITTER_API_KEY=...
fly secrets set TWITTER_API_SECRET=...
fly secrets set TWITTER_ACCESS_TOKEN=...
fly secrets set TWITTER_ACCESS_SECRET=...
fly secrets set TWITTER_BEARER_TOKEN=...
```

Get from: https://developer.twitter.com/en/portal

**Meta/Facebook API:**
```bash
fly secrets set META_APP_ID=...
fly secrets set META_APP_SECRET=...
fly secrets set META_ACCESS_TOKEN=...
fly secrets set META_BUSINESS_ACCOUNT_ID=...
```

Get from: https://developers.facebook.com

**LinkedIn API (optional):**
```bash
fly secrets set LINKEDIN_CLIENT_ID=...
fly secrets set LINKEDIN_CLIENT_SECRET=...
fly secrets set LINKEDIN_ACCESS_TOKEN=...
```

Get from: https://www.linkedin.com/developers

---

## Scaling & Monitoring

### Scale Compute
```bash
# Increase memory/CPU
fly scale vm --memory 1024 --cpus 2

# Add multiple regions
fly regions add lhr syd
```

### Monitor
```bash
# Real-time logs
fly logs -f

# Metrics
fly status

# Detailed monitoring
fly open /api/health
```

### Errors
Check logs for errors:
```bash
fly logs -e ERROR
```

---

## Database Setup (Optional)

For persistent conversation logs, set up Firestore or PostgreSQL:

### Firestore
1. Create Firebase project at https://firebase.google.com
2. Download service account JSON
3. Set environment variables:
   ```bash
   fly secrets set FIREBASE_PROJECT_ID=your_id
   fly secrets set FIREBASE_PRIVATE_KEY='your_key'
   fly secrets set FIREBASE_CLIENT_EMAIL=your_email
   ```

### Supabase (PostgreSQL)
1. Create project at https://supabase.com
2. Get connection string
3. Set:
   ```bash
   fly secrets set SUPABASE_URL=...
   fly secrets set SUPABASE_ANON_KEY=...
   ```

---

## Local Development

Run both frontend and backend locally:

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run dev:server

# Or both together
npm run dev:both
```

Test backend:
```bash
curl http://localhost:3001/api/health
```

Frontend: http://localhost:5173

---

## CI/CD (Optional)

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Fly

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

---

## Troubleshooting

### App won't start
```bash
fly logs -e ERROR
```
Check logs for error messages and error codes.

### Backend can't reach external APIs
- Verify API keys in `fly secrets list`
- Check network access (firewall, VPN)
- Test endpoint manually: `curl https://api.example.com`

### Frontend can't reach backend
- Verify `VITE_API_BASE_URL` in frontend build
- Check CORS settings in `server.ts`
- Test: `curl https://your-app.fly.dev/api/health`

### Database connection fails
- Verify connection string environment variable
- Test connection locally first
- Check firewall rules on database

### High latency
- Check Fly.io region (use closest one)
- Increase VM CPU/memory
- Use CDN for static assets (Cloudflare)

---

## Costs

**Fly.io (estimated monthly):**
- Shared CPU, 512 MB RAM: ~$5/month (free tier available)
- 3 vCPU, 1 GB RAM: ~$25/month
- Scale up as needed

**External APIs:**
- Gemini (free tier available): ~$10/month
- OpenAI GPT-4: ~$30-100/month (depending on usage)
- Resend (email): $0.20 per email after free tier
- Twitter API: Free (with developer account)
- Meta API: Free for basic access

---

## Next Steps

1. Deploy to Fly.io
2. Set all secrets
3. Test `/api/health` endpoint
4. Create your first workflow in n8n
5. Run a CrewAI agent test
6. Build your first Langflow flow
7. Customize branding in settings

---

## Support

- Fly.io Docs: https://fly.io/docs
- GitHub Issues: Report bugs
- Email: support@coredna.io (when ready)

---

**Deployment complete!** 🚀

Your Core DNA AI Agency is now running at:
```
https://core-dna-agency.fly.dev
```
