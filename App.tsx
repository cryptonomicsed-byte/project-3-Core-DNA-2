
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import ExtractPage from './pages/ExtractPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import BrandSimulatorPage from './pages/BrandSimulatorPage';
import AgentForgePage from './pages/AgentForgePage';
import SettingsPage from './pages/SettingsPage';
import BattleModePage from './pages/BattleModePage';
import SonicLabPage from './pages/SonicLabPage';
import LiveSessionPage from './pages/LiveSessionPage';
import SharedProfilePage from './pages/SharedProfilePage';
import WorkflowsPage from './pages/WorkflowsPage';
import AgentsPage from './pages/AgentsPage';
import FlowsPage from './pages/FlowsPage';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);

  // Dark Mode Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <AuthProvider>
      <Router>
        <Routes>
            {/* Shared Route - No Layout Wrappers */}
            <Route path="/share/:id" element={<SharedProfilePage />} />
            
            {/* Main App Routes */}
            <Route path="*" element={
                <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/extract" element={<ExtractPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/campaigns" element={<CampaignsPage />} />
                    <Route path="/simulate" element={<BrandSimulatorPage />} />
                    <Route path="/live" element={<LiveSessionPage />} />
                    <Route path="/agent-forge" element={<AgentForgePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/battle" element={<BattleModePage />} />
                    <Route path="/sonic" element={<SonicLabPage />} />
                    <Route path="/workflows" element={<WorkflowsPage />} />
                    <Route path="/agents" element={<AgentsPage />} />
                    <Route path="/flows" element={<FlowsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
            } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
