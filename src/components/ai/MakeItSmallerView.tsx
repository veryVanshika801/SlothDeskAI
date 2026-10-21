import React, { useState } from 'react';
import { Task, Subtask } from '../../types';
import { breakdownTaskIntoSteps } from '../../services/aiService';
import { SlothMascot } from '../mascot/SlothMascot';
import { Sparkles, Check, Plus, Clock, Scissors, RotateCcw } from 'lucide-react';

interface MakeItSmallerViewProps {
  tasks: Task[];
  onAddSubtasks: (taskId: string, subtasks: Subtask[]) => void;
  onOpenTaskTab: () => void;
}

export const MakeItSmallerView: React.FC<MakeItSmallerViewProps> = ({
  tasks,
  onAddSubtasks,
  onOpenTaskTab,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    tasks[0]?.id || 'custom'
  );
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<Subtask[]>([]);
  const [sourceStatus, setSourceStatus] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const activeTask = tasks.find((t) => t.id === selectedTaskId);
  const taskTitleToBreak =
    selectedTaskId === 'custom' ? customTitle : activeTask?.title || '';
  const taskDescToBreak =
    selectedTaskId === 'custom' ? customDesc : activeTask?.description || '';

  const handleBreakdown = async () => {
    if (!taskTitleToBreak.trim()) return;
    setIsLoading(true);
    setApplied(false);
    try {
      const res = await breakdownTaskIntoSteps(taskTitleToBreak, taskDescToBreak);
      setSteps(res.steps);
      setSourceStatus(res.source);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeStepEvenSmaller = (index: number) => {
    const currentStep = steps[index];
    const halfMinutes = Math.max(3, Math.floor((currentStep.estimatedMinutes || 10) / 2));
    const micro1: Subtask = {
      id: `micro-${Date.now()}-1`,
      title: `Set a 5-minute timer and open just the first file for: "${currentStep.title}"`,
      completed: false,
      estimatedMinutes: halfMinutes,
    };
    const micro2: Subtask = {
      id: `micro-${Date.now()}-2`,
      title: `Write down 1 bullet point or note before stopping: "${currentStep.title}"`,
      completed: false,
      estimatedMinutes: halfMinutes,
    };

    const newSteps = [...steps];
    newSteps.splice(index, 1, micro1, micro2);
    setSteps(newSteps);
  };

  const toggleStepComplete = (id: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const updateStepTitle = (id: string, newTitle: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleSaveToTask = () => {
    if (selectedTaskId !== 'custom' && activeTask) {
      onAddSubtasks(activeTask.id, steps);
      setApplied(true);
      setTimeout(() => onOpenTaskTab(), 1200);
    }
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
                AI Deconstructor
              </span>
              <span className="text-[#A6AD99]">·</span>
              <span className="text-xs font-medium text-[#39483B]">Make It Smaller</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#22221F] font-semibold mt-1">
              Shrink Overwhelming Tasks to Tiny Bites
            </h2>
            <p className="text-sm text-[#77766E] max-w-xl mt-1">
              Procrastination is usually just a task that is too vaguely sized. We split intimidating projects into micro-actions so small your brain won't resist starting.
            </p>
          </div>
        </div>

        {sourceStatus && (
          <div className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-[#F5F0E7] text-[#39483B] border border-[#A6AD99]/40 shrink-0">
            Engine: {sourceStatus === 'live_ai' ? 'Live Gemini / Gemma' : 'Deterministic Mode'}
          </div>
        )}
      </div>

      {/* Task Selector / Custom Input */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#A6AD99]/30 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#77766E] mb-2">
            Choose an Existing Task or Enter a New One
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#F5F0E7]/60 border border-[#A6AD99]/40 text-sm text-[#22221F] focus:outline-none focus:ring-2 focus:ring-[#39483B]/30"
          >
            {tasks
              .filter((t) => !t.completed)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.priority.toUpperCase()})
                </option>
              ))}
            <option value="custom">+ Type a custom intimidating task...</option>
          </select>
        </div>

        {selectedTaskId === 'custom' && (
          <div className="space-y-3 pt-2">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Write comprehensive thesis chapter or Clean out whole garage..."
              className="w-full p-3 rounded-xl bg-[#F5F0E7]/60 border border-[#A6AD99]/40 text-sm text-[#22221F] focus:outline-none focus:ring-2 focus:ring-[#39483B]/30"
            />
            <textarea
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              placeholder="Optional notes or context..."
              rows={2}
              className="w-full p-3 rounded-xl bg-[#F5F0E7]/60 border border-[#A6AD99]/40 text-xs text-[#22221F] focus:outline-none focus:ring-2 focus:ring-[#39483B]/30 resize-none"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-[#77766E]">
            Target: Each step will take between 5 to 15 minutes max.
          </span>
          <button
            onClick={handleBreakdown}
            disabled={isLoading || !taskTitleToBreak.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] disabled:opacity-50 transition-colors shadow-sm"
          >
            <Scissors className="w-3.5 h-3.5" />
            {isLoading ? 'Deconstructing...' : 'Make It Smaller'}
          </button>
        </div>
      </div>

      {/* Generated Steps */}
      {steps.length > 0 && (
        <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 border border-[#A6AD99]/30 space-y-6">
          <div className="flex items-center justify-between border-b border-[#A6AD99]/20 pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#39483B]">
                Micro-Action Breakdown
              </span>
              <h3 className="text-lg font-serif font-bold text-[#22221F] mt-0.5">
                "{taskTitleToBreak}"
              </h3>
            </div>
            <button
              onClick={handleBreakdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#77766E] hover:bg-[#E9E0D2] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  step.completed
                    ? 'bg-[#E3E8DD]/40 border-[#A6AD99]/30 opacity-75'
                    : 'bg-[#F5F0E7]/40 border-[#A6AD99]/30'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleStepComplete(step.id)}
                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      step.completed
                        ? 'bg-[#39483B] border-[#39483B] text-white'
                        : 'border-[#A6AD99] bg-white'
                    }`}
                  >
                    {step.completed && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStepTitle(step.id, e.target.value)}
                      className={`w-full text-xs font-medium text-[#22221F] bg-transparent border-b border-transparent hover:border-[#A6AD99] focus:border-[#39483B] focus:outline-none pb-0.5 ${
                        step.completed ? 'line-through text-[#77766E]' : ''
                      }`}
                    />
                    <div className="flex items-center gap-2 text-[11px] text-[#77766E]">
                      <Clock className="w-3 h-3" />
                      <span>~{step.estimatedMinutes} mins</span>
                      <span>·</span>
                      <span>Micro-step #{idx + 1}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleMakeStepEvenSmaller(idx)}
                  title="Break this specific step into two even smaller steps"
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium text-[#39483B] bg-[#E3E8DD] hover:bg-[#d5ded0] transition-colors shrink-0"
                >
                  Make Smaller
                </button>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#77766E]">
              Total time: ~{steps.reduce((acc, s) => acc + (s.estimatedMinutes || 10), 0)} mins across {steps.length} tiny actions.
            </span>

            {selectedTaskId !== 'custom' ? (
              <button
                onClick={handleSaveToTask}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                {applied ? 'Saved to Task!' : 'Attach as Subtasks'}
              </button>
            ) : (
              <button
                onClick={onOpenTaskTab}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] transition-colors"
              >
                <span>View Workspace Tasks</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
