import React, { useState, useEffect } from 'react';
import {
  loadTasks,
  saveTasks,
  loadGarden,
  saveGarden,
  loadActivities,
  saveActivities,
  loadPlanner,
  savePlanner,
  loadSettings,
  saveSettings,
  INITIAL_TASKS,
  INITIAL_GARDEN,
  INITIAL_ACTIVITIES,
  INITIAL_PLANNER,
  INITIAL_SETTINGS,
} from './utils/storage';
import { Task, SlothGardenData, ActivityItem, TimeBlock, AppSettings, Subtask } from './types';
import { LandingPage } from './components/landing/LandingPage';
import { WorkspaceShell } from './components/workspace/WorkspaceShell';

export default function App() {
  const [view, setView] = useState<'landing' | 'workspace'>('landing');
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [garden, setGarden] = useState<SlothGardenData>(() => loadGarden());
  const [activities, setActivities] = useState<ActivityItem[]>(() => loadActivities());
  const [planner, setPlanner] = useState<TimeBlock[]>(() => loadPlanner());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [celebratingTaskId, setCelebratingTaskId] = useState<string | null>(null);

  // Sync to storage on change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveGarden(garden);
  }, [garden]);

  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  useEffect(() => {
    savePlanner(planner);
  }, [planner]);

  useEffect(() => {
    saveSettings(settings);
    // Apply reduced motion to document class or style if needed
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [settings]);

  // Activity logging helper
  const addActivity = (type: ActivityItem['type'], title: string, details?: string) => {
    const newItem: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type,
      title,
      details,
    };
    setActivities((prev) => [newItem, ...prev.slice(0, 49)]); // keep recent 50
  };

  // Task actions
  const handleAddTask = (task: Task) => {
    setTasks((prev) => [task, ...prev]);
    addActivity('task_created', `Created task "${task.title}"`, `Priority: ${task.priority.toUpperCase()}`);
  };

  const handleAddTasks = (newTasks: Task[]) => {
    setTasks((prev) => [...newTasks, ...prev]);
    addActivity('ai_organize', `Added ${newTasks.length} tasks from AI`, 'Imported from AI workflow');
  };

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    addActivity('task_updated', `Updated "${updated.title}"`);
  };

  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (target) {
      addActivity('task_deleted', `Deleted "${target.title}"`);
    }
  };

  const handleToggleComplete = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const willBeCompleted = !target.completed;
    const updatedTasks = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            completed: willBeCompleted,
            completedAt: willBeCompleted ? new Date().toISOString() : undefined,
          }
        : t
    );
    setTasks(updatedTasks);

    if (willBeCompleted) {
      // Sprout leaf in Sloth Garden
      const todayStr = new Date().toISOString().slice(0, 10);
      const newCount = garden.leafCount + 1;
      const newStage = Math.min(5, Math.floor(newCount / 5) + 1);

      const existingHistory = [...garden.historyLogs];
      const todayEntry = existingHistory.find((h) => h.date === todayStr);
      if (todayEntry) {
        todayEntry.leavesEarned += 1;
      } else {
        existingHistory.unshift({ date: todayStr, leavesEarned: 1 });
      }

      setGarden({
        leafCount: newCount,
        treeStage: newStage,
        historyLogs: existingHistory,
      });

      setCelebratingTaskId(target.id);
      setTimeout(() => setCelebratingTaskId(null), 3000);

      addActivity(
        'task_completed',
        `Completed "${target.title}"`,
        `Sprouted leaf #${newCount} in the Sloth Garden 🌿`
      );
    }
  };

  const handleAddSubtasks = (taskId: string, subtasks: Subtask[]) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: [...(t.subtasks || []), ...subtasks],
            }
          : t
      )
    );
    addActivity('ai_breakdown', `Deconstructed task into ${subtasks.length} steps`);
  };

  const handleSaveSchedule = (newBlocks: TimeBlock[]) => {
    setPlanner(newBlocks);
    addActivity('planner_saved', 'Saved daily time block plan', `${newBlocks.length} blocks scheduled`);
  };

  const handleResetGarden = () => {
    setGarden({
      leafCount: 0,
      treeStage: 1,
      historyLogs: [],
    });
    addActivity('garden_reset', 'Reset Sloth Garden tree leaves to 0');
  };

  const handleClearHistory = () => {
    setActivities([]);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const handleExportData = () => {
    const backup = {
      app: 'SlothDesk AI',
      exportDate: new Date().toISOString(),
      tasks,
      garden,
      activities,
      planner,
      settings,
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slothdesk_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setTasks(INITIAL_TASKS);
    setGarden(INITIAL_GARDEN);
    setActivities(INITIAL_ACTIVITIES);
    setPlanner(INITIAL_PLANNER);
    setSettings(INITIAL_SETTINGS);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E7] text-[#22221F]">
      {view === 'landing' ? (
        <LandingPage
          onEnterWorkspace={() => setView('workspace')}
          onSelectFeature={(tab) => {
            setView('workspace');
          }}
        />
      ) : (
        <WorkspaceShell
          tasks={tasks}
          garden={garden}
          activities={activities}
          planner={planner}
          settings={settings}
          onAddTask={handleAddTask}
          onAddTasks={handleAddTasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          onAddSubtasks={handleAddSubtasks}
          onSaveSchedule={handleSaveSchedule}
          onResetGarden={handleResetGarden}
          onClearHistory={handleClearHistory}
          onUpdateSettings={handleUpdateSettings}
          onExportData={handleExportData}
          onClearAllData={handleClearAllData}
          onNavigateHome={() => setView('landing')}
          celebratingTaskId={celebratingTaskId}
        />
      )}
    </div>
  );
}
