
export interface BrandColor {
  hex: string;
  name: string;
  usage: string;
}

export interface BrandFont {
  family: string;
  usage: string;
  description: string;
}

export interface Persona {
  name: string;
  demographics: string;
  psychographics: string;
  painPoints: string[];
  behaviors: string[];
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CompetitorAnalysis {
  name: string;
  differentiation: string; // How our brand differs
}

export interface VisualIdentityExtended {
    logoUrl?: string; // Uploaded by user
    logoStyle: string;
    logoGenPrompt: string; // Prompt to generate a concept
    logoConcepts: string[]; // Text descriptions of 3 concepts
    generatedLogoUrl?: string;

    patternStyle: string;
    patternGenPrompt: string;
    generatedPatternUrl?: string;

    iconographyStyle: string;
    iconGenPrompt: string;
    generatedIconUrl?: string; // An image showing a set of icons

    moodBoardPrompts: string[]; // 3-4 prompts for mood images
    generatedMoodBoardUrls?: string[];
}

export interface SonicIdentity {
    voiceType: string; // e.g. "Warm, deep, authoritative"
    musicGenre: string; // e.g. "Lo-fi beats, Orchestral swell"
    soundKeywords: string[]; // e.g. ["Click", "Swoosh", "Piano"]
    audioLogoDescription: string; // Description of a 3-second sound logo
}

export interface ConfidenceScores {
    visuals: number; // 0-100
    strategy: number;
    tone: number;
    overall: number;
}

export interface TrendAlignment {
    trendName: string; // e.g. "2025 Neo-Minimalism"
    score: number; // 0-100
    reasoning: string;
}

export interface BrandAccessibility {
    logoAlt: string;
    guidelines: string;
}

export interface BrandDNA {
  id: string; // UUID
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  detectedLanguage?: string; // e.g., "en", "fr", "es"
  
  // Confidence
  confidenceScores: ConfidenceScores;
  
  // Pro: Trend Alignment
  trendAlignment?: TrendAlignment;
  
  // Pro: Accessibility
  accessibility?: BrandAccessibility;

  // Pro: Sonic Identity (New)
  sonicIdentity?: SonicIdentity;

  // Visual Identity
  colors: BrandColor[];
  fonts: BrandFont[];
  visualStyle: {
    style: string;
    description: string;
  };
  // logoStyle: string; // Deprecated in favor of visualIdentityExtended
  heroImagePrompt: string;
  heroImageUrl?: string;

  // Extended Visuals
  visualIdentityExtended: VisualIdentityExtended;

  // Strategic Core
  mission: string;
  elevatorPitch: string;
  values: string[];
  keyMessaging: string[]; // USPs / Slogans

  // Personality
  toneOfVoice: {
    adjectives: string[];
    description: string;
  };
  brandPersonality: string[]; // Archetypes with explanation e.g. "Hero: We save the day"

  // Deep Strategy
  targetAudience: string; // General summary
  personas: Persona[];
  swot: SWOT;
  competitors: CompetitorAnalysis[];

  createdAt: number;
}

export interface CampaignAsset {
  id: string;
  type: 'social' | 'email' | 'banner' | 'story' | 'video_short';
  channel?: string; // e.g. "Instagram", "LinkedIn"
  title: string;
  content: string; // The copy text
  imagePrompt: string; // The prompt used to generate the image
  imageUrl?: string; // The base64 image data
  videoUrl?: string; // The video URL/Data
  isGeneratingImage: boolean;
  isGeneratingVideo?: boolean;
  scheduledAt?: string; // ISO date string for scheduling
}

export interface SavedCampaign {
  id: string;
  profileId: string;
  dna: BrandDNA; // Snapshot of the brand DNA at the time of campaign
  timestamp: number;
  goal: string;
  assets: CampaignAsset[];
}

export type UserTier = 'free' | 'pro' | 'agency';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tier: UserTier;
}

export enum AssetType {
  SOCIAL = 'social',
  EMAIL = 'email',
  BANNER = 'banner',
  STORY = 'story',
  VIDEO_SHORT = 'video_short'
}

// --- Agent Forge Types ---

export type AgentRole = 'support' | 'sales' | 'content_guardian' | 'creative_director';

export interface AgentGuardrails {
  strictness: 'low' | 'medium' | 'high'; // Affects temperature and system prompt rigidity
  forbiddenTopics: string[];
  requiredPhrases: string[];
  knowledgeBaseLimit: boolean; // If true, agent refuses to answer outside of DNA context
}

export interface AgentConfig {
  id: string;
  name: string;
  role: AgentRole;
  guardrails: AgentGuardrails;
  generatedSystemPrompt: string; // The output prompt for Gemini
}

