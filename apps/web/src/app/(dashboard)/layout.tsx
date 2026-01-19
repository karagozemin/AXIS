import { Sidebar } from '@/components/app/Sidebar';
import { TopBar } from '@/components/app/TopBar';
import { LoanProvider } from '@/contexts/LoanContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LoanProvider>
      <div className="min-h-screen bg-midnight-900 flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <TopBar />
          <main className="p-6 min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto pb-12">{children}</div>
          </main>
        </div>
      </div>
    </LoanProvider>
  );
}
