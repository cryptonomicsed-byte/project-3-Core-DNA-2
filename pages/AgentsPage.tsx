import React, { useState, useEffect } from 'react';
import { CrewAIService, SwarmExecution, ConversationLog, CLOSER_SWARM } from './services/crewaiService';

const AgentsPage: React.FC = () => {
  const [swarmExecution, setSwarmExecution] = useState<SwarmExecution | null>(null);
  const [conversations, setConversations] = useState<ConversationLog[]>([]);
  const [leadInfo, setLeadInfo] = useState({
    name: '',
    website: '',
    industry: ''
  });
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationLog | null>(null);

  const crewaiService = new CrewAIService();

  // Load conversations on mount
  useEffect(() => {
    const savedConversations = crewaiService.getConversationLogsLocal();
    setConversations(savedConversations);
  }, []);

  const handleExecuteSwarm = async () => {
    if (!leadInfo.name || !leadInfo.website) {
      alert('Please fill in lead name and website');
      return;
    }

    setIsExecuting(true);
    try {
      const execution = await crewaiService.executeCloserSwarm(leadInfo);

      if (execution.status === 'success' && execution.outputs.closer) {
        const conversation: ConversationLog = {
          id: `log_${Date.now()}`,
          userId: 'current_user',
          leadInfo,
          initialMessage: `Lead: ${leadInfo.name} (${leadInfo.website})`,
          swarmResponse: execution.outputs.closer as string,
          executionId: execution.id,
          timestamp: Date.now()
        };

        crewaiService.saveConversationLocal(conversation);
        setConversations([conversation, ...conversations]);
        setSwarmExecution(execution);
      }

      setLeadInfo({ name: '', website: '', industry: '' });
      setShowExecuteModal(false);
    } catch (error) {
      console.error('Swarm execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI Agents
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            CrewAI-powered sales swarm for lead research, outreach & closing
          </p>
        </div>

        {/* Swarm Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {CLOSER_SWARM.name}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {CLOSER_SWARM.description}
          </p>

          {/* Agent Roles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {CLOSER_SWARM.agents.map((agent, idx) => (
              <div
                key={idx}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize mb-2">
                  {agent.role}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {CLOSER_SWARM.tasks[idx]?.description}
                </p>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                  <p>Model: {agent.model}</p>
                  <p>Temperature: {agent.temperature}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowExecuteModal(true)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Run Closer Swarm →
          </button>
        </div>

        {/* Conversation History */}
        {conversations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Conversation History
            </h2>

            <div className="space-y-4">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {conv.leadInfo.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(conv.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {conv.leadInfo.website}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {conv.swarmResponse.substring(0, 150)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execute Modal */}
        {showExecuteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Run Closer Swarm
              </h2>

              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Lead name"
                  value={leadInfo.name}
                  onChange={e => setLeadInfo({ ...leadInfo, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <input
                  type="url"
                  placeholder="Company website"
                  value={leadInfo.website}
                  onChange={e => setLeadInfo({ ...leadInfo, website: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Industry (optional)"
                  value={leadInfo.industry}
                  onChange={e => setLeadInfo({ ...leadInfo, industry: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowExecuteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteSwarm}
                  disabled={isExecuting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isExecuting ? 'Running...' : 'Execute'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Detail Modal */}
        {selectedConversation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedConversation.leadInfo.name}
                </h2>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                    Website
                  </h3>
                  <a
                    href={selectedConversation.leadInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {selectedConversation.leadInfo.website}
                  </a>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                    Generated Response
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedConversation.swarmResponse}
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Execution ID: {selectedConversation.executionId}
                  <br />
                  Created: {new Date(selectedConversation.timestamp).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedConversation.swarmResponse);
                  alert('Response copied to clipboard');
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy Response
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentsPage;
