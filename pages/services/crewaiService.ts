/**
 * CrewAI Integration Service
 * Manages AI agent swarms for sales, research, and content
 */

export type AgentRole = 'researcher' | 'writer' | 'closer' | 'content_guardian';

export interface AgentTask {
  id: string;
  agent: AgentRole;
  description: string;
  expectedOutput: string;
  context?: string;
}

export interface CrewAISwarm {
  id: string;
  name: string;
  description: string;
  agents: Array<{
    role: AgentRole;
    model: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
  }>;
  tasks: AgentTask[];
  createdAt: number;
}

export interface SwarmExecution {
  id: string;
  swarmId: string;
  status: 'pending' | 'running' | 'success' | 'error';
  input: Record<string, string>;
  outputs: Record<string, string>; // role -> output
  error?: string;
  startedAt: number;
  completedAt?: number;
  duration?: number;
}

export interface ConversationLog {
  id: string;
  userId: string;
  leadInfo: Record<string, string>;
  initialMessage: string;
  swarmResponse: string;
  executionId: string;
  timestamp: number;
}

// Pre-configured Closer Swarm
export const CLOSER_SWARM: CrewAISwarm = {
  id: 'closer-swarm-v1',
  name: 'Closer Swarm',
  description: 'AI sales swarm: Research leads, draft personalized emails, add urgency',
  agents: [
    {
      role: 'researcher',
      model: 'gpt-4-turbo',
      systemPrompt: `You are a research specialist. Your job is to:
1. Analyze the provided lead website/info
2. Extract key pain points, industry, company size
3. Identify gaps (missing features, poor social presence, outdated branding)
4. Create a mini brand DNA profile (2-3 sentence summary)
Return structured findings in JSON format.`,
      temperature: 0.3,
      maxTokens: 500
    },
    {
      role: 'writer',
      model: 'gpt-4-turbo',
      systemPrompt: `You are a copywriter specialist. Your job is to:
1. Take research findings from the Researcher
2. Draft a compelling, personalized email that:
   - Opens with a specific insight about THEIR business
   - Offers a solution related to their identified gap
   - Includes a link to view a brand DNA report
3. Keep tone professional, conversational, non-salesy
Return the email body as plain text.`,
      temperature: 0.7,
      maxTokens: 400
    },
    {
      role: 'closer',
      model: 'gpt-4-turbo',
      systemPrompt: `You are a sales closer specialist. Your job is to:
1. Refine the email draft from the Writer
2. Add subtle urgency hooks (e.g., "Limited spots for Q1 audits")
3. Include a Calendly link for a 15-min intro call
4. Add pricing tier (Starter: $299, Pro: $999)
5. Include a clear CTA button/link
Return the final, polished email ready to send.`,
      temperature: 0.6,
      maxTokens: 300
    }
  ],
  tasks: [
    {
      id: 'task-research',
      agent: 'researcher',
      description: 'Analyze lead website and extract pain points',
      expectedOutput: 'JSON: {painPoints, industry, gapAnalysis, dnaProfile}'
    },
    {
      id: 'task-write',
      agent: 'writer',
      description: 'Draft personalized email with DNA report link',
      expectedOutput: 'Email body (plain text)'
    },
    {
      id: 'task-close',
      agent: 'closer',
      description: 'Refine email, add urgency, pricing, CTA',
      expectedOutput: 'Final polished email with all components'
    }
  ],
  createdAt: Date.now()
};

export class CrewAIService {
  private backendUrl: string;
  private apiKey: string;

  constructor(
    backendUrl: string = 'http://localhost:3001',
    apiKey: string = ''
  ) {
    this.backendUrl = backendUrl;
    this.apiKey = apiKey;
  }

  /**
   * Execute the Closer Swarm with lead information
   */
  async executeCloserSwarm(leadInfo: {
    name: string;
    website: string;
    industry?: string;
    context?: string;
  }): Promise<SwarmExecution> {
    const execution: SwarmExecution = {
      id: `exec_${Date.now()}`,
      swarmId: CLOSER_SWARM.id,
      status: 'running',
      input: leadInfo as Record<string, string>,
      outputs: {},
      startedAt: Date.now()
    };

    try {
      const response = await fetch(
        `${this.backendUrl}/api/agents/closer-swarm/execute`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            leadName: leadInfo.name,
            websiteUrl: leadInfo.website,
            industry: leadInfo.industry,
            context: leadInfo.context
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Swarm execution failed: ${response.statusText}`);
      }

      const result = await response.json();
      execution.status = 'success';
      execution.outputs = result.outputs;
      execution.completedAt = Date.now();
      execution.duration = execution.completedAt - execution.startedAt;
    } catch (error) {
      execution.status = 'error';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = Date.now();
      execution.duration = execution.completedAt - execution.startedAt;
    }

    return execution;
  }

  /**
   * Log conversation for future training/improvement
   */
  async logConversation(
    userId: string,
    leadInfo: Record<string, string>,
    initialMessage: string,
    response: string,
    executionId: string
  ): Promise<ConversationLog> {
    const log: ConversationLog = {
      id: `log_${Date.now()}`,
      userId,
      leadInfo,
      initialMessage,
      swarmResponse: response,
      executionId,
      timestamp: Date.now()
    };

    try {
      await fetch(`${this.backendUrl}/api/agents/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(log)
      });
    } catch (error) {
      console.error('Failed to log conversation:', error);
    }

    return log;
  }

  /**
   * Save conversation log to localStorage (mock Firestore)
   */
  saveConversationLocal(log: ConversationLog): void {
    const logs = JSON.parse(
      localStorage.getItem('crewai_conversations') || '[]'
    );
    logs.push(log);
    localStorage.setItem('crewai_conversations', JSON.stringify(logs));
  }

  /**
   * Retrieve conversation logs
   */
  getConversationLogsLocal(userId?: string): ConversationLog[] {
    const logs: ConversationLog[] = JSON.parse(
      localStorage.getItem('crewai_conversations') || '[]'
    );
    return userId
      ? logs.filter(log => log.userId === userId)
      : logs;
  }

  /**
   * Get swarm status
   */
  async getSwarmStatus(executionId: string): Promise<SwarmExecution | null> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/agents/executions/${executionId}`,
        {
          headers: { 'Authorization': `Bearer ${this.apiKey}` }
        }
      );

      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error('Failed to fetch swarm status:', error);
      return null;
    }
  }
}
