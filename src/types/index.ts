export type Priority = 'low' | 'medium' | 'high';
export type EnergyLevel = 'low' | 'normal' | 'high';

export interface AppSettings {
  reducedMotion: boolean;
  defaultEnergy: EnergyLevel;
  theme: 'light' | 'soft-cream';
  aiModelPreference: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  dueDate?: string;
  estimatedMinutes?: number;
  tags?: string[];
  subtasks?: Subtask[];
  createdAt: string;
  completedAt?: string;
  energyLevel?: EnergyLevel;
}

export type MascotState =
  | 'idle'
  | 'thinking'
  | 'low-energy'
  | 'task-completed'
  | 'encouragement'
  | 'empty-state'
  | 'error-state'
  | 'garden';

export interface ActivityItem {
  id: string;
  timestamp: string;
  type:
    | 'task_created'
    | 'task_completed'
    | 'task_updated'
    | 'task_deleted'
    | 'ai_organize'
    | 'ai_low_energy'
    | 'ai_breakdown'
    | 'ai_notes'
    | 'planner_saved'
    | 'garden_reset';
  title: string;
  details?: string;
}

export interface SlothGardenData {
  leafCount: number;
  treeStage: number; // 1 to 5
  lastHarvestDate?: string;
  historyLogs: { date: string; leavesEarned: number }[];
}

export interface TimeBlock {
  id: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "09:45"
  title: string;
  isBreak: boolean;
  taskId?: string;
  energyLevel?: EnergyLevel;
}

export interface AIServiceStatus {
  isConfigured: boolean;
  modelName: string;
  provider: 'gemini' | 'gemma_open_weight' | 'demo';
  statusMessage: string;
  isDemoMode: boolean;
}

export interface OrganizedTaskProposal {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  estimatedMinutes: number;
  tags: string[];
  suggestedDue?: string;
  selected: boolean;
}

export interface LowEnergyPlan {
  headline: string;
  compassionateNote: string;
  primaryManageableTask: {
    id: string;
    title: string;
    whyThisFirst: string;
    immediateSmallSteps: string[];
    estimatedMinutes: number;
  };
  optionalGentleTasks: {
    title: string;
    estimatedMinutes: number;
  }[];
  canPostponeWithoutGuilt: string[];
}

export interface NoteAnalysisResult {
  conciseSummary: string;
  keyPoints: string[];
  extractedActions: {
    title: string;
    priority: Priority;
    estimatedMinutes: number;
    explicitDateMentioned?: string;
  }[];
  explicitDates: string[];
  openQuestionsOrAmbiguities: string[];
}
