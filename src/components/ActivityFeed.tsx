'use client';

import { useEffect, useState } from 'react';
import { getTotalVolume, rpcServer, CONTRACT_ADDRESS } from '@/utils/stellar';
import { Activity, TrendingUp } from 'lucide-react';

export default function ActivityFeed() {
  const [volume, setVolume] = useState<number>(0);
  const [events, setEvents] = useState<any[]>([]);
  const [networkError, setNetworkError] = useState<boolean>(false);

  useEffect(() => {
    const fetchVolumeAndEvents = async () => {
      try {
        const vol = await getTotalVolume();
        setVolume(vol);

        const server = rpcServer;
        const latestLedger = await server.getLatestLedger();
        const startLedger = Math.max(1, latestLedger.sequence - 1000);
        
        const eventsResponse = await server.getEvents({
          startLedger,
          filters: [
            {
              type: "contract",
              contractIds: [CONTRACT_ADDRESS],
              topics: [["*", "*", "*"]]
            }
          ],
          limit: 10
        });
        
        setEvents(eventsResponse.events || []);
        setNetworkError(false);
      } catch(e) {
        console.warn("Failed to fetch data (likely ISP block):", e);
        setNetworkError(true);
      }
    };

    fetchVolumeAndEvents();
    const interval = setInterval(fetchVolumeAndEvents, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Live Activity</h2>
        </div>
        {networkError && (
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">
            ISP Block Detected (Use VPN)
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Platform Volume</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {volume !== null ? `${volume} XLM` : 'Loading...'}
          </div>
        </div>

        {events.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent Splits</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {events.map((evt, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 text-sm">
                  <span className="text-blue-400 font-medium">Split Recorded!</span>
                  <div className="text-gray-400 text-xs mt-1">
                    Ledger: {evt.ledger}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
