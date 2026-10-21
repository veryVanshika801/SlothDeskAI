import React, { useState, useEffect } from 'react';
import { Task, FocusSession, WeeklyReflectionData, Priority } from '../../types';
import { requestWeeklyReflection } from '../../services/aiService';
import {
  loadWeeklyReflections,
  saveWeeklyReflections,
} from '../../utils/storage';
import { SlothMascot } from '../mascot/SlothMascot';
import {
  CalendarDays,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Plus,
  Save,
  Trash2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Coffee,
  RotateCcw,
} from 'lucide-react';

interface WeeklyReflectionViewProps {
  tasks: Task[];
  focusSessions: FocusSession[];
  onAddTasks: (newTasks: Task[]) => void;
}

// Helpers for ISO Week Calculation
function getWeekRange(offsetWeeks = 0): { start: Date; end: Date; weekLabel: string; key: string } {
  const now = new Date();
  const currentDay = now.getDay();
  // Monday is 1, Sunday is 0
  const distanceToMonday = (currentDay + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const key = monday.toISOString().slice(0, 10);
  const weekLabel = `${monday.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })} – ${sunday.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  return { start: monday, end: sunday, weekLabel, key };
}

export const WeeklyReflectionView: React.FC<WeeklyReflectionViewProps> = ({
  tasks,
  focusSessions,
  onAddTasks,
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [reflections, setReflections] = useState<WeeklyReflectionData[]>(() =>
    loadWeeklyReflections()
  );
  const [userNote, setUserNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [variationIndex, setVariationIndex] = useState(0);
  const [sourceStatus, setSourceStatus] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { start, end, weekLabel, key } = getWeekRange(weekOffset);

  // Sync reflections to storage
  useEffect(() => {
    saveWeeklyReflections(reflections);
  }, [reflections]);

  // Load existing reflection for this week
  const currentReflection = reflections.find((r) => r.weekStart === key);

  useEffect(() => {
    if (currentReflection) {
      setUserNote(currentReflection.userReflectionText || '');
    } else {
      setUserNote('');
    }
  }, [key, currentReflection]);

  // Filter tasks completed during this week range
  const completedInWeek = tasks.filter((t) => {
    if (!t.completed || !t.completedAt) return false;
    const date = new Date(t.completedAt);
    return date >= start && date <= end;
  });

  const pendingTasks = tasks.filter((t) => !t.completed);

  // Filter focus sessions in this week range
  const sessionsInWeek = focusSessions.filter((s) => {
    const date = new Date(s.completedAt);
    return date >= start && date <= end;
  });

  const totalFocusMinutesInWeek = sessionsInWeek.reduce(
    (acc, s) => acc + (s.durationMinutes || 0),
    0
  );

  const handleSaveUserNote = () => {
    const updated: WeeklyReflectionData = {
      id: currentReflection?.id || `ref-${key}`,
      weekStart: key,
      weekEnd: end.toISOString().slice(0, 10),
      completedTasksCount: completedInWeek.length,
      pendingTasksCount: pendingTasks.length,
      totalFocusMinutes: totalFocusMinutesInWeek,
      focusSessionsCount: sessionsInWeek.length,
      smallWins: currentReflection?.smallWins || [
        `Finished ${completedInWeek.length} thoughtful outcomes.`,
        `Logged ${totalFocusMinutesInWeek} minutes of mindful focus.`,
      ],
      userReflectionText: userNote,
      aiReflectionSummary: currentReflection?.aiReflectionSummary,
      suggestedNextWeekFocus: currentReflection?.suggestedNextWeekFocus,
      updatedAt: new Date().toISOString(),
    };

    setReflections((prev) => {
      const filtered = prev.filter((r) => r.weekStart !== key);
      return [updated, ...filtered];
    });

    setStatusMessage('Reflection saved to your journal.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleGenerateAIReflection = async (variation = 0) => {
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const res = await requestWeeklyReflection(
        completedInWeek,
        pendingTasks,
        totalFocusMinutesInWeek,
        userNote,
        variation
      );

      const updated: WeeklyReflectionData = {
        id: currentReflection?.id || `ref-${key}`,
        weekStart: key,
        weekEnd: end.toISOString().slice(0, 10),
        completedTasksCount: completedInWeek.length,
        pendingTasksCount: pendingTasks.length,
        totalFocusMinutes: totalFocusMinutesInWeek,
        focusSessionsCount: sessionsInWeek.length,
        smallWins: res.reflection.smallWins,
        userReflectionText: userNote,
        aiReflectionSummary: res.reflection.aiReflectionSummary,
        suggestedNextWeekFocus: res.reflection.suggestedNextWeekFocus,
        updatedAt: new Date().toISOString(),
      };

      setReflections((prev) => {
        const filtered = prev.filter((r) => r.weekStart !== key);
        return [updated, ...filtered];
      });

      setSourceStatus(res.source);
      setVariationIndex(variation);
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Reflection generation issue; basic statistics remain accurate.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptSuggestedFocus = () => {
    if (!currentReflection?.suggestedNextWeekFocus) return;
    const newTasks: Task[] = currentReflection.suggestedNextWeekFocus.map((focusText, idx) => ({
      id: `task-nextweek-${Date.now()}-${idx}`,
      title: focusText,
      priority: idx === 0 ? 'high' : 'medium',
      completed: false,
      estimatedMinutes: 25,
      category: 'Weekly Plan',
      tags: ['Next Week', 'Reflection'],
      createdAt: new Date().toISOString(),
      energyLevel: 'normal',
    }));

    onAddTasks(newTasks);
    setStatusMessage(`Added ${newTasks.length} suggested focus intentions to your tasks!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeleteReflection = () => {
    setReflections((prev) => prev.filter((r) => r.weekStart !== key));
    setUserNote('');
    setStatusMessage('Reflection reset.');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner with Week Navigation */}
      <div className="bg-[#E9E0D2] rounded-3xl p-6 md:p-8 border border-[#A6AD99]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-5">
          <SlothMascot state="encouragement" size="lg" />
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#77766E]">
              Gentle Retrospective
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#22221F]">
              Weekly Sloth Reflection
            </h1>
            <p className="text-xs text-[#77766E] max-w-md">
              A gentle look back at real work and honest rest. No punishing streaks, no fabricated scores.
            </p>
          </div>
        </div>

        {/* Week Selector */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-[#A6AD99]/30 shadow-xs">
          <button
            onClick={() => setWeekOffset((prev) => prev - 1)}
            aria-label="Previous week"
            className="p-1.5 rounded-lg text-[#77766E] hover:text-[#22221F] hover:bg-[#F5F0E7] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center min-w-[170px]">
            <div className="text-xs font-semibold text-[#22221F]">
              {weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : `${Math.abs(weekOffset)} Weeks Ago`}
            </div>
            <div className="text-[11px] text-[#77766E]">{weekLabel}</div>
          </div>

          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            disabled={weekOffset >= 0}
            aria-label="Next week"
            className="p-1.5 rounded-lg text-[#77766E] hover:text-[#22221F] hover:bg-[#F5F0E7] disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-2xl bg-[#E3E8DD] text-[#39483B] text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{statusMessage}</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}

      {/* Calculated Real Data Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#A6AD99]/30 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#77766E] block">
            Completed in Week
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-[#39483B] tabular-nums">
              {completedInWeek.length}
            </span>
            <span className="text-xs text-[#77766E]">tasks finished</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#A6AD99]/30 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#77766E] block">
            Focus Sessions
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-[#39483B] tabular-nums">
              {sessionsInWeek.length}
            </span>
            <span className="text-xs text-[#77766E]">sessions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#A6AD99]/30 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#77766E] block">
            Focused Duration
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-[#22221F] tabular-nums">
              {totalFocusMinutesInWeek}
            </span>
            <span className="text-xs text-[#77766E]">mins logged</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#A6AD99]/30 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#77766E] block">
            Open / Rescheduled
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-[#C47D61] tabular-nums">
              {pendingTasks.length}
            </span>
            <span className="text-xs text-[#77766E]">deferred without guilt</span>
          </div>
        </div>
      </div>

      {/* AI Gentle Reflection Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#A6AD99]/30 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#A6AD99]/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E3E8DD] text-[#39483B] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#22221F]">
                Sloth Weekly Retrospective
              </h3>
              <p className="text-xs text-[#77766E]">
                Encouraging summary grounded in your real recorded data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sourceStatus && (
              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                  sourceStatus === 'live_ai'
                    ? 'bg-[#E3E8DD] text-[#39483B]'
                    : 'bg-[#E9E0D2] text-[#77766E]'
                }`}
              >
                {sourceStatus === 'live_ai' ? 'Live AI Analysis' : 'Local Heuristic Analysis'}
              </span>
            )}
            <button
              onClick={() => handleGenerateAIReflection(variationIndex + 1)}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-[#39483B] text-white text-xs font-semibold hover:bg-[#2c392e] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{currentReflection?.aiReflectionSummary ? 'Regenerate' : 'Generate Reflection'}</span>
            </button>
          </div>
        </div>

        {currentReflection?.aiReflectionSummary ? (
          <div className="space-y-4">
            <p className="text-xs md:text-sm text-[#22221F] leading-relaxed italic bg-[#F5F0E7]/60 p-4 rounded-2xl border border-[#A6AD99]/20">
              "{currentReflection.aiReflectionSummary}"
            </p>

            {/* Small Wins */}
            {currentReflection.smallWins && currentReflection.smallWins.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#39483B] block">
                  Small Wins & Meaningful Progress
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentReflection.smallWins.map((win, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#E3E8DD]/60 border border-[#A6AD99]/20 text-xs text-[#22221F] flex items-center gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#39483B] shrink-0" />
                      <span>{win}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Focus for Coming Week */}
            {currentReflection.suggestedNextWeekFocus &&
              currentReflection.suggestedNextWeekFocus.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#E9E0D2]/50 border border-[#A6AD99]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#39483B] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Suggested Gentle Focus for Coming Week</span>
                    </span>
                    <button
                      onClick={handleAcceptSuggestedFocus}
                      className="px-3 py-1.5 rounded-lg bg-[#39483B] text-white text-[11px] font-semibold hover:bg-[#2c392e] transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add as Next Week's Tasks</span>
                    </button>
                  </div>

                  <ul className="space-y-1.5 text-xs text-[#22221F]">
                    {currentReflection.suggestedNextWeekFocus.map((focusItem, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#39483B] mt-1.5 shrink-0" />
                        <span>{focusItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <Coffee className="w-8 h-8 text-[#A6AD99] mx-auto" />
            <h4 className="text-sm font-semibold text-[#22221F]">
              Ready for your weekly check-in?
            </h4>
            <p className="text-xs text-[#77766E] max-w-sm mx-auto">
              Click the button above to generate a gentle review of your week's accomplishments and suggested next steps.
            </p>
          </div>
        )}
      </div>

      {/* User's Personal Weekly Journal Note */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#A6AD99]/30 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#22221F]">
              Personal Weekly Journal
            </h3>
            <p className="text-xs text-[#77766E]">
              What did you learn? Where did you honor your energy? (Optional & private)
            </p>
          </div>
          {currentReflection && (
            <button
              onClick={handleDeleteReflection}
              className="p-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-medium flex items-center gap-1"
              title="Reset this week's reflection"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <textarea
          rows={4}
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder="Jot down any thoughts about your pacing, what worked, or what felt heavy this week..."
          className="w-full p-4 rounded-2xl border border-[#A6AD99]/40 bg-[#F5F0E7]/40 text-xs text-[#22221F] placeholder:text-[#A6AD99] focus:outline-none focus:ring-2 focus:ring-[#39483B] leading-relaxed resize-none"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSaveUserNote}
            className="px-5 py-2.5 rounded-xl bg-[#39483B] text-white text-xs font-semibold hover:bg-[#2c392e] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Reflection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
