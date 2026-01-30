
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BrandDNA, SavedCampaign } from '../types';
import { FADE_IN_UP } from '../constants';
import { AnalyticsSection } from '../components/AnalyticsSection';
import TrendPulse from '../components/TrendPulse';

const DashboardPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<BrandDNA[]>([]);
  const [campaigns, setCampaigns] = useState<SavedCampaign[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    if (user) {
        loadData();
    }
  }, [user]);

  const loadData = () => {
    // Load Profiles
    const storedProfiles = localStorage.getItem('core_dna_profiles');
    if (storedProfiles) {
        try {
            const parsed = JSON.parse(storedProfiles);
            if (Array.isArray(parsed)) {
                setProfiles(parsed);
            } else {
                setProfiles([]);
            }
        } catch (e) {
            console.error("Failed to parse stored profiles", e);
            setProfiles([]);
        }
    }

    // Load Campaigns
    const storedCampaigns = localStorage.getItem('core_dna_saved_campaigns');
    if (storedCampaigns) {
        try {
            const parsed = JSON.parse(storedCampaigns);
            if (Array.isArray(parsed)) {
                setCampaigns(parsed);
            }
        } catch (e) {
            console.error("Failed to parse stored campaigns", e);
        }
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm("Are you sure you want to delete this profile version? This cannot be undone.")) {
        const updated = profiles.filter(p => p.id !== id);
        localStorage.setItem('core_dna_profiles', JSON.stringify(updated));
        setProfiles(updated);
    }
  };

  const handleShareProfile = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const url = `${window.location.origin}/#/share/${id}`;
      navigator.clipboard.writeText(url);
      alert(`Public Brand Twin URL copied!\n${url}`);
  };

  const sortedProfiles = [...profiles].sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      return a.createdAt - b.createdAt;
  });

  if (!user) {
    return (
        <div className="container mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl font-display font-bold mb-4">Please Sign In</h2>
            <p className="mb-8 text-gray-600 dark:text-gray-400">You need to be logged in to view your saved profiles.</p>
            <button onClick={login} className="px-6 py-3 bg-dna-primary text-white rounded-full font-bold">Sign In with Google (Mock)</button>
        </div>
    );
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

        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-display font-bold">Your Core DNA Portfolios</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your brand versions and campaigns.</p>
            </div>
            <div className="flex gap-4 items-center">
                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
                
                {user.tier === 'agency' ? (
                     <button className="px-4 py-2 bg-dna-secondary text-white rounded-lg font-bold text-sm hover:opacity-90">
                        Bulk Extract
                    </button>
                ) : (
                    <button 
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg font-bold text-sm cursor-not-allowed" 
                        title="Upgrade to Agency Tier"
                        onClick={() => alert("Bulk Extract is available for Agency Tier only.")}
                    >
                        Bulk Extract <span className="text-xs uppercase ml-1 border border-gray-300 px-1 rounded">Agency</span>
                    </button>
                )}

                <Link to="/extract" className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold text-sm hover:opacity-90">
                    + New Extraction
                </Link>
            </div>
        </div>

        {profiles.length > 0 && (
            <TrendPulse dna={profiles[0]} />
        )}

        {profiles.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 mt-8">
                <p className="text-xl text-gray-500 mb-4">No profiles saved yet.</p>
                <Link to="/extract" className="text-dna-primary font-bold hover:underline">Extract your first brand DNA</Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {sortedProfiles.map((profile, i) => (
                    <motion.div 
                        key={profile.id || i}
                        variants={FADE_IN_UP}
                        initial="hidden" animate="visible"
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 group cursor-pointer flex flex-col"
                        onClick={() => navigate('/extract', { state: { dna: profile } })}
                    >
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                             {profile.heroImageUrl ? (
                                <img src={profile.heroImageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt="Brand Hero" />
                             ) : (
                                <div className="w-full h-full bg-gradient-to-r from-dna-primary to-dna-secondary opacity-50" />
                             )}
                             <div className="absolute top-2 right-2 flex gap-1">
                                <button 
                                    onClick={(e) => handleShareProfile(e, profile.id)}
                                    className="p-1.5 bg-black/50 hover:bg-dna-primary text-white rounded-full backdrop-blur-md transition-colors"
                                    title="Get Public Link"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                </button>
                                <button 
                                    onClick={(e) => handleDelete(e, profile.id)}
                                    className="p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors"
                                    title="Delete Profile"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                             </div>
                        </div>
                        <div className="p-6 flex-grow">
                            <h3 className="text-xl font-bold font-display mb-1">{profile.name}</h3>
                            <p className="text-sm text-gray-500 mb-4 truncate">{profile.tagline}</p>
                            
                            <div className="flex gap-2 mb-4">
                                {(Array.isArray(profile.colors) ? profile.colors : []).slice(0, 5).map((c, idx) => (
                                    <div 
                                      key={idx} 
                                      className="w-5 h-5 rounded-full border border-gray-100 dark:border-gray-600 shadow-sm" 
                                      style={{ backgroundColor: typeof c === 'string' ? c : c.hex }}
                                      title={typeof c === 'string' ? c : c.name}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center text-xs text-gray-400">
                             <div>
                                 <span className="block font-medium text-gray-500 dark:text-gray-300">Version: {new Date(profile.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                 <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                             </div>
                             <button className="text-dna-primary font-bold hover:underline">Open &rarr;</button>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}

        {/* Brand Performance Analytics Section */}
        {(profiles.length > 0 || campaigns.length > 0) && (
            <AnalyticsSection profiles={profiles} campaigns={campaigns} />
        )}
    </div>
  );
};

export default DashboardPage;
