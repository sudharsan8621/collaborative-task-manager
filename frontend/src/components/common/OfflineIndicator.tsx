/**
 * Offline Indicator Component
 * Shows a banner when the user is offline
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 py-2 px-4 text-center text-sm font-medium flex items-center justify-center"
        >
          <WifiOff className="w-4 h-4 mr-2" />
          You're offline. Some features may not be available.
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;