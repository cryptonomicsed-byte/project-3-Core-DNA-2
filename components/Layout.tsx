
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const { user, login, logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path ? 'text-dna-primary' : 'text-gray-600 dark:text-gray-300';

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <header className="fixed w-full top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-dna-secondary to-dna-primary flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Core DNA
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-2 lg:gap-4 items-center overflow-x-auto">
            <Link to="/extract" className={`text-sm font-medium hover:text-dna-primary transition-colors ${isActive('/extract')}`}>
               Extract DNA
            </Link>
            <Link to="/dashboard" className={`text-sm font-medium hover:text-dna-primary transition-colors ${isActive('/dashboard')}`}>
               Dashboard
            </Link>
            <Link to="/campaigns" className={`text-sm font-medium hover:text-dna-primary transition-colors ${isActive('/campaigns')}`}>
               Campaigns
            </Link>

            {/* AI Agency Section */}
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

            <Link to="/workflows" className={`text-sm font-medium hover:text-dna-primary transition-colors flex items-center gap-1 ${isActive('/workflows')}`}>
               <span>⚙️</span> Automations
            </Link>
            <Link to="/agents" className={`text-sm font-medium hover:text-dna-primary transition-colors flex items-center gap-1 ${isActive('/agents')}`}>
               <span>🤖</span> AI Agents
            </Link>
            <Link to="/flows" className={`text-sm font-medium hover:text-dna-primary transition-colors flex items-center gap-1 ${isActive('/flows')}`}>
               <span>🔀</span> Flows
            </Link>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

            <Link to="/battle" className={`text-sm font-medium hover:text-dna-primary transition-colors flex items-center gap-1 ${isActive('/battle')}`}>
               <span>⚔️</span> Battle
            </Link>
            <Link to="/sonic" className={`text-sm font-medium hover:text-dna-primary transition-colors flex items-center gap-1 ${isActive('/sonic')}`}>
               <span>🔊</span> Sonic
            </Link>
            <Link to="/agent-forge" className={`text-sm font-medium hover:text-dna-primary transition-colors ${isActive('/agent-forge')}`}>
               Agent Forge
            </Link>
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Link to="/settings" className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isActive('/settings')}`} title="Settings">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </Link>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 24.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {user ? (
               <div className="flex items-center gap-2 cursor-pointer" onClick={logout} title="Click to Logout">
                 <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
               </div>
            ) : (
               <button 
                onClick={login}
                className="px-4 py-2 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:opacity-90 transition-opacity"
               >
                 Sign In
               </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16 relative overflow-hidden">
         {/* Background Elements */}
         <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-dna-primary/10 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-dna-secondary/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
            <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-dna-accent/10 rounded-full blur-[100px] animate-pulse-slow delay-2000" />
         </div>
        
        <div className="relative z-10">
          {children}
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-8 transition-colors duration-300">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Core DNA. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-dna-primary">Privacy Policy</a>
            <a href="#" className="hover:text-dna-primary">Terms of Service</a>
            <a href="#" className="hover:text-dna-primary">About Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
