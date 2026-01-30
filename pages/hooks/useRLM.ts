import { useEffect, useState, useCallback } from 'react';
import { RLMService, RLMConfig, RLMTask, RLMResponse } from '../services/rlmService';
import { GlobalSettings } from '../../types';

/**
 * Hook to manage RLM processing
 */
export function useRLM() {
  const [rlmService, setRlmService] = useState<RLMService | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chunkCount, setChunkCount] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Initialize RLM service from settings
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('core_dna_settings');
      if (!storedSettings) return;

      const settings: GlobalSettings = JSON.parse(storedSettings);
      if (!settings.rlm.enabled) return;

      const config: RLMConfig = {
        provider: settings.rlm.rootModel as any,
        model: settings.llms[settings.rlm.rootModel]?.defaultModel || 'default',
        apiKey: settings.llms[settings.rlm.rootModel]?.apiKey || '',
        maxTokens: settings.rlm.maxTokens,
        temperature: 0.7,
        chunkSize: settings.rlm.chunkSizeKB,
        overlapPercentage: settings.rlm.overlapPercentage,
      };

      const service = new RLMService(config);
      setRlmService(service);
    } catch (err) {
      console.error('Failed to initialize RLM:', err);
      setError('RLM initialization failed');
    }
  }, []);

  // Process content with RLM
  const processWithRLM = useCallback(async (task: RLMTask): Promise<RLMResponse | null> => {
    if (!rlmService) return null;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await rlmService.processWithRLM(task);
      
      if (response.chunks) {
        setTotalChunks(response.chunks);
      }

      if (response.status === 'error') {
        setError(response.error || 'Processing failed');
      }

      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { status: 'error', error: errorMsg };
    } finally {
      setIsProcessing(false);
      setChunkCount(0);
      setTotalChunks(0);
    }
  }, [rlmService]);

  // Check if RLM is enabled
  const isRLMEnabled = useCallback((): boolean => {
    try {
      const storedSettings = localStorage.getItem('core_dna_settings');
      if (!storedSettings) return false;
      const settings: GlobalSettings = JSON.parse(storedSettings);
      return settings.rlm.enabled;
    } catch {
      return false;
    }
  }, []);

  return {
    rlmService,
    isProcessing,
    chunkCount,
    totalChunks,
    error,
    processWithRLM,
    isRLMEnabled,
  };
}
