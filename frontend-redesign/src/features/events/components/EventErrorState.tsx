import { AlertTriangle, RotateCcw } from 'lucide-react';
import type React from 'react';
import { Button } from '../../../components/ui/Button';

export interface EventErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export const EventErrorState: React.FC<EventErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-3xl border border-status-danger/40 bg-surface-base/90 p-12 text-center shadow-xl backdrop-blur-glass"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-status-danger/30 bg-status-danger/10 text-status-danger">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h3 className="text-xl font-bold text-white tracking-tight">
        Failed to Synchronize Event Stream
      </h3>
      <p className="mt-2 max-w-md text-sm text-slate-400 leading-relaxed">
        {error?.message ||
          'A telemetry timeout or network disruption interrupted communication with the event database.'}
      </p>

      <div className="mt-6">
        <Button variant="danger" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" />
          <span>Retry Connection</span>
        </Button>
      </div>
    </div>
  );
};
