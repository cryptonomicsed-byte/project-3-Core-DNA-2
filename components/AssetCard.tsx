
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CampaignAsset } from '../types';
import { generateVeoVideo } from '../pages/geminiService';

interface AssetCardProps {
  asset: CampaignAsset;
  onRegenerateImage: (assetId: string, prompt: string) => void;
  onUpdateContent: (assetId: string, newContent: string) => void;
  onUpdateSchedule: (assetId: string, date: string) => void;
  onVideoReady?: (assetId: string, url: string) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onRegenerateImage, onUpdateContent, onUpdateSchedule, onVideoReady }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(asset.content);
  const [showScheduler, setShowScheduler] = useState(false);
  const [isAnimating, setIsAnimating] = useState(asset.isGeneratingVideo || false);

  // Sync state if asset prop updates externally
  useEffect(() => {
    setContent(asset.content);
  }, [asset.content]);

  const handleDownload = () => {
    if (!asset.imageUrl && !asset.videoUrl) return;
    const link = document.createElement('a');
    link.href = asset.videoUrl || asset.imageUrl || '';
    link.download = `${asset.title.replace(/\s+/g, '_')}.${asset.videoUrl ? 'mp4' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    alert(`Sharing "${asset.title}" to social media! (Mock Action)`);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (content !== asset.content) {
      onUpdateContent(asset.id, content);
    }
  };

  const handleCancelEdit = () => {
    setContent(asset.content);
    setIsEditing(false);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateSchedule(asset.id, e.target.value);
  };

  const handleAnimate = async () => {
      if (!asset.imageUrl) return;
      setIsAnimating(true);
      try {
          const videoUrl = await generateVeoVideo(asset.imagePrompt || "Cinematic movement", asset.imageUrl);
          if (videoUrl && onVideoReady) {
              onVideoReady(asset.id, videoUrl);
          } else {
              alert("Video generation failed or timed out.");
          }
      } catch (e) {
          console.error(e);
          alert("Video generation error. Ensure Gemini API key is valid.");
      } finally {
          setIsAnimating(false);
      }
  };

  const imagePrompt = asset.imagePrompt || "";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-dna-secondary px-2 py-1 bg-dna-secondary/10 rounded-md">
            {asset.videoUrl ? 'VIDEO' : asset.type}
            </span>
            {asset.scheduledAt && (
                <span className="text-[10px] font-mono bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {new Date(asset.scheduledAt).toLocaleDateString()} {new Date(asset.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            )}
        </div>
        <div className="flex gap-2">
           <button 
                onClick={() => setShowScheduler(!showScheduler)} 
                className={`transition-colors ${showScheduler ? 'text-dna-primary' : 'text-gray-400 hover:text-dna-primary'}`} 
                title="Schedule Post"
           >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
           </button>
           <button onClick={handleShare} className="text-gray-500 hover:text-dna-accent transition-colors" title="Share">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
           </button>
           <button onClick={handleDownload} disabled={!asset.imageUrl && !asset.videoUrl} className="text-gray-500 hover:text-dna-primary transition-colors disabled:opacity-30" title="Download Asset">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
           </button>
        </div>
      </div>

      {showScheduler && (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 animate-fade-in-down">
              <label className="text-xs font-bold text-gray-500 uppercase">Deploy Time:</label>
              <input 
                type="datetime-local" 
                value={asset.scheduledAt || ''}
                onChange={handleDateChange}
                className="flex-1 text-sm p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              />
          </div>
      )}

      <div className="flex flex-col md:flex-row h-full">
        {/* Text Content */}
        <div className="p-6 md:w-1/2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">{asset.title}</h3>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-xs text-dna-secondary hover:underline">Edit Text</button>
                )}
            </div>
            
            {isEditing ? (
              <div className="flex flex-col gap-2">
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-32 p-2 text-sm border rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-dna-primary outline-none"
                  />
                  <div className="flex gap-2 justify-end">
                      <button onClick={handleCancelEdit} className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                      <button onClick={handleSaveEdit} className="px-3 py-1 text-xs bg-dna-primary text-white rounded hover:bg-dna-secondary transition-colors">Save & Regenerate</button>
                  </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 mb-2 font-mono">Image Prompt: {imagePrompt.slice(0, 50)}...</p>
            <div className="flex gap-2">
                <button 
                  onClick={() => onRegenerateImage(asset.id, asset.imagePrompt || "Brand style marketing image")}
                  disabled={asset.isGeneratingImage || isAnimating}
                  className="text-xs flex items-center gap-1 text-dna-primary hover:text-dna-accent transition-colors disabled:opacity-50"
                >
                  <svg className={`w-3 h-3 ${asset.isGeneratingImage ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {asset.isGeneratingImage ? 'Generating Image...' : 'Regenerate'}
                </button>
                
                {asset.imageUrl && !asset.videoUrl && (
                    <button 
                      onClick={handleAnimate}
                      disabled={isAnimating || asset.isGeneratingImage}
                      className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-400 transition-colors disabled:opacity-50"
                    >
                      <svg className={`w-3 h-3 ${isAnimating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {isAnimating ? 'Animating (Veo)...' : 'Animate (Veo)'}
                    </button>
                )}
            </div>
          </div>
        </div>

        {/* Visual Content */}
        <div className="md:w-1/2 bg-gray-100 dark:bg-gray-900 min-h-[200px] relative overflow-hidden group">
          {asset.videoUrl ? (
              <video 
                src={asset.videoUrl} 
                controls 
                className="w-full h-full object-cover"
                poster={asset.imageUrl}
              />
          ) : asset.isGeneratingImage || isAnimating ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-800 z-10">
                <div className="w-full h-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 background-animate bg-[length:200%_100%]"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-dna-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {isAnimating ? 'Generating Video (Veo)...' : 'Rendering Image...'}
                    </span>
                </div>
             </div>
          ) : asset.imageUrl ? (
            <img 
              src={asset.imageUrl} 
              alt={asset.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
               <span className="text-gray-400 text-sm">Image Placeholder</span>
            </div>
          )}
          
          {/* Overlay Gradient */}
          {!asset.isGeneratingImage && !isAnimating && !asset.videoUrl && (
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AssetCard;
