"use client";
import { useEffect, useState } from 'react';
import KharchaTrackerAdvanced from './KharchaTrackerAdvanced';

export default function KharchaTrackerPage() {
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('kharcha_tracker_data');
    let localData: any = {};
    if (saved) {
      try { localData = JSON.parse(saved); } catch (e) {}
    }

    // Sync from server
    fetch('/api/hisaab/personal')
      .then(res => res.json())
      .then(data => {
        const serverData = data?.data;
        if (serverData) {
          const localTime = localData.last_updated || 0;
          const serverTime = serverData.last_updated || 0;
          
          const localCount = (localData.expenses?.length || 0) + (localData.incomes?.length || 0);
          const serverCount = (serverData.expenses?.length || 0) + (serverData.incomes?.length || 0);

          let preferServer = false;
          if (serverCount > 0 && localCount === 0) {
            preferServer = true;
          } else if (serverTime > localTime) {
            preferServer = true;
          } else if (!localData.last_updated && serverCount > localCount) {
            preferServer = true;
          }
          
          // Use server data if it's explicitly newer or more populated
          if (preferServer) {
            setInitialData(serverData);
            localStorage.setItem('kharcha_tracker_data', JSON.stringify(serverData));
          } else {
            setInitialData(localData);
          }
        } else {
          setInitialData(localData);
        }
      })
      .catch(err => {
        console.error('Failed to sync personal expenses from server', err);
        setInitialData(localData);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleChange = (data: any) => {
    const dataWithTime = { ...data, last_updated: Date.now() };
    localStorage.setItem('kharcha_tracker_data', JSON.stringify(dataWithTime));
    
    // Sync to server
    fetch('/api/hisaab/personal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataWithTime)
    }).catch(err => console.error('Failed to save personal expenses to server', err));
  };

  if (isLoading || !initialData) {
    return (
      <div className="w-full h-screen bg-[#0b1224] flex items-center justify-center">
        <div className="text-white opacity-50">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-[#0b1224] p-0 md:p-4">
      <KharchaTrackerAdvanced initialData={initialData} onChange={handleChange} />
    </div>
  );
}
