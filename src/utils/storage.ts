import {
  Task,
  ActivityItem,
  SlothGardenData,
  TimeBlock,
  AppSettings,
} from '../types';

const STORAGE_VERSION = '2.0';
const STORAGE_PREFIX = 'slothdesk_';

export const KEYS = {
  VERSION: `${STORAGE_PREFIX}version`,
  TASKS: `${STORAGE_PREFIX}tasks`,
  ACTIVITIES: `${STORAGE_PREFIX}activities`,
  GARDEN: `${STORAGE_PREFIX}garden`,
  PLANNER: `${STORAGE_PREFIX}planner`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  QUICK_NOTES: `${STORAGE_PREFIX}quick_notes`,
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Draft weekly priorities without rushing',
    description: 'Select at most 3 core outcomes for this week. Keep room for breathing.',
    priority: 'high',
    category: 'Planning',
    completed: false,
    estimatedMinutes: 25,
    tags: ['Planning', 'Mindful'],
    suggestedNextAction: 'Open blank document and write down 3 rough thoughts',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    energyLevel: 'normal',
    subtasks: [
      { id: 'sub-1', title: 'Open a blank page and jot down raw thoughts', completed: true, estimatedMinutes: 5, starterAction: 'Open notepad' },
      { id: 'sub-2', title: 'Pick the one task that relieves the most friction', completed: false, estimatedMinutes: 10, starterAction: 'Circle 1 item' },
      { id: 'sub-3', title: 'Mark everything else as optional bonus', completed: false, estimatedMinutes: 10, starterAction: 'Add note' },
    ],
  },
  {
    id: 'task-2',
    title: 'Review team feedback notes & distill next steps',
    description: 'Read the summary, extract only 2 actionable items, and file away the rest.',
    priority: 'medium',
    category: 'Work',
    completed: false,
    estimatedMinutes: 30,
    tags: ['Work', 'Communication'],
    suggestedNextAction: 'Skim document highlights for 5 minutes',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    energyLevel: 'normal',
    subtasks: [
      { id: 'sub-4', title: 'Skim document highlights', completed: false, estimatedMinutes: 10, starterAction: 'Open feedback doc' },
      { id: 'sub-5', title: 'Send a short 2-sentence confirmation reply', completed: false, estimatedMinutes: 5, starterAction: 'Draft reply' },
    ],
  },
  {
    id: 'task-3',
    title: 'Take an unplugged 15-minute tea break',
    description: 'No screens, look at greenery outside, take 3 deep slow breaths.',
    priority: 'low',
    category: 'Self-Care',
    completed: true,
    estimatedMinutes: 15,
    tags: ['Wellness', 'Sloth Pace'],
    suggestedNextAction: 'Boil water and step onto balcony',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    energyLevel: 'low',
  },
  {
    id: 'task-4',
    title: 'Water windowsill succulents and gentle stretch',
    description: 'Physical movement to reset body posture and calm shoulders.',
    priority: 'low',
    category: 'Home',
    completed: false,
    estimatedMinutes: 10,
    tags: ['Home', 'Self-Care'],
    suggestedNextAction: 'Refill watering cup',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    energyLevel: 'low',
  },
];

export const INITIAL_GARDEN: SlothGardenData = {
  leafCount: 7,
  treeStage: 2,
  completedTaskIds: ['task-3'],
  historyLogs: [
    { date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10), leavesEarned: 3 },
    { date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), leavesEarned: 3 },
    { date: new Date().toISOString().slice(0, 10), leavesEarned: 1 },
  ],
};

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'task_completed',
    title: 'Completed "Take an unplugged 15-minute tea break"',
    details: 'Sprouted 1 leaf on the Sloth Garden tree 🌿',
  },
  {
    id: 'act-2',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    type: 'task_created',
    title: 'Created task "Draft weekly priorities without rushing"',
    details: 'Set priority to High with 3 micro-steps',
  },
  {
    id: 'act-3',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    type: 'ai_organize',
    title: 'Organized messy brainstorm note',
    details: 'Generated 4 structured tasks via Lazy Task Organizer',
  },
];

