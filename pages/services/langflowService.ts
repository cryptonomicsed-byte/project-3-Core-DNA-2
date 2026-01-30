/**
 * Langflow Integration Service
 * Manages visual AI flow creation and execution
 */

export interface FlowNode {
  id: string;
  type: string;
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface FlowConnection {
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface LangflowFlow {
  id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  connections: FlowConnection[];
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
  templateId?: string; // Link to pre-built template
}

export interface FlowExecution {
  id: string;
  flowId: string;
  status: 'pending' | 'running' | 'success' | 'error';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt: number;
  completedAt?: number;
}

// Pre-built flow templates
export const FLOW_TEMPLATES = {
  brandDNACampaignGenerator: {
    id: 'flow-brand-dna-campaign',
    name: 'Brand DNA → Campaign Generator',
    description: 'Convert brand DNA into social media posts + visual prompts',
    nodes: [
      {
        id: 'input-dna',
        type: 'input',
        label: 'Brand DNA Input',
        config: { format: 'json' },
        position: { x: 0, y: 0 }
      },
      {
        id: 'extract-insights',
        type: 'chain',
        label: 'Extract Campaign Insights',
        config: {
          prompt: 'Given this brand DNA, extract 5 key insights for a Q1 campaign: ${dna_json}',
          model: 'gpt-4-turbo'
        },
        position: { x: 200, y: 0 }
      },
      {
        id: 'generate-posts',
        type: 'chain',
        label: 'Generate Social Posts',
        config: {
          prompt: 'Create 3 engaging Instagram captions from these insights: ${insights}',
          model: 'gpt-4-turbo'
        },
        position: { x: 400, y: 0 }
      },
      {
        id: 'generate-visuals',
        type: 'chain',
        label: 'Generate Visual Prompts',
        config: {
          prompt: 'Create Ideogram/Midjourney prompts for 3 hero images based on: ${insights}',
          model: 'gpt-4-turbo'
        },
        position: { x: 600, y: 0 }
      },
      {
        id: 'output-campaign',
        type: 'output',
        label: 'Campaign Package',
        config: { format: 'json' },
        position: { x: 800, y: 0 }
      }
    ],
    connections: [
      { source: 'input-dna', sourceHandle: 'out', target: 'extract-insights', targetHandle: 'in' },
      { source: 'extract-insights', sourceHandle: 'out', target: 'generate-posts', targetHandle: 'in' },
      { source: 'extract-insights', sourceHandle: 'out', target: 'generate-visuals', targetHandle: 'in' },
      { source: 'generate-posts', sourceHandle: 'out', target: 'output-campaign', targetHandle: 'posts_in' },
      { source: 'generate-visuals', sourceHandle: 'out', target: 'output-campaign', targetHandle: 'visuals_in' }
    ],
    createdAt: Date.now(),
    isPublic: true
  },

  reviewToSocialGraphic: {
    id: 'flow-review-social-graphic',
    name: 'Review → Social Graphic',
    description: 'Scrape review, generate AI visual, create post',
    nodes: [
      {
        id: 'input-review',
        type: 'input',
        label: 'Review Input',
        config: { format: 'text' },
        position: { x: 0, y: 0 }
      },
      {
        id: 'scrape-context',
        type: 'chain',
        label: 'Extract Review Context',
        config: {
          prompt: 'Extract: sentiment, key phrases, product/service from: ${review_text}',
          model: 'gpt-4-turbo'
        },
        position: { x: 200, y: 0 }
      },
      {
        id: 'gen-visual-prompt',
        type: 'chain',
        label: 'Generate Visual Prompt',
        config: {
          prompt: 'Create an Ideogram prompt for a social graphic showcasing: ${context}',
          model: 'gpt-4-turbo'
        },
        position: { x: 400, y: 0 }
      },
      {
        id: 'call-ideogram',
        type: 'api',
        label: 'Call Ideogram API',
        config: {
          endpoint: 'https://api.ideogram.ai/generate',
          method: 'POST',
          apiKeyVar: 'IDEOGRAM_API_KEY',
          body: { prompt: '${visual_prompt}', style: 'instagram_post' }
        },
        position: { x: 600, y: 0 }
      },
      {
        id: 'gen-caption',
        type: 'chain',
        label: 'Generate Post Caption',
        config: {
          prompt: 'Write a short, engaging Instagram caption for this review: ${review_text}',
          model: 'gpt-4-turbo'
        },
        position: { x: 600, y: 100 }
      },
      {
        id: 'output-social',
        type: 'output',
        label: 'Social Post Ready',
        config: { format: 'json' },
        position: { x: 800, y: 50 }
      }
    ],
    connections: [
      { source: 'input-review', sourceHandle: 'out', target: 'scrape-context', targetHandle: 'in' },
      { source: 'scrape-context', sourceHandle: 'out', target: 'gen-visual-prompt', targetHandle: 'in' },
      { source: 'scrape-context', sourceHandle: 'out', target: 'gen-caption', targetHandle: 'in' },
      { source: 'gen-visual-prompt', sourceHandle: 'out', target: 'call-ideogram', targetHandle: 'in' },
      { source: 'call-ideogram', sourceHandle: 'out', target: 'output-social', targetHandle: 'image_in' },
      { source: 'gen-caption', sourceHandle: 'out', target: 'output-social', targetHandle: 'caption_in' }
    ],
    createdAt: Date.now(),
    isPublic: true
  }
};

export class LangflowService {
  private backendUrl: string;
  private apiKey: string;

  constructor(
    backendUrl: string = 'http://localhost:7860',
    apiKey: string = ''
  ) {
    this.backendUrl = backendUrl;
    this.apiKey = apiKey;
  }

  /**
   * Create a flow from template
   */
  async createFlowFromTemplate(
    templateId: string,
    customName?: string
  ): Promise<LangflowFlow> {
    const template = (FLOW_TEMPLATES as Record<string, LangflowFlow>)[templateId];

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const flow: LangflowFlow = {
      ...template,
      id: `flow_${Date.now()}`,
      name: customName || template.name,
      templateId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Save to local storage
    this.saveFlowLocal(flow);
    return flow;
  }

  /**
   * Execute a flow
   */
  async executeFlow(
    flowId: string,
    input: Record<string, unknown>
  ): Promise<FlowExecution> {
    const execution: FlowExecution = {
      id: `exec_${Date.now()}`,
      flowId,
      status: 'running',
      input,
      startedAt: Date.now()
    };

    try {
      const response = await fetch(
        `${this.backendUrl}/api/flows/${flowId}/execute`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(input)
        }
      );

      if (!response.ok) {
        throw new Error(`Flow execution failed: ${response.statusText}`);
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
   * Duplicate a flow
   */
  async duplicateFlow(sourceFlowId: string, newName: string): Promise<LangflowFlow> {
    const source = this.loadFlowLocal(sourceFlowId);

    if (!source) {
      throw new Error(`Flow ${sourceFlowId} not found`);
    }

    const duplicate: LangflowFlow = {
      ...source,
      id: `flow_${Date.now()}`,
      name: newName,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.saveFlowLocal(duplicate);
    return duplicate;
  }

  /**
   * Export flow as JSON
   */
  exportFlowAsJSON(flow: LangflowFlow): string {
    return JSON.stringify(flow, null, 2);
  }

  /**
   * Import flow from JSON
   */
  importFlowFromJSON(json: string): LangflowFlow {
    const flow = JSON.parse(json) as LangflowFlow;
    flow.id = `flow_${Date.now()}`;
    flow.createdAt = Date.now();
    flow.updatedAt = Date.now();
    this.saveFlowLocal(flow);
    return flow;
  }

  /**
   * Get all flows
   */
  getAllFlowsLocal(): LangflowFlow[] {
    const flows = localStorage.getItem('langflow_flows');
    return flows ? JSON.parse(flows) : [];
  }

  /**
   * Load single flow
   */
  private loadFlowLocal(flowId: string): LangflowFlow | null {
    const flows = this.getAllFlowsLocal();
    return flows.find(f => f.id === flowId) || null;
  }

  /**
   * Save flow to local storage
   */
  private saveFlowLocal(flow: LangflowFlow): void {
    const flows = this.getAllFlowsLocal();
    const index = flows.findIndex(f => f.id === flow.id);

    if (index >= 0) {
      flows[index] = flow;
    } else {
      flows.push(flow);
    }

    localStorage.setItem('langflow_flows', JSON.stringify(flows));
  }

  /**
   * Delete flow
   */
  deleteFlowLocal(flowId: string): void {
    const flows = this.getAllFlowsLocal();
    const filtered = flows.filter(f => f.id !== flowId);
    localStorage.setItem('langflow_flows', JSON.stringify(filtered));
  }
}
