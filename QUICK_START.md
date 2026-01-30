# Core DNA - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set API Key
Edit `.env.local` and add your Google Gemini API key:
```bash
GEMINI_API_KEY=your_google_genai_api_key_here
```

Get your free API key: https://ai.google.dev/

### 3. Run Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 🎯 Key Pages

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Introduction & demo |
| Extract DNA | `/extract` | Analyze websites for brand DNA |
| Dashboard | `/dashboard` | Manage brand profiles & campaigns |
| Campaigns | `/campaigns` | Create marketing assets |
| Brand Simulator | `/simulate` | Chat with your brand persona |
| Agent Forge | `/agent-forge` | Create custom AI agents |
| Battle Mode | `/battle` | Compare brands competitively |
| Sonic Lab | `/sonic` | Design audio branding |
| Settings | `/settings` | Configure AI providers |

---

## 📦 Available Scripts

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# TypeScript check (no emit)
npx tsc --noEmit
```

---

## 🔧 Troubleshooting

### "API Key is missing" Error
- Ensure `.env.local` has `GEMINI_API_KEY=your_key`
- Restart dev server after changing `.env.local`

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Large Bundle Warning
This is normal for feature-rich SPA. See DEBUG_REPORT.md for optimization suggestions.

---

## 📊 What Core DNA Does

1. **Extract Brand DNA** - Analyze any website to extract complete brand identity
2. **Generate Assets** - Create unlimited marketing content (images, videos, copy)
3. **Simulate Brand** - Chat as your brand with AI
4. **Battle Brands** - Compare your brand against competitors
5. **Audio Branding** - Design sonic identity (voice, music, sound effects)
6. **Agent Forge** - Create AI agents with specific roles (support, sales, etc.)
7. **Lead Hunting** - Find local business prospects with gap analysis
8. **Live Sessions** - Real-time team collaboration

---

## 🏗️ Architecture

- **Frontend**: React 19 + TypeScript + Vite
- **AI**: Google Gemini API (multi-provider support)
- **State**: React Context + localStorage
- **UI**: Tailwind CSS + Framer Motion
- **Exports**: PDF (jsPDF) + Images (html2canvas)

---

## 📝 File Structure

```
CoreDNA/
├── pages/                 # 11 main page components
│   └── services/         # Service modules
│       ├── pdfService.ts
│       └── workflowService.ts
├── components/           # 7 reusable components
├── contexts/             # React context (AuthContext)
├── types.ts             # TypeScript interfaces
├── constants.ts         # App constants
├── App.tsx              # Router configuration
├── index.tsx            # React entry point
└── styles.css           # Global styles
```

---

## ✅ Verification

All systems check:
```bash
# TypeScript
✅ npx tsc --noEmit

# Build
✅ npm run build

# Dev Server  
✅ npm run dev
```

---

## 🆘 Support

- API Key Issues: Check Google AI Studio (https://ai.google.dev/)
- TypeScript Errors: Run `npx tsc --noEmit` for full error list
- Build Issues: See DEBUG_REPORT.md for detailed analysis

---

**Status**: ✅ Ready to develop
**Last Updated**: 2026-01-02
