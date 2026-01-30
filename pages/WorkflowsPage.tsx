import React, { useState, useEffect } from 'react';
import { N8nService, N8nWorkflow, WorkflowExecution, PRE_CONFIGURED_NODES } from './services/n8nService';

const WorkflowsPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8nWorkflow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionInput, setExecutionInput] = useState<Record<string, string>>({});

  const n8nService = new N8nService();

  // Load workflows from storage on mount
  useEffect(() => {
    const savedWorkflows = n8nService.loadWorkflowsLocal();
    setWorkflows(savedWorkflows);

    // Load pre-configured nodes as template workflows
    if (savedWorkflows.length === 0) {
      loadDefaultWorkflows();
    }
  }, []);

  const loadDefaultWorkflows = async () => {
    const defaultWorkflows: N8nWorkflow[] = [
      {
        id: 'wf-extract-dna',
        name: 'Extract DNA from URL',
        description: 'Scrapes website and extracts brand DNA via Gemini',
        active: true,
        nodes: [PRE_CONFIGURED_NODES.extractDNA as any],
        connections: {},
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'wf-send-report',
        name: 'Send Closer Report',
        description: 'Generates PDF report, attaches and emails via Gmail/Resend',
        active: true,
        nodes: [PRE_CONFIGURED_NODES.sendCloserReport as any],
        connections: {},
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'wf-post-scheduler',
        name: 'Auto-Post Scheduler',
        description: 'Posts content to social media via Meta/Twitter API',
        active: true,
        nodes: [PRE_CONFIGURED_NODES.autoPostScheduler as any],
        connections: {},
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    setWorkflows(defaultWorkflows);
    defaultWorkflows.forEach(wf => n8nService.saveWorkflowLocal(wf));
  };

  const handleExecuteWorkflow = async () => {
    if (!selectedWorkflow) return;

    setIsExecuting(true);
    try {
      const execution = await n8nService.executeWorkflow(
        selectedWorkflow.id,
        executionInput
      );
      setExecutions([execution, ...executions]);
      setExecutionInput({});
      setShowCreateModal(false);
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const toggleWorkflowStatus = (workflowId: string) => {
    setWorkflows(
      workflows.map(wf =>
        wf.id === workflowId ? { ...wf, active: !wf.active } : wf
      )
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Automations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            n8n Embedded Workflows for your AI Agency
          </p>
        </div>

        {/* Workflows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {workflows.map(workflow => (
            <div
              key={workflow.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedWorkflow(workflow);
                setShowCreateModal(true);
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {workflow.name}
                </h3>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleWorkflowStatus(workflow.id);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    workflow.active
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                  }`}
                >
                  {workflow.active ? 'Active' : 'Inactive'}
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {workflow.description}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {workflow.nodes.length} node{workflow.nodes.length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Executions History */}
        {executions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Execution History
            </h2>
            <div className="space-y-4">
              {executions.slice(0, 5).map(exec => (
                <div
                  key={exec.id}
                  className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {workflows.find(w => w.id === exec.workflowId)?.name}
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

        {/* Execute Modal */}
        {showCreateModal && selectedWorkflow && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Execute: {selectedWorkflow.name}
              </h2>

              <div className="space-y-4 mb-6">
                {selectedWorkflow.name === 'Extract DNA from URL' && (
                  <input
                    type="url"
                    placeholder="Enter website URL"
                    value={executionInput.url || ''}
                    onChange={e =>
                      setExecutionInput({ ...executionInput, url: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  />
                )}

                {selectedWorkflow.name === 'Send Closer Report' && (
                  <>
                    <input
                      type="email"
                      placeholder="Recipient email"
                      value={executionInput.recipient_email || ''}
                      onChange={e =>
                        setExecutionInput({
                          ...executionInput,
                          recipient_email: e.target.value
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    />
                    <textarea
                      placeholder="Report content"
                      value={executionInput.content || ''}
                      onChange={e =>
                        setExecutionInput({
                          ...executionInput,
                          content: e.target.value
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                      rows={4}
                    />
                  </>
                )}

                {selectedWorkflow.name === 'Auto-Post Scheduler' && (
                  <>
                    <textarea
                      placeholder="Post content"
                      value={executionInput.content || ''}
                      onChange={e =>
                        setExecutionInput({
                          ...executionInput,
                          content: e.target.value
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                      rows={4}
                    />
                    <select
                      value={executionInput.platform || ''}
                      onChange={e =>
                        setExecutionInput({
                          ...executionInput,
                          platform: e.target.value
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    >
                      <option value="">Select platform</option>
                      <option value="twitter">Twitter</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedWorkflow(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteWorkflow}
                  disabled={isExecuting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isExecuting ? 'Executing...' : 'Execute'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowsPage;
