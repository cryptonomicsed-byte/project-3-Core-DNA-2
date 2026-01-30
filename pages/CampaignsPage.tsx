
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandDNA, CampaignAsset, SavedCampaign } from '../types';
import { generateCampaignAssets, generateAssetImage, runAgentHiveCampaign } from './geminiService';
import { getEnabledWorkflows, triggerScheduleWorkflow } from './services/workflowService';
import AssetCard from '../components/AssetCard';
import SavedCampaignsModal from '../components/SavedCampaignsModal';
import { FADE_IN_UP } from '../constants';
import JSZip from 'jszip';

const CampaignsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State
  const [selectedDNA, setSelectedDNA] = useState<BrandDNA | null>(null);
  const [goal, setGoal] = useState('');
  const [channels, setChannels] = useState<string[]>(['Instagram', 'Email']);
  const [tone, setTone] = useState('Brand Default');
  const [assets, setAssets] = useState<CampaignAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  
  // Hive Mode
  const [hiveMode, setHiveMode] = useState(false);
  const [hiveStatus, setHiveStatus] = useState<string[]>([]);

  // Saved Campaigns State
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaign[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  
  // Scheduling State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingProvider, setSchedulingProvider] = useState<string>('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Load DNA from router state or local storage
  useEffect(() => {
    if (location.state?.dna) {
        setSelectedDNA(location.state.dna);
        if (location.state.prefillGoal) setGoal(location.state.prefillGoal);
    } else {
        // Fallback: try to load first profile from storage for demo
        const stored = localStorage.getItem('core_dna_profiles');
        if (stored) {
            try {
                const profiles = JSON.parse(stored);
                if (Array.isArray(profiles) && profiles.length > 0) {
                    setSelectedDNA(profiles[0]);
                }
            } catch (e) {
                console.error("Error loading profiles", e);
            }
        }
    }
  }, [location.state]);

  // Load Saved Campaigns
  useEffect(() => {
    const stored = localStorage.getItem('core_dna_saved_campaigns');
    if (stored) {
        try {
            setSavedCampaigns(JSON.parse(stored));
        } catch(e) { console.error(e); }
    }
  }, []);

  const handleGenerate = async () => {
    if (!selectedDNA || !goal) return;
    
    setLoading(true);
    setLoadingMsg('Initializing generation...');
    setHiveStatus([]);
    
    // Clear previous assets
    setAssets([]);

    try {
        if (hiveMode) {
            // Agent Hive Flow
            const newAssets: CampaignAsset[] = [];
            for (const channel of channels) {
                setLoadingMsg(`Hive Agent Active: Processing ${channel}...`);
                try {
                    const asset = await runAgentHiveCampaign(selectedDNA, goal, channel, (status) => {
                        setHiveStatus(prev => [...prev, `[${channel}] ${status}`]);
                    });
                    newAssets.push(asset);
                    setAssets(prev => [...prev, asset]); // Incremental update
                } catch (e) {
                    console.error("Hive Error", e);
                }
            }
            // Trigger images for Hive assets
            for (const asset of newAssets) {
                if (asset.imagePrompt) {
                    handleRegenerateImage(asset.id, asset.imagePrompt);
                }
            }

        } else {
            // Standard Flow
            setLoadingMsg('Generating strategy & copy...');
            const toneOverride = tone === 'Brand Default' ? undefined : tone;
            const generatedAssets = await generateCampaignAssets(selectedDNA, goal, channels, channels.length * 2, toneOverride); 
            
            if (Array.isArray(generatedAssets)) {
                setAssets(generatedAssets);
                setLoadingMsg('Rendering on-brand visuals...');
                // Loop through assets sequentially with a delay for image gen
                for (const asset of generatedAssets) {
                    if (asset && asset.imagePrompt) {
                         try {
                             await new Promise(r => setTimeout(r, 2000));
                             const img = await generateAssetImage(asset.imagePrompt, selectedDNA.visualStyle?.description || 'modern style');
                             if (img) {
                                 setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, imageUrl: img, isGeneratingImage: false } : a));
                             } else {
                                 setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, isGeneratingImage: false } : a));
                             }
                         } catch (err) {
                             console.error(`Error generating image for asset ${asset.id}`, err);
                             setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, isGeneratingImage: false } : a));
                         }
                    }
                }
            }
        }

    } catch (e) {
        console.error(e);
        alert("Failed to generate campaign");
    } finally {
        setLoading(false);
        setLoadingMsg('');
    }
  };

  const handleRegenerateImage = async (assetId: string, prompt: string) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, isGeneratingImage: true } : a));

    try {
        const style = selectedDNA?.visualStyle?.description || 'modern style';
        const img = await generateAssetImage(prompt, style);

        setAssets(prev => prev.map(a => a.id === assetId ? { 
            ...a, 
            imageUrl: img || a.imageUrl, // Keep old image if failed
            imagePrompt: prompt,
            isGeneratingImage: false 
        } : a));
    } catch (e) {
        console.error(e);
        setAssets(prev => prev.map(a => a.id === assetId ? { ...a, isGeneratingImage: false } : a));
    }
  };

  const handleVideoReady = (assetId: string, url: string) => {
      setAssets(prev => prev.map(a => a.id === assetId ? { ...a, videoUrl: url } : a));
  };

  const handleUpdateContent = (assetId: string, newContent: string) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, content: newContent } : a));
  };

  const handleUpdateSchedule = (assetId: string, date: string) => {
      setAssets(prev => prev.map(a => a.id === assetId ? { ...a, scheduledAt: date } : a));
  };

  const handleDownloadAll = async () => {
      if (!assets || assets.length === 0) return;

      const zip = new JSZip();
      const folder = zip.folder("Campaign");
      if(!folder) return;
      
      assets.forEach((asset) => {
          if (asset) {
              folder.file(`${(asset.title || 'asset').replace(/\s+/g,'_')}.txt`, asset.content || '');
              if (asset.imageUrl) {
                  try {
                    folder.file(`${(asset.title || 'asset').replace(/\s+/g,'_')}.png`, asset.imageUrl.split(',')[1], {base64: true});
                  } catch (e) { console.error("Error adding image to zip", e); }
              }
          }
      });
      const content = await zip.generateAsync({type:"blob"});
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(content);
      link.download = "campaign_assets.zip";
      link.click();
  };

  // --- Workflow / Scheduling ---
  
  const handleOpenScheduleModal = () => {
      const providers = getEnabledWorkflows();
      if (providers.length === 0) {
          alert("No automation workflows enabled. Please go to Settings > Automations to configure n8n, Zapier, or others.");
          return;
      }
      if (providers.length >= 1) {
          setSchedulingProvider(providers[0].id);
      }
      setIsScheduleModalOpen(true);
  };

  const confirmSchedule = async () => {
      if (!selectedDNA || !schedulingProvider) return;
      setIsScheduling(true);
      
      try {
          await triggerScheduleWorkflow(schedulingProvider, {
              dna: selectedDNA,
              goal,
              assets
          });
          alert("Campaign payload successfully sent to automation workflow!");
          setIsScheduleModalOpen(false);
      } catch (e) {
          console.error(e);
          alert("Failed to trigger workflow. Check console and settings.");
      } finally {
          setIsScheduling(false);
      }
  };

  // --- Saved Campaign Handlers ---

  const handleSaveCampaign = () => {
      if (!selectedDNA || assets.length === 0) return;
      const newCampaign: SavedCampaign = {
          id: Date.now().toString(),
          profileId: selectedDNA.id,
          dna: selectedDNA,
          timestamp: Date.now(),
          goal: goal,
          assets: assets
      };
      
      const updated = [newCampaign, ...savedCampaigns];
      setSavedCampaigns(updated);
      localStorage.setItem('core_dna_saved_campaigns', JSON.stringify(updated));
      alert("Campaign Saved!");
  };

  const handleLoadCampaign = (campaign: SavedCampaign) => {
      setSelectedDNA(campaign.dna); 
      setGoal(campaign.goal);
      setAssets(campaign.assets);
      setIsSavedModalOpen(false);
      const inferredChannels = Array.from(new Set(campaign.assets.map(a => a.channel || '')));
      if(inferredChannels.length > 0) setChannels(inferredChannels.filter(c => c));
  };

  const handleDeleteCampaign = (id: string) => {
      const updated = savedCampaigns.filter(c => c.id !== id);
      setSavedCampaigns(updated);
      localStorage.setItem('core_dna_saved_campaigns', JSON.stringify(updated));
  };

  const enabledWorkflows = getEnabledWorkflows();

  if (!selectedDNA) {
      return <div className="p-12 text-center">No profile selected. <button onClick={() => navigate('/dashboard')} className="text-dna-primary underline">Go to Dashboard</button></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-dna-primary mb-6 transition-colors font-medium group"
        >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
        </button>

        {/* Header / Config */}
        <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-display font-bold">New Campaign for <span className="text-dna-primary">{selectedDNA.name}</span></h1>
                <button 
                    onClick={() => setIsSavedModalOpen(true)}
                    className="text-sm font-medium text-gray-500 hover:text-dna-primary flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
                    View Saved ({savedCampaigns.length})
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Campaign Goal</label>
                    <textarea 
                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-32 focus:ring-2 focus:ring-dna-secondary outline-none"
                        placeholder="e.g. Summer Sale, New Product Launch, Crisis Response..."
                        value={goal}
                        onChange={e => setGoal(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tone Override</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-xs font-bold uppercase text-dna-primary">Agent Hive Mode</span>
                                <div 
                                    onClick={() => setHiveMode(!hiveMode)}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${hiveMode ? 'bg-dna-primary' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${hiveMode ? 'translate-x-5' : ''}`} />
                                </div>
                            </label>
                        </div>
                        <select 
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            disabled={hiveMode}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-dna-secondary outline-none disabled:opacity-50"
                        >
                            <option value="Brand Default">Brand Default (Strict)</option>
                            <option value="Urgent / Sale">Urgent / Sale</option>
                            <option value="Empathetic / Serious">Empathetic / Serious</option>
                            <option value="Playful / Witty">Playful / Witty</option>
                            <option value="Professional / Corporate">Professional / Corporate</option>
                            <option value="Excited / Hype">Excited / Hype</option>
                        </select>
                        {hiveMode && <p className="text-[10px] text-gray-500 mt-1">Deep Mode: Multi-Agent Review Loop (Slower, Higher Quality)</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Channels</label>
                        <div className="flex flex-wrap gap-2">
                            {['Instagram', 'LinkedIn', 'Email', 'Twitter/X', 'Banner Ads'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setChannels(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        channels.includes(c) 
                                        ? 'bg-dna-secondary text-white' 
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 flex justify-end">
                <button 
                    onClick={handleGenerate}
                    disabled={loading || !goal}
                    className="px-8 py-3 bg-gradient-to-r from-dna-primary to-dna-secondary text-white rounded-xl font-bold shadow-lg hover:shadow-dna-primary/30 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                            Generating...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Generate Campaign
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
            <div className="py-12 text-center">
                 <div className="inline-block w-8 h-8 border-4 border-dna-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="animate-pulse">{loadingMsg}</p>
                 {hiveStatus.length > 0 && (
                     <div className="mt-4 max-w-md mx-auto text-xs text-gray-500 font-mono space-y-1">
                         {hiveStatus.map((s, i) => <div key={i}>{s}</div>)}
                     </div>
                 )}
            </div>
        )}

        {/* Results */}
        {assets.length > 0 && !loading && (
            <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-display">Campaign Assets</h2>
                    <div className="flex gap-3">
                         <button 
                             onClick={handleOpenScheduleModal}
                             className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20"
                         >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Push to Schedule
                         </button>
                         <button 
                            onClick={handleSaveCampaign}
                            className="px-4 py-2 bg-white dark:bg-gray-800 text-dna-primary border border-dna-primary rounded-lg text-sm font-bold hover:bg-dna-primary hover:text-white transition-colors flex items-center gap-2"
                         >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                            Save
                         </button>
                         <button onClick={handleDownloadAll} className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold flex items-center gap-2">
                            Download ZIP
                         </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {assets.map(asset => (
                        <AssetCard 
                            key={asset.id} 
                            asset={asset}
                            onRegenerateImage={handleRegenerateImage}
                            onUpdateContent={handleUpdateContent}
                            onUpdateSchedule={handleUpdateSchedule}
                            onVideoReady={handleVideoReady}
                        />
                    ))}
                </div>
            </motion.div>
        )}
        
        <SavedCampaignsModal 
            isOpen={isSavedModalOpen}
            onClose={() => setIsSavedModalOpen(false)}
            savedCampaigns={savedCampaigns}
            onLoad={handleLoadCampaign}
            onDelete={handleDeleteCampaign}
        />

        {/* Schedule Modal */}
        <AnimatePresence>
            {isScheduleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800"
                    >
                        <h3 className="text-xl font-bold font-display mb-2 text-gray-900 dark:text-white">Push to Automation</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Send these {assets.length} assets to your configured workflow tool.
                            Ensure assets have scheduled times set if required by your workflow.
                        </p>
                        
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Provider</label>
                            <div className="space-y-2">
                                {enabledWorkflows.map(wf => (
                                    <label key={wf.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${schedulingProvider === wf.id ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                                        <input 
                                            type="radio" 
                                            name="provider" 
                                            value={wf.id}
                                            checked={schedulingProvider === wf.id}
                                            onChange={(e) => setSchedulingProvider(e.target.value)}
                                            className="text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="font-bold text-gray-800 dark:text-gray-200">{wf.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setIsScheduleModalOpen(false)}
                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmSchedule}
                                disabled={isScheduling || !schedulingProvider}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isScheduling ? (
                                    <>
                                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        Trigger Workflow
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default CampaignsPage;
