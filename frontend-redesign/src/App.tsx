import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { useState } from 'react';
import { Layout } from './components/Layout';
import type { WorkspaceView } from './components/Sidebar';
import { SmoothScrollProvider } from './components/SmoothScrollProvider';
import { EventTable } from './features/admin/components/EventTable';
import { KpiGrid } from './features/admin/components/KpiGrid';
import { RoleGuard } from './features/auth/components/RoleGuard';
import { AuthProvider } from './features/auth/context/AuthContext';
import { EventList } from './features/events/EventList';
import { useEvents } from './features/events/api/useEvents';
import { OrganizerDashboard } from './features/organizer/components/OrganizerDashboard';
import { SimCollegeContainer } from './features/simcollege';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<WorkspaceView>('student');
  const { data: events = [], isLoading, error } = useEvents();

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'student' && <EventList />}

      {currentView === 'simcollege' && <SimCollegeContainer />}

      {currentView === 'organizer' && (
        <RoleGuard requiredRole="ROLE_ORGANIZER">
          <OrganizerDashboard />
        </RoleGuard>
      )}

      {currentView === 'admin' && (
        <RoleGuard requiredRole="ROLE_ADMIN">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Control Plane & Telemetry
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Real-time monitoring, event publishing, capacity enforcement, and student engagement
                metrics
              </p>
            </div>

            <KpiGrid />

            <EventTable events={events} isLoading={isLoading} error={error} />
          </div>
        </RoleGuard>
      )}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SmoothScrollProvider>
          <AppContent />
        </SmoothScrollProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
