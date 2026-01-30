
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandDNA } from '../types';
import { refineBrandDNA } from '../pages/geminiService';
import { exportBrandProfileToPDF } from '../pages/services/pdfService';
import { analyzeAccessibility } from '../pages/accessibilityService';
import { useNavigate } from 'react-router-dom';

interface DNAProfileCardProps {
  dna: BrandDNA;
  onSave?: (asNewVersion?: boolean) => void;
  onEdit?: () => void; 
  onGoToCampaigns?: () => void;
  onUpdate?: (updatedDna: BrandDNA) => void;
  onShare?: () => void;
  readOnly?: boolean;
}

const ConfidenceChip: React.FC<{ score: number, label: string }> = ({ score, label }) => {
    let color = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (score < 50) color = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    else if (score < 80) color = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    
    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${color} border border-white/10`}>
            {label}: {score}%
        </span>
    );
};

const Section: React.FC<{ 
  title: string; 
  colorClass: string; 
  defaultOpen?: boolean; 
  children: React.ReactNode;
  confidence?: number;
  pro?: boolean;
}> = ({ title, colorClass, defaultOpen = true, children, confidence, pro }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 dark:border-gray-700 last:border-0 break-inside-avoid">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-6 text-left focus:outline-none group"
      >
        <div className="flex items-center gap-3">
            <h3 className={`text-lg font-bold uppercase tracking-wider ${colorClass} group-hover:opacity-80 transition-opacity flex items-center gap-2`}>
              {title}
              {pro && <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm">PRO</span>}
            </h3>
            {confidence !== undefined && (
                <ConfidenceChip score={confidence} label="Match" />
            )}
        </div>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-8 space-y-8">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RefineModal: React.FC<{ isOpen: boolean; onClose: () => void; onRefine: (instr: string) => void; isRefining: boolean }> = ({ isOpen, onClose, onRefine, isRefining }) => {
    const [instruction, setInstruction] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700"
            >
                <h3 className="text-xl font-bold font-display mb-2">Refine Brand Strategy</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Describe how you want to change the profile. The AI will intelligently update all sections to remain consistent.
                </p>
                
                <textarea 
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="e.g. 'Make the tone more playful and use brighter colors like neon green.'"
                    className="w-full h-32 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-dna-primary outline-none resize-none"
                    autoFocus
                />
                
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                    <button 
                        onClick={() => onRefine(instruction)}
                        disabled={!instruction || isRefining}
                        className="px-6 py-2 bg-dna-primary text-white rounded-lg font-bold hover:bg-dna-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isRefining ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Refining...
                            </>
                        ) : 'Update Strategy'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const DNAProfileCard: React.FC<DNAProfileCardProps> = ({ dna, onSave, onEdit, onGoToCampaigns, onUpdate, onShare, readOnly = false }) => {
  const navigate = useNavigate();
  const [showRefine, setShowRefine] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Memoize Accessibility calculation
  const a11yResults = useMemo(() => analyzeAccessibility(dna.colors), [dna.colors]);

  if (!dna) return null;

  const handleRefine = async (instruction: string) => {
      setIsRefining(true);
      try {
          const updatedDna = await refineBrandDNA(dna, instruction);
          if (onUpdate) onUpdate(updatedDna);
          setShowRefine(false);
      } catch (e) {
          console.error(e);
          alert("Refinement failed. Please try again.");
      } finally {
          setIsRefining(false);
      }
  };

  const handleExport = async () => {
    setIsExporting(true);
    await exportBrandProfileToPDF('dna-profile-container', dna);
    setIsExporting(false);
  };

  const handleSimulate = () => {
      navigate('/simulate', { state: { dna } });
  };

  const handleAgentForge = () => {
      navigate('/agent-forge', { state: { dna } });
  };

  // Safe access helpers
  const colors = Array.isArray(dna.colors) ? dna.colors : [];
  const fonts = Array.isArray(dna.fonts) ? dna.fonts : [];
  const toneAdjectives = dna.toneOfVoice?.adjectives && Array.isArray(dna.toneOfVoice.adjectives) ? dna.toneOfVoice.adjectives : [];
  const brandPersonality = Array.isArray(dna.brandPersonality) ? dna.brandPersonality : [];
  const values = Array.isArray(dna.values) ? dna.values : [];
  const keyMessaging = Array.isArray(dna.keyMessaging) ? dna.keyMessaging : [];
  const personas = Array.isArray(dna.personas) ? dna.personas : [];
  const competitors = Array.isArray(dna.competitors) ? dna.competitors : [];
  const swot = dna.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const visuals = dna.visualIdentityExtended || {};
  const confidence = dna.confidenceScores || { overall: 85, visuals: 85, strategy: 85, tone: 85 };
  const trend = dna.trendAlignment;
  const sonic = dna.sonicIdentity;

  return (
    <>
    {/* Action Bar */}
    {!readOnly && (
        <div className="w-full max-w-5xl mx-auto mb-4 flex flex-wrap justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4">
            <h2 className="font-display font-bold text-gray-900 dark:text-white">Profile Actions</h2>
            <div className="flex gap-3 flex-wrap">
                <button 
                    onClick={handleSimulate}
                    className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity text-sm font-bold flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    Simulate
                </button>
                <button 
                    onClick={handleAgentForge}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-opacity text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    Build Agent
                </button>
                <button 
                    onClick={onShare}
                    className="px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-bold flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    Share
                </button>
                <button 
                    onClick={handleExport} 
                    disabled={isExporting}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-bold flex items-center gap-2"
                >
                    {isExporting ? 'Exporting...' : 'Export'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </button>
                <button 
                    onClick={() => setShowRefine(true)} 
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-bold flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Refine
                </button>
                {onSave && (
                    <div className="flex gap-1">
                        <button onClick={() => onSave(false)} className="px-4 py-2 rounded-l-lg bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-bold flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Save
                        </button>
                        <button 
                            onClick={() => onSave(true)} 
                            className="px-2 py-2 rounded-r-lg bg-gray-100 text-gray-600 border border-l-0 border-gray-300 hover:bg-gray-200 transition-colors text-sm"
                            title="Save as New Version"
                        >
                            +V
                        </button>
                    </div>
                )}
                {onGoToCampaigns && (
                    <button onClick={onGoToCampaigns} className="px-4 py-2 rounded-lg bg-gradient-to-r from-dna-primary to-dna-secondary text-white hover:shadow-lg hover:shadow-dna-primary/30 transition-all text-sm font-bold flex items-center gap-2">
                        Campaigns
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                )}
            </div>
        </div>
    )}

    {/* Capture Area ID */}
    <div id="dna-profile-container" className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      
      {/* Hero Header */}
      <div className="relative h-72 md:h-96 w-full bg-gray-900 overflow-hidden group">
        {dna.heroImageUrl ? (
           <img src={dna.heroImageUrl} alt="Brand Essence" className="w-full h-full object-cover opacity-80 transition-transform duration-[10s] group-hover:scale-110" />
        ) : (
           <div className="w-full h-full bg-gradient-to-r from-dna-primary to-dna-secondary opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-8 md:p-12">
            <div className="text-white w-full">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight">{dna.name}</h1>
                        <ConfidenceChip score={confidence.overall} label="Confidence" />
                        {dna.detectedLanguage && (
                           <span className="px-2 py-1 rounded bg-white/20 text-white text-xs font-mono uppercase border border-white/20">
                             {dna.detectedLanguage}
                           </span>
                        )}
                    </div>
                    <p className="text-xl md:text-2xl text-dna-secondary font-light">{dna.tagline}</p>
                    <p className="text-sm opacity-70 mt-4 max-w-2xl leading-relaxed">{dna.description}</p>
                    <div className="mt-2 text-xs text-gray-400">Created: {new Date(dna.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
            </div>
        </div>
      </div>

      <div className="px-8 md:px-12 bg-white dark:bg-gray-800">
        
        {/* Pro Insights Section */}
        {(trend || sonic) && (
            <Section title="Pro Insights" colorClass="text-orange-500" pro={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Trend Alignment */}
                    {trend && (
                        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-2xl p-6 border border-orange-100 dark:border-orange-800/50">
                             <div className="flex justify-between items-center mb-4">
                                 <h4 className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">Trend Alignment</h4>
                                 <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{trend.score}%</span>
                             </div>
                             <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-4 overflow-hidden">
                                 <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" style={{ width: `${trend.score}%` }}></div>
                             </div>
                             <h5 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{trend.trendName}</h5>
                             <p className="text-sm text-gray-600 dark:text-gray-300">{trend.reasoning}</p>
                        </div>
                    )}

                    {/* Sonic Identity (New) */}
                    {sonic && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50">
                            <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                Sonic Identity
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-indigo-400 font-bold uppercase">Voice Type</span>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{sonic.voiceType}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-indigo-400 font-bold uppercase">Music Genre</span>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{sonic.musicGenre}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-indigo-400 font-bold uppercase">Audio Logo Concept</span>
                                    <p className="text-xs italic text-gray-600 dark:text-gray-400 mt-1">"{sonic.audioLogoDescription}"</p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {sonic.soundKeywords?.map((k, i) => (
                                        <span key={i} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-xs">
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Accessibility Check */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Accessibility Check (WCAG)</h4>
                        <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {a11yResults.length > 0 ? a11yResults.map((res, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 rounded bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-1">
                                            <div className="w-4 h-4 rounded-full border border-gray-300" style={{backgroundColor: res.color1.hex}}></div>
                                            <div className="w-4 h-4 rounded-full border border-gray-300" style={{backgroundColor: res.color2.hex}}></div>
                                        </div>
                                        <span className="text-xs text-gray-500">{res.color1.name} / {res.color2.name}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                        res.score === 'AAA' ? 'bg-green-100 text-green-700' :
                                        res.score === 'AA' ? 'bg-blue-100 text-blue-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {res.score}
                                    </span>
                                </div>
                            )) : <p className="text-sm text-gray-500">Add more colors to check contrast.</p>}
                        </div>

                        {/* Alt-Text Suggestions */}
                        {dna.accessibility && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Alt-Text Suggestions</h5>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm">
                                    <p className="mb-2 text-gray-700 dark:text-gray-300"><span className="font-semibold text-dna-secondary">Logo Alt:</span> {dna.accessibility.logoAlt}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs italic"><span className="font-semibold not-italic text-dna-secondary">Guidelines:</span> {dna.accessibility.guidelines}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Section>
        )}

        {/* Section 1: Strategic Foundation */}
        <Section title="Strategic Foundation" colorClass="text-dna-primary" confidence={confidence.strategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mission & Elevator Pitch */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-semibold mb-3 text-gray-500 uppercase tracking-wide">Mission Statement</h4>
                        <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 italic text-lg font-display text-gray-800 dark:text-gray-200">
                            "{dna.mission || 'To lead the industry with innovation.'}"
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-3 text-gray-500 uppercase tracking-wide">Elevator Pitch</h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {dna.elevatorPitch || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Values & Messaging */}
                <div className="space-y-6">
                     <div>
                        <h4 className="text-sm font-semibold mb-3 text-gray-500 uppercase tracking-wide">Core Values</h4>
                        <div className="flex flex-wrap gap-2">
                            {values.map((v, i) => (
                                <span key={i} className="px-4 py-2 bg-dna-primary/10 text-dna-primary rounded-lg text-sm font-bold border border-dna-primary/20">{v}</span>
                            ))}
                        </div>
                     </div>
                     <div>
                        <h4 className="text-sm font-semibold mb-3 text-gray-500 uppercase tracking-wide">Key Messaging</h4>
                        <ul className="space-y-2">
                            {keyMessaging.map((msg, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span>{msg}</span>
                                </li>
                            ))}
                        </ul>
                     </div>
                </div>
            </div>
        </Section>

        {/* Section 2: Visual Identity & Assets (New Visuals) */}
        <Section title="Visual Portfolio" colorClass="text-dna-secondary" confidence={confidence.visuals}>
             
             {/* Logo Section */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                 <div className="md:col-span-1">
                    <h4 className="text-sm font-semibold mb-4 text-gray-500 uppercase tracking-wide">Logo</h4>
                    <div className="p-8 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center min-h-[200px]">
                        {visuals.logoUrl ? (
                            <img src={visuals.logoUrl} alt="Brand Logo" className="max-h-24 object-contain" />
                        ) : visuals.generatedLogoUrl ? (
                            <img src={visuals.generatedLogoUrl} alt="Logo Concept" className="max-h-32 object-contain mix-blend-multiply dark:mix-blend-normal" />
                        ) : (
                            <div className="text-gray-400 text-center text-sm">Generating Concept...</div>
                        )}
                        <p className="text-xs text-gray-400 mt-4 text-center">
                            {visuals.logoUrl ? "Uploaded Logo" : "AI Generated Concept"}
                        </p>
                    </div>
                 </div>
                 
                 <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold mb-4 text-gray-500 uppercase tracking-wide">Logo Strategy & Concepts</h4>
                    <div className="space-y-4">
                        <p className="text-gray-700 dark:text-gray-300">{visuals.logoStyle || "Modern and minimalist."}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {(visuals.logoConcepts || []).map((concept: string, i: number) => (
                                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-bold text-dna-secondary mb-1 block">Concept {i+1}</span>
                                    {concept}
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>
             </div>

             {/* Pattern & Icons */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 break-inside-avoid">
                 <div>
                     <h4 className="text-sm font-semibold mb-4 text-gray-500 uppercase tracking-wide">Brand Pattern</h4>
                     <div className="h-48 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                        {visuals.generatedPatternUrl ? (
                            <img src={visuals.generatedPatternUrl} alt="Brand Pattern" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400 text-sm">Generating Pattern...</div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2">
                             <p className="text-xs text-white truncate px-2">{visuals.patternStyle}</p>
                        </div>
                     </div>
                 </div>
                 <div>
                     <h4 className="text-sm font-semibold mb-4 text-gray-500 uppercase tracking-wide">Iconography</h4>
                     <div className="h-48 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative bg-white dark:bg-gray-900 flex items-center justify-center p-4">
                        {visuals.generatedIconUrl ? (
                            <img src={visuals.generatedIconUrl} alt="Icons" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <div className="text-gray-400 text-sm">Generating Icons...</div>
                        )}
                     </div>
                     <p className="text-xs text-gray-500 mt-2">{visuals.iconographyStyle}</p>
                 </div>
             </div>

             {/* Mood Board */}
             <div className="break-inside-avoid">
                 <h4 className="text-sm font-semibold mb-6 text-gray-500 uppercase tracking-wide">Mood Board</h4>
                 {visuals.generatedMoodBoardUrls && visuals.generatedMoodBoardUrls.length > 0 ? (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {visuals.generatedMoodBoardUrls.map((url: string, i: number) => (
                             <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                 <img src={url} alt={`Mood ${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                             </div>
                         ))}
                     </div>
                 ) : (
                     <div className="grid grid-cols-4 gap-4 opacity-50">
                         {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-xl"></div>)}
                     </div>
                 )}
             </div>

             <div className="border-t border-gray-100 dark:border-gray-700 my-8"></div>

             {/* Colors */}
             <div className="break-inside-avoid">
                <h4 className="text-sm font-semibold mb-6 text-gray-500 uppercase tracking-wide">Color Palette</h4>
                {colors.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-8 md:gap-12 py-4">
                        {colors.map((c, i) => (
                            <div key={i} className="group flex flex-col items-center">
                                <div 
                                    className="w-16 h-16 rounded-full shadow-lg border-2 border-white dark:border-gray-800 transition-transform transform group-hover:scale-110 mb-3" 
                                    style={{ backgroundColor: c.hex }}
                                />
                                <div className="text-center">
                                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{c.name}</p>
                                    <p className="font-mono text-xs text-gray-400 uppercase tracking-wide mt-1">{c.hex}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">{c.usage}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-500 italic text-sm">No color palette info available.</p>}
            </div>

            {/* Typography */}
            <div className="mt-8 break-inside-avoid">
                <h4 className="text-sm font-semibold mb-4 text-gray-500 uppercase tracking-wide">Typography</h4>
                {fonts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fonts.map((f, i) => (
                            <div key={i} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                                <div className="mb-4">
                                    <div className="text-5xl mb-2 text-gray-800 dark:text-gray-200" style={{ fontFamily: f.family }}>Aa</div>
                                    <h5 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: f.family }}>{f.family}</h5>
                                    <span className="inline-block px-2 py-1 mt-2 text-xs font-medium bg-gray-200 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300">
                                        {f.usage}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                                    {f.description}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-500 italic text-sm">No typography info available.</p>}
            </div>
        </Section>

        {/* Section 3: Audience Personas */}
        <Section title="Audience Personas" colorClass="text-dna-accent" defaultOpen={false}>
             <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">{dna.targetAudience}</p>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {personas.map((persona, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow break-inside-avoid">
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dna-accent to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                {persona.name.charAt(0)}
                            </div>
                            <div>
                                <h5 className="font-bold text-lg text-gray-900 dark:text-white">{persona.name}</h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{persona.demographics}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 text-sm">
                            <div>
                                <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Psychographics:</span>
                                <p className="text-gray-600 dark:text-gray-400">{persona.psychographics}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-red-500 block mb-1">Pain Points:</span>
                                <ul className="list-disc pl-4 text-gray-600 dark:text-gray-400 space-y-1">
                                    {persona.painPoints.map((pt, j) => <li key={j}>{pt}</li>)}
                                </ul>
                            </div>
                            <div>
                                <span className="font-semibold text-green-500 block mb-1">Behaviors:</span>
                                <ul className="list-disc pl-4 text-gray-600 dark:text-gray-400 space-y-1">
                                    {persona.behaviors.map((beh, j) => <li key={j}>{beh}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
        </Section>

        {/* Section 4: Market Analysis (SWOT & Competitors) */}
        <Section title="Market Analysis" colorClass="text-purple-500" defaultOpen={false}>
            {/* SWOT */}
            <div className="mb-10 break-inside-avoid">
                <h4 className="text-sm font-semibold mb-6 text-gray-500 uppercase tracking-wide">SWOT Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800">
                        <h5 className="font-bold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                             Strengths
                        </h5>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-4 space-y-1">
                            {(swot.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                    <div className="p-5 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800">
                        <h5 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                             Weaknesses
                        </h5>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-4 space-y-1">
                            {(swot.weaknesses || []).map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                    <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                        <h5 className="font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                             Opportunities
                        </h5>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-4 space-y-1">
                            {(swot.opportunities || []).map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                    <div className="p-5 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-800">
                        <h5 className="font-bold text-yellow-700 dark:text-yellow-400 mb-2 flex items-center gap-2">
                             Threats
                        </h5>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-4 space-y-1">
                            {(swot.threats || []).map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Competitors */}
            {competitors.length > 0 && (
                <div className="break-inside-avoid">
                    <h4 className="text-sm font-semibold mb-6 text-gray-500 uppercase tracking-wide">Competitor Landscape</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {competitors.map((comp, i) => (
                            <div key={i} className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <h5 className="font-bold text-gray-900 dark:text-white mb-2">{comp.name}</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-semibold text-dna-primary">Differentiation:</span> {comp.differentiation}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Section>

        {/* Section 5: Voice & Archetypes */}
        <Section title="Voice & Archetypes" colorClass="text-gray-500" defaultOpen={false} confidence={confidence.tone}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="break-inside-avoid">
                    <h4 className="text-sm font-semibold mb-4 text-gray-500 uppercase tracking-wide">Tone of Voice</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 h-full">
                        {toneAdjectives.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {toneAdjectives.map((adj, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 shadow-sm text-dna-primary">{adj}</span>
                                ))}
                            </div>
                        )}
                        <p className="text-gray-600 dark:text-gray-400 italic leading-relaxed">"{dna.toneOfVoice?.description || 'N/A'}"</p>
                    </div>
                </div>

                <div className="break-inside-avoid">
                    <h4 className="text-sm font-semibold mb-4 text-gray-500 uppercase tracking-wide">Archetypes</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-center">
                        <div className="flex flex-col gap-3">
                            {brandPersonality.map((p, i) => (
                                <div key={i} className="flex items-start gap-3 px-4 py-3 bg-dna-primary/5 rounded-xl">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-dna-primary flex-shrink-0"></div>
                                    <span className="text-dna-primary font-medium text-sm">{p}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Section>
      </div>
    </div>
    
    <RefineModal 
        isOpen={showRefine} 
        onClose={() => setShowRefine(false)} 
        onRefine={handleRefine}
        isRefining={isRefining}
    />
    </>
  );
};

export default DNAProfileCard;
