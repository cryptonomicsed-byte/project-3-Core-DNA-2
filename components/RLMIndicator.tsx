import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RLMIndicatorProps {
  isActive?: boolean;
  isProcessing?: boolean;
  chunkCount?: number;
  totalChunks?: number;
}

const RLMIndicator: React.FC<RLMIndicatorProps> = ({ 
  isActive = false, 
  isProcessing = false,
  chunkCount = 0,
  totalChunks = 0
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isActive && !isProcessing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative"
      onHoverStart={() => setShowTooltip(true)}
      onHoverEnd={() => setShowTooltip(false)}
    >
      {/* Indicator Badge */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
        isProcessing
          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white animate-pulse'
          : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
      }`}>
        <span className="text-lg">♾️</span>
        {isProcessing ? 'RLM Processing' : 'RLM Active'}
        
        {isProcessing && totalChunks > 0 && (
          <span className="ml-1 text-indigo-200 dark:text-indigo-400">
            ({chunkCount}/{totalChunks})
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-black text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap z-50 pointer-events-none border border-gray-700"
        >
          <div className="font-bold">RLM Mode Enabled</div>
          <div className="text-gray-300">Processing unbounded context</div>
          {isProcessing && (
            <div className="text-indigo-300 mt-1">
              Analyzing chunks recursively...
            </div>
          )}
          
          {/* Arrow */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-black border-l border-t border-gray-700 rotate-45" />
        </motion.div>
      )}

      {/* Pulsing Dots Animation (when processing) */}
      {isProcessing && (
        <div className="absolute -inset-2">
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-indigo-500 opacity-10"
          />
        </div>
      )}
    </motion.div>
  );
};

export default RLMIndicator;
