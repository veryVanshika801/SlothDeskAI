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
  starterAction?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  dueDate?: string;
  estimatedMinutes?: number;
  category?: string;
  tags?: string[];
  subtasks?: Subtask[];
  suggestedNextAction?: string;
  createdAt: string;
  completedAt?: string;
  energyLevel?: EnergyLevel;
}

export type MascotState =
  | 'idle'
  | 'thinking'
  | 'generating'
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
    | 'task_uncompleted'
    | 'task_updated'
    | 'task_deleted'
    | 'ai_organize'
    | 'ai_low_energy'
    | 'ai_breakdown'
    | 'ai_notes'
    | 'ai_quick_capture'
    | 'ai_reschedule'
    | 'planner_saved'
    | 'garden_reset';
  title: string;
  details?: string;
  undoable?: boolean;
  undoPayload?: any;
}

export interface SlothGardenData {
  leafCount: number;
  treeStage: number; // 1 to 5
  lastHarvestDate?: string;
  completedTaskIds: string[]; // Prevents duplicate leaf rewards on re-completion
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
  provider: 'gemini' | 'openweight' | 'demo';
  providerLabel: string;
  modelName: string;
  isOpenWeight: boolean;
  statusMessage: string;
  isDemoMode: boolean;
}

export interface OrganizedTaskProposal {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  estimatedMinutes: number;
  tags: string[];
  suggestedNextAction?: string;
  suggestedDue?: string | null;
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
  decisions: string[];
  extractedActions: {
    title: string;
    priority: Priority;
    estimatedMinutes: number;
    explicitDateMentioned?: string | null;
    isExplicitInSource: boolean;
  }[];
  explicitDates: string[];
  openQuestionsOrAmbiguities: string[];
}

export interface QuickCaptureItem {
  tasks: Array<{
    title: string;
    priority: Priority;
    estimatedMinutes: number;
    selected: boolean;
  }>;
  notes: Array<{ text: string; selected: boolean }>;
  ideas: Array<{ text: string; selected: boolean }>;
  deadlines: Array<{ title: string; date: string; selected: boolean }>;
}

export interface ReschedulePlan {
  headline: string;
  explanation: string;
  adjustedBlocks: TimeBlock[];
  deferredTasks: string[];
}

export interface DocumentSummaryResult {
  fileName: string;
  fileSize: number;
  summary: string;
  keyPoints: string[];
  extractedActions: Array<{
    title: string;
    priority: Priority;
    estimatedMinutes: number;
  }>;
  sourceSnippets: string[];
}
