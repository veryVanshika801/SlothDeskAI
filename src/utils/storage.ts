import { Task, ActivityItem, SlothGardenData, TimeBlock, EnergyLevel } from '../types';

const TASKS_KEY = 'slothdesk_tasks';
const ACTIVITIES_KEY = 'slothdesk_activities';
const GARDEN_KEY = 'slothdesk_garden';
const PLANNER_KEY = 'slothdesk_planner';
const SETTINGS_KEY = 'slothdesk_settings';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Draft weekly priorities without rushing',
    description: 'Select at most 3 core outcomes for this week. Keep room for breathing.',
    priority: 'high',
    completed: false,
    estimatedMinutes: 25,
    tags: ['Planning', 'Mindful'],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    energyLevel: 'normal',
    subtasks: [
      { id: 'sub-1', title: 'Open a blank page and jot down raw thoughts', completed: true, estimatedMinutes: 5 },
      { id: 'sub-2', title: 'Pick the one task that relieves the most friction', completed: false, estimatedMinutes: 10 },
      { id: 'sub-3', title: 'Mark everything else as optional bonus', completed: false, estimatedMinutes: 10 },
    ]
  },
  {
    id: 'task-2',
    title: 'Review team feedback notes & distill next steps',
    description: 'Read the summary, extract only 2 actionable items, and file away the rest.',
    priority: 'medium',
    completed: false,
    estimatedMinutes: 30,
    tags: ['Work', 'Communication'],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    energyLevel: 'normal',
    subtasks: [
      { id: 'sub-4', title: 'Skim document highlights', completed: false, estimatedMinutes: 10 },
      { id: 'sub-5', title: 'Send a short 2-sentence confirmation reply', completed: false, estimatedMinutes: 5 }
    ]
  },
  {
    id: 'task-3',
    title: 'Take an unplugged 15-minute tea break',
    description: 'No screens, look at greenery outside, take 3 deep slow breaths.',
    priority: 'low',
    completed: true,
    estimatedMinutes: 15,
    tags: ['Wellness', 'Sloth Pace'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    energyLevel: 'low',
  },
  {
    id: 'task-4',
    title: 'Water windowsill succulents and gentle stretch',
    description: 'Physical movement to reset body posture and calm shoulders.',
    priority: 'low',
    completed: false,
    estimatedMinutes: 10,
    tags: ['Home', 'Self-Care'],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    energyLevel: 'low',
  }
];

export const INITIAL_GARDEN: SlothGardenData = {
  leafCount: 7,
  treeStage: 2,
  historyLogs: [
    { date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10), leavesEarned: 3 },
    { date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), leavesEarned: 3 },
    { date: new Date().toISOString().slice(0, 10), leavesEarned: 1 },
  ]
};

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'task_completed',
    title: 'Completed "Take an unplugged 15-minute tea break"',
    details: 'Sprouted 1 leaf on the Sloth Garden tree 🌿'
  },
  {
    id: 'act-2',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    type: 'task_created',
    title: 'Created task "Draft weekly priorities without rushing"',
    details: 'Set priority to High with 3 micro-steps'
  },
  {
    id: 'act-3',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    type: 'ai_organize',
    title: 'Organized messy brainstorm note',
    details: 'Generated 4 structured tasks via Lazy Task Organizer'
  }
];

export const INITIAL_PLANNER: TimeBlock[] = [
  {
    id: 'block-1',
    startTime: '09:00',
    endTime: '09:45',
    title: 'Draft weekly priorities without rushing',
    isBreak: false,
    taskId: 'task-1',
    energyLevel: 'normal'
  },
  {
    id: 'block-2',
    startTime: '09:45',
    endTime: '10:05',
    title: 'Sloth warm tea & mindful gazing',
    isBreak: true,
    energyLevel: 'low'
  },
  {
    id: 'block-3',
    startTime: '10:05',
    endTime: '10:45',
    title: 'Review team feedback notes',
    isBreak: false,
    taskId: 'task-2',
    energyLevel: 'normal'
  },
  {
    id: 'block-4',
    startTime: '10:45',
    endTime: '11:00',
    title: 'Water windowsill succulents & stretch',
    isBreak: false,
    taskId: 'task-4',
    energyLevel: 'low'
  }
];

export interface AppSettings {
  reducedMotion: boolean;
  defaultEnergy: EnergyLevel;
  theme: 'light' | 'soft-cream';
  aiModelPreference: string;
}

export const INITIAL_SETTINGS: AppSettings = {
  reducedMotion: false,
  defaultEnergy: 'normal',
  theme: 'soft-cream',
  aiModelPreference: 'Gemma 2 9B / Gemini 3.8 Flash'
};

export const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return INITIAL_TASKS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_TASKS;
  }
};

export const saveTasks = (tasks: Task[]) => {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
};

export const loadGarden = (): SlothGardenData => {
  try {
    const raw = localStorage.getItem(GARDEN_KEY);
    if (!raw) return INITIAL_GARDEN;
    return JSON.parse(raw);
  } catch {
    return INITIAL_GARDEN;
  }
};

export const saveGarden = (data: SlothGardenData) => {
  try {
    localStorage.setItem(GARDEN_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save garden', e);
  }
};

export const loadActivities = (): ActivityItem[] => {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    if (!raw) return INITIAL_ACTIVITIES;
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVITIES;
  }
};

export const saveActivities = (activities: ActivityItem[]) => {
  try {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  } catch (e) {
    console.error('Failed to save activities', e);
  }
};

export const loadPlanner = (): TimeBlock[] => {
  try {
    const raw = localStorage.getItem(PLANNER_KEY);
    if (!raw) return INITIAL_PLANNER;
    return JSON.parse(raw);
  } catch {
    return INITIAL_PLANNER;
  }
};

export const savePlanner = (planner: TimeBlock[]) => {
  try {
    localStorage.setItem(PLANNER_KEY, JSON.stringify(planner));
  } catch (e) {
    console.error('Failed to save planner', e);
  }
};

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return INITIAL_SETTINGS;
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};
