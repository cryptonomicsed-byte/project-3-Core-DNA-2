import React, { useState, useEffect } from 'react';
import { LangflowService, LangflowFlow, FlowExecution, FLOW_TEMPLATES } from './services/langflowService';

const FlowsPage: React.FC = () => {
  const [flows, setFlows] = useState<LangflowFlow[]>([]);
  const [executions, setExecutions] = useState<FlowExecution[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<LangflowFlow | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionInput, setExecutionInput] = useState<Record<string, string>>({});

  const langflowService = new LangflowService();

  // Load flows on mount
  useEffect(() => {
    const savedFlows = langflowService.getAllFlowsLocal();
    setFlows(savedFlows);
  }, []);

  const handleCreateFromTemplate = async (templateId: string) => {
    try {
      const newFlow = await langflowService.createFlowFromTemplate(
        templateId,
        newFlowName || undefined
      );
      setFlows([...flows, newFlow]);
      setNewFlowName('');
      setShowTemplateModal(false);
    } catch (error) {
      console.error('Failed to create flow from template:', error);
    }
  };

  const handleDuplicateFlow = async () => {
    if (!selectedFlow) return;

    try {
      const duplicated = await langflowService.duplicateFlow(
        selectedFlow.id,
        newFlowName || `${selectedFlow.name} (Copy)`
      );
      setFlows([...flows, duplicated]);
      setNewFlowName('');
      setShowDuplicateModal(false);
      setSelectedFlow(null);
    } catch (error) {
      console.error('Failed to duplicate flow:', error);
    }
  };

  const handleExecuteFlow = async () => {
    if (!selectedFlow) return;

    setIsExecuting(true);
    try {
      const execution = await langflowService.executeFlow(
        selectedFlow.id,
        executionInput
      );
      setExecutions([execution, ...executions]);
      setExecutionInput({});
      setShowExecuteModal(false);
    } catch (error) {
      console.error('Flow execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExportFlow = (flow: LangflowFlow) => {
    const json = langflowService.exportFlowAsJSON(flow);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flow.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
  };

  const handleDeleteFlow = (flowId: string) => {
    if (confirm('Are you sure you want to delete this flow?')) {
      langflowService.deleteFlowLocal(flowId);
      setFlows(flows.filter(f => f.id !== flowId));
      if (selectedFlow?.id === flowId) {
        setSelectedFlow(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Flows
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Langflow visual AI logic - drag, build, deploy
            </p>
          </div>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            + New Flow
          </button>
        </div>

        {/* Flows Grid */}
        {flows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {flows.map(flow => (
              <div
                key={flow.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {flow.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {flow.description}
                </p>

                <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                  {flow.nodes.length} nodes • {flow.connections.length} connections
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedFlow(flow);
                      setShowExecuteModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Run
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFlow(flow);
                      setShowDuplicateModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleExportFlow(flow)}
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleDeleteFlow(flow.id)}
                    className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center mb-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No flows yet. Create your first one from a template.
            </p>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Flow
            </button>
          </div>
        )}

        {/* Executions */}
        {executions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Execution History
            </h2>
            <div className="space-y-3">
              {executions.slice(0, 5).map(exec => (
                <div
                  key={exec.id}
                  className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {flows.find(f => f.id === exec.flowId)?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(exec.startedAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      exec.status === 'success'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : exec.status === 'error'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}
                  >
                    {exec.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Choose a Template
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Object.entries(FLOW_TEMPLATES).map(([key, template]) => (
                  <div
                    key={key}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setNewFlowName(template.name);
                      handleCreateFromTemplate(key);
                    }}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowTemplateModal(false)}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Execute Modal */}
        {showExecuteModal && selectedFlow && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Run: {selectedFlow.name}
              </h2>

              <div className="space-y-4 mb-6">
                {selectedFlow.name.includes('Brand DNA') && (
                  <textarea
                    placeholder="Paste brand DNA JSON"
                    value={executionInput.dna_json || ''}
                    onChange={e =>
                      setExecutionInput({ ...executionInput, dna_json: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    rows={6}
                  />
                )}

                {selectedFlow.name.includes('Review') && (
                  <textarea
                    placeholder="Paste review text"
                    value={executionInput.review_text || ''}
                    onChange={e =>
                      setExecutionInput({ ...executionInput, review_text: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    rows={6}
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowExecuteModal(false);
                    setSelectedFlow(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteFlow}
                  disabled={isExecuting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isExecuting ? 'Running...' : 'Execute'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Modal */}
        {showDuplicateModal && selectedFlow && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Duplicate Flow
              </h2>

              <input
                type="text"
                placeholder="New flow name"
                value={newFlowName}
                onChange={e => setNewFlowName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setSelectedFlow(null);
                    setNewFlowName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDuplicateFlow}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Duplicate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowsPage;
