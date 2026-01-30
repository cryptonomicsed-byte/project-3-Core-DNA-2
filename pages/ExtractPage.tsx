
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { analyzeBrandDNA, generateAssetImage, findLeadsWithMaps, generateLeadOutreach } from './geminiService';
import { BrandDNA, LeadProfile } from '../types';
import DNAProfileCard from '../components/DNAProfileCard';
import { FADE_IN_UP } from '../constants';
import { useAuth } from '../contexts/AuthContext';

const ExtractPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'extract' | 'leads'>('extract');

  // Extract State
  const [url, setUrl] = useState('');
  const [nameHint, setNameHint] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [context, setContext] = useState('');
  const [logoFile, setLogoFile] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dna, setDna] = useState<BrandDNA | null>(null);
  
  // Lead Gen State
  const [niche, setNiche] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [leads, setLeads] = useState<LeadProfile[]>([]);
  const [isHunting, setIsHunting] = useState(false);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if we are loading an existing profile for viewing/editing
  useEffect(() => {
      if (location.state?.dna) {
          setDna(location.state.dna);
          if (location.state.dna.websiteUrl) setUrl(location.state.dna.websiteUrl);
          if (location.state.dna.name) setNameHint(location.state.dna.name);
      }
  }, [location.state]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoFile(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const generateVisuals = async (dnaProfile: BrandDNA) => {
    const style = dnaProfile.visualStyle?.description || 'modern';
    const extended = dnaProfile.visualIdentityExtended;

    // Helper to generate and set
    const genAndSet = async (prompt: string, field: keyof typeof extended, fieldName: string) => {
        if (!prompt) return;
        try {
            const img = await generateAssetImage(prompt, style);
            if (img) {
                setDna(prev => {
                    if (!prev || !prev.visualIdentityExtended) return prev;
                    const newExtended = { ...prev.visualIdentityExtended };
                    
                    if (field === 'generatedMoodBoardUrls') {
                        newExtended.generatedMoodBoardUrls = [...(newExtended.generatedMoodBoardUrls || []), img];
                    } else {
                        (newExtended as any)[field] = img;
                    }
                    
                    return { ...prev, visualIdentityExtended: newExtended };
                });
            }
        } catch (e) {
            console.error(`Failed to generate ${fieldName}`, e);
        }
    };

    // 1. Hero Image (Critical)
    setProgressStep("Generating Brand Essence Hero...");
    if (dnaProfile.heroImagePrompt) {
        const hero = await generateAssetImage(dnaProfile.heroImagePrompt, style);
        if (hero) {
            setDna(prev => prev ? { ...prev, heroImageUrl: hero } : null);
        }
        await new Promise(r => setTimeout(r, 3000)); // Pace the requests significantly
    }

    // 2. Logo Concept (if no logo uploaded)
    if (!logoFile && extended?.logoGenPrompt) {
        await genAndSet(extended.logoGenPrompt, 'generatedLogoUrl', 'Logo Concept');
        await new Promise(r => setTimeout(r, 3000));
    }

    // 3. Pattern
    if (extended?.patternGenPrompt) {
        await genAndSet(extended.patternGenPrompt, 'generatedPatternUrl', 'Pattern');
        await new Promise(r => setTimeout(r, 3000));
    }

    // 4. Icons
    if (extended?.iconGenPrompt) {
        await genAndSet(extended.iconGenPrompt, 'generatedIconUrl', 'Icons');
        await new Promise(r => setTimeout(r, 3000));
    }

    // 5. Mood Board (Parallel-ish but throttled)
    if (extended?.moodBoardPrompts) {
        // Only generate 2 to save quota for now
        for (const prompt of extended.moodBoardPrompts.slice(0, 2)) {
            await genAndSet(prompt, 'generatedMoodBoardUrls', 'Mood Board Image');
            await new Promise(r => setTimeout(r, 4000)); // Stronger delay for loop
        }
    }

    setProgressStep("");
    setLoading(false);
  };

  const handleExtract = async () => {
    if (!url) {
      setError("Please enter a website URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setDna(null);

    try {
      // Step 1: Text Analysis (Strategy)
      setProgressStep("Analyzing strategy & visual identity...");
      // Pass the logo file & context if available
      const result = await analyzeBrandDNA(url, nameHint, competitors, logoFile || undefined, context);
      
      // Initial set with text data
      setDna(result);
      
      // Step 2: Trigger progressive visual generation
      await generateVisuals(result);

    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("API Key is missing")) {
        setError("Configuration Error: API Key is missing. Please set your GOOGLE_GENAI_API_KEY.");
      } else {
        setError(`Analysis Failed: ${err.message || "Unknown error"}. Try again later.`);
      }
      setLoading(false);
    }
  };

  const handleSaveProfile = (asNewVersion = false) => {
    if (!dna) return;
    
    // Check auth
    if (!user) {
        if(confirm("You need to sign in to save profiles. Sign in with mock account now?")) {
            login();
        } else {
            return;
        }
    }

    const savedProfiles: BrandDNA[] = JSON.parse(localStorage.getItem('core_dna_profiles') || '[]');
    
    let updatedProfiles;

    if (asNewVersion) {
        // Create new version
        const newVersion = {
            ...dna,
            id: Date.now().toString(),
            createdAt: Date.now()
        };
        updatedProfiles = [newVersion, ...savedProfiles];
    } else {
        // Overwrite existing if ID matches, else add
        const existingIndex = savedProfiles.findIndex(p => p.id === dna.id);
        if (existingIndex >= 0) {
            savedProfiles[existingIndex] = dna;
            updatedProfiles = savedProfiles;
        } else {
            updatedProfiles = [dna, ...savedProfiles];
        }
    }

    localStorage.setItem('core_dna_profiles', JSON.stringify(updatedProfiles));
    alert(asNewVersion ? "Saved as new version!" : "Profile updated!");
    
    // Redirect to dashboard to see the list
    if (asNewVersion) navigate('/dashboard');
  };

  // --- Lead Gen Handlers ---

  const handleGetLocation = () => {
      setIsLocating(true);
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (pos) => {
                  setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                  setIsLocating(false);
              },
              (err) => {
                  console.error(err);
                  alert("Could not fetch location. Please ensure you have allowed location permissions for this site.");
                  setIsLocating(false);
              },
              { timeout: 10000 }
          );
      } else {
          alert("Geolocation is not supported by this browser.");
          setIsLocating(false);
      }
  };

  const handleHuntLeads = async () => {
      if (!userLocation || !niche) return;
      setIsHunting(true);
      setLeads([]);
      try {
          const foundLeads = await findLeadsWithMaps(niche, userLocation.lat, userLocation.lng);
          setLeads(foundLeads);
      } catch (e) {
          console.error(e);
          alert("Failed to hunt leads. The Agent might have run into a rate limit or API issue.");
      } finally {
          setIsHunting(false);
      }
  };

  const handleEngageLead = async (leadId: string) => {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) return;
      
      // Use existing DNA if available for context
      const senderDna = dna || undefined;
      
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, generatedOutreach: 'Drafting...' } : l));
      
      try {
          const outreach = await generateLeadOutreach(lead, senderDna);
          setLeads(prev => prev.map(l => l.id === leadId ? { ...l, generatedOutreach: outreach } : l));
      } catch (e) {
          console.error(e);
          setLeads(prev => prev.map(l => l.id === leadId ? { ...l, generatedOutreach: undefined } : l));
      }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-dna-primary transition-colors font-medium group"
          >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back
          </button>

          {/* Tab Switcher */}
          {!dna && (
              <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-xl flex gap-1 self-center">
                  <button 
                    onClick={() => setActiveTab('extract')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'extract' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                      Extract DNA
                  </button>
                  <button 
                    onClick={() => setActiveTab('leads')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'leads' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                      Lead Hunter
                  </button>
              </div>
          )}
      </div>

      {!dna && (
          <AnimatePresence mode="wait">
            
            {/* TAB 1: EXTRACT DNA */}
            {activeTab === 'extract' && (
                <motion.div 
                    key="extract"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dna-primary to-dna-accent"></div>
                        <h2 className="text-3xl font-display font-bold mb-8 text-center">Extract Core DNA</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Website URL <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-dna-secondary outline-none transition-all"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Company Name (Optional)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Acme Corp"
                                        value={nameHint}
                                        onChange={(e) => setNameHint(e.target.value)}
                                        className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-dna-secondary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Competitor URLs (Optional)</label>
                                    <input 
                                        type="text" 
                                        placeholder="url1.com, url2.com"
                                        value={competitors}
                                        onChange={(e) => setCompetitors(e.target.value)}
                                        className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-dna-secondary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Advanced Context Inputs */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Brand Guidelines / Context (Optional)</label>
                                <textarea 
                                    placeholder="Paste mission statement, values, or specific instructions here to guide the analysis..."
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    className="w-full p-4 h-24 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-dna-secondary outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Logo Upload Section */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Brand Logo (Optional)</label>
                                <div 
                                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                    />
                                    {logoFile ? (
                                        <div className="flex items-center justify-center gap-4">
                                            <img src={logoFile} alt="Preview" className="h-12 w-auto object-contain" />
                                            <span className="text-sm text-green-500 font-bold">Logo Uploaded!</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setLogoFile(null); }}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <p className="text-xs text-gray-500">
                                                Upload your logo to help AI analyze colors and shape.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleExtract}
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-dna-secondary to-dna-primary text-white rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-lg disabled:opacity-50"
                            >
                                {loading ? 'Analyzing & Generating Visuals...' : 'Extract Core DNA'}
                            </button>
                            
                            <p className="text-xs text-center text-gray-500 mt-4">
                                Uses Google Gemini 3 Flash Preview for strategy & Gemini 2.5 Flash Image for image generation.
                                <br/>Ensure your API Key is configured.
                            </p>
                        </div>
                    </div>
                    
                    {loading && (
                        <div className="mt-8 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-dna-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-lg font-medium animate-pulse">{progressStep}</p>
                            <p className="text-xs text-gray-400 mt-2">Generating portfolio assets (Logo concepts, Patterns, Moodboard)...</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* TAB 2: LEAD HUNTER AGENT */}
            {activeTab === 'leads' && (
                <motion.div 
                    key="leads"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-display font-bold">Agent Lead Hunter</h2>
                                <p className="text-gray-500">Deploy an autonomous agent to scan Google Maps for local businesses and identify gaps in their digital presence.</p>
                            </div>
                            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Maps & Search Grounding Active</span>
                            </div>
                        </div>

                        {/* Search Control */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Target Niche</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Dentists, Coffee Shops"
                                    value={niche}
                                    onChange={(e) => setNiche(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Location</label>
                                <button 
                                    onClick={handleGetLocation}
                                    disabled={isLocating}
                                    className={`w-full p-3 rounded-xl border flex items-center justify-center gap-2 transition-colors ${
                                        userLocation 
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' 
                                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    {isLocating ? (
                                        <>
                                            <span className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"></span>
                                            Locating...
                                        </>
                                    ) : userLocation ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                                        </>
                                    ) : '📍 Detect My Location'}
                                </button>
                            </div>
                            <div className="md:col-span-1 flex items-end">
                                <button 
                                    onClick={handleHuntLeads}
                                    disabled={isHunting || !userLocation || !niche}
                                    className="w-full p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                                >
                                    {isHunting ? 'Scanning...' : 'Deploy Agent'}
                                </button>
                            </div>
                        </div>

                        {/* Results Grid */}
                        {isHunting && (
                            <div className="py-12 text-center">
                                <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-500 animate-pulse">Scanning Google Maps & Social Media...</p>
                                <p className="text-xs text-gray-400">Analyzing ratings, websites, and social signals.</p>
                            </div>
                        )}

                        {!isHunting && leads.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {leads.map((lead) => (
                                    <motion.div 
                                        key={lead.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-white dark:bg-gray-900/50"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg">{lead.name}</h3>
                                            {lead.rating && (
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    lead.rating < 4.0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {lead.rating} ★
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {lead.address}
                                        </p>

                                        <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg mb-4">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Agent Analysis</h4>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Gap: <span className="text-red-500">{lead.gapAnalysis.opportunity}</span>
                                            </p>
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {lead.gapAnalysis.missingWebsite && <span className="text-[10px] bg-red-100 text-red-700 px-2 rounded">No Website</span>}
                                                {lead.gapAnalysis.lowRating && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 rounded">Low Rating</span>}
                                                {lead.gapAnalysis.socialSilence && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 rounded">Social Silence</span>}
                                            </div>
                                        </div>

                                        {expandedLead === lead.id ? (
                                            <div className="mt-4 animate-fade-in-up">
                                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h5 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">AI Outreach Draft</h5>
                                                        <button onClick={() => navigator.clipboard.writeText(lead.generatedOutreach || '')} className="text-xs text-emerald-600 hover:underline">Copy</button>
                                                    </div>
                                                    {lead.generatedOutreach === 'Drafting...' ? (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <span className="animate-spin h-3 w-3 border-2 border-emerald-500 border-t-transparent rounded-full"></span>
                                                            Generating hyper-personalized script...
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                                                            {lead.generatedOutreach}
                                                        </p>
                                                    )}
                                                </div>
                                                <button onClick={() => setExpandedLead(null)} className="w-full text-center text-xs text-gray-400 mt-2 hover:text-gray-600">Close Draft</button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    setExpandedLead(lead.id);
                                                    if (!lead.generatedOutreach) handleEngageLead(lead.id);
                                                }}
                                                className="w-full py-2 border border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                Draft Outreach
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

          </AnimatePresence>
      )}

      {dna && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DNAProfileCard 
                dna={dna} 
                onSave={handleSaveProfile}
                onUpdate={(updated) => setDna(updated)}
                onGoToCampaigns={() => {
                    handleSaveProfile(false); 
                    navigate('/campaigns', { state: { dna } });
                }}
              />
          </motion.div>
      )}
    </div>
  );
};

export default ExtractPage;