export const INITIAL_PLANNER: TimeBlock[] = [
  {
    id: 'block-1',
    startTime: '09:00',
    endTime: '09:45',
    title: 'Draft weekly priorities without rushing',
    isBreak: false,
    taskId: 'task-1',
    energyLevel: 'normal',
  },
  {
    id: 'block-2',
    startTime: '09:45',
    endTime: '10:05',
    title: 'Sloth warm tea & mindful gazing',
    isBreak: true,
    energyLevel: 'low',
  },
  {
    id: 'block-3',
    startTime: '10:05',
    endTime: '10:45',
    title: 'Review team feedback notes',
    isBreak: false,
    taskId: 'task-2',
    energyLevel: 'normal',
  },
  {
    id: 'block-4',
    startTime: '10:45',
    endTime: '11:00',
    title: 'Water windowsill succulents & stretch',
    isBreak: false,
    taskId: 'task-4',
    energyLevel: 'low',
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  reducedMotion: false,
  defaultEnergy: 'normal',
  theme: 'soft-cream',
  aiModelPreference: 'auto',
};

// Safe storage access helper
function safeGet<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const item = window.localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Storage read error for key "${key}", using fallback:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Storage write error for key "${key}":`, err);
    return false;
  }
}

export function loadTasks(): Task[] {
  const loaded = safeGet<Task[]>(KEYS.TASKS, INITIAL_TASKS);
  if (!Array.isArray(loaded)) return INITIAL_TASKS;
  return loaded;
}

export function saveTasks(tasks: Task[]): void {
  safeSet(KEYS.TASKS, tasks);
}

export function loadGarden(): SlothGardenData {
  const loaded = safeGet<SlothGardenData>(KEYS.GARDEN, INITIAL_GARDEN);
  if (!loaded || typeof loaded.leafCount !== 'number') return INITIAL_GARDEN;
  // Ensure completedTaskIds array exists
  if (!Array.isArray(loaded.completedTaskIds)) {
    loaded.completedTaskIds = ['task-3'];
  }
  return loaded;
}

export function saveGarden(garden: SlothGardenData): void {
  safeSet(KEYS.GARDEN, garden);
}

export function loadActivities(): ActivityItem[] {
  const loaded = safeGet<ActivityItem[]>(KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  if (!Array.isArray(loaded)) return INITIAL_ACTIVITIES;
  return loaded;
}

export function saveActivities(activities: ActivityItem[]): void {
  safeSet(KEYS.ACTIVITIES, activities);
}

export function loadPlanner(): TimeBlock[] {
  const loaded = safeGet<TimeBlock[]>(KEYS.PLANNER, INITIAL_PLANNER);
  if (!Array.isArray(loaded)) return INITIAL_PLANNER;
  return loaded;
}

export function savePlanner(planner: TimeBlock[]): void {
  safeSet(KEYS.PLANNER, planner);
}

export function loadSettings(): AppSettings {
  const loaded = safeGet<AppSettings>(KEYS.SETTINGS, INITIAL_SETTINGS);
  return { ...INITIAL_SETTINGS, ...loaded };
}

export function saveSettings(settings: AppSettings): void {
  safeSet(KEYS.SETTINGS, settings);
}

export function loadQuickNotes(): string[] {
  return safeGet<string[]>(KEYS.QUICK_NOTES, [
    'Remember: Moving slow is not falling behind.',
    'Focus on one clear outcome at a time.',
  ]);
}

export function saveQuickNotes(notes: string[]): void {
  safeSet(KEYS.QUICK_NOTES, notes);
}

// ---------------------------------------------------------------------------
// Safe Data Clearance (Only clears SlothDesk keys, preserves other origin data)
// ---------------------------------------------------------------------------

export function clearSlothDeskData(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    Object.keys(window.localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        window.localStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.error('Failed to clear SlothDesk local data', err);
  }
}

// ---------------------------------------------------------------------------
// Backup Export & Validated Import (Feature 6F)
// ---------------------------------------------------------------------------

export interface SlothDeskBackup {
  app: 'SlothDesk AI';
  version: string;
  exportDate: string;
  tasks: Task[];
  garden: SlothGardenData;
  activities: ActivityItem[];
  planner: TimeBlock[];
  settings: AppSettings;
  quickNotes?: string[];
}

export function generateExportBackup(): string {
  const backup: SlothDeskBackup = {
    app: 'SlothDesk AI',
    version: STORAGE_VERSION,
    exportDate: new Date().toISOString(),
    tasks: loadTasks(),
    garden: loadGarden(),
    activities: loadActivities(),
    planner: loadPlanner(),
    settings: loadSettings(),
    quickNotes: loadQuickNotes(),
  };
  return JSON.stringify(backup, null, 2);
}

export function validateBackupJson(jsonString: string): {
  isValid: boolean;
  error?: string;
  data?: SlothDeskBackup;
  summary?: { taskCount: number; leafCount: number; plannerBlocks: number };
} {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, error: 'File content is not a valid JSON object.' };
    }

    if (parsed.app !== 'SlothDesk AI' && !parsed.tasks) {
      return { isValid: false, error: 'Unrecognized backup file. Missing SlothDesk structure.' };
    }

    if (!Array.isArray(parsed.tasks)) {
      return { isValid: false, error: 'Backup does not contain a valid tasks array.' };
    }

    // Check for task ID duplicates
    const idSet = new Set<string>();
    for (const t of parsed.tasks) {
      if (!t.id || !t.title) {
        return { isValid: false, error: 'One or more tasks are missing mandatory ID or Title.' };
      }
      if (idSet.has(t.id)) {
        return { isValid: false, error: `Duplicate task ID detected in backup: ${t.id}` };
      }
      idSet.add(t.id);
    }

    const data: SlothDeskBackup = {
      app: 'SlothDesk AI',
      version: parsed.version || '1.0',
      exportDate: parsed.exportDate || new Date().toISOString(),
      tasks: parsed.tasks,
      garden: parsed.garden && typeof parsed.garden.leafCount === 'number' ? parsed.garden : INITIAL_GARDEN,
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      planner: Array.isArray(parsed.planner) ? parsed.planner : [],
      settings: parsed.settings || INITIAL_SETTINGS,
      quickNotes: Array.isArray(parsed.quickNotes) ? parsed.quickNotes : [],
    };

    return {
      isValid: true,
      data,
      summary: {
        taskCount: data.tasks.length,
        leafCount: data.garden.leafCount,
        plannerBlocks: data.planner.length,
      },
    };
  } catch (err: any) {
    return { isValid: false, error: `JSON Parse error: ${err.message}` };
  }
}

export function restoreBackup(backup: SlothDeskBackup): void {
  saveTasks(backup.tasks);
  saveGarden(backup.garden);
  saveActivities(backup.activities);
  savePlanner(backup.planner);
  saveSettings(backup.settings);
  if (backup.quickNotes) {
    saveQuickNotes(backup.quickNotes);
  }
}
