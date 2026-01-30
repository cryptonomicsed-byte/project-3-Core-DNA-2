export const APP_NAME = "Core DNA";

export const FADE_IN_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const STAGGER_CHILDREN = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export const MOCK_DNA_DATA = {
  name: "EcoLuxe Tech",
  tagline: "Sustainable Technology for a Greener Future",
  description: "A forward-thinking technology brand focused on eco-friendly gadgets and renewable energy solutions.",
  colors: [
    { hex: "#10B981", name: "Emerald Vitality", usage: "Primary Brand Color" },
    { hex: "#3B82F6", name: "Ocean Depth", usage: "Secondary/Accents" },
    { hex: "#F59E0B", name: "Solar Flare", usage: "Call to Action" },
    { hex: "#F9FAFB", name: "Clean Slate", usage: "Background" },
    { hex: "#064E3B", name: "Deep Forest", usage: "Text/Footer" }
  ],
  fonts: [
    { family: "Space Grotesk", usage: "Headings", description: "Modern, geometric sans-serif for impact." },
    { family: "Inter", usage: "Body", description: "Clean, highly readable sans-serif for long text." }
  ],
  toneOfVoice: {
    adjectives: ["Innovative", "Eco-conscious", "Optimistic", "Professional"],
    description: "Our voice is knowledgeable yet accessible, inspiring trust and action towards a sustainable future."
  },
  visualStyle: {
    style: "Eco-Modernist",
    description: "Minimalist, nature-inspired, clean lines, plenty of whitespace with green accents."
  },
  targetAudience: "Environmentally conscious professionals and tech enthusiasts.",
  keyMessaging: ["Innovation naturally", "Tech that breathes"],
  values: ["Sustainability", "Innovation"],
  brandPersonality: ["Creator", "Caregiver"],
  logoStyle: "Abstract leaf combined with circuit lines.",
  heroImagePrompt: "A sleek, solar-powered device resting on a mossy rock in a futuristic bright forest, macro photography style.",
  createdAt: Date.now()
};