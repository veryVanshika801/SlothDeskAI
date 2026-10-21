import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  CalendarDays,
  NotebookPen,
  Trees,
  History,
  Settings,
  Menu,
  X,
  Plus,
  Play,
  ExternalLink,
  Shield,
  Coffee,
  LifeBuoy,
  BookOpen,
} from 'lucide-react';
import { SlothMascot } from '../mascot/SlothMascot';
import {
  Task,
  SlothGardenData,
  ActivityItem,
  TimeBlock,
  AppSettings,
  Subtask,
  FocusSession,
  EnergyLevel,
} from '../../types';
import { DashboardOverview } from '../dashboard/DashboardOverview';
import { TasksView } from '../tasks/TasksView';
import { LazyTaskOrganizer } from '../ai/LazyTaskOrganizer';
import { LowEnergyModeView } from '../ai/LowEnergyModeView';
import { MakeItSmallerView } from '../ai/MakeItSmallerView';
import { NotesToActionView } from '../ai/NotesToActionView';
import { SlowPlannerView } from '../ai/SlowPlannerView';
import { SlothGardenView } from '../garden/SlothGardenView';
import { ActivityHistoryView } from '../history/ActivityHistoryView';
import { SettingsView } from '../settings/SettingsView';
import { OneTaskFocusMode } from '../focus/OneTaskFocusMode';
import { QuickCaptureModal } from '../quickcapture/QuickCaptureModal';
import { SlothRescueModal } from '../rescue/SlothRescueModal';
import { WeeklyReflectionView } from '../reflection/WeeklyReflectionView';

