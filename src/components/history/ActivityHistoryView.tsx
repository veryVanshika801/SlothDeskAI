import React, { useState } from 'react';
import { ActivityItem } from '../../types';
import { SlothMascot } from '../mascot/SlothMascot';
import { History, CheckCircle2, PlusCircle, Sparkles, RotateCcw, Trash2 } from 'lucide-react';

interface ActivityHistoryViewProps {
  activities: ActivityItem[];
  onClearHistory: () => void;
  onUndoActivity?: (item: ActivityItem) => void;
}

export const ActivityHistoryView: React.FC<ActivityHistoryViewProps> = ({
  activities,
  onClearHistory,
  onUndoActivity,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = activities.filter((act) => {
    if (filterType === 'all') return true;
    if (filterType === 'completed' && act.type === 'task_completed') return true;
    if (filterType === 'created' && act.type === 'task_created') return true;
    if (filterType === 'ai' && act.type.startsWith('ai_')) return true;
    return true;
  });

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-[#39483B]" />;
      case 'task_created':
        return <PlusCircle className="w-4 h-4 text-[#A6AD99]" />;
      case 'ai_organize':
      case 'ai_low_energy':
      case 'ai_breakdown':
      case 'ai_notes':
      case 'ai_quick_capture':
      case 'ai_reschedule':
        return <Sparkles className="w-4 h-4 text-[#C47D61]" />;
      default:
        return <History className="w-4 h-4 text-[#77766E]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#E9E0D2] rounded-2xl p-6 border border-[#A6AD99]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-5">
          <SlothMascot state="idle" size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#77766E]">
                Reflection Log
              </span>
              <span className="text-[#A6AD99]">·</span>
              <span className="text-xs font-medium text-[#39483B]">Activity History</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#22221F] font-semibold mt-1">
              Your Quiet Record of Steady Progress
            </h2>
            <p className="text-sm text-[#77766E] max-w-xl mt-1">
              Every action taken in SlothDesk is logged transparently. Review what you accomplished without gamified pressure or guilt.
            </p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="px-3.5 py-2 rounded-xl text-xs text-[#77766E] hover:text-[#C47D61] hover:bg-[#F5F0E7] transition-colors shrink-0"
        >
          Clear History
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-[#E9E0D2] rounded-xl border border-[#A6AD99]/30 text-xs">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'completed', label: 'Completions' },
            { id: 'created', label: 'Created' },
            { id: 'ai', label: 'AI Transformations' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === f.id
                  ? 'bg-[#39483B] text-[#F5F0E7]'
                  : 'text-[#77766E] hover:text-[#22221F]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-[#77766E] font-mono">{filtered.length} entries</span>
      </div>

      {/* Timeline List */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 border border-[#A6AD99]/30 space-y-4 shadow-xs">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#77766E]">
            No activity matches the current filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3.5 p-3.5 rounded-xl bg-[#F5F0E7]/40 border border-[#A6AD99]/20"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#A6AD99]/30 shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#22221F]">{item.title}</span>
                    <span className="text-[11px] font-mono text-[#77766E] tabular-nums">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{' '}
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {item.details && (
                    <p className="text-xs text-[#77766E]">{item.details}</p>
                  )}
                </div>
              </div>

              {item.undoable && onUndoActivity && (
                <button
                  onClick={() => onUndoActivity(item)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg text-[#39483B] bg-white border border-[#A6AD99]/40 hover:bg-[#E9E0D2] shrink-0"
                  title="Undo this operation"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Undo</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
