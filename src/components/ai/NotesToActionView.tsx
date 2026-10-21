import React, { useState } from 'react';
import { Task, NoteAnalysisResult, Priority } from '../../types';
import { convertNotesToActions } from '../../services/aiService';
import { SlothMascot } from '../mascot/SlothMascot';
import { Sparkles, Check, Plus, Calendar, HelpCircle, FileText, ArrowRight } from 'lucide-react';

interface NotesToActionViewProps {
  onAddTasks: (newTasks: Task[]) => void;
  onOpenTaskTab: () => void;
}

export const NotesToActionView: React.FC<NotesToActionViewProps> = ({
  onAddTasks,
  onOpenTaskTab,
}) => {
  const [notes, setNotes] = useState(
    `Project Sync with Sarah - Oct 21
Discussed the new design system rollout. The warm ivory palette feels much calmer.
Key decisions:
- Finalize the typography tokens by Friday.
- Need to check if the mobile menu works properly on iPhone screens.
- Open question: Are we including calendar sync in phase 1 or postponing to phase 2?
Sarah mentioned we should send the updated demo link to the client by next Monday.`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<NoteAnalysisResult | null>(null);
  const [sourceStatus, setSourceStatus] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<Record<number, boolean>>({});
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAnalyze = async () => {
    if (!notes.trim()) return;
    setIsLoading(true);
    setAddedSuccess(false);
    try {
      const res = await convertNotesToActions(notes);
      setAnalysis(res.analysis);
      setSourceStatus(res.source);
      // Select all actions by default
      const initialMap: Record<number, boolean> = {};
      res.analysis.extractedActions.forEach((_, i) => {
        initialMap[i] = true;
      });
      setSelectedActions(initialMap);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAction = (idx: number) => {
    setSelectedActions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleConvertSelected = () => {
    if (!analysis) return;
    const actionsToConvert = analysis.extractedActions.filter((_, i) => selectedActions[i]);
    if (actionsToConvert.length === 0) return;

    const newTasks: Task[] = actionsToConvert.map((a) => ({
      id: `task-note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: a.title,
      description: `Extracted from note summary. Mentioned timeline: ${a.explicitDateMentioned || 'Flexible'}`,
      priority: a.priority,
      completed: false,
      estimatedMinutes: a.estimatedMinutes,
      tags: ['Notes', 'Extracted'],
      createdAt: new Date().toISOString(),
      energyLevel: a.priority === 'high' ? 'high' : 'normal',
    }));

    onAddTasks(newTasks);
    setAddedSuccess(true);
    setTimeout(() => onOpenTaskTab(), 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#E9E0D2] rounded-2xl p-6 border border-[#A6AD99]/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <SlothMascot state={isLoading ? 'thinking' : 'idle'} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#77766E]">
                Distillation Engine
              </span>
              <span className="text-[#A6AD99]">·</span>
              <span className="text-xs font-medium text-[#39483B]">Note-to-Action Converter</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#22221F] font-semibold mt-1">
              Extract Actionable Clarity from Walls of Text
            </h2>
            <p className="text-sm text-[#77766E] max-w-xl mt-1">
              Paste meeting recaps, lectures, or reading notes. The sloth isolates commitments, dates explicitly stated, open questions, and concrete tasks.
            </p>
          </div>
        </div>

        {sourceStatus && (
          <div className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-[#F5F0E7] text-[#39483B] border border-[#A6AD99]/40 shrink-0">
            Engine: {sourceStatus === 'live_ai' ? 'Live Gemini / Gemma' : 'Deterministic Mode'}
          </div>
        )}
      </div>

      {/* Input Notes Area */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#A6AD99]/30 space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#77766E]">
          Raw Notes / Meeting Transcript
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste meeting text or lecture notes here..."
          rows={6}
          className="w-full p-4 rounded-xl bg-[#F5F0E7]/60 border border-[#A6AD99]/40 text-sm text-[#22221F] focus:outline-none focus:ring-2 focus:ring-[#39483B]/30 resize-none font-sans"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-[#77766E]">
            Honest extraction: Explicit source dates are distinguished from assumptions.
          </span>
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !notes.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] disabled:opacity-50 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isLoading ? 'Distilling Insights...' : 'Distill Notes'}
          </button>
        </div>
      </div>

      {/* Analysis Output */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary & Key Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#A6AD99]/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#39483B]">
                <FileText className="w-4 h-4" />
                <span>Concise Executive Summary</span>
              </div>
              <p className="text-sm text-[#22221F] leading-relaxed">
                {analysis.conciseSummary}
              </p>
            </div>

            <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#A6AD99]/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#39483B]">
                <Sparkles className="w-4 h-4" />
                <span>Key Takeaways</span>
              </div>
              <ul className="text-xs text-[#22221F] space-y-2">
                {analysis.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#39483B] font-bold">·</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Items to Convert */}
          <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 border border-[#A6AD99]/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#A6AD99]/20 pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#39483B]">
                  Extracted Action Items
                </span>
                <h3 className="text-lg font-serif font-bold text-[#22221F]">
                  Convert to Tasks ({Object.values(selectedActions).filter(Boolean).length} selected)
                </h3>
              </div>
              <span className="text-xs text-[#77766E]">Click to toggle inclusion</span>
            </div>

            <div className="space-y-3">
              {analysis.extractedActions.map((action, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleAction(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    selectedActions[idx]
                      ? 'bg-[#E3E8DD]/40 border-[#39483B]/40 shadow-xs'
                      : 'bg-[#F5F0E7]/40 border-[#A6AD99]/30 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!selectedActions[idx]}
                    onChange={() => {}} // handled by parent onClick
                    className="mt-0.5 w-4 h-4 rounded text-[#39483B] focus:ring-[#39483B]"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="text-sm font-medium text-[#22221F]">{action.title}</div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#77766E]">
                      <span className="capitalize font-semibold text-[#39483B]">
                        {action.priority} Priority
                      </span>
                      <span>·</span>
                      <span>~{action.estimatedMinutes} mins</span>
                      {action.explicitDateMentioned && (
                        <>
                          <span>·</span>
                          <span className="text-[#C47D61] font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Date: {action.explicitDateMentioned}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-xs text-[#77766E]">
                Extracted items will be injected directly into your active task list.
              </span>
              <button
                onClick={handleConvertSelected}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                {addedSuccess ? 'Converted & Saved!' : 'Convert Selected to Tasks'}
              </button>
            </div>
          </div>

          {/* Dates & Open Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.explicitDates.length > 0 && (
              <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#A6AD99]/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#77766E]">
                  <Calendar className="w-4 h-4 text-[#39483B]" />
                  <span>Explicit Dates Found</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {analysis.explicitDates.map((date, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-[#F5F0E7] text-xs text-[#22221F] border border-[#A6AD99]/30"
                    >
                      {date}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.openQuestionsOrAmbiguities.length > 0 && (
              <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#A6AD99]/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#77766E]">
                  <HelpCircle className="w-4 h-4 text-[#C47D61]" />
                  <span>Open Questions & Ambiguities</span>
                </div>
                <ul className="text-xs text-[#77766E] space-y-1 list-disc list-inside pt-1">
                  {analysis.openQuestionsOrAmbiguities.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
