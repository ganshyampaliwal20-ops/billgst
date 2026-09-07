"use client";
import { useEffect, useState } from 'react';
import KharchaTrackerAdvanced from './KharchaTrackerAdvanced';

export default function KharchaTrackerPage() {
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('kharcha_tracker_data');
    if (saved) {
      try {
        setInitialData(JSON.parse(saved));
      } catch (e) {
        setInitialData({});
      }
    } else {
      setInitialData({});
    }
  }, []);

  const handleChange = (data: any) => {
    localStorage.setItem('kharcha_tracker_data', JSON.stringify(data));
  };

  if (!initialData) return null;

  return (
    <div className="w-full h-full min-h-screen bg-[#0b1224] p-0 md:p-4">
      <KharchaTrackerAdvanced initialData={initialData} onChange={handleChange} />
    </div>
  );
}
