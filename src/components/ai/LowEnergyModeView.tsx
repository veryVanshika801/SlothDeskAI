import React, { useState } from 'react';
import { Task, EnergyLevel, LowEnergyPlan } from '../../types';
import { generateLowEnergyPlan } from '../../services/aiService';
import { SlothMascot } from '../mascot/SlothMascot';
import { Sparkles, Check, Clock, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';

interface LowEnergyModeViewProps {
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onOpenTaskTab: () => void;
}

export const LowEnergyModeView: React.FC<LowEnergyModeViewProps> = ({
  tasks,
  onCompleteTask,
  onOpenTaskTab,
}) => {
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('low');
  const [availableMinutes, setAvailableMinutes] = useState<number>(45);
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<LowEnergyPlan | null>(null);
  const [sourceStatus, setSourceStatus] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setAccepted(false);
    try {
      const res = await generateLowEnergyPlan(tasks, energyLevel, availableMinutes);
      setPlan(res.plan);
      setSourceStatus(res.source);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#E9E0D2] rounded-2xl p-6 border border-[#A6AD99]/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <SlothMascot state="low-energy" size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#77766E]">
                Energy-Adaptive AI
              </span>
              <span className="text-[#A6AD99]">·</span>
              <span className="text-xs font-medium text-[#39483B]">Low-Energy Mode</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#22221F] font-semibold mt-1">
              Work with Your Energy, Not Against It
            </h2>
            <p className="text-sm text-[#77766E] max-w-xl mt-1">
              Low days are a natural human rhythm. Tell the sloth how much gas is in the tank, and receive a guilt-free plan that preserves your sanity.
            </p>
          </div>
        </div>

        {sourceStatus && (
          <div className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-[#F5F0E7] text-[#39483B] border border-[#A6AD99]/40 shrink-0">
            Engine: {sourceStatus === 'live_ai' ? 'Live Gemini / Gemma' : 'Deterministic Mode'}
          </div>
        )}
      </div>

      {/* Energy & Time Selector */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#A6AD99]/30 space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#77766E] mb-3">
            Current Energy Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'low',
                title: 'Low Energy',
                desc: 'Tired, foggy, or overwhelmed. 1 simple thing is enough.',
              },
              {
                id: 'normal',
                title: 'Steady / Normal',
                desc: 'Balanced, steady pace without excessive pressure.',
              },
              {
                id: 'high',
                title: 'High Energy',
                desc: 'Ready for deep focus and clearing bottlenecks.',
              },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setEnergyLevel(option.id as EnergyLevel)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  energyLevel === option.id
                    ? 'bg-[#E3E8DD] border-[#39483B] shadow-xs'
                    : 'bg-[#F5F0E7]/40 border-[#A6AD99]/30 hover:border-[#A6AD99]'
                }`}
              >
                <div className="text-sm font-semibold text-[#22221F]">{option.title}</div>
                <div className="text-xs text-[#77766E] mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#77766E] mb-2">
            Available Focus Time: <span className="text-[#39483B] font-bold">{availableMinutes} minutes</span>
          </label>
          <input
            type="range"
            min={15}
            max={180}
            step={15}
            value={availableMinutes}
            onChange={(e) => setAvailableMinutes(Number(e.target.value))}
            className="w-full accent-[#39483B] cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[#77766E] mt-1">
            <span>15 min (Quick pause)</span>
            <span>45 min</span>
            <span>90 min</span>
            <span>3 hours (Deep session)</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#A6AD99]/20">
          <span className="text-xs text-[#77766E]">
            {tasks.filter((t) => !t.completed).length} open tasks in your active workspace.
          </span>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] disabled:opacity-50 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isLoading ? 'Calibrating Plan...' : 'Generate Low-Energy Plan'}
          </button>
        </div>
      </div>

      {/* Generated Low-Energy Sanctuary Plan */}
      {plan && (
        <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 border border-[#A6AD99]/30 space-y-6">
          <div className="border-b border-[#A6AD99]/20 pb-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#C47D61]">
              Compassionate Curated Plan
            </span>
            <h3 className="text-2xl font-serif font-bold text-[#22221F] mt-1">{plan.headline}</h3>
            <p className="text-sm text-[#77766E] mt-2 leading-relaxed italic bg-[#F5F0E7]/60 p-4 rounded-xl border border-[#A6AD99]/30">
              "{plan.compassionateNote}"
            </p>
          </div>

          {/* Primary Manageable Task */}
          <div className="bg-[#E3E8DD]/60 rounded-xl p-5 border border-[#A6AD99]/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#39483B]">
                Your Sole Priority Right Now
              </span>
              <div className="flex items-center gap-1 text-xs text-[#77766E]">
                <Clock className="w-3.5 h-3.5" />
                <span>~{plan.primaryManageableTask.estimatedMinutes} mins</span>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-[#22221F]">
              {plan.primaryManageableTask.title}
            </h4>
            <p className="text-xs text-[#77766E]">
              {plan.primaryManageableTask.whyThisFirst}
            </p>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-medium text-[#22221F]">Frictionless starting steps:</div>
              {plan.primaryManageableTask.immediateSmallSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#22221F] bg-[#FFFFFF] p-2.5 rounded-lg border border-[#A6AD99]/30">
                  <span className="w-4 h-4 rounded-full bg-[#39483B] text-[#F5F0E7] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => {
                  if (plan.primaryManageableTask.id) {
                    onCompleteTask(plan.primaryManageableTask.id);
                  }
                  setAccepted(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Mark Completed Now
              </button>
            </div>
          </div>

          {/* Optional Gentle Tasks */}
          {plan.optionalGentleTasks.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#77766E] mb-2">
                Optional Gentle Tasks (Only If Capacity Rises)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.optionalGentleTasks.map((t, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#F5F0E7]/60 border border-[#A6AD99]/30 flex items-center justify-between text-xs">
                    <span className="text-[#22221F] font-medium">{t.title}</span>
                    <span className="text-[#77766E]">~{t.estimatedMinutes}m</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explicitly Postpone Without Guilt */}
          {plan.canPostponeWithoutGuilt.length > 0 && (
            <div className="bg-[#F5F0E7]/60 rounded-xl p-4 border border-[#A6AD99]/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#77766E]">
                <ShieldCheck className="w-4 h-4 text-[#39483B]" />
                <span>Explicitly Shelved for Tomorrow (Zero Guilt)</span>
              </div>
              <ul className="text-xs text-[#77766E] space-y-1 list-disc list-inside">
                {plan.canPostponeWithoutGuilt.map((item, idx) => (
                  <li key={idx} className="line-through opacity-80">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleGenerate}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs text-[#77766E] hover:bg-[#E9E0D2] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Adjust & Regenerate
            </button>
            <button
              onClick={onOpenTaskTab}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] transition-colors"
            >
              <span>Follow This Plan in Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
