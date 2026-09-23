import {
  ArrowUpDown,
  CheckSquare,
  Download,
  FileJson,
  Plus,
  Search,
  Square,
  Trash2,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { apiClient } from '../../../lib/apiClient';
import { formatDate, getCapacityTier } from '../../../lib/utils';
import type { CampusEvent } from '../../../types';
import { useDeleteEvent } from '../api/useDeleteEvent';
import { CreateEventModal } from './CreateEventModal';

export interface EventTableProps {
  events: CampusEvent[];
  isLoading?: boolean;
  error?: Error | null;
}

type SortField = 'title' | 'category' | 'dateTime' | 'capacity' | 'registered';
type SortOrder = 'asc' | 'desc';

export const EventTable: React.FC<EventTableProps> = ({
  events,
  isLoading = false,
  error = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>('dateTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const deleteMutation = useDeleteEvent();

  // Sorting and Filtering
  const processedEvents = useMemo(() => {
    let result = [...events];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'dateTime':
          comparison = new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
          break;
        case 'capacity':
          comparison = (a.maxCapacity || 0) - (b.maxCapacity || 0);
          break;
        case 'registered':
          comparison = a.registeredCount - b.registeredCount;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [events, searchTerm, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === processedEvents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedEvents.map((e) => e.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected events?`)) {
      for (const id of selectedIds) {
        await deleteMutation.mutateAsync(id);
      }
      setSelectedIds([]);
    }
  };

  const handleDeleteSingle = async (id: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteMutation.mutateAsync(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const exportCsv = () => {
    const csvData = apiClient.exportCsv(processedEvents);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `campus-events-roster-${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJson = () => {
    const jsonData = apiClient.exportJson(processedEvents);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `campus-events-roster-${new Date().toISOString().split('T')[0]}.json`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAllSelected = processedEvents.length > 0 && selectedIds.length === processedEvents.length;

  return (
    <div className="rounded-3xl border border-border-subtle bg-surface-raised/80 backdrop-blur-glass overflow-hidden shadow-2xl">
      {/* Table Action Bar */}
      <div className="flex flex-col gap-4 p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle bg-surface-raised/50">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Event Registry & Operations
          </h3>
          <p className="text-xs text-slate-400">
            High-density event administration, batch roster export, and capacity telemetry
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter roster..."
              className="h-9 pl-9 text-xs rounded-xl border-border-subtle bg-surface-base"
              aria-label="Filter events table"
            />
          </div>

          {/* Bulk Actions if rows selected */}
          {selectedIds.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              title={`Delete ${selectedIds.length} events`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </Button>
          )}

          {/* Export CSV */}
          <Button variant="outline" size="sm" onClick={exportCsv} title="Export as CSV">
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </Button>

          {/* Export JSON */}
          <Button variant="outline" size="sm" onClick={exportJson} title="Export as JSON">
            <FileJson className="h-3.5 w-3.5" />
            <span>JSON</span>
          </Button>

          {/* Create Event Modal */}
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            <span>New Event</span>
          </Button>
        </div>
      </div>

      {/* Responsive Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-surface-base/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-border-subtle">
            <tr>
              <th className="w-12 px-5 py-4">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-slate-400 hover:text-white"
                  aria-label={isAllSelected ? 'Deselect all events' : 'Select all events'}
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-4 w-4 text-brand-primary" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-5 py-4">
                <button
                  type="button"
                  onClick={() => toggleSort('title')}
                  className="inline-flex items-center gap-1.5 hover:text-white"
                >
                  <span>Event</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-5 py-4">
                <button
                  type="button"
                  onClick={() => toggleSort('category')}
                  className="inline-flex items-center gap-1.5 hover:text-white"
                >
                  <span>Category</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-5 py-4">
                <button
                  type="button"
                  onClick={() => toggleSort('dateTime')}
                  className="inline-flex items-center gap-1.5 hover:text-white"
                >
                  <span>Schedule</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-5 py-4">Venue</th>
              <th className="px-5 py-4">
                <button
                  type="button"
                  onClick={() => toggleSort('capacity')}
                  className="inline-flex items-center gap-1.5 hover:text-white"
                >
                  <span>Capacity / Occupancy</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50">
            {isLoading ? (
              ['table-skel-1', 'table-skel-2', 'table-skel-3', 'table-skel-4', 'table-skel-5'].map(
                (key) => (
                  <tr key={key}>
                    <td colSpan={7} className="px-5 py-4">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ),
              )
            ) : processedEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                  {error
                    ? 'Failed to retrieve event registry data. Please retry.'
                    : 'No matching events located in registry.'}
                </td>
              </tr>
            ) : (
              processedEvents.map((event) => {
                const capacity = getCapacityTier(event.registeredCount, event.maxCapacity);
                const isSelected = selectedIds.includes(event.id);

                return (
                  <tr
                    key={event.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-brand-primary/5' : 'hover:bg-surface-overlay/40'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => toggleSelectOne(event.id)}
                        className="text-slate-400 hover:text-white"
                        aria-label={`Select ${event.title}`}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-brand-primary" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="aspect-square h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-surface-base">
                          {event.imageUrl ? (
                            <img
                              src={event.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-mono text-[10px] text-slate-400">
                              CC
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white line-clamp-1">{event.title}</div>
                          <div className="font-mono text-xs text-slate-400 tracking-tight tabular-nums">
                            ID: #{event.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Badge variant={event.category}>{event.category}</Badge>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-slate-300 tracking-tight tabular-nums whitespace-nowrap">
                      {formatDate(event.dateTime)}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-300 truncate max-w-[160px]">
                      {event.venue}
                    </td>

                    <td className="px-5 py-4">
                      <div className="w-36 space-y-1">
                        <div className="flex items-center justify-between font-mono text-xs tracking-tight tabular-nums">
                          <span className="font-bold text-white">{event.registeredCount}</span>
                          <span className="text-slate-400">/ {event.maxCapacity ?? '∞'}</span>
                          <span className="text-[10px] text-slate-400">({capacity.percent}%)</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-base border border-border-subtle">
                          <div
                            className={`h-full transition-all duration-300 ${capacity.barColor}`}
                            style={{ width: `${capacity.percent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteSingle(event.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-status-danger/10 hover:text-status-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger"
                        title="Delete Event"
                        aria-label={`Delete event ${event.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog for Event Creation */}
      <CreateEventModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};