interface WorkspaceShellProps {
  tasks: Task[];
  garden: SlothGardenData;
  activities: ActivityItem[];
  planner: TimeBlock[];
  settings: AppSettings;
  focusSessions: FocusSession[];
  energyLevel: EnergyLevel;
  onAddTask: (task: Task) => void;
  onAddTasks: (newTasks: Task[]) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onAddSubtasks: (taskId: string, subtasks: Subtask[]) => void;
  onSaveSchedule: (blocks: TimeBlock[]) => void;
  onResetGarden: () => void;
  onDailyReset: () => void;
  onClearHistory: () => void;
  onUndoActivity: (item: ActivityItem) => void;
  onLoadSampleData: () => void;
  onRestoreData: (backup: any) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateEnergy: (energy: EnergyLevel) => void;
  onRecordFocusSession: (session: FocusSession) => void;
  onExportData: () => void;
  onClearAllData: () => void;
  onNavigateHome: () => void;
  celebratingTaskId: string | null;
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({
  tasks,
  garden,
  activities,
  planner,
  settings,
  focusSessions,
  energyLevel,
  onAddTask,
  onAddTasks,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onAddSubtasks,
  onSaveSchedule,
  onResetGarden,
  onDailyReset,
  onClearHistory,
  onUndoActivity,
  onLoadSampleData,
  onRestoreData,
  onUpdateSettings,
  onUpdateEnergy,
  onRecordFocusSession,
  onExportData,
  onClearAllData,
  onNavigateHome,
  celebratingTaskId,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [targetMakeSmallerTask, setTargetMakeSmallerTask] = useState<string>('');
  const [focusTaskId, setFocusTaskId] = useState<string | undefined>(undefined);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [rescueModalOpen, setRescueModalOpen] = useState(false);

  // Keyboard shortcut Cmd+K or Ctrl+K for quick capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickCaptureOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, count: tasks.filter((t) => !t.completed).length },
    { id: 'focus', label: 'Gentle Focus', icon: Play },
    { id: 'reflection', label: 'Weekly Reflection', icon: BookOpen },
    { id: 'organizer', label: 'Task Organizer', icon: Sparkles },
    { id: 'low-energy', label: 'Low-Energy Mode', icon: Coffee },
    { id: 'breakdown', label: 'Make It Smaller', icon: Sparkles },
    { id: 'notes', label: 'Notes & Summaries', icon: NotebookPen },
    { id: 'planner', label: 'Slow Planner', icon: CalendarDays },
    { id: 'garden', label: 'Sloth Garden', icon: Trees, count: garden.leafCount, leaf: true },
    { id: 'history', label: 'Activity History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleOpenMakeSmaller = (taskTitle: string) => {
    setTargetMakeSmallerTask(taskTitle);
    setActiveTab('breakdown');
  };

  const handleStartFocus = (taskId: string) => {
    setFocusTaskId(taskId);
    setActiveTab('focus');
  };

  const handleStartFocusFromRescue = (taskTitle: string, durationMinutes: number) => {
    // Check if task exists or create it
    const existing = tasks.find((t) => t.title.toLowerCase() === taskTitle.toLowerCase());
    if (existing) {
      setFocusTaskId(existing.id);
    } else {
      const newTask: Task = {
        id: `task-rescue-${Date.now()}`,
        title: taskTitle,
        priority: 'high',
        completed: false,
        estimatedMinutes: durationMinutes,
        createdAt: new Date().toISOString(),
        tags: ['Rescue'],
        energyLevel: 'low',
      };
      onAddTask(newTask);
      setFocusTaskId(newTask.id);
    }
    setActiveTab('focus');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview
            tasks={tasks}
            garden={garden}
            energyLevel={energyLevel}
            onOpenTab={setActiveTab}
            onToggleComplete={onToggleComplete}
            onOpenMakeSmaller={handleOpenMakeSmaller}
            onStartFocusOnTask={handleStartFocus}
            onOpenQuickCapture={() => setQuickCaptureOpen(true)}
            onOpenRescueMode={() => setRescueModalOpen(true)}
            onUpdateEnergy={onUpdateEnergy}
          />
        );
      case 'tasks':
        return (
          <TasksView
            tasks={tasks}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onToggleComplete={onToggleComplete}
            onOpenMakeSmaller={handleOpenMakeSmaller}
            onStartFocusOnTask={handleStartFocus}
            onOpenRescueMode={() => setRescueModalOpen(true)}
          />
        );
      case 'focus':
        return (
          <OneTaskFocusMode
            tasks={tasks}
            initialTaskId={focusTaskId}
            onCompleteTask={onToggleComplete}
            onRecordFocusSession={onRecordFocusSession}
            onExitFocus={() => setActiveTab('tasks')}
            onSelectTask={(id) => setFocusTaskId(id)}
            onAddTask={onAddTask}
          />
        );
      case 'reflection':
        return (
          <WeeklyReflectionView
            tasks={tasks}
            focusSessions={focusSessions}
            onAddTasks={onAddTasks}
          />
        );
      case 'organizer':
        return (
          <LazyTaskOrganizer
            onAddTasks={onAddTasks}
            onOpenTaskTab={() => setActiveTab('tasks')}
          />
        );
      case 'low-energy':
        return (
          <LowEnergyModeView
            tasks={tasks}
            onCompleteTask={onToggleComplete}
            onOpenTaskTab={() => setActiveTab('tasks')}
          />
        );
      case 'breakdown':
        return (
          <MakeItSmallerView
            tasks={tasks}
            initialTaskTitle={targetMakeSmallerTask}
            onAddSubtasks={onAddSubtasks}
            onAddStandaloneTasks={onAddTasks}
            onOpenTaskTab={() => setActiveTab('tasks')}
          />
        );
      case 'notes':
        return (
          <NotesToActionView
            onAddTasks={onAddTasks}
            onOpenTaskTab={() => setActiveTab('tasks')}
          />
        );
      case 'planner':
        return (
          <SlowPlannerView
            tasks={tasks}
            initialBlocks={planner}
            energyLevel={energyLevel}
            onSaveSchedule={onSaveSchedule}
            onUpdateEnergy={onUpdateEnergy}
          />
        );
      case 'garden':
        return (
          <SlothGardenView
            garden={garden}
            openTasks={tasks.filter((t) => !t.completed)}
            onResetGarden={onResetGarden}
            onDailyReset={onDailyReset}
            celebratingTaskId={celebratingTaskId}
          />
        );
      case 'history':
        return (
          <ActivityHistoryView
            activities={activities}
            onClearHistory={onClearHistory}
            onUndoActivity={onUndoActivity}
          />
        );
      case 'settings':
        return (
          <SettingsView
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onClearAllData={onClearAllData}
            onLoadSampleData={onLoadSampleData}
            onRestoreData={onRestoreData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E7] text-[#22221F] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#E9E0D2] border-r border-[#A6AD99]/30 shrink-0 min-h-screen p-5 justify-between">
        <div className="space-y-6">
          {/* Logo Lockup */}
          <div className="flex items-center justify-between pb-4 border-b border-[#A6AD99]/30">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#39483B] flex items-center justify-center text-[#F5F0E7] font-serif font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
                S
              </div>
              <div>
                <span className="font-serif text-lg font-bold tracking-tight text-[#22221F] block leading-tight">
                  SlothDesk AI
                </span>
                <span className="text-[11px] text-[#77766E] block font-sans">
                  Calm Productivity
                </span>
              </div>
            </button>
          </div>

          {/* Rescue Mode Primary Button (Part 2) */}
          <button
            onClick={() => setRescueModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-2xl bg-[#C47D61] text-white hover:bg-[#b06f55] text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Help me get unstuck</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#39483B] text-[#F5F0E7] font-semibold shadow-xs'
                      : 'text-[#22221F] hover:bg-[#F5F0E7]/80 hover:text-[#39483B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-[#F5F0E7] text-[#39483B]'
                          : 'bg-[#F5F0E7] text-[#77766E]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-[#A6AD99]/30 space-y-3">
          <button
            onClick={onNavigateHome}
            className="w-full text-left px-3 py-1.5 text-xs text-[#77766E] hover:text-[#22221F] transition-colors flex items-center gap-2"
          >
            <span>← Landing Page</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] text-[#77766E] px-3">
            <span className="w-2 h-2 rounded-full bg-[#39483B]" />
            <span>Move Slower. Get There.</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-4 py-3 bg-[#E9E0D2] border-b border-[#A6AD99]/30">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-[#39483B] flex items-center justify-center text-[#F5F0E7] font-serif font-bold text-sm">
              S
            </div>
            <span className="font-serif font-bold text-[#22221F]">SlothDesk AI</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRescueModalOpen(true)}
              className="p-2 rounded-xl bg-[#C47D61] text-white"
              title="Help me get unstuck"
            >
              <LifeBuoy className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#22221F] hover:bg-[#F5F0E7]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#E9E0D2] border-b border-[#A6AD99]/30 p-4 space-y-1 animate-in fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                    isActive ? 'bg-[#39483B] text-[#F5F0E7]' : 'text-[#22221F]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="text-[10px] font-mono">{item.count}</span>
                  )}
                </button>
              );
            })}
            <button
              onClick={onNavigateHome}
              className="w-full text-left px-3 py-2 text-xs text-[#77766E] hover:text-[#22221F] pt-2"
            >
              ← Back to Landing Page
            </button>
          </div>
        )}

        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#F5F0E7] border-b border-[#A6AD99]/20">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#77766E]">
              Workspace
            </span>
            <span className="text-[#A6AD99]">/</span>
            <span className="text-xs font-bold text-[#22221F] capitalize">
              {activeTab.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Unstuck Trigger */}
            <button
              onClick={() => setRescueModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C47D61]/15 text-[#C47D61] hover:bg-[#C47D61]/25 text-xs font-semibold transition-colors border border-[#C47D61]/30"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Get Unstuck</span>
            </button>

            {/* Quick Capture Cmd+K Button */}
            <button
              onClick={() => setQuickCaptureOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#A6AD99]/40 text-xs text-[#22221F] hover:bg-[#E9E0D2] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#39483B]" />
              <span className="font-medium">Brain Dump</span>
              <kbd className="font-mono text-[10px] bg-[#F5F0E7] px-1 py-0.5 rounded text-[#77766E]">
                ⌘K
              </kbd>
            </button>

            {/* Vault badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9E0D2] border border-[#A6AD99]/30 text-xs text-[#22221F]">
              <div className="w-2 h-2 rounded-full bg-[#39483B]" />
              <span className="font-medium">Private Vault</span>
              <span className="text-[#77766E]">(Local)</span>
            </div>
          </div>
        </header>

        {/* Main Work Area */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>

      {/* Global Quick Capture Modal */}
      <QuickCaptureModal
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
        onSaveTasks={onAddTasks}
        onSaveNotes={(newNotes) => {
          newNotes.forEach((_n) => {
            onAddTasks([]);
          });
        }}
      />

      {/* Sloth Rescue Mode Modal (Part 2) */}
      <SlothRescueModal
        isOpen={rescueModalOpen}
        onClose={() => setRescueModalOpen(false)}
        onStartFocus={handleStartFocusFromRescue}
        onAddTask={onAddTask}
        onOpenMakeSmaller={handleOpenMakeSmaller}
      />
    </div>
  );
};
