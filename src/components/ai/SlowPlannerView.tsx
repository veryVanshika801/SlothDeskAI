import React, { useState } from 'react';
import { Task, TimeBlock, EnergyLevel } from '../../types';
import { generateSlowSchedule } from '../../services/aiService';
import { SlothMascot } from '../mascot/SlothMascot';
import { SmartRescheduleModal } from '../planner/SmartRescheduleModal';
import {
  Sparkles,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Coffee,
  MoveUp,
  MoveDown,
  Check,
  AlertTriangle,
  RefreshCw,
  Zap,
  Battery,
  BatteryMedium,
  BatteryFull,
  CheckCircle2,
} from 'lucide-react';

interface SlowPlannerViewProps {
  tasks: Task[];
  initialBlocks: TimeBlock[];
  energyLevel?: EnergyLevel;
  onSaveSchedule: (blocks: TimeBlock[]) => void;
  onUpdateEnergy?: (energy: EnergyLevel) => void;
}

export const SlowPlannerView: React.FC<SlowPlannerViewProps> = ({
  tasks,
  initialBlocks,
  energyLevel = 'normal',
  onSaveSchedule,
  onUpdateEnergy,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [availableHours, setAvailableHours] = useState<number>(4);
  const [currentEnergy, setCurrentEnergy] = useState<EnergyLevel>(energyLevel);
  const [blocks, setBlocks] = useState<TimeBlock[]>(initialBlocks);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceStatus, setSourceStatus] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isOverloaded, setIsOverloaded] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // New block form
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('11:45');
  const [newEnd, setNewEnd] = useState('12:15');
  const [newIsBreak, setNewIsBreak] = useState(false);

  const handleEnergyChange = (newEnergy: EnergyLevel) => {
    setCurrentEnergy(newEnergy);
    if (onUpdateEnergy) onUpdateEnergy(newEnergy);
  };

  const handleGenerateAI = async () => {
    setIsLoading(true);
    setSaveSuccess(false);
    try {
      const res = await generateSlowSchedule(tasks, availableHours, currentEnergy);
      setBlocks(res.schedule);
      setSourceStatus(res.source);
      setIsOverloaded(Boolean(res.isOverloaded));
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
      energyLevel: newIsBreak ? 'low' : currentEnergy,
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
      <div className="bg-[#E9E0D2] rounded-3xl p-6 md:p-8 border border-[#A6AD99]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-5">
          <SlothMascot
            state={currentEnergy === 'low' ? 'low-energy' : 'idle'}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#77766E]">
                Unhurried Rhythm
              </span>
              <span className="text-[#A6AD99]">·</span>
              <span className="text-xs font-medium text-[#39483B]">The Slow Planner</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#22221F] font-bold mt-1">
              Energy-Based Daily Rhythm
            </h1>
            <p className="text-xs text-[#77766E] max-w-xl mt-1 leading-relaxed">
              Never cram back-to-back blocks without oxygen. Pacing adapts directly to whether your energy is Low, Normal, or High today.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setShowRescheduleModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white text-[#39483B] border border-[#A6AD99]/40 text-xs font-semibold hover:bg-[#F5F0E7] transition-colors flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Running Behind? Downshift</span>
          </button>

          {sourceStatus && (
            <div className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#F5F0E7] text-[#39483B] border border-[#A6AD99]/40 shrink-0">
              {sourceStatus === 'live_ai' ? 'Live AI Engine' : 'Deterministic Mode'}
            </div>
          )}
        </div>
      </div>

      {isOverloaded && (
        <div className="p-4 rounded-2xl bg-[#C47D61]/10 border border-[#C47D61]/30 text-xs text-[#C47D61] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Heads up: Your open tasks exceed the available window with buffer room. Consider rescheduling non-critical tasks.
            </span>
          </div>
          <button
            onClick={() => setShowRescheduleModal(true)}
            className="underline font-semibold"
          >
            Auto-downshift
          </button>
        </div>
      )}

      {/* Control Bar: Date, Available Hours & Working Energy Selector */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#A6AD99]/30 flex flex-wrap items-center justify-between gap-5 shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#22221F]">
            <Calendar className="w-4 h-4 text-[#39483B]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#F5F0E7] border border-[#A6AD99]/40 text-xs text-[#22221F] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-[#77766E]">
            <Clock className="w-4 h-4 text-[#39483B]" />
            <span>Window:</span>
            <select
              value={availableHours}
              onChange={(e) => setAvailableHours(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl bg-[#F5F0E7] border border-[#A6AD99]/40 text-xs text-[#22221F] focus:outline-none font-medium"
            >
              <option value={2}>2 Hours (Gentle)</option>
              <option value={3}>3 Hours</option>
              <option value={4}>4 Hours (Balanced)</option>
              <option value={6}>6 Hours (Deep)</option>
            </select>
          </div>

          {/* Energy Level Selector (Part 3) */}
          <div className="flex items-center gap-1.5 bg-[#F5F0E7] p-1 rounded-2xl border border-[#A6AD99]/30 text-xs">
            <span className="text-[11px] text-[#77766E] font-medium px-2">Energy:</span>
            {(
              [
                { level: 'low', label: 'Low', icon: Battery },
                { level: 'normal', label: 'Medium', icon: BatteryMedium },
                { level: 'high', label: 'High', icon: BatteryFull },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const isSelected = currentEnergy === opt.level;
              return (
                <button
                  key={opt.level}
                  type="button"
                  onClick={() => handleEnergyChange(opt.level)}
                  className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
                    isSelected
                      ? 'bg-[#39483B] text-white shadow-xs'
                      : 'text-[#77766E] hover:text-[#22221F]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleGenerateAI}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] disabled:opacity-50 transition-colors shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isLoading ? 'Composing Calm Flow...' : 'Suggest Schedule with AI'}</span>
        </button>
      </div>

      {/* Energy Mode Guidance Note */}
      <div className="p-3.5 rounded-2xl bg-[#E3E8DD]/50 border border-[#A6AD99]/30 text-xs text-[#39483B] flex items-center gap-2.5">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span>
          {currentEnergy === 'low'
            ? 'Low-Energy Pacing: Prioritizes 1–2 essential tasks, caps focus sessions at 20 minutes, and schedules generous restorative pauses.'
            : currentEnergy === 'high'
            ? 'High-Energy Pacing: Deep focus blocks (35–45 mins) for core objectives, with crisp 10-minute active stretch breaks.'
            : 'Medium-Energy Pacing: Balanced 25–35 minute sessions with 15-minute tea and breathing pauses.'}
        </span>
      </div>

      {/* Schedule Timeline Blocks */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 md:p-8 border border-[#A6AD99]/30 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#A6AD99]/20 pb-3">
          <h2 className="text-base font-serif font-bold text-[#22221F]">
            Timeline Blocks ({blocks.length})
          </h2>
          <span className="text-xs text-[#77766E]">
            Green bars indicate mindful buffer & break zones
          </span>
        </div>

        <div className="space-y-3">
          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                block.isBreak
                  ? 'bg-[#E3E8DD]/70 border-[#A6AD99]/40 text-[#39483B]'
                  : 'bg-[#F5F0E7]/60 border-[#A6AD99]/30 text-[#22221F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#77766E] bg-white px-2.5 py-1 rounded-lg border border-[#A6AD99]/30">
                  {block.startTime} – {block.endTime}
                </span>

                {block.isBreak ? (
                  <Coffee className="w-4 h-4 text-[#39483B] shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-[#77766E] shrink-0" />
                )}

                <span className="text-xs font-semibold">{block.title}</span>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center">
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  aria-label="Move block earlier"
                  className="p-1.5 rounded-lg text-[#77766E] hover:text-[#22221F] hover:bg-white disabled:opacity-30"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === blocks.length - 1}
                  aria-label="Move block later"
                  className="p-1.5 rounded-lg text-[#77766E] hover:text-[#22221F] hover:bg-white disabled:opacity-30"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteBlock(block.id)}
                  aria-label="Remove block"
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Manual Add Block Strip */}
        <form
          onSubmit={handleAddBlock}
          className="pt-4 border-t border-[#A6AD99]/20 flex flex-wrap items-center gap-3 text-xs"
        >
          <input
            type="text"
            placeholder="Add custom block title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 min-w-[180px] p-2.5 rounded-xl bg-[#F5F0E7]/60 border border-[#A6AD99]/30 text-xs text-[#22221F]"
          />
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="w-16 p-2 rounded-xl text-center bg-[#F5F0E7]/60 border border-[#A6AD99]/30"
            />
            <span>–</span>
            <input
              type="text"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="w-16 p-2 rounded-xl text-center bg-[#F5F0E7]/60 border border-[#A6AD99]/30"
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-[#77766E] cursor-pointer">
            <input
              type="checkbox"
              checked={newIsBreak}
              onChange={(e) => setNewIsBreak(e.target.checked)}
              className="accent-[#39483B]"
            />
            <span>Mindful Break</span>
          </label>
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="px-4 py-2 rounded-xl bg-[#E9E0D2] text-[#22221F] font-semibold hover:bg-[#ded3c1] disabled:opacity-40"
          >
            Add Block
          </button>
        </form>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[#A6AD99]/20">
          <span className="text-xs text-[#77766E]">
            {saveSuccess ? (
              <span className="text-[#39483B] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Daily schedule saved!</span>
              </span>
            ) : (
              'Save your timeline to anchor today\'s gentle flow.'
            )}
          </span>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#39483B] text-white text-xs font-semibold hover:bg-[#2c392e] transition-colors shadow-xs"
          >
            Save Daily Schedule
          </button>
        </div>
      </div>

      <SmartRescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        openTasks={tasks.filter((t) => !t.completed)}
        onApplySchedule={(newBlocks) => {
          setBlocks(newBlocks);
          onSaveSchedule(newBlocks);
        }}
      />
    </div>
  );
};
