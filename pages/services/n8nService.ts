/**
 * n8n Workflow Integration Service
 * Manages headless n8n workflows for automation core
 */

export interface N8nNode {
  id: string;
  type: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  description: string;
  active: boolean;
  nodes: N8nNode[];
  connections: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'success' | 'error';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt: number;
  completedAt?: number;
}

// Pre-configured node templates
export const PRE_CONFIGURED_NODES = {
  extractDNA: {
    id: 'extract-dna-node',
    type: 'http.request',
    name: 'Extract DNA from URL',
    description: 'Scrapes website and extracts brand DNA via Gemini',
    config: {
      method: 'POST',
      url: '${GEMINI_ENDPOINT}/extract',
      headers: {
        'Authorization': 'Bearer ${GEMINI_API_KEY}',
        'Content-Type': 'application/json'
      },
      body: {
        url: '=function() { return $input.all().url; }()',
        prompt: 'Extract brand identity, colors, fonts, mission, tone from this website'
      }
    }
  },

  sendCloserReport: {
    id: 'send-report-node',
    type: 'pdf.generate',
    name: 'Send Closer Report',
    description: 'Generates PDF report, attaches and emails via Gmail/Resend',
    config: {
      template: 'closer_report',
      filename: 'dna_report_${DATE}.pdf',
      email: {
        to: '=function() { return $input.all().recipient_email; }()',
        subject: 'Your Brand DNA Report',
        provider: 'resend', // or 'gmail'
        apiKey: '${RESEND_API_KEY}'
      }
    }
  },

  autoPostScheduler: {
    id: 'post-scheduler-node',
    type: 'schedule.trigger',
    name: 'Auto-Post Scheduler',
    description: 'Posts content to social media via Meta/Twitter API',
    config: {
      schedule: 'cron',
      cronExpression: '0 9 * * *', // 9 AM daily
      platforms: ['twitter', 'facebook', 'instagram'],
      content: '=function() { return $input.all().content; }()',
      apiKeys: {
        twitter: '${TWITTER_API_KEY}',
        meta: '${META_API_KEY}'
      }
    }
  }
};

// Service class for n8n operations
export class N8nService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = 'http://localhost:5678', apiKey: string = '') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Create a new workflow from pre-configured nodes
   */
  async createWorkflow(
    name: string,
    nodeIds: string[],
    config?: Record<string, unknown>
  ): Promise<N8nWorkflow> {
    const nodes = nodeIds.map(id => {
      const template = (PRE_CONFIGURED_NODES as Record<string, N8nNode>)[id];
      return { ...template, ...config };
    });

    const workflow: N8nWorkflow = {
      id: `workflow_${Date.now()}`,
      name,
      description: `Workflow: ${name}`,
      active: true,
      nodes,
      connections: this.buildConnections(nodes),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    return workflow;
  }

  /**
   * Execute a workflow and return results
   */
  async executeWorkflow(
    workflowId: string,
    input: Record<string, unknown>
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}`,
      workflowId,
      status: 'pending',
      input,
      startedAt: Date.now()
    };

    try {
      // Call the backend API to execute
      const response = await fetch(`${this.baseUrl}/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error(`Workflow execution failed: ${response.statusText}`);
      }

      const result = await response.json();
      execution.status = 'success';
      execution.output = result;
      execution.completedAt = Date.now();
    } catch (error) {
      execution.status = 'error';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = Date.now();
    }

    return execution;
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId: string): Promise<WorkflowExecution> {
    const response = await fetch(
      `${this.baseUrl}/api/executions/${executionId}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch execution status');
    }

    return response.json();
  }

  /**
   * Build connection graph between nodes
   */
  private buildConnections(nodes: N8nNode[]): Record<string, unknown> {
    const connections: Record<string, unknown> = {};

    for (let i = 0; i < nodes.length - 1; i++) {
      connections[nodes[i].id] = {
        main: [[{ node: nodes[i + 1].id, branch: 0, type: 'main' }]]
      };
    }

    return connections;
  }

  /**
   * Save workflow configuration to localStorage (for client-side persistence)
   */
  saveWorkflowLocal(workflow: N8nWorkflow): void {
    const workflows = JSON.parse(
      localStorage.getItem('n8n_workflows') || '[]'
    );
    workflows.push(workflow);
    localStorage.setItem('n8n_workflows', JSON.stringify(workflows));
  }

  /**
   * Load workflows from localStorage
   */
  loadWorkflowsLocal(): N8nWorkflow[] {
    return JSON.parse(localStorage.getItem('n8n_workflows') || '[]');
  }
}
