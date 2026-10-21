import React, { useState } from 'react';
import { Task, TimeBlock, EnergyLevel } from '../../types';
import { generateSlowSchedule } from '../../services/aiService';
import { SlothMascot } from '../mascot/SlothMascot';
import { Sparkles, Plus, Trash2, Clock, Calendar, Coffee, MoveUp, MoveDown, Check } from 'lucide-react';

interface SlowPlannerViewProps {
  tasks: Task[];
  initialBlocks: TimeBlock[];
  onSaveSchedule: (blocks: TimeBlock[]) => void;
}

export const SlowPlannerView: React.FC<SlowPlannerViewProps> = ({
  tasks,
  initialBlocks,
  onSaveSchedule,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [availableHours, setAvailableHours] = useState<number>(4);
  const [blocks, setBlocks] = useState<TimeBlock[]>(initialBlocks);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceStatus, setSourceStatus] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New block form
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('11:45');
  const [newEnd, setNewEnd] = useState('12:15');
  const [newIsBreak, setNewIsBreak] = useState(false);

  const handleGenerateAI = async () => {
    setIsLoading(true);
    setSaveSuccess(false);
    try {
      const res = await generateSlowSchedule(tasks, availableHours);
      setBlocks(res.schedule);
      setSourceStatus(res.source);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newBlock: TimeBlock = {
      id: `block-${Date.now()}`,
      startTime: newStart,
      endTime: newEnd,
      title: newTitle.trim(),
      isBreak: newIsBreak,
      energyLevel: newIsBreak ? 'low' : 'normal',
    };

    setBlocks((prev) => [...prev, newBlock]);
    setNewTitle('');
    setSaveSuccess(false);
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSaveSuccess(false);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBlocks(updated);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    onSaveSchedule(blocks);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#E9E0D2] rounded-2xl p-6 border border-[#A6AD99]/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <SlothMascot state="idle" size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#77766E]">
                Unhurried Rhythm
              </span>
              <span className="text-[#A6AD99]">·</span>
              <span className="text-xs font-medium text-[#39483B]">The Slow Planner</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#22221F] font-semibold mt-1">
              Time Blocking for Humans, Not Robots
            </h2>
            <p className="text-sm text-[#77766E] max-w-xl mt-1">
              Never cram back-to-back 60-minute blocks without oxygen. Balance real focus sessions with deliberate breathing room and slow mindful pauses.
            </p>
          </div>
        </div>

        {sourceStatus && (
          <div className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-[#F5F0E7] text-[#39483B] border border-[#A6AD99]/40 shrink-0">
            Engine: {sourceStatus === 'live_ai' ? 'Live Gemini / Gemma' : 'Deterministic Mode'}
          </div>
        )}
      </div>

      {/* Control Bar: Date & Hours */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#A6AD99]/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#22221F]">
            <Calendar className="w-4 h-4 text-[#39483B]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#F5F0E7] border border-[#A6AD99]/40 text-xs text-[#22221F] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-[#77766E]">
            <Clock className="w-4 h-4 text-[#39483B]" />
            <span>Available Window:</span>
            <select
              value={availableHours}
              onChange={(e) => setAvailableHours(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg bg-[#F5F0E7] border border-[#A6AD99]/40 text-xs text-[#22221F] focus:outline-none"
            >
              <option value={2}>2 Hours</option>
              <option value={3}>3 Hours</option>
              <option value={4}>4 Hours (Recommended)</option>
              <option value={6}>6 Hours</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateAI}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] disabled:opacity-50 transition-colors shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isLoading ? 'Composing Calm Flow...' : 'Suggest Schedule with AI'}
        </button>
      </div>

      {/* Schedule Timeline Blocks */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 border border-[#A6AD99]/30 space-y-4">
        <div className="flex items-center justify-between border-b border-[#A6AD99]/20 pb-3">
          <h3 className="text-base font-serif font-bold text-[#22221F]">
            Timeline Blocks ({blocks.length})
          </h3>
          <span className="text-xs text-[#77766E]">
            Green bars indicate mindful buffer & break zones
          </span>
        </div>

        <div className="space-y-3">
          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                block.isBreak
                  ? 'bg-[#E3E8DD]/60 border-[#A6AD99]/40'
                  : 'bg-[#F5F0E7]/40 border-[#A6AD99]/30'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1">
                <div className="flex flex-col items-center justify-center min-w-[80px] p-2 rounded-lg bg-[#FFFFFF] border border-[#A6AD99]/30 font-mono text-xs text-[#39483B] font-semibold tabular-nums">
                  <span>{block.startTime}</span>
                  <span className="text-[10px] text-[#77766E] font-sans font-normal">to</span>
                  <span>{block.endTime}</span>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {block.isBreak && <Coffee className="w-3.5 h-3.5 text-[#39483B]" />}
                    <span className="text-sm font-medium text-[#22221F]">{block.title}</span>
                  </div>
                  <div className="text-xs text-[#77766E]">
                    {block.isBreak ? 'Mindful Recovery' : 'Focused Deep Flow'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center">
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded text-[#77766E] hover:text-[#22221F] hover:bg-[#E9E0D2] disabled:opacity-30"
                  title="Move block up"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === blocks.length - 1}
                  className="p-1.5 rounded text-[#77766E] hover:text-[#22221F] hover:bg-[#E9E0D2] disabled:opacity-30"
                  title="Move block down"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteBlock(block.id)}
                  className="p-1.5 rounded text-[#77766E] hover:text-[#C47D61] hover:bg-[#E9E0D2]"
                  title="Remove block"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add custom block row */}
        <form
          onSubmit={handleAddBlock}
          className="pt-4 border-t border-[#A6AD99]/20 flex flex-wrap items-center gap-3 text-xs"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new custom task or mindful pause..."
            className="flex-1 min-w-[200px] p-2.5 rounded-xl bg-[#F5F0E7]/60 border border-[#A6AD99]/40 text-xs text-[#22221F] focus:outline-none"
          />
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="w-16 p-2 rounded-lg bg-[#F5F0E7]/60 border border-[#A6AD99]/40 text-xs font-mono text-center"
            />
            <span className="text-[#77766E]">-</span>
            <input
              type="text"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="w-16 p-2 rounded-lg bg-[#F5F0E7]/60 border border-[#A6AD99]/40 text-xs font-mono text-center"
            />
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#77766E]">
            <input
              type="checkbox"
              checked={newIsBreak}
              onChange={(e) => setNewIsBreak(e.target.checked)}
              className="rounded text-[#39483B] focus:ring-[#39483B]"
            />
            <span>Is Break</span>
          </label>

          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-[#39483B] text-[#F5F0E7] font-medium hover:bg-[#2c392e] transition-colors"
          >
            Add Block
          </button>
        </form>

        {/* Footer save */}
        <div className="flex items-center justify-between pt-4 border-t border-[#A6AD99]/20">
          <span className="text-xs text-[#77766E]">
            Changes are saved to your local session plan.
          </span>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] transition-colors shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            {saveSuccess ? 'Schedule Saved!' : 'Save Daily Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};
