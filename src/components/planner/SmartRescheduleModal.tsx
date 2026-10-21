import React, { useState } from 'react';
import { Task, TimeBlock, ReschedulePlan } from '../../types';
import { requestSmartReschedule } from '../../services/aiService';
import { SlothMascot } from '../mascot/SlothMascot';
import { X, Sparkles, Check, Clock, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';

interface SmartRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  openTasks: Task[];
  onApplySchedule: (newBlocks: TimeBlock[]) => void;
}

export const SmartRescheduleModal: React.FC<SmartRescheduleModalProps> = ({
  isOpen,
  onClose,
  openTasks,
  onApplySchedule,
}) => {
  const [remainingMinutes, setRemainingMinutes] = useState(90);
  const [isLoading, setIsLoading] = useState(false);
  const [rescheduleResult, setRescheduleResult] = useState<ReschedulePlan | null>(null);
  const [sourceStatus, setSourceStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateReschedule = async () => {
    setIsLoading(true);
    try {
      const res = await requestSmartReschedule(openTasks, remainingMinutes);
      setRescheduleResult(res.reschedule);
      setSourceStatus(res.source);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!rescheduleResult) return;
    onApplySchedule(rescheduleResult.adjustedBlocks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F5F0E7] rounded-3xl max-w-xl w-full border border-[#A6AD99] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-[#E9E0D2] border-b border-[#A6AD99]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#39483B] text-[#F5F0E7] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#22221F]">
                Smart Reschedule & Downshift
              </h3>
              <p className="text-xs text-[#77766E]">
                Recover gently when meetings run long or energy drops.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#77766E] hover:text-[#22221F] hover:bg-[#F5F0E7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!rescheduleResult ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-[#A6AD99]/30 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#77766E]">
                  Remaining Focus Time Today: <span className="text-[#39483B] font-bold">{remainingMinutes} mins</span>
                </label>
                <input
                  type="range"
                  min={30}
                  max={240}
                  step={15}
                  value={remainingMinutes}
                  onChange={(e) => setRemainingMinutes(Number(e.target.value))}
                  className="w-full accent-[#39483B] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#77766E]">
                  <span>30 mins</span>
                  <span>90 mins</span>
                  <span>3 hours</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#E3E8DD]/60 border border-[#A6AD99]/30 text-xs text-[#22221F] space-y-1">
                <span className="font-semibold text-[#39483B]">SlothDesk Rescheduling Principle:</span>
                <p className="text-[#77766E]">
                  Instead of rushing through 5 tasks poorly, we prioritize the 1 most impactful outcome and explicitly postpone the rest until tomorrow with zero guilt.
                </p>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={handleGenerateReschedule}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isLoading ? 'Recalibrating Schedule...' : 'Propose Adjusted Schedule'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="border-b border-[#A6AD99]/20 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C47D61]">
                  Guilt-Free Recovery Plan
                </span>
                <h4 className="font-serif text-xl font-bold text-[#22221F] mt-1">
                  {rescheduleResult.headline}
                </h4>
                <p className="text-xs text-[#77766E] mt-1.5 italic bg-white p-3 rounded-xl border border-[#A6AD99]/30">
                  "{rescheduleResult.explanation}"
                </p>
              </div>

              {/* Proposed Adjusted Blocks */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#39483B]">
                  Proposed Blocks for Today
                </span>
                {rescheduleResult.adjustedBlocks.map((block) => (
                  <div
                    key={block.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      block.isBreak ? 'bg-[#E3E8DD]/60 border-[#A6AD99]/40' : 'bg-white border-[#A6AD99]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[#39483B] font-semibold">
                        {block.startTime} - {block.endTime}
                      </span>
                      <span className="font-medium text-[#22221F]">{block.title}</span>
                    </div>
                    <span className="text-[11px] text-[#77766E]">
                      {block.isBreak ? 'Mindful break' : 'Single focus'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Deferred Tasks Without Guilt */}
              {rescheduleResult.deferredTasks.length > 0 && (
                <div className="p-3.5 rounded-xl bg-white border border-[#A6AD99]/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#77766E]">
                    <ShieldCheck className="w-4 h-4 text-[#39483B]" />
                    <span>Safely Deferred to Tomorrow (No Guilt)</span>
                  </div>
                  <ul className="text-xs text-[#77766E] list-disc list-inside space-y-0.5">
                    {rescheduleResult.deferredTasks.map((t, idx) => (
                      <li key={idx} className="line-through opacity-70">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {rescheduleResult && (
          <div className="p-4 bg-[#E9E0D2] border-t border-[#A6AD99]/30 flex items-center justify-between">
            <button
              onClick={() => setRescheduleResult(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#77766E] hover:text-[#22221F]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Adjust Time</span>
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply to Today's Planner</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