// --- Pulse & Trends ---
export interface TrendPulseItem {
    id: string;
    topic: string;
    relevanceScore: number;
    summary: string;
    sourceUrl?: string;
    suggestedAngle: string;
}

// --- Lead Gen Types ---
export interface LeadGapAnalysis {
    missingWebsite: boolean;
    lowRating: boolean;
    socialSilence: boolean; // Inferred
    opportunity: string; // The "Hook"
}

export interface LeadProfile {
    id: string;
    name: string;
    address: string;
    rating?: number;
    website?: string;
    placeUri?: string; // Google Maps Link
    gapAnalysis: LeadGapAnalysis;
    generatedOutreach?: string; // The email draft
}

// --- Settings & Integrations ---

export type LLMProviderId = 
  | 'google' | 'openai' | 'anthropic' | 'xai' | 'deepseek' | 'mistral' 
  | 'openrouter' | 'perplexity' | 'ollama' | 'venice' | 'microsoft'
  | 'qwen' | 'zai' | 'comet' | 'custom_openai' | 'cohere' | 'huggingface'
  | 'groq' | 'together' | 'sambanova' | 'cerebras' | 'hyperbolic' | 'nebius'
  | 'friendli' | 'replicate_llm' | 'aws_bedrock' | 'minimax' | 'hunyuan'
  | 'blackbox' | 'dify';

export type ImageProviderId = 
  | 'google' | 'openai' | 'stability' | 'midjourney' | 'fal_flux'
  | 'runware' | 'leonardo' | 'recraft' | 'xai' | 'amazon' | 'adobe'
  | 'deepai' | 'replicate' | 'bria' | 'segmind' | 'prodia' | 'ideogram' 
  | 'black_forest_labs' | 'wan' | 'hunyuan_image';

export type VoiceProviderId = 
  | 'elevenlabs' | 'openai' | 'piper' | 'playht' | 'azure' | 'custom'
  | 'cartesia' | 'deepgram' | 'lmnt' | 'fish' | 'rime' | 'neets' | 'speechify'
  | 'amazon_polly' | 'google_tts';

export type WorkflowProviderId = 
  | 'n8n' | 'dify' | 'make' | 'zapier' | 'custom_rag'
  | 'pipedream' | 'activepieces' | 'relay' | 'integrately' | 'pabbly' | 'tray';

export interface LLMConfig {
  provider: LLMProviderId;
  enabled: boolean;
  apiKey: string;
  baseUrl?: string; // For Ollama/Local/OpenAI-compatible
  defaultModel?: string; // e.g., 'gpt-4-turbo', 'mistral-large-latest'
}

export interface ImageConfig {
  provider: ImageProviderId;
  enabled: boolean;
  apiKey: string;
  stylePreset?: string; // For Stability/Flux
}

export interface VoiceConfig {
  provider: VoiceProviderId;
  enabled: boolean;
  apiKey?: string;
  voiceId?: string; // Default voice ID
  endpoint?: string; // For custom/piper
}

export interface WorkflowConfig {
  provider: WorkflowProviderId;
  enabled: boolean;
  apiKey?: string;
  webhookUrl?: string; // For general triggers
  scheduleWebhookUrl?: string; // Specific for scheduling posts
  postingWebhookUrl?: string; // Specific for immediate posting
}

export interface RLMSettings {
  enabled: boolean; // RLM Mode active
  rootModel: LLMProviderId; // Root model for recursive processing
  recursiveModel: LLMProviderId; // Recursive model (can be different)
  chunkSizeKB: number; // Size of chunks (512 KB default)
  overlapPercentage: number; // Context overlap (10% default)
  maxTokens: number; // Max tokens per chunk
}

export interface GlobalSettings {
  activeLLM: LLMProviderId; // Which one to actually use for generation
  activeImageGen: ImageProviderId; // Which one to use for images
  activeVoice: VoiceProviderId; // Primary voice engine
  activeWorkflow: WorkflowProviderId; // Default automation provider
  llms: Record<string, LLMConfig>;
  image: Record<string, ImageConfig>;
  voice: Record<string, VoiceConfig>;
  workflows: Record<string, WorkflowConfig>;
  rlm: RLMSettings; // RLM configuration
  theme: 'system' | 'light' | 'dark';
  dataCollection: boolean;
}

// --- Battle Mode Types ---

export interface BattleMetric {
    subject: string;
    A: number; // Score for Brand A
    B: number; // Score for Brand B
    fullMark: number;
}

export interface BattleReport {
    winner: 'A' | 'B' | 'Tie';
    summary: string;
    metrics: BattleMetric[];
    gapAnalysis: string; // The "Blue Ocean" opportunity
    visualCritique: string;
}
