import React, { useState, useEffect, useRef } from 'react';
import { Task, FocusSession } from '../../types';
import { SlothMascot } from '../mascot/SlothMascot';
import {
  loadActiveFocusState,
  saveActiveFocusState,
  clearActiveFocusState,
} from '../../utils/storage';
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  ArrowRight,
  X,
  Clock,
  Sparkles,
  Coffee,
  Plus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface OneTaskFocusModeProps {
  tasks: Task[];
  initialTaskId?: string;
  onCompleteTask: (taskId: string) => void;
  onRecordFocusSession: (session: FocusSession) => void;
  onExitFocus: () => void;
  onSelectTask: (taskId: string) => void;
  onAddTask?: (task: Task) => void;
}

export const OneTaskFocusMode: React.FC<OneTaskFocusModeProps> = ({
  tasks,
  initialTaskId,
  onCompleteTask,
  onRecordFocusSession,
  onExitFocus,
  onSelectTask,
  onAddTask,
}) => {
  const openTasks = tasks.filter((t) => !t.completed);
  const activeTask =
    openTasks.find((t) => t.id === initialTaskId) || openTasks[0];

  // Ad-hoc task creation
  const [showNewTaskInput, setShowNewTaskInput] = useState(false);
  const [adhocTaskTitle, setAdhocTaskTitle] = useState('');

  // Presets & Duration (in seconds)
  const [durationSeconds, setDurationSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState('');
  const [breakModeActive, setBreakModeActive] = useState(false);
  const [taskMarkedComplete, setTaskMarkedComplete] = useState(false);

  // Drift-prevention references
  const endTimestampRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef<number>(25 * 60);

  // Restore active focus session if exists
  useEffect(() => {
    const saved = loadActiveFocusState();
    if (saved) {
      setDurationSeconds(saved.durationSeconds);
      if (saved.isPaused) {
        setIsRunning(false);
        setIsPaused(true);
        setRemainingSeconds(saved.remainingSeconds);
        pausedRemainingRef.current = saved.remainingSeconds;
      } else {
        const now = Date.now();
        const elapsedSinceStart = Math.floor((now - saved.startTimestamp) / 1000);
        const computedRemaining = Math.max(0, saved.durationSeconds - elapsedSinceStart);
        if (computedRemaining > 0) {
          setIsRunning(true);
          setIsPaused(false);
          setRemainingSeconds(computedRemaining);
          endTimestampRef.current = now + computedRemaining * 1000;
        } else {
          // Finished while away!
          setIsRunning(false);
          setIsCompleted(true);
          setRemainingSeconds(0);
          clearActiveFocusState();
        }
      }
    }
  }, []);

  // Timestamp-based accurate timer tick to prevent drift
  useEffect(() => {
    if (!isRunning || isZenMode) return;

    const interval = setInterval(() => {
      if (!endTimestampRef.current) return;
      const now = Date.now();
      const distance = Math.max(0, Math.ceil((endTimestampRef.current - now) / 1000));
      setRemainingSeconds(distance);

      if (distance <= 0) {
        // Session complete!
        clearInterval(interval);
        setIsRunning(false);
        setIsCompleted(true);
        clearActiveFocusState();

        // Record completed session
        const session: FocusSession = {
          id: `focus-${Date.now()}`,
          taskId: activeTask?.id,
          taskTitle: activeTask?.title || 'Gentle Focus Session',
          durationMinutes: Math.round(durationSeconds / 60),
          completedAt: new Date().toISOString(),
          mode: 'timed',
        };
        onRecordFocusSession(session);
      } else {
        // Persist state for refresh safety
        saveActiveFocusState({
          taskId: activeTask?.id,
          taskTitle: activeTask?.title || 'Mindful Focus',
          durationSeconds,
          remainingSeconds: distance,
          startTimestamp: Date.now() - (durationSeconds - distance) * 1000,
          isPaused: false,
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, isZenMode, durationSeconds, activeTask, onRecordFocusSession]);

  const handleStartTimer = () => {
    const targetRem = isPaused ? pausedRemainingRef.current : durationSeconds;
    endTimestampRef.current = Date.now() + targetRem * 1000;
    setIsRunning(true);
    setIsPaused(false);
    setIsCompleted(false);
    setBreakModeActive(false);

    saveActiveFocusState({
      taskId: activeTask?.id,
      taskTitle: activeTask?.title || 'Focus Session',
      durationSeconds,
      remainingSeconds: targetRem,
      startTimestamp: Date.now() - (durationSeconds - targetRem) * 1000,
      isPaused: false,
    });
  };

  const handlePauseTimer = () => {
    if (!isRunning) return;
    setIsRunning(false);
    setIsPaused(true);
    pausedRemainingRef.current = remainingSeconds;

    saveActiveFocusState({
      taskId: activeTask?.id,
      taskTitle: activeTask?.title || 'Focus Session',
      durationSeconds,
      remainingSeconds,
      startTimestamp: Date.now(),
      isPaused: true,
      pausedAt: Date.now(),
    });
  };

  const handleCancelTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
    setRemainingSeconds(durationSeconds);
    pausedRemainingRef.current = durationSeconds;
    endTimestampRef.current = null;
    clearActiveFocusState();
  };

  const handleFinishEarly = () => {
    const elapsedSeconds = Math.max(60, durationSeconds - remainingSeconds);
    const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));

    setIsRunning(false);
    setIsCompleted(true);
    clearActiveFocusState();

    const session: FocusSession = {
      id: `focus-${Date.now()}`,
      taskId: activeTask?.id,
      taskTitle: activeTask?.title || 'Focus Session',
      durationMinutes: elapsedMins,
      completedAt: new Date().toISOString(),
      mode: 'timed',
    };
    onRecordFocusSession(session);
  };

  const handleSelectPreset = (mins: number) => {
    handleCancelTimer();
    setIsZenMode(false);
    setDurationSeconds(mins * 60);
    setRemainingSeconds(mins * 60);
    pausedRemainingRef.current = mins * 60;
  };

  const handleApplyCustomMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMinutesInput, 10);
    if (!isNaN(val) && val > 0 && val <= 180) {
      handleSelectPreset(val);
      setCustomMinutesInput('');
    }
  };

  const handleCreateAdhocTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adhocTaskTitle.trim() || !onAddTask) return;

    const newTask: Task = {
      id: `task-focus-${Date.now()}`,
      title: adhocTaskTitle.trim(),
      priority: 'medium',
      completed: false,
      estimatedMinutes: Math.round(durationSeconds / 60),
      createdAt: new Date().toISOString(),
      energyLevel: 'normal',
    };
    onAddTask(newTask);
    onSelectTask(newTask.id);
    setAdhocTaskTitle('');
    setShowNewTaskInput(false);
  };

  const handleCompleteCurrentTask = () => {
    if (!activeTask) return;
    onCompleteTask(activeTask.id);
    setTaskMarkedComplete(true);
  };

  const handleStartBreak = (mins = 5) => {
    setBreakModeActive(true);
    setIsCompleted(false);
    setDurationSeconds(mins * 60);
    setRemainingSeconds(mins * 60);
    pausedRemainingRef.current = mins * 60;
    endTimestampRef.current = Date.now() + mins * 60 * 1000;
    setIsRunning(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, ((durationSeconds - remainingSeconds) / durationSeconds) * 100)
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#77766E]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#39483B] animate-pulse" />
          <span>Gentle Focus Sanctuary</span>
        </div>
        <button
          onClick={onExitFocus}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs text-[#77766E] hover:text-[#22221F] hover:bg-[#E9E0D2] transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Exit Focus Mode</span>
        </button>
      </div>

      {/* Main Focus Container */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-10 border border-[#A6AD99]/30 shadow-md text-center space-y-7 relative overflow-hidden">
        {/* Sloth Mascot Animation */}
        <div className="flex flex-col items-center">
          <SlothMascot
            state={
              isCompleted
                ? 'task-completed'
                : breakModeActive
                ? 'low-energy'
                : isRunning
                ? 'thinking'
                : 'idle'
            }
            size="hero"
          />
        </div>

        {/* Completion Celebration State */}
        {isCompleted ? (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#39483B]">
                Session Complete
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22221F]">
                Wonderful presence. Take a calm breath.
              </h2>
              <p className="text-xs text-[#77766E] max-w-md mx-auto leading-relaxed">
                You honored your time without rushing. Remember: focus sessions don't automatically complete tasks unless you decide it's done.
              </p>
            </div>

            {/* Gentle Break Suggestions */}
            <div className="p-4 rounded-2xl bg-[#E3E8DD]/60 border border-[#A6AD99]/30 max-w-md mx-auto text-left space-y-2 text-xs">
              <span className="font-semibold text-[#39483B] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5" />
                <span>Sloth Break Suggestion</span>
              </span>
              <p className="text-[#22221F]">
                Gaze out the window, roll your shoulders back, or pour a warm cup of herbal tea.
              </p>
            </div>

            {/* Actions Cluster */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {activeTask && !taskMarkedComplete && (
                <button
                  onClick={handleCompleteCurrentTask}
                  className="px-5 py-2.5 rounded-xl bg-[#39483B] text-white text-xs font-semibold hover:bg-[#2c392e] transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark Task Complete (+1 Leaf 🌿)</span>
                </button>
              )}

              <button
                onClick={() => handleStartBreak(5)}
                className="px-4 py-2.5 rounded-xl bg-[#E9E0D2] text-[#22221F] text-xs font-semibold hover:bg-[#ded3c1] transition-colors flex items-center gap-1.5"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Take 5-min Mindful Break</span>
              </button>

              <button
                onClick={handleStartTimer}
                className="px-4 py-2.5 rounded-xl bg-white border border-[#A6AD99]/40 text-[#22221F] text-xs font-semibold hover:bg-[#F5F0E7] transition-colors"
              >
                Start Another Session
              </button>

              <button
                onClick={onExitFocus}
                className="px-4 py-2.5 rounded-xl text-[#77766E] hover:text-[#22221F] text-xs font-semibold"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : breakModeActive ? (
          /* Break Countdown Mode */
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#39483B]">
              Restorative Pause
            </span>
            <div className="font-mono text-5xl sm:text-6xl font-bold text-[#39483B] tabular-nums">
              {formatTime(remainingSeconds)}
            </div>
            <p className="text-xs text-[#77766E] italic">
              Close your eyes, sip water, or let your mind wander gently.
            </p>
            <button
              onClick={handleCancelTimer}
              className="px-4 py-2 rounded-xl bg-[#E9E0D2] text-[#22221F] text-xs font-semibold hover:bg-[#ded3c1]"
            >
              End Break
            </button>
          </div>
        ) : (
          /* Active Focus Display */
          <div className="space-y-6">
            {/* Active Task Name */}
            <div className="space-y-1.5 max-w-xl mx-auto">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#39483B] block">
                Single Focus Intention
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#22221F]">
                {activeTask ? activeTask.title : 'Unstructured Mindful Flow'}
              </h2>
              {activeTask?.description && (
                <p className="text-xs text-[#77766E] leading-relaxed">
                  {activeTask.description}
                </p>
              )}
            </div>

            {/* Timer Display & Circular/Linear Progress Bar */}
            <div className="space-y-3">
              {!isZenMode ? (
                <div className="space-y-2">
                  <div className="font-mono text-6xl sm:text-7xl font-bold text-[#22221F] tabular-nums tracking-tight">
                    {formatTime(remainingSeconds)}
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full max-w-xs mx-auto h-2 bg-[#E9E0D2] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#39483B] transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-6 text-xl font-serif italic text-[#77766E]">
                  Unhurried Zen Flow · No Clock Pressure
                </div>
              )}

              {/* Presets: 5m, 10m, 25m, Zen + Custom */}
              {!isRunning && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                    {[
                      { label: '5m Micro', mins: 5 },
                      { label: '10m Gentle', mins: 10 },
                      { label: '25m Pomodoro', mins: 25 },
                    ].map((preset) => (
                      <button
                        key={preset.mins}
                        onClick={() => handleSelectPreset(preset.mins)}
                        className={`px-3 py-1.5 rounded-xl border transition-colors ${
                          durationSeconds === preset.mins * 60 && !isZenMode
                            ? 'bg-[#39483B] text-white border-[#39483B]'
                            : 'bg-[#F5F0E7] text-[#22221F] border-[#A6AD99]/30 hover:bg-[#E9E0D2]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        handleCancelTimer();
                        setIsZenMode(true);
                      }}
                      className={`px-3 py-1.5 rounded-xl border transition-colors ${
                        isZenMode
                          ? 'bg-[#39483B] text-white border-[#39483B]'
                          : 'bg-[#F5F0E7] text-[#22221F] border-[#A6AD99]/30 hover:bg-[#E9E0D2]'
                      }`}
                    >
                      Zen Flow
                    </button>
                  </div>

                  {/* Custom Minutes Input */}
                  <form
                    onSubmit={handleApplyCustomMinutes}
                    className="flex items-center justify-center gap-2 text-xs pt-1"
                  >
                    <span className="text-[#77766E]">Custom duration:</span>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={customMinutesInput}
                      onChange={(e) => setCustomMinutesInput(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-16 px-2.5 py-1 rounded-lg border border-[#A6AD99]/40 text-center text-xs bg-white text-[#22221F]"
                    />
                    <button
                      type="submit"
                      disabled={!customMinutesInput}
                      className="px-2.5 py-1 rounded-lg bg-[#E9E0D2] text-[#22221F] font-semibold hover:bg-[#ded3c1] disabled:opacity-40"
                    >
                      Set Mins
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Controls Cluster */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {!isRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="px-7 py-3 rounded-2xl bg-[#39483B] text-white text-xs font-semibold hover:bg-[#2c392e] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isPaused ? 'Resume Focus' : 'Start Focus Session'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="px-6 py-3 rounded-2xl bg-[#E9E0D2] text-[#22221F] text-xs font-semibold hover:bg-[#ded3c1] transition-colors flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause Timer</span>
                </button>
              )}

              {(isRunning || isPaused) && (
                <>
                  <button
                    onClick={handleFinishEarly}
                    className="px-4 py-3 rounded-2xl bg-[#E3E8DD] text-[#39483B] text-xs font-semibold hover:bg-[#d5dece] transition-colors"
                  >
                    Finish Early
                  </button>
                  <button
                    onClick={handleCancelTimer}
                    className="px-4 py-3 rounded-2xl text-[#77766E] hover:text-[#22221F] hover:bg-[#F5F0E7] text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task Switcher & Ad-Hoc Task Creator */}
      <div className="bg-[#E9E0D2] rounded-2xl p-4 border border-[#A6AD99]/30 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#77766E]">Active Focus Intention:</span>
          <button
            onClick={() => setShowNewTaskInput(!showNewTaskInput)}
            className="text-[#39483B] hover:underline font-semibold flex items-center gap-1 text-[11px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Set New Intention</span>
          </button>
        </div>

        {showNewTaskInput && (
          <form onSubmit={handleCreateAdhocTask} className="flex gap-2">
            <input
              type="text"
              value={adhocTaskTitle}
              onChange={(e) => setAdhocTaskTitle(e.target.value)}
              placeholder="What small intention do you want to focus on?"
              className="flex-1 p-2.5 rounded-xl border border-[#A6AD99]/40 bg-white text-xs text-[#22221F]"
              autoFocus
            />
            <button
              type="submit"
              disabled={!adhocTaskTitle.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#39483B] text-white text-xs font-semibold hover:bg-[#2c392e] disabled:opacity-40"
            >
              Set Active
            </button>
          </form>
        )}

        {openTasks.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-1">
            <span className="text-[11px] text-[#77766E] shrink-0">Switch task:</span>
            {openTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onSelectTask(t.id);
                  handleCancelTimer();
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] truncate max-w-[160px] transition-colors border ${
                  activeTask?.id === t.id
                    ? 'bg-[#39483B] text-white border-[#39483B]'
                    : 'bg-white text-[#22221F] border-[#A6AD99]/30 hover:bg-[#F5F0E7]'
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
