export const metadata = {
  title: 'Kharcha Tracker - BillGST',
  description: 'Track your expenses easily'
};

export default function KharchaTrackerPage() {
  return (
    <div className="w-full h-full min-h-screen">
      <iframe src="/kharcha.html" className="w-full h-screen border-none" title="Kharcha Tracker"></iframe>
    </div>
  );
}
