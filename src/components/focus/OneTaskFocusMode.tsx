import React, { useState, useEffect } from 'react';
import { Task, Subtask } from '../../types';
import { SlothMascot } from '../mascot/SlothMascot';
import { Play, Pause, RotateCcw, Check, ArrowRight, X, Clock, Sparkles } from 'lucide-react';

interface OneTaskFocusModeProps {
  tasks: Task[];
  initialTaskId?: string;
  onCompleteTask: (taskId: string) => void;
  onExitFocus: () => void;
  onSelectTask: (taskId: string) => void;
}

export const OneTaskFocusMode: React.FC<OneTaskFocusModeProps> = ({
  tasks,
  initialTaskId,
  onCompleteTask,
  onExitFocus,
  onSelectTask,
}) => {
  const openTasks = tasks.filter((t) => !t.completed);
  const activeTask =
    openTasks.find((t) => t.id === initialTaskId) || openTasks[0];

  // Timer state: 25 minutes default (1500 seconds)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'timed' | 'zen'>('timed');
  const [completedAnimation, setCompletedAnimation] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timerMode === 'timed' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerMode, timerSeconds]);

  if (!activeTask) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-[#A6AD99]/30 text-center space-y-4 max-w-lg mx-auto shadow-sm">
        <SlothMascot state="encouragement" size="lg" />
        <h3 className="font-serif text-2xl font-bold text-[#22221F]">
          All Tasks Cleared!
        </h3>
        <p className="text-xs text-[#77766E] leading-relaxed">
          There are no incomplete tasks left in your workspace. You have earned a calm break with warm tea.
        </p>
        <button
          onClick={onExitFocus}
          className="px-6 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e]"
        >
          Return to Overview
        </button>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    setCompletedAnimation(true);
    onCompleteTask(activeTask.id);
    setTimeout(() => {
      setCompletedAnimation(false);
      setTimerSeconds(25 * 60);
      setTimerRunning(false);
    }, 2000);
  };

  const setPreset = (mins: number) => {
    setTimerRunning(false);
    setTimerSeconds(mins * 60);
    setTimerMode('timed');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#77766E]">
          <span className="w-2 h-2 rounded-full bg-[#39483B]" />
          <span>One-Task Sanctuary</span>
        </div>
        <button
          onClick={onExitFocus}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#77766E] hover:text-[#22221F] hover:bg-[#E9E0D2] transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Exit Focus</span>
        </button>
      </div>

      {/* Main Focus Card */}
      <div className="bg-[#FFFFFF] rounded-3xl p-8 md:p-12 border border-[#A6AD99]/30 shadow-md text-center space-y-8 relative overflow-hidden">
        {/* Mascot Centerpiece */}
        <div className="flex flex-col items-center">
          <SlothMascot
            state={completedAnimation ? 'task-completed' : timerRunning ? 'thinking' : 'idle'}
            size="hero"
          />
        </div>

        {/* Task Focus Details */}
        <div className="space-y-2 max-w-xl mx-auto">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#39483B]">
            Current Focus Outcome
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22221F]">
            {activeTask.title}
          </h2>
          {activeTask.description && (
            <p className="text-xs text-[#77766E] leading-relaxed">
              {activeTask.description}
            </p>
          )}

          {activeTask.suggestedNextAction && (
            <div className="mt-3 p-3 rounded-xl bg-[#E3E8DD]/60 border border-[#A6AD99]/30 text-xs text-[#39483B] flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Smallest next move: {activeTask.suggestedNextAction}</span>
            </div>
          )}
        </div>

        {/* Subtasks Progress if any */}
        {activeTask.subtasks && activeTask.subtasks.length > 0 && (
          <div className="max-w-md mx-auto text-left bg-[#F5F0E7]/60 p-4 rounded-2xl border border-[#A6AD99]/30 space-y-2 text-xs">
            <span className="font-semibold text-[#77766E] uppercase tracking-wider text-[10px]">
              Micro-Steps Checklist
            </span>
            {activeTask.subtasks.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2 text-[#22221F]">
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                    sub.completed ? 'bg-[#39483B] border-[#39483B] text-white' : 'border-[#A6AD99]'
                  }`}
                >
                  {sub.completed && <Check className="w-2.5 h-2.5" />}
                </div>
                <span className={sub.completed ? 'line-through text-[#77766E]' : ''}>{sub.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Gentle Timer Controls */}
        <div className="space-y-4 pt-2">
          {timerMode === 'timed' ? (
            <div className="font-mono text-5xl sm:text-6xl font-bold text-[#22221F] tabular-nums tracking-tight">
              {formatTime(timerSeconds)}
            </div>
          ) : (
            <div className="text-lg font-serif italic text-[#77766E]">
              Unhurried Flow Mode · No Clock Running
            </div>
          )}

          {/* Preset Buttons */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <button
              onClick={() => setPreset(15)}
              className="px-2.5 py-1 rounded-lg bg-[#F5F0E7] text-[#77766E] hover:text-[#22221F]"
            >
              15m Gentle
            </button>
            <button
              onClick={() => setPreset(25)}
              className="px-2.5 py-1 rounded-lg bg-[#F5F0E7] text-[#77766E] hover:text-[#22221F]"
            >
              25m Focus
            </button>
            <button
              onClick={() => setPreset(45)}
              className="px-2.5 py-1 rounded-lg bg-[#F5F0E7] text-[#77766E] hover:text-[#22221F]"
            >
              45m Deep
            </button>
            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerMode('zen');
              }}
              className="px-2.5 py-1 rounded-lg bg-[#F5F0E7] text-[#77766E] hover:text-[#22221F]"
            >
              Zen Flow
            </button>
          </div>

          {/* Action Button Cluster */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {timerMode === 'timed' && (
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E9E0D2] text-[#22221F] text-xs font-semibold hover:bg-[#ded3c1] transition-colors"
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{timerRunning ? 'Pause Clock' : 'Start Focus'}</span>
              </button>
            )}

            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>{completedAnimation ? 'Completed! +1 Leaf 🌿' : 'Finish Task'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Task Selector Bar */}
      {openTasks.length > 1 && (
        <div className="flex items-center justify-between p-4 bg-[#E9E0D2] rounded-2xl border border-[#A6AD99]/30 text-xs">
          <span className="text-[#77766E]">Other open tasks:</span>
          <div className="flex items-center gap-2 overflow-x-auto max-w-md">
            {openTasks
              .filter((t) => t.id !== activeTask.id)
              .slice(0, 3)
              .map((other) => (
                <button
                  key={other.id}
                  onClick={() => onSelectTask(other.id)}
                  className="px-3 py-1.5 rounded-lg bg-white text-[#22221F] hover:bg-[#F5F0E7] truncate max-w-[140px] text-[11px]"
                >
                  {other.title}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
