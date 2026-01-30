/**
 * RLM (Recursive Language Model) Service
 * Handles infinite context processing for long-context tasks
 * Supports multiple LLM providers (OpenAI, Anthropic Claude, Google Gemini)
 */

interface RLMConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'groq';
  model: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  chunkSize?: number; // KB per chunk
  overlapPercentage?: number; // Context overlap between chunks (0-100)
}

interface RLMTask {
  id: string;
  type: 'extract-dna' | 'battle-analysis' | 'closer-research';
  content: string;
  systemPrompt: string;
  enabled: boolean;
}

interface RLMResponse {
  status: 'success' | 'processing' | 'error';
  result?: string;
  chunks?: number;
  totalTokens?: number;
  processingTime?: number;
  error?: string;
}

class RLMService {
  private config: RLMConfig;
  private activeChunks: Map<string, string[]> = new Map();
  private recursionDepth: number = 0;
  private maxRecursionDepth: number = 5;

  constructor(config: RLMConfig) {
    this.config = {
      chunkSize: 512, // 512 KB chunks
      overlapPercentage: 10, // 10% overlap
      maxTokens: 8000,
      temperature: 0.7,
      ...config,
    };
  }

  /**
   * Process long-context content recursively
   * Breaks down large content into manageable chunks, processes each,
   * then synthesizes results into coherent output
   */
  async processWithRLM(task: RLMTask): Promise<RLMResponse> {
    if (!task.enabled) {
      return { status: 'error', error: 'RLM mode not enabled' };
    }

    const startTime = Date.now();

    try {
      // Step 1: Split content into chunks with overlap
      const chunks = this.createChunks(
        task.content,
        this.config.chunkSize,
        this.config.overlapPercentage
      );

      if (chunks.length === 0) {
        return { status: 'error', error: 'No content to process' };
      }

      // Step 2: Process each chunk recursively
      const chunkResults = await this.processChunksRecursively(
        chunks,
        task.systemPrompt,
        task.type
      );

      // Step 3: Synthesize results
      const finalResult = await this.synthesizeResults(
        chunkResults,
        task.systemPrompt,
        task.type
      );

      const processingTime = Date.now() - startTime;

      return {
        status: 'success',
        result: finalResult,
        chunks: chunks.length,
        totalTokens: this.estimateTokens(finalResult),
        processingTime,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Split content into overlapping chunks
   */
  private createChunks(
    content: string,
    chunkSizeKB: number,
    overlapPercentage: number
  ): string[] {
    const chunkSizeBytes = chunkSizeKB * 1024;
    const contentBytes = new TextEncoder().encode(content).length;

    if (contentBytes <= chunkSizeBytes) {
      return [content];
    }

    const chunks: string[] = [];
    let startIdx = 0;
    const overlapSize = Math.floor((chunkSizeBytes / contentBytes) * overlapPercentage);

    while (startIdx < content.length) {
      const endIdx = Math.min(startIdx + chunkSizeBytes, content.length);
      chunks.push(content.substring(startIdx, endIdx));

      // Move forward with overlap
      startIdx = endIdx - overlapSize;

      if (startIdx >= content.length) break;
    }

    return chunks;
  }

  /**
   * Recursively process chunks with context awareness
   */
  private async processChunksRecursively(
    chunks: string[],
    systemPrompt: string,
    taskType: string
  ): Promise<string[]> {
    if (this.recursionDepth >= this.maxRecursionDepth) {
      return chunks;
    }

    this.recursionDepth++;
    const results: string[] = [];

    // Process chunks in batches to maintain context
    const batchSize = Math.max(1, Math.floor(chunks.length / 2));

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, Math.min(i + batchSize, chunks.length));
      const batchContext = this.buildContextFromBatch(batch, i, chunks.length);

      const response = await this.callLLM({
        systemPrompt,
        userPrompt: batchContext,
        taskType,
      });

      results.push(response);
    }

    this.recursionDepth--;
    return results;
  }

  /**
   * Build context-aware prompt from batch
   */
  private buildContextFromBatch(
    batch: string[],
    batchIndex: number,
    totalChunks: number
  ): string {
    const chunkNumber = Math.floor(batchIndex / Math.ceil(totalChunks / 2));
    const isLastBatch = batchIndex + batch.length >= totalChunks;

    return `
[CHUNK ${chunkNumber + 1} of ~${Math.ceil(totalChunks / 2)}]
${isLastBatch ? '[FINAL CHUNK]' : ''}

Content:
${batch.join('\n---\n')}

Instructions: Analyze this chunk and extract key insights. Preserve context from previous chunks.
    `.trim();
  }

  /**
   * Synthesize chunk results into final output
   */
  private async synthesizeResults(
    chunkResults: string[],
    systemPrompt: string,
    taskType: string
  ): Promise<string> {
    if (chunkResults.length === 0) return '';
    if (chunkResults.length === 1) return chunkResults[0];

    const synthesisPrompt = `
You are synthesizing results from analyzing large content in multiple chunks.

Chunk Results:
${chunkResults.map((r, i) => `[Chunk ${i + 1}]\n${r}`).join('\n\n---\n\n')}

Task: Create a coherent, unified analysis that combines all chunk insights without redundancy.
Maintain narrative flow and ensure all critical information is included.
    `.trim();

    const result = await this.callLLM({
      systemPrompt,
      userPrompt: synthesisPrompt,
      taskType,
    });

    return result;
  }

  /**
   * Call LLM provider (with provider abstraction)
   */
  private async callLLM({
    systemPrompt,
    userPrompt,
    taskType,
  }: {
    systemPrompt: string;
    userPrompt: string;
    taskType: string;
  }): Promise<string> {
    // This will be implemented by frontend calling backend API
    // Backend will handle provider-specific logic

    const response = await fetch('/api/llm/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: this.config.provider,
        model: this.config.model,
        systemPrompt,
        userPrompt,
        taskType,
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result || '';
  }

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 chars)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Update RLM configuration
   */
  setConfig(newConfig: Partial<RLMConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): RLMConfig {
    return { ...this.config };
  }

  /**
   * Reset recursion depth
   */
  resetRecursionDepth(): void {
    this.recursionDepth = 0;
  }
}

// Export singleton instance
let rlmInstance: RLMService | null = null;

export function initializeRLM(config: RLMConfig): RLMService {
  rlmInstance = new RLMService(config);
  return rlmInstance;
}

export function getRLMService(): RLMService | null {
  return rlmInstance;
}

export type { RLMConfig, RLMTask, RLMResponse };
export { RLMService };
