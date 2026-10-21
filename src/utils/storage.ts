import {
  Task,
  ActivityItem,
  SlothGardenData,
  TimeBlock,
  AppSettings,
  EnergyLevel,
  FocusSession,
  WeeklyReflectionData,
} from '../types';

const STORAGE_VERSION = '2.1';
const STORAGE_PREFIX = 'slothdesk_';

export const KEYS = {
  VERSION: `${STORAGE_PREFIX}version`,
  TASKS: `${STORAGE_PREFIX}tasks`,
  ACTIVITIES: `${STORAGE_PREFIX}activities`,
  GARDEN: `${STORAGE_PREFIX}garden`,
  PLANNER: `${STORAGE_PREFIX}planner`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  QUICK_NOTES: `${STORAGE_PREFIX}quick_notes`,
  FOCUS_SESSIONS: `${STORAGE_PREFIX}focus_sessions`,
  WEEKLY_REFLECTIONS: `${STORAGE_PREFIX}weekly_reflections`,
  CURRENT_ENERGY: `${STORAGE_PREFIX}current_energy`,
  ACTIVE_FOCUS_STATE: `${STORAGE_PREFIX}active_focus_state`,
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

export const INITIAL_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: 'foc-init-1',
    taskId: 'task-3',
    taskTitle: 'Take an unplugged 15-minute tea break',
    durationMinutes: 15,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    mode: 'timed',
  },
  {
    id: 'foc-init-2',
    taskTitle: 'Mindful Morning Setup',
    durationMinutes: 25,
    completedAt: new Date().toISOString(),
    mode: 'timed',
  },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'task_completed',
    title: 'Completed "Take an unplugged 15-minute tea break"',
    details: 'Sprouted leaf #7 in Sloth Garden 🌿',
    undoable: true,
    undoPayload: { taskId: 'task-3' },
  },
  {
    id: 'act-2',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    type: 'ai_organize',
    title: 'Organized messy brain dump notes',
    details: 'Derived 3 clean focus milestones',
  },
  {
    id: 'act-3',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    type: 'task_created',
    title: 'Created task "Review team feedback notes"',
    details: 'Priority: MEDIUM',
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
    title: 'Sloth herbal tea & balcony window gaze',
    isBreak: true,
    energyLevel: 'low',
  },
  {
    id: 'block-3',
    startTime: '10:05',
    endTime: '10:50',
    title: 'Review team feedback notes',
    isBreak: false,
    taskId: 'task-2',
    energyLevel: 'high',
  },
  {
    id: 'block-4',
    startTime: '10:50',
    endTime: '11:15',
    title: 'Gentle stretch & posture reset',
    isBreak: true,
    energyLevel: 'low',
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  reducedMotion: false,
  defaultEnergy: 'normal',
  theme: 'soft-cream',
  aiModelPreference: 'auto',
};

// Safe LocalStorage access helper
function safeGet<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const item = window.localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Failed to read ${key} from localStorage, using fallback:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

// ---------------------------------------------------------------------------
// Load & Save Methods
// ---------------------------------------------------------------------------

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

export function loadCurrentEnergy(): EnergyLevel {
  const loaded = safeGet<EnergyLevel>(KEYS.CURRENT_ENERGY, 'normal');
  return ['low', 'normal', 'high'].includes(loaded) ? loaded : 'normal';
}

export function saveCurrentEnergy(energy: EnergyLevel): void {
  safeSet(KEYS.CURRENT_ENERGY, energy);
}

export function loadFocusSessions(): FocusSession[] {
  const loaded = safeGet<FocusSession[]>(KEYS.FOCUS_SESSIONS, INITIAL_FOCUS_SESSIONS);
  if (!Array.isArray(loaded)) return INITIAL_FOCUS_SESSIONS;
  return loaded;
}

export function saveFocusSessions(sessions: FocusSession[]): void {
  safeSet(KEYS.FOCUS_SESSIONS, sessions);
}

export function addFocusSession(session: FocusSession): FocusSession[] {
  const current = loadFocusSessions();
  const updated = [session, ...current];
  saveFocusSessions(updated);
  return updated;
}

export function loadWeeklyReflections(): WeeklyReflectionData[] {
  const loaded = safeGet<WeeklyReflectionData[]>(KEYS.WEEKLY_REFLECTIONS, []);
  if (!Array.isArray(loaded)) return [];
  return loaded;
}

export function saveWeeklyReflections(reflections: WeeklyReflectionData[]): void {
  safeSet(KEYS.WEEKLY_REFLECTIONS, reflections);
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

// Active Focus session persistence (for refresh drift safety)
export interface ActiveFocusState {
  taskId?: string;
  taskTitle: string;
  durationSeconds: number;
  remainingSeconds: number;
  startTimestamp: number;
  isPaused: boolean;
  pausedAt?: number;
}

export function loadActiveFocusState(): ActiveFocusState | null {
  return safeGet<ActiveFocusState | null>(KEYS.ACTIVE_FOCUS_STATE, null);
}

export function saveActiveFocusState(state: ActiveFocusState | null): void {
  if (state === null) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(KEYS.ACTIVE_FOCUS_STATE);
      }
    } catch {}
  } else {
    safeSet(KEYS.ACTIVE_FOCUS_STATE, state);
  }
}

export function clearActiveFocusState(): void {
  saveActiveFocusState(null);
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
// Backup Export & Validated Import
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
  focusSessions?: FocusSession[];
  weeklyReflections?: WeeklyReflectionData[];
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
    focusSessions: loadFocusSessions(),
    weeklyReflections: loadWeeklyReflections(),
    quickNotes: loadQuickNotes(),
  };
  return JSON.stringify(backup, null, 2);
}

export function validateBackupJson(jsonString: string): {
  isValid: boolean;
  error?: string;
  data?: SlothDeskBackup;
  summary?: { taskCount: number; leafCount: number; plannerBlocks: number; focusSessionsCount: number };
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
      focusSessions: Array.isArray(parsed.focusSessions) ? parsed.focusSessions : [],
      weeklyReflections: Array.isArray(parsed.weeklyReflections) ? parsed.weeklyReflections : [],
      quickNotes: Array.isArray(parsed.quickNotes) ? parsed.quickNotes : [],
    };

    return {
      isValid: true,
      data,
      summary: {
        taskCount: data.tasks.length,
        leafCount: data.garden.leafCount,
        plannerBlocks: data.planner.length,
        focusSessionsCount: data.focusSessions?.length || 0,
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
  if (backup.focusSessions) {
    saveFocusSessions(backup.focusSessions);
  }
  if (backup.weeklyReflections) {
    saveWeeklyReflections(backup.weeklyReflections);
  }
  if (backup.quickNotes) {
    saveQuickNotes(backup.quickNotes);
  }
}
