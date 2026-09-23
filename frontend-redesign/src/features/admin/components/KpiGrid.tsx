import { Calendar, Cpu, TrendingUp, Users } from 'lucide-react';
import type React from 'react';
import { DecryptedText } from '../../../components/reactbits/text/DecryptedText';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useAdminStats } from '../api/useAdminStats';

const SKELETON_KEYS = ['kpi-skel-1', 'kpi-skel-2', 'kpi-skel-3', 'kpi-skel-4'];

export const KpiGrid: React.FC = () => {
  const { data: metrics = [], isLoading } = useAdminStats();

  const iconMap: Record<string, React.ElementType> = {
    'total-events': Calendar,
    'total-registered': Users,
    'occupancy-rate': TrendingUp,
    'system-throughput': Cpu,
  };

  const statusColors: Record<string, { text: string; bg: string; border: string; glow: string }> = {
    primary: {
      text: 'text-brand-primary',
      bg: 'bg-brand-primary/10',
      border: 'border-brand-primary/20',
      glow: 'shadow-glow-cyan',
    },
    success: {
      text: 'text-status-success',
      bg: 'bg-status-success/10',
      border: 'border-status-success/20',
      glow: '',
    },
    info: {
      text: 'text-indigo-300',
      bg: 'bg-brand-accent/10',
      border: 'border-brand-accent/20',
      glow: 'shadow-glow-indigo',
    },
    warning: {
      text: 'text-status-warning',
      bg: 'bg-status-warning/10',
      border: 'border-status-warning/20',
      glow: '',
    },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="h-36 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = iconMap[metric.id] || Calendar;
        const color = statusColors[metric.status] || statusColors.primary;

        return (
          <div
            key={metric.id}
            className="flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface-raised/80 p-5 backdrop-blur-glass transition-all duration-300 hover:border-border-strong hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                {metric.label}
              </span>
              <div className={`rounded-xl border p-2.5 ${color.bg} ${color.border} ${color.glow}`}>
                <Icon className={`h-4 w-4 ${color.text}`} />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-1 text-3xl font-extrabold text-white tracking-tight">
                {metric.prefix && <span className="text-xl text-slate-400">{metric.prefix}</span>}
                <DecryptedText
                  text={metric.value}
                  speed={35}
                  maxIterations={8}
                  animateOnHover
                  className="text-white"
                />
                {metric.suffix && (
                  <span className="text-xl text-slate-400 font-mono tracking-tight tabular-nums">
                    {metric.suffix}
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate">{metric.subtitle}</span>
                {metric.change && (
                  <span
                    className={`font-mono text-[11px] font-medium tracking-tight tabular-nums ${color.text}`}
                  >
                    {metric.change}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
