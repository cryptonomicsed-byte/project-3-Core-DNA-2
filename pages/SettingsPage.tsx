
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalSettings, LLMProviderId, ImageProviderId, VoiceProviderId, WorkflowProviderId } from '../types';
import { useNavigate } from 'react-router-dom';

const INITIAL_SETTINGS: GlobalSettings = {
    theme: 'system',
    dataCollection: true,
    activeLLM: 'google',
    activeImageGen: 'google',
    activeVoice: 'openai',
    activeWorkflow: 'n8n',
    rlm: {
        enabled: false,
        rootModel: 'google',
        recursiveModel: 'google',
        chunkSizeKB: 512,
        overlapPercentage: 10,
        maxTokens: 8000,
    },
    llms: {
        google: { provider: 'google', enabled: true, apiKey: process.env.API_KEY || '' },
        openai: { provider: 'openai', enabled: false, apiKey: '', defaultModel: 'gpt-4o' },
        anthropic: { provider: 'anthropic', enabled: false, apiKey: '', defaultModel: 'claude-3-5-sonnet-latest' },
        mistral: { provider: 'mistral', enabled: false, apiKey: '', defaultModel: 'mistral-large-latest', baseUrl: 'https://api.mistral.ai/v1' },
        xai: { provider: 'xai', enabled: false, apiKey: '', defaultModel: 'grok-beta', baseUrl: 'https://api.x.ai/v1' },
        deepseek: { provider: 'deepseek', enabled: false, apiKey: '', defaultModel: 'deepseek-chat', baseUrl: 'https://api.deepseek.com/v1' },
        groq: { provider: 'groq', enabled: false, apiKey: '', defaultModel: 'llama3-70b-8192', baseUrl: 'https://api.groq.com/openai/v1' },
        together: { provider: 'together', enabled: false, apiKey: '', defaultModel: 'meta-llama/Llama-3-70b-chat-hf', baseUrl: 'https://api.together.xyz/v1' },
        openrouter: { provider: 'openrouter', enabled: false, apiKey: '', defaultModel: 'anthropic/claude-3.5-sonnet', baseUrl: 'https://openrouter.ai/api/v1' },
        perplexity: { provider: 'perplexity', enabled: false, apiKey: '', defaultModel: 'llama-3-sonar-large-32k-online', baseUrl: 'https://api.perplexity.ai' },
        qwen: { provider: 'qwen', enabled: false, apiKey: '', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', defaultModel: 'qwen-max' },
        cohere: { provider: 'cohere', enabled: false, apiKey: '', defaultModel: 'command-r-plus' },
        microsoft: { provider: 'microsoft', enabled: false, apiKey: '', defaultModel: 'gpt-4', baseUrl: 'https://YOUR_RESOURCE.openai.azure.com/' },
        ollama: { provider: 'ollama', enabled: false, apiKey: '', baseUrl: 'http://localhost:11434/v1', defaultModel: 'llama3' },
        custom_openai: { provider: 'custom_openai', enabled: false, apiKey: '', baseUrl: 'http://localhost:1234/v1' },
        // High Performance
        sambanova: { provider: 'sambanova', enabled: false, apiKey: '', baseUrl: 'https://api.sambanova.ai/v1' },
        cerebras: { provider: 'cerebras', enabled: false, apiKey: '', baseUrl: 'https://api.cerebras.ai/v1' },
        hyperbolic: { provider: 'hyperbolic', enabled: false, apiKey: '', baseUrl: 'https://api.hyperbolic.xyz/v1' },
        nebius: { provider: 'nebius', enabled: false, apiKey: '', baseUrl: 'https://api.studio.nebius.ai/v1' },
        aws_bedrock: { provider: 'aws_bedrock', enabled: false, apiKey: '' },
        friendli: { provider: 'friendli', enabled: false, apiKey: '' },
        replicate_llm: { provider: 'replicate_llm', enabled: false, apiKey: '' },
        minimax: { provider: 'minimax', enabled: false, apiKey: '' },
        hunyuan: { provider: 'hunyuan', enabled: false, apiKey: '' },
        // New Additions
        blackbox: { provider: 'blackbox', enabled: false, apiKey: '' },
        dify: { provider: 'dify', enabled: false, apiKey: '', baseUrl: 'https://api.dify.ai/v1' },
        // Niche / Legacy
        venice: { provider: 'venice', enabled: false, apiKey: '' },
        zai: { provider: 'zai', enabled: false, apiKey: '' },
        comet: { provider: 'comet', enabled: false, apiKey: '' },
        huggingface: { provider: 'huggingface', enabled: false, apiKey: '' },
    },
    image: {
        google: { provider: 'google', enabled: true, apiKey: '' },
        openai: { provider: 'openai', enabled: false, apiKey: '' }, // DALL-E 3
        stability: { provider: 'stability', enabled: false, apiKey: '' },
        fal_flux: { provider: 'fal_flux', enabled: false, apiKey: '' },
        midjourney: { provider: 'midjourney', enabled: false, apiKey: '' }, // Proxy
        runware: { provider: 'runware', enabled: false, apiKey: '' },
        leonardo: { provider: 'leonardo', enabled: false, apiKey: '' },
        recraft: { provider: 'recraft', enabled: false, apiKey: '' },
        xai: { provider: 'xai', enabled: false, apiKey: '' },
        amazon: { provider: 'amazon', enabled: false, apiKey: '' },
        adobe: { provider: 'adobe', enabled: false, apiKey: '' },
        deepai: { provider: 'deepai', enabled: false, apiKey: '' },
        replicate: { provider: 'replicate', enabled: false, apiKey: '' },
        bria: { provider: 'bria', enabled: false, apiKey: '' },
        segmind: { provider: 'segmind', enabled: false, apiKey: '' },
        prodia: { provider: 'prodia', enabled: false, apiKey: '' },
        ideogram: { provider: 'ideogram', enabled: false, apiKey: '' },
        black_forest_labs: { provider: 'black_forest_labs', enabled: false, apiKey: '' },
        wan: { provider: 'wan', enabled: false, apiKey: '' },
        hunyuan_image: { provider: 'hunyuan_image', enabled: false, apiKey: '' },
    },
    voice: {
        elevenlabs: { provider: 'elevenlabs', enabled: false, apiKey: '' },
        openai: { provider: 'openai', enabled: false, apiKey: '' },
        playht: { provider: 'playht', enabled: false, apiKey: '' },
        cartesia: { provider: 'cartesia', enabled: false, apiKey: '' }, // Fastest TTS
        deepgram: { provider: 'deepgram', enabled: false, apiKey: '' },
        lmnt: { provider: 'lmnt', enabled: false, apiKey: '' },
        fish: { provider: 'fish', enabled: false, apiKey: '' },
        rime: { provider: 'rime', enabled: false, apiKey: '' },
        neets: { provider: 'neets', enabled: false, apiKey: '' },
        speechify: { provider: 'speechify', enabled: false, apiKey: '' },
        amazon_polly: { provider: 'amazon_polly', enabled: false, apiKey: '' },
        google_tts: { provider: 'google_tts', enabled: false, apiKey: '' },
        azure: { provider: 'azure', enabled: false, apiKey: '', endpoint: '' },
        piper: { provider: 'piper', enabled: false, endpoint: 'http://localhost:5000' },
        custom: { provider: 'custom', enabled: false, endpoint: '' },
    },
    workflows: {
        n8n: { provider: 'n8n', enabled: false, webhookUrl: '', scheduleWebhookUrl: '' },
        zapier: { provider: 'zapier', enabled: false, webhookUrl: '', postingWebhookUrl: '' },
        make: { provider: 'make', enabled: false, webhookUrl: '', scheduleWebhookUrl: '' },
        activepieces: { provider: 'activepieces', enabled: false, webhookUrl: '' },
        pipedream: { provider: 'pipedream', enabled: false, webhookUrl: '' },
        relay: { provider: 'relay', enabled: false, webhookUrl: '' },
        integrately: { provider: 'integrately', enabled: false, webhookUrl: '' },
        pabbly: { provider: 'pabbly', enabled: false, webhookUrl: '' },
        tray: { provider: 'tray', enabled: false, webhookUrl: '' },
        dify: { provider: 'dify', enabled: false, apiKey: '', webhookUrl: '' },
        custom_rag: { provider: 'custom_rag', enabled: false, webhookUrl: '' },
    }
};

const PROVIDER_META: Record<string, { title: string, icon: string, fields: string[] }> = {
    // LLMs
    google: { title: 'Google Gemini', icon: 'G', fields: ['apiKey'] },
    openai: { title: 'OpenAI', icon: 'O', fields: ['apiKey', 'defaultModel'] },
    anthropic: { title: 'Anthropic', icon: 'C', fields: ['apiKey', 'defaultModel'] },
    mistral: { title: 'Mistral AI', icon: 'M', fields: ['apiKey', 'baseUrl', 'defaultModel'] },
    xai: { title: 'xAI (Grok)', icon: 'X', fields: ['apiKey', 'baseUrl'] },
    deepseek: { title: 'DeepSeek', icon: 'D', fields: ['apiKey', 'baseUrl'] },
    groq: { title: 'Groq', icon: 'Gq', fields: ['apiKey', 'baseUrl'] },
    together: { title: 'Together AI', icon: 'T', fields: ['apiKey', 'baseUrl'] },
    openrouter: { title: 'OpenRouter', icon: 'OR', fields: ['apiKey', 'baseUrl'] },
    perplexity: { title: 'Perplexity', icon: 'P', fields: ['apiKey', 'baseUrl'] },
    qwen: { title: 'Qwen (Alibaba)', icon: 'Q', fields: ['apiKey', 'baseUrl'] },
    cohere: { title: 'Cohere', icon: 'Co', fields: ['apiKey'] },
    microsoft: { title: 'Azure OpenAI', icon: 'Az', fields: ['apiKey', 'baseUrl', 'defaultModel'] },
    ollama: { title: 'Ollama (Local)', icon: 'Ol', fields: ['baseUrl', 'defaultModel'] },
    custom_openai: { title: 'Custom / Local', icon: '?', fields: ['baseUrl', 'apiKey'] },
    sambanova: { title: 'SambaNova', icon: 'SN', fields: ['apiKey', 'baseUrl'] },
    cerebras: { title: 'Cerebras', icon: 'Ce', fields: ['apiKey', 'baseUrl'] },
    hyperbolic: { title: 'Hyperbolic', icon: 'Hy', fields: ['apiKey', 'baseUrl'] },
    nebius: { title: 'Nebius', icon: 'Nb', fields: ['apiKey', 'baseUrl'] },
    aws_bedrock: { title: 'AWS Bedrock', icon: 'AWS', fields: ['apiKey'] },
    friendli: { title: 'Friendli', icon: 'Fr', fields: ['apiKey'] },
    replicate_llm: { title: 'Replicate', icon: 'R', fields: ['apiKey'] },
    minimax: { title: 'MiniMax', icon: 'Mm', fields: ['apiKey'] },
    hunyuan: { title: 'Hunyuan', icon: 'H', fields: ['apiKey'] },
    blackbox: { title: 'Blackbox', icon: 'B', fields: ['apiKey'] },
    dify: { title: 'Dify.ai', icon: 'Di', fields: ['apiKey', 'baseUrl'] },
    venice: { title: 'Venice', icon: 'V', fields: ['apiKey'] },
    zai: { title: 'Zai', icon: 'Z', fields: ['apiKey'] },
    comet: { title: 'Comet', icon: 'Cm', fields: ['apiKey'] },
    huggingface: { title: 'HuggingFace', icon: 'HF', fields: ['apiKey'] },

    // Image
    stability: { title: 'Stability AI', icon: 'S', fields: ['apiKey'] },
    fal_flux: { title: 'Fal.ai (Flux)', icon: 'F', fields: ['apiKey'] },
    midjourney: { title: 'Midjourney', icon: 'Mj', fields: ['apiKey'] },
    runware: { title: 'Runware', icon: 'Rw', fields: ['apiKey'] },
    leonardo: { title: 'Leonardo.ai', icon: 'L', fields: ['apiKey'] },
    recraft: { title: 'Recraft', icon: 'Rc', fields: ['apiKey'] },
    amazon: { title: 'Amazon Titan', icon: 'Am', fields: ['apiKey'] },
    adobe: { title: 'Adobe Firefly', icon: 'Ad', fields: ['apiKey'] },
    deepai: { title: 'DeepAI', icon: 'Da', fields: ['apiKey'] },
    replicate: { title: 'Replicate', icon: 'R', fields: ['apiKey'] },
    bria: { title: 'Bria', icon: 'Br', fields: ['apiKey'] },
    segmind: { title: 'Segmind', icon: 'Sm', fields: ['apiKey'] },
    prodia: { title: 'Prodia', icon: 'Pr', fields: ['apiKey'] },
    ideogram: { title: 'Ideogram', icon: 'Id', fields: ['apiKey'] },
    black_forest_labs: { title: 'Black Forest', icon: 'BF', fields: ['apiKey'] },
    wan: { title: 'Wan', icon: 'W', fields: ['apiKey'] },
    hunyuan_image: { title: 'Hunyuan', icon: 'Hi', fields: ['apiKey'] },

    // Voice
    elevenlabs: { title: 'ElevenLabs', icon: '11', fields: ['apiKey'] },
    playht: { title: 'PlayHT', icon: 'Ph', fields: ['apiKey'] },
    cartesia: { title: 'Cartesia', icon: 'Ca', fields: ['apiKey'] },
    deepgram: { title: 'Deepgram', icon: 'Dg', fields: ['apiKey'] },
    lmnt: { title: 'LMNT', icon: 'Lm', fields: ['apiKey'] },
    fish: { title: 'Fish Audio', icon: 'Fi', fields: ['apiKey'] },
    rime: { title: 'Rime', icon: 'Ri', fields: ['apiKey'] },
    neets: { title: 'Neets', icon: 'Nt', fields: ['apiKey'] },
    speechify: { title: 'Speechify', icon: 'Sp', fields: ['apiKey'] },
    amazon_polly: { title: 'Amazon Polly', icon: 'AP', fields: ['apiKey'] },
    google_tts: { title: 'Google TTS', icon: 'G', fields: ['apiKey'] },
    azure: { title: 'Azure Speech', icon: 'Az', fields: ['apiKey', 'endpoint'] },
    piper: { title: 'Piper (Local)', icon: 'Pi', fields: ['endpoint'] },
    custom: { title: 'Custom TTS', icon: '?', fields: ['endpoint'] },

    // Workflows
    n8n: { title: 'n8n', icon: 'n8', fields: ['webhookUrl'] },
    zapier: { title: 'Zapier', icon: 'Z', fields: ['webhookUrl'] },
    make: { title: 'Make.com', icon: 'M', fields: ['webhookUrl'] },
    activepieces: { title: 'ActivePieces', icon: 'Ap', fields: ['webhookUrl'] },
    pipedream: { title: 'Pipedream', icon: 'Pd', fields: ['webhookUrl'] },
    relay: { title: 'Relay.app', icon: 'Ry', fields: ['webhookUrl'] },
    integrately: { title: 'Integrately', icon: 'In', fields: ['webhookUrl'] },
    pabbly: { title: 'Pabbly', icon: 'Pb', fields: ['webhookUrl'] },
    tray: { title: 'Tray.io', icon: 'Tr', fields: ['webhookUrl'] },
    custom_rag: { title: 'Custom RAG', icon: 'Cr', fields: ['webhookUrl'] },
};

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'llm' | 'image' | 'voice' | 'workflow' | 'rlm'>('llm');
    const [settings, setSettings] = useState<GlobalSettings>(INITIAL_SETTINGS);
    const [hasChanges, setHasChanges] = useState(false);

    // Load settings on mount
    useEffect(() => {
        const stored = localStorage.getItem('core_dna_settings');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSettings(prev => ({
                    ...prev,
                    ...parsed,
                    llms: { ...prev.llms, ...parsed.llms },
                    image: { ...prev.image, ...parsed.image },
                    voice: { ...prev.voice, ...parsed.voice },
                    workflows: { ...prev.workflows, ...parsed.workflows }
                }));
            } catch (e) {
                console.error("Failed to load settings", e);
            }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('core_dna_settings', JSON.stringify(settings));
        setHasChanges(false);
        window.dispatchEvent(new Event('settingsUpdated'));
        alert("Settings saved successfully. Neural pathways updated.");
    };

    const updateProvider = (category: keyof GlobalSettings, key: string, updates: Partial<any>) => {
        setSettings(prev => ({
            ...prev,
            [category]: { 
                ...prev[category] as any, 
                [key]: { ...(prev[category] as any)[key] || (INITIAL_SETTINGS[category] as any)[key], ...updates } 
            }
        }));
        setHasChanges(true);
    };

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all border-b-2 ${
                activeTab === id
                    ? 'border-dna-primary text-dna-primary bg-dna-primary/5'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    const ProviderCard = ({ id, category, data, isActive, onToggle }: any) => {
        const meta = PROVIDER_META[id] || { title: id, icon: id.charAt(0).toUpperCase(), fields: ['apiKey'] };
        
        return (
            <div className={`p-6 rounded-2xl border transition-all relative ${
                data.enabled 
                ? 'bg-white dark:bg-gray-800 border-dna-primary/50 shadow-lg shadow-dna-primary/5' 
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-70 hover:opacity-100'
            }`}>
                {isActive && (
                    <div className="absolute top-0 right-0 bg-dna-primary text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                        Active Driver
                    </div>
                )}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner ${data.enabled ? 'bg-gradient-to-br from-dna-primary to-dna-secondary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                            {meta.icon}
                        </div>
                        <div>
                            <h3 className="font-bold font-display text-lg leading-tight">{meta.title}</h3>
                        </div>
                    </div>
                    <button 
                        onClick={onToggle}
                        className={`w-12 h-6 rounded-full relative transition-colors ${data.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${data.enabled ? 'translate-x-6' : ''}`} />
                    </button>
                </div>
                {data.enabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                        {meta.fields.map((field: string) => (
                            <div key={field}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    {field === 'apiKey' ? 'API Key' : field === 'baseUrl' ? 'Base URL' : field === 'defaultModel' ? 'Model ID' : field === 'endpoint' ? 'Endpoint URL' : field === 'webhookUrl' ? 'Webhook URL' : field}
                                </label>
                                <input 
                                    type={field === 'apiKey' ? 'password' : 'text'}
                                    value={data[field] || ''}
                                    onChange={e => updateProvider(category, id, { [field]: e.target.value })}
                                    className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-dna-primary outline-none text-sm font-mono"
                                    placeholder={field === 'baseUrl' ? 'https://api...' : ''}
                                />
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-dna-primary mb-6 transition-colors font-medium group"
            >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back
            </button>

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white">Neural Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Configure models, voices, and automated scheduling workflows.</p>
                </div>
                {hasChanges && (
                    <motion.button 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={handleSave}
                        className="px-6 py-3 bg-gradient-to-r from-dna-secondary to-dna-primary text-white rounded-xl font-bold shadow-lg hover:shadow-dna-primary/30 flex items-center gap-2"
                    >
                        Save Changes
                    </motion.button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-900/50 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
                    <TabButton id="llm" label="Text Intelligence" icon={<span>🧠</span>} />
                    <TabButton id="image" label="Image Generators" icon={<span>🎨</span>} />
                    <TabButton id="voice" label="Voice / TTS" icon={<span>🔊</span>} />
                    <TabButton id="workflow" label="Automations" icon={<span>⚡</span>} />
                    <TabButton id="rlm" label="RLM Mode" icon={<span>♾️</span>} />
                </div>

                <div className="p-8 bg-gray-50/50 dark:bg-black/20 min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'llm' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-yellow-800 dark:text-yellow-400">Primary Text Intelligence</h3>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-500">Select which model powers the main analysis and chat features.</p>
                                    </div>
                                    <select 
                                        value={settings.activeLLM}
                                        onChange={(e) => {
                                            setSettings(prev => ({...prev, activeLLM: e.target.value as LLMProviderId}));
                                            setHasChanges(true);
                                        }}
                                        className="p-2 rounded bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 font-bold"
                                    >
                                        {Object.keys(settings.llms).map(k => (
                                            <option key={k} value={k}>{PROVIDER_META[k]?.title || k}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.keys(settings.llms).map(key => (
                                        <ProviderCard 
                                            key={key} 
                                            id={key} 
                                            category="llms"
                                            data={settings.llms[key]} 
                                            isActive={settings.activeLLM === key}
                                            onToggle={() => updateProvider('llms', key, { enabled: !settings.llms[key].enabled })}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'image' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="mb-6 p-4 bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800 rounded-xl flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-pink-800 dark:text-pink-400">Image Generation Engine</h3>
                                        <p className="text-sm text-pink-700 dark:text-pink-500">Powering visual identity creation.</p>
                                    </div>
                                    <select 
                                        value={settings.activeImageGen}
                                        onChange={(e) => {
                                            setSettings(prev => ({...prev, activeImageGen: e.target.value as ImageProviderId}));
                                            setHasChanges(true);
                                        }}
                                        className="p-2 rounded bg-white dark:bg-gray-800 border border-pink-300 dark:border-pink-700 font-bold"
                                    >
                                        {Object.keys(settings.image).map(k => (
                                            <option key={k} value={k}>{PROVIDER_META[k]?.title || k}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.keys(settings.image).map(key => (
                                        <ProviderCard 
                                            key={key} 
                                            id={key} 
                                            category="image"
                                            data={settings.image[key]} 
                                            isActive={settings.activeImageGen === key}
                                            onToggle={() => updateProvider('image', key, { enabled: !settings.image[key].enabled })}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'voice' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                 <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-purple-800 dark:text-purple-400">Primary Voice Engine</h3>
                                        <p className="text-sm text-purple-700 dark:text-purple-500">Select the default text-to-speech provider.</p>
                                    </div>
                                    <select 
                                        value={settings.activeVoice}
                                        onChange={(e) => {
                                            setSettings(prev => ({...prev, activeVoice: e.target.value as VoiceProviderId}));
                                            setHasChanges(true);
                                        }}
                                        className="p-2 rounded bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 font-bold"
                                    >
                                        {Object.keys(settings.voice).map(k => (
                                            <option key={k} value={k}>{PROVIDER_META[k]?.title || k}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {Object.keys(settings.voice).map(key => (
                                        <ProviderCard 
                                            key={key} 
                                            id={key} 
                                            category="voice"
                                            data={settings.voice[key]} 
                                            isActive={settings.activeVoice === key}
                                            onToggle={() => updateProvider('voice', key, { enabled: !settings.voice[key].enabled })}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'workflow' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-green-800 dark:text-green-400">Default Automation</h3>
                                        <p className="text-sm text-green-700 dark:text-green-500">Primary destination for workflow triggers.</p>
                                    </div>
                                    <select 
                                        value={settings.activeWorkflow}
                                        onChange={(e) => {
                                            setSettings(prev => ({...prev, activeWorkflow: e.target.value as WorkflowProviderId}));
                                            setHasChanges(true);
                                        }}
                                        className="p-2 rounded bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 font-bold"
                                    >
                                        {Object.keys(settings.workflows).map(k => (
                                            <option key={k} value={k}>{PROVIDER_META[k]?.title || k}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {Object.keys(settings.workflows).map(key => (
                                        <ProviderCard 
                                            key={key} 
                                            id={key} 
                                            category="workflows"
                                            data={settings.workflows[key]} 
                                            isActive={settings.activeWorkflow === key}
                                            onToggle={() => updateProvider('workflows', key, { enabled: !settings.workflows[key].enabled })}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'rlm' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-2">
                                                ♾️ RLM Mode (Infinite Context)
                                            </h3>
                                            <p className="text-sm text-indigo-700 dark:text-indigo-500 mt-1">Recursive Language Model for processing unbounded content through intelligent chunking and synthesis.</p>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">Available for Pro & Hunter tiers</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setSettings(prev => ({...prev, rlm: {...prev.rlm, enabled: !prev.rlm.enabled}}));
                                                setHasChanges(true);
                                            }}
                                            className={`w-14 h-8 rounded-full relative transition-colors flex-shrink-0 ${settings.rlm.enabled ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                        >
                                            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.rlm.enabled ? 'translate-x-6' : ''}`} />
                                        </button>
                                    </div>

                                    {settings.rlm.enabled && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-indigo-200 dark:border-indigo-800">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase mb-2">Root Model</label>
                                                    <select 
                                                        value={settings.rlm.rootModel}
                                                        onChange={(e) => {
                                                            setSettings(prev => ({...prev, rlm: {...prev.rlm, rootModel: e.target.value as any}}));
                                                            setHasChanges(true);
                                                        }}
                                                        className="w-full p-2 rounded-lg bg-white dark:bg-gray-900 border border-indigo-300 dark:border-indigo-700 font-bold text-sm"
                                                    >
                                                        {Object.keys(settings.llms).map(k => (
                                                            <option key={k} value={k}>{PROVIDER_META[k]?.title || k}</option>
                                                        ))}
                                                    </select>
                                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">For initial context decomposition</p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase mb-2">Recursive Model</label>
                                                    <select 
                                                        value={settings.rlm.recursiveModel}
                                                        onChange={(e) => {
                                                            setSettings(prev => ({...prev, rlm: {...prev.rlm, recursiveModel: e.target.value as any}}));
                                                            setHasChanges(true);
                                                        }}
                                                        className="w-full p-2 rounded-lg bg-white dark:bg-gray-900 border border-indigo-300 dark:border-indigo-700 font-bold text-sm"
                                                    >
                                                        {Object.keys(settings.llms).map(k => (
                                                            <option key={k} value={k}>{PROVIDER_META[k]?.title || k}</option>
                                                        ))}
                                                    </select>
                                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">For chunk processing and synthesis</p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase mb-2">Chunk Size (KB)</label>
                                                    <input 
                                                        type="number"
                                                        value={settings.rlm.chunkSizeKB}
                                                        onChange={(e) => {
                                                            setSettings(prev => ({...prev, rlm: {...prev.rlm, chunkSizeKB: parseInt(e.target.value) || 512}}));
                                                            setHasChanges(true);
                                                        }}
                                                        min="256"
                                                        max="2048"
                                                        step="256"
                                                        className="w-full p-2 rounded-lg bg-white dark:bg-gray-900 border border-indigo-300 dark:border-indigo-700 font-mono text-sm"
                                                    />
                                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Larger = fewer chunks, faster</p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase mb-2">Context Overlap (%)</label>
                                                    <input 
                                                        type="number"
                                                        value={settings.rlm.overlapPercentage}
                                                        onChange={(e) => {
                                                            setSettings(prev => ({...prev, rlm: {...prev.rlm, overlapPercentage: parseInt(e.target.value) || 10}}));
                                                            setHasChanges(true);
                                                        }}
                                                        min="0"
                                                        max="50"
                                                        step="5"
                                                        className="w-full p-2 rounded-lg bg-white dark:bg-gray-900 border border-indigo-300 dark:border-indigo-700 font-mono text-sm"
                                                    />
                                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Overlap maintains narrative flow</p>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase mb-2">Max Tokens per Chunk</label>
                                                    <input 
                                                        type="number"
                                                        value={settings.rlm.maxTokens}
                                                        onChange={(e) => {
                                                            setSettings(prev => ({...prev, rlm: {...prev.rlm, maxTokens: parseInt(e.target.value) || 8000}}));
                                                            setHasChanges(true);
                                                        }}
                                                        min="2000"
                                                        max="32000"
                                                        step="1000"
                                                        className="w-full p-2 rounded-lg bg-white dark:bg-gray-900 border border-indigo-300 dark:border-indigo-700 font-mono text-sm"
                                                    />
                                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Higher = better quality, higher cost</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700 rounded-xl">
                                    <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">✨ Features Unlocked</h4>
                                    <ul className="space-y-1 text-sm text-indigo-800 dark:text-indigo-300">
                                        <li>✓ Extract DNA: Full website crawl with infinite context</li>
                                        <li>✓ Battle Mode: Deep competitive analysis across large datasets</li>
                                        <li>✓ Closer Agent: Complete conversation history analysis</li>
                                        <li>✓ 10x longer context without losing quality</li>
                                    </ul>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
