'use client';

import { useEffect, useState } from 'react';
import { getTotalVolume } from '@/utils/stellar';
import { Activity, TrendingUp } from 'lucide-react';

export default function ActivityFeed() {
  const [totalVolume, setTotalVolume] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchVolume = async () => {
      const volume = await getTotalVolume();
      if (mounted) {
        setTotalVolume(volume);
      }
    };

    fetchVolume();
    const interval = setInterval(fetchVolume, 5000); // poll every 5s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-6 mb-8 mt-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl shadow-inner">
          <Activity size={24} className="animate-pulse" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Live Network Stats
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total split volume recorded on smart contract
          </p>
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md mb-1">
          <TrendingUp size={12} /> Syncing
        </div>
        <p className="font-mono text-2xl font-black text-slate-900 dark:text-white">
          {totalVolume !== null ? totalVolume.toFixed(2) : '---'} <span className="text-sm text-slate-500">XLM</span>
        </p>
      </div>
    </div>
  );
}
