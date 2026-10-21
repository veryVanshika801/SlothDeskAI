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
} from 'lucide-react';
import { SlothMascot } from '../mascot/SlothMascot';
import { Task, SlothGardenData, ActivityItem, TimeBlock, AppSettings, Subtask } from '../../types';
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

interface WorkspaceShellProps {
  tasks: Task[];
  garden: SlothGardenData;
  activities: ActivityItem[];
  planner: TimeBlock[];
  settings: AppSettings;
  onAddTask: (task: Task) => void;
  onAddTasks: (newTasks: Task[]) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onAddSubtasks: (taskId: string, subtasks: Subtask[]) => void;
  onSaveSchedule: (blocks: TimeBlock[]) => void;
  onResetGarden: () => void;
  onClearHistory: () => void;
  onUndoActivity: (item: ActivityItem) => void;
  onLoadSampleData: () => void;
  onRestoreData: (backup: any) => void;
  onUpdateSettings: (settings: AppSettings) => void;
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
  onAddTask,
  onAddTasks,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onAddSubtasks,
  onSaveSchedule,
  onResetGarden,
  onClearHistory,
  onUndoActivity,
  onLoadSampleData,
  onRestoreData,
  onUpdateSettings,
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
    { id: 'focus', label: 'One-Task Focus', icon: Play },
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview
            tasks={tasks}
            garden={garden}
            onOpenTab={setActiveTab}
            onToggleComplete={onToggleComplete}
            onOpenMakeSmaller={handleOpenMakeSmaller}
            onStartFocusOnTask={handleStartFocus}
            onOpenQuickCapture={() => setQuickCaptureOpen(true)}
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
          />
        );
      case 'focus':
        return (
          <OneTaskFocusMode
            tasks={tasks}
            initialTaskId={focusTaskId}
            onCompleteTask={onToggleComplete}
            onExitFocus={() => setActiveTab('tasks')}
            onSelectTask={(id) => setFocusTaskId(id)}
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
            onSaveSchedule={onSaveSchedule}
          />
        );
      case 'garden':
        return (
          <SlothGardenView
            garden={garden}
            onResetGarden={onResetGarden}
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
                  Calm Workspace
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#39483B] text-[#F5F0E7] shadow-xs'
                      : 'text-[#22221F] hover:bg-[#F5F0E7]/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-[#2c392e] text-[#F5F0E7]'
                          : 'bg-[#F5F0E7] text-[#77766E]'
                      }`}
                    >
                      {item.count} {item.leaf ? '🌿' : ''}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Sloth Companion Status */}
        <div className="pt-4 border-t border-[#A6AD99]/30 space-y-3">
          <div className="p-3 rounded-xl bg-[#F5F0E7]/70 border border-[#A6AD99]/30 flex items-center gap-3">
            <SlothMascot state="idle" size="sm" />
            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-[#22221F] block truncate">
                Pacing Assistant
              </span>
              <span className="text-[11px] text-[#39483B] font-medium block truncate">
                Slow & Steady
              </span>
            </div>
          </div>

          <button
            onClick={onNavigateHome}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-[#77766E] hover:text-[#22221F] transition-colors"
          >
            <span>Exit to Landing Page</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#E9E0D2] border-b border-[#A6AD99]/30">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 font-serif text-base font-bold text-[#22221F]"
          >
            <div className="w-6 h-6 rounded-lg bg-[#39483B] text-[#F5F0E7] flex items-center justify-center text-xs">
              S
            </div>
            <span>SlothDesk AI</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuickCaptureOpen(true)}
              className="p-2 rounded-lg bg-white text-[#39483B] border border-[#A6AD99]/40"
              title="Quick Brain Dump"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#22221F] hover:bg-[#F5F0E7]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#E9E0D2] border-b border-[#A6AD99]/30 p-4 space-y-1">
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

          <div className="flex items-center gap-4">
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

            {/* Guest mode status badge */}
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
          // Add notes to activities or quick note store
          newNotes.forEach((n) => {
            onAddTasks([]);
          });
        }}
      />
    </div>
  );
};
