import React, { useState } from 'react';
import { Task, RescueUnstuckResult } from '../../types';
import { requestRescueUnstuck } from '../../services/aiService';
import { SlothMascot } from '../mascot/SlothMascot';
import {
  LifeBuoy,
  X,
  Sparkles,
  ArrowRight,
  Play,
  Plus,
  Scissors,
  RotateCcw,
  Edit3,
  CheckCircle2,
  Clock,
  HeartHandshake,
  AlertCircle,
} from 'lucide-react';

interface SlothRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFocus: (taskTitle: string, durationMinutes: number) => void;
  onAddTask: (task: Task) => void;
  onOpenMakeSmaller: (taskTitle: string) => void;
}

const QUICK_CHIPS = [
  { id: 'too_many_tasks', label: 'Too many tasks at once' },
  { id: 'dont_know_where_to_start', label: "Don't know where to start" },
  { id: 'low_energy', label: 'Extremely low energy' },
  { id: 'procrastinating', label: 'Procrastinating / Dread' },
  { id: 'break_down', label: 'Need help breaking something down' },
];

export const SlothRescueModal: React.FC<SlothRescueModalProps> = ({
  isOpen,
  onClose,
  onStartFocus,
  onAddTask,
  onOpenMakeSmaller,
}) => {
  const [situationText, setSituationText] = useState('');
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rescueResult, setRescueResult] = useState<RescueUnstuckResult | null>(null);
  const [sourceStatus, setSourceStatus] = useState<string | null>(null);
  const [variationIndex, setVariationIndex] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectChip = (chip: { id: string; label: string }) => {
    setSelectedChip(chip.id);
    if (!situationText) {
      setSituationText(chip.label);
    } else if (!situationText.includes(chip.label)) {
      setSituationText((prev) => `${prev.trim()}. ${chip.label}`);
    }
  };

  const handleGenerateRescue = async (variation = 0) => {
    const textToSubmit = situationText.trim() || selectedChip || 'Feeling stuck and overwhelmed';
    setIsLoading(true);
    setErrorMessage(null);
    setAddedSuccess(false);

    try {
      const res = await requestRescueUnstuck(textToSubmit, selectedChip || undefined, variation);
      setRescueResult(res.rescue);
      setSourceStatus(res.source);
      setVariationIndex(variation);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to generate rescue suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAnother = () => {
    const nextVar = variationIndex + 1;
    handleGenerateRescue(nextVar);
  };

  const handleMakeSmallerAction = () => {
    if (!rescueResult) return;
    onClose();
    onOpenMakeSmaller(rescueResult.firstAction.title);
  };

  const handleStartFocusAction = () => {
    if (!rescueResult) return;
    onClose();
    onStartFocus(rescueResult.firstAction.title, rescueResult.firstAction.estimatedMinutes || 10);
  };

  const handleAddTaskAction = () => {
    if (!rescueResult) return;
    const newTask: Task = {
      id: `task-rescue-${Date.now()}`,
      title: rescueResult.firstAction.title,
      description: `Sloth Rescue Action: ${rescueResult.firstAction.reason}`,
      priority: 'high',
      completed: false,
      estimatedMinutes: rescueResult.firstAction.estimatedMinutes || 10,
      category: 'Focus',
      tags: ['Rescue', 'Unstuck'],
      suggestedNextAction: rescueResult.firstAction.starterAction,
      createdAt: new Date().toISOString(),
      energyLevel: 'low',
    };
    onAddTask(newTask);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rescue-modal-title"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-[#F5F0E7] rounded-3xl max-w-xl w-full border border-[#A6AD99] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 md:p-6 bg-[#E9E0D2] border-b border-[#A6AD99]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#39483B] text-[#F5F0E7] flex items-center justify-center shadow-xs">
              <LifeBuoy className="w-5 h-5 text-[#E3E8DD]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#39483B]">
                  Sloth Rescue Mode
                </span>
                <span className="text-[#A6AD99]">·</span>
                <span className="text-[11px] text-[#77766E]">No Guilt</span>
              </div>
              <h2 id="rescue-modal-title" className="font-serif text-xl font-bold text-[#22221F]">
                Let's get you unstuck.
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Sloth Rescue panel"
            className="p-2 rounded-xl text-[#77766E] hover:text-[#22221F] hover:bg-[#F5F0E7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!rescueResult ? (
            /* Input View */
            <div className="space-y-5">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#A6AD99]/30">
                <SlothMascot state="encouragement" size="sm" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#22221F]">
                    Feeling overwhelmed or frozen?
                  </p>
                  <p className="text-xs text-[#77766E] leading-relaxed">
                    You don't need to finish everything right now. Tell us what feels heavy, and we'll extract just one friction-free move.
                  </p>
                </div>
              </div>

              {/* Quick Choice Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#77766E]">
                  Quick Choices (Click any that apply):
                </label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_CHIPS.map((chip) => {
                    const isSelected = selectedChip === chip.id;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => handleSelectChip(chip)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                          isSelected
                            ? 'bg-[#39483B] text-white border-[#39483B]'
                            : 'bg-white text-[#22221F] border-[#A6AD99]/40 hover:bg-[#E9E0D2]'
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <label
                  htmlFor="situation-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#77766E]"
                >
                  What feels difficult right now?
                </label>
                <textarea
                  id="situation-input"
                  rows={4}
                  value={situationText}
                  onChange={(e) => setSituationText(e.target.value)}
                  placeholder="e.g., I have 10 tabs open, an essay due, dirty laundry, and I feel like lying on the floor..."
                  className="w-full p-4 rounded-2xl border border-[#A6AD99]/50 bg-white text-xs text-[#22221F] placeholder:text-[#A6AD99] focus:outline-none focus:ring-2 focus:ring-[#39483B] leading-relaxed resize-none"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#77766E] italic">
                  Gentle, non-judgmental guidance
                </span>
                <button
                  onClick={() => handleGenerateRescue(0)}
                  disabled={isLoading || (!situationText.trim() && !selectedChip)}
                  className="px-6 py-3 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Thinking gently...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Help Me Unstick</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Rescue Result View */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Acknowledgement Box */}
              <div className="p-4 rounded-2xl bg-white border border-[#A6AD99]/30 flex items-start gap-4">
                <SlothMascot state="encouragement" size="sm" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#39483B]">
                      Sloth Perspective
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        sourceStatus === 'live_ai'
                          ? 'bg-[#E3E8DD] text-[#39483B]'
                          : 'bg-[#E9E0D2] text-[#77766E]'
                      }`}
                    >
                      {sourceStatus === 'live_ai' ? 'Live AI' : 'Offline Guidance'}
                    </span>
                  </div>
                  <p className="text-xs text-[#22221F] leading-relaxed italic">
                    "{rescueResult.acknowledgement}"
                  </p>
                </div>
              </div>

              {/* The One First Action Card */}
              <div className="p-5 rounded-2xl bg-[#E3E8DD] border border-[#39483B]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-[#39483B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#39483B]" />
                    <span>Your Recommended First Move</span>
                  </span>
                  <span className="text-xs font-semibold text-[#39483B] flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{rescueResult.firstAction.estimatedMinutes} mins</span>
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#22221F]">
                  {rescueResult.firstAction.title}
                </h3>

                <p className="text-xs text-[#77766E] leading-relaxed">
                  {rescueResult.firstAction.reason}
                </p>

                {/* 15-second starter hook */}
                <div className="p-3 rounded-xl bg-white/90 border border-[#A6AD99]/30 text-xs text-[#22221F] flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#39483B] shrink-0" />
                  <span>
                    <strong className="text-[#39483B]">10-Second Starter: </strong>
                    {rescueResult.firstAction.starterAction}
                  </span>
                </div>
              </div>

              {/* Follow up steps */}
              {rescueResult.followUpSteps && rescueResult.followUpSteps.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-[#A6AD99]/30 space-y-2 text-xs">
                  <span className="font-semibold text-[#77766E] uppercase tracking-wider text-[10px]">
                    Optional Next Steps (Only when ready):
                  </span>
                  <div className="space-y-1.5">
                    {rescueResult.followUpSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[#22221F]">
                        <span className="w-4 h-4 rounded-full bg-[#E9E0D2] text-[#39483B] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons Cluster */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleStartFocusAction}
                    className="px-4 py-2.5 rounded-xl bg-[#39483B] text-white text-xs font-semibold hover:bg-[#2c392e] transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start This Task (~{rescueResult.firstAction.estimatedMinutes}m)</span>
                  </button>

                  <button
                    onClick={handleAddTaskAction}
                    className="px-4 py-2.5 rounded-xl bg-white text-[#22221F] border border-[#A6AD99]/40 text-xs font-semibold hover:bg-[#F5F0E7] transition-colors flex items-center justify-center gap-2"
                  >
                    {addedSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#39483B]" />
                        <span className="text-[#39483B]">Added to My Tasks!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to My Tasks</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#A6AD99]/20 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMakeSmallerAction}
                      className="px-3 py-1.5 rounded-lg text-[#39483B] hover:bg-[#E9E0D2] font-semibold flex items-center gap-1.5"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Make It Smaller</span>
                    </button>
                    <button
                      onClick={handleTryAnother}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-lg text-[#77766E] hover:text-[#22221F] hover:bg-[#E9E0D2] font-medium flex items-center gap-1.5"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>Try another suggestion</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setRescueResult(null)}
                    className="px-3 py-1.5 rounded-lg text-[#77766E] hover:text-[#22221F] hover:bg-[#E9E0D2] font-medium flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit my input</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
