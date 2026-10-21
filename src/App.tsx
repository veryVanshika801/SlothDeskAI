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
  clearSlothDeskData,
  generateExportBackup,
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

  // Sync to local storage
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
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [settings]);

  // Activity logging helper
  const addActivity = (
    type: ActivityItem['type'],
    title: string,
    details?: string,
    undoable = false,
    undoPayload?: any
  ) => {
    const newItem: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type,
      title,
      details,
      undoable,
      undoPayload,
    };
    setActivities((prev) => [newItem, ...prev.slice(0, 49)]); // keep recent 50
  };

  // Task actions
  const handleAddTask = (task: Task) => {
    setTasks((prev) => [task, ...prev]);
    addActivity(
      'task_created',
      `Created task "${task.title}"`,
      `Priority: ${task.priority.toUpperCase()}`,
      true,
      { taskId: task.id }
    );
  };

  const handleAddTasks = (newTasks: Task[]) => {
    if (newTasks.length === 0) return;
    setTasks((prev) => [...newTasks, ...prev]);
    addActivity(
      'ai_organize',
      `Added ${newTasks.length} tasks from AI`,
      'Imported into active workspace'
    );
  };

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    addActivity('task_updated', `Updated "${updated.title}"`);
  };

  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (target) {
      addActivity(
        'task_deleted',
        `Deleted "${target.title}"`,
        undefined,
        true,
        { task: target }
      );
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
      // Prevent duplicate leaf rewards!
      const alreadyEarned = garden.completedTaskIds?.includes(target.id);
      let newCount = garden.leafCount;
      let newCompletedIds = Array.isArray(garden.completedTaskIds)
        ? [...garden.completedTaskIds]
        : [];

      if (!alreadyEarned) {
        newCount = garden.leafCount + 1;
        newCompletedIds.push(target.id);

        const todayStr = new Date().toISOString().slice(0, 10);
        const existingHistory = [...garden.historyLogs];
        const todayEntry = existingHistory.find((h) => h.date === todayStr);
        if (todayEntry) {
          todayEntry.leavesEarned += 1;
        } else {
          existingHistory.unshift({ date: todayStr, leavesEarned: 1 });
        }

        const newStage = Math.min(5, Math.floor(newCount / 5) + 1);

        setGarden({
          leafCount: newCount,
          treeStage: newStage,
          completedTaskIds: newCompletedIds,
          historyLogs: existingHistory,
        });

        setCelebratingTaskId(target.id);
        setTimeout(() => setCelebratingTaskId(null), 3000);

        addActivity(
          'task_completed',
          `Completed "${target.title}"`,
          `Sprouted leaf #${newCount} in Sloth Garden 🌿`,
          true,
          { taskId: target.id }
        );
      } else {
        // Already earned a leaf previously, just mark completed without duplicate leaf exploit
        addActivity(
          'task_completed',
          `Re-completed "${target.title}"`,
          `Completed again (Leaf already earned)`,
          true,
          { taskId: target.id }
        );
      }
    } else {
      // Task was reopened
      addActivity(
        'task_uncompleted',
        `Reopened "${target.title}"`,
        `Task marked as active`,
        true,
        { taskId: target.id }
      );
    }
  };

  const handleUndoActivity = (item: ActivityItem) => {
    if (!item.undoPayload) return;

    if (item.type === 'task_completed' && item.undoPayload.taskId) {
      // Reopen task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === item.undoPayload.taskId
            ? { ...t, completed: false, completedAt: undefined }
            : t
        )
      );
      addActivity('task_uncompleted', `Undid completion of task`);
    } else if (item.type === 'task_deleted' && item.undoPayload.task) {
      // Restore task
      setTasks((prev) => [item.undoPayload.task, ...prev]);
      addActivity('task_created', `Restored "${item.undoPayload.task.title}"`);
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
    addActivity('ai_breakdown', `Attached ${subtasks.length} micro-steps to task`);
  };

  const handleSaveSchedule = (newBlocks: TimeBlock[]) => {
    setPlanner(newBlocks);
    addActivity('planner_saved', 'Saved daily time block plan', `${newBlocks.length} blocks scheduled`);
  };

  const handleResetGarden = () => {
    setGarden({
      leafCount: 0,
      treeStage: 1,
      completedTaskIds: [],
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
    const jsonStr = generateExportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slothdesk_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = () => {
    clearSlothDeskData();
    setTasks([]);
    setGarden({ leafCount: 0, treeStage: 1, completedTaskIds: [], historyLogs: [] });
    setActivities([]);
    setPlanner([]);
    setSettings(INITIAL_SETTINGS);
  };

  const handleLoadSampleData = () => {
    setTasks(INITIAL_TASKS);
    setGarden(INITIAL_GARDEN);
    setActivities(INITIAL_ACTIVITIES);
    setPlanner(INITIAL_PLANNER);
    setSettings(INITIAL_SETTINGS);
  };

  const handleRestoreData = (backup: any) => {
    if (backup.tasks) setTasks(backup.tasks);
    if (backup.garden) setGarden(backup.garden);
    if (backup.activities) setActivities(backup.activities);
    if (backup.planner) setPlanner(backup.planner);
    if (backup.settings) setSettings(backup.settings);
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
          onUndoActivity={handleUndoActivity}
          onLoadSampleData={handleLoadSampleData}
          onRestoreData={handleRestoreData}
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
