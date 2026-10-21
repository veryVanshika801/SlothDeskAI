import {
  AIServiceStatus,
  OrganizedTaskProposal,
  LowEnergyPlan,
  NoteAnalysisResult,
  Subtask,
  TimeBlock,
  Task,
  EnergyLevel,
} from '../types';

export async function fetchAIStatus(): Promise<AIServiceStatus> {
  try {
    const res = await fetch('/api/ai/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      isConfigured: false,
      modelName: 'Gemma 2 9B / Gemini 3.8 Flash (Client Fallback)',
      provider: 'demo',
      statusMessage: 'Demo Mode (Offline / Client Heuristics)',
      isDemoMode: true,
    };
  }
}

export async function organizeMessyNotes(
  text: string
): Promise<{ tasks: OrganizedTaskProposal[]; source: string }> {
  try {
    const res = await fetch('/api/ai/organize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      tasks: data.tasks.map((t: any) => ({ ...t, selected: true })),
      source: data.source || 'demo',
    };
  } catch (err) {
    // Client-side fallback
    const lines = text
      .split(/[\n,;•·\-]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);

    const fallback: OrganizedTaskProposal[] = lines.slice(0, 6).map((line, i) => ({
      id: `task-client-${Date.now()}-${i}`,
      title: line.charAt(0).toUpperCase() + line.slice(1),
      description: 'Extracted with calm clarity from your input.',
      priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
      estimatedMinutes: i === 0 ? 30 : 20,
      tags: ['Organized', 'Calm'],
      suggestedDue: undefined,
      selected: true,
    }));

    return { tasks: fallback, source: 'client_fallback' };
  }
}

export async function generateLowEnergyPlan(
  tasks: Task[],
  energyLevel: EnergyLevel,
  availableMinutes: number
): Promise<{ plan: LowEnergyPlan; source: string }> {
  try {
    const res = await fetch('/api/ai/low-energy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks, energyLevel, availableMinutes }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { plan: data.plan, source: data.source || 'demo' };
  } catch (err) {
    const chosen = tasks.find((t) => !t.completed) || {
      id: 'task-fallback',
      title: 'Take one calm breath and tidy desk surface',
      priority: 'low',
    };
    return {
      plan: {
        headline: 'Gentle Pacing Mode: One Step Is Enough',
        compassionateNote:
          'Energy fluctuates naturally. Honor your capacity today without criticism or comparison.',
        primaryManageableTask: {
          id: chosen.id,
          title: chosen.title,
          whyThisFirst: 'High emotional relief with very low startup resistance.',
          immediateSmallSteps: [
            'Pour yourself a glass of water or warm tea.',
            'Spend just 5 minutes on the easiest part.',
            'Give yourself credit and pause.',
          ],
          estimatedMinutes: Math.min(20, availableMinutes),
        },
        optionalGentleTasks: [
          { title: 'Gentle 10-minute stretch', estimatedMinutes: 10 },
          { title: 'File away loose desktop documents', estimatedMinutes: 5 },
        ],
        canPostponeWithoutGuilt: tasks
          .filter((t) => t.id !== chosen.id && !t.completed)
          .slice(0, 3)
          .map((t) => t.title),
      },
      source: 'client_fallback',
    };
  }
}

export async function breakdownTaskIntoSteps(
  taskTitle: string,
  taskDescription?: string
): Promise<{ steps: Subtask[]; source: string }> {
  try {
    const res = await fetch('/api/ai/breakdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskTitle, taskDescription }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      steps: data.steps.map((s: any, idx: number) => ({
        id: s.id || `step-${Date.now()}-${idx}`,
        title: s.title,
        completed: false,
        estimatedMinutes: s.estimatedMinutes || 10,
      })),
      source: data.source || 'demo',
    };
  } catch (err) {
    return {
      steps: [
        { id: `step-${Date.now()}-1`, title: `Open files and blank workspace for "${taskTitle}"`, completed: false, estimatedMinutes: 5 },
        { id: `step-${Date.now()}-2`, title: 'Draft a quick 3-bullet outline', completed: false, estimatedMinutes: 10 },
        { id: `step-${Date.now()}-3`, title: 'Execute the first bullet only', completed: false, estimatedMinutes: 15 },
        { id: `step-${Date.now()}-4`, title: 'Review and close session calmly', completed: false, estimatedMinutes: 5 },
      ],
      source: 'client_fallback',
    };
  }
}

export async function convertNotesToActions(
  notes: string
): Promise<{ analysis: NoteAnalysisResult; source: string }> {
  try {
    const res = await fetch('/api/ai/notes-to-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { analysis: data.analysis, source: data.source || 'demo' };
  } catch (err) {
    const lines = notes.split('\n').filter((l) => l.trim().length > 0);
    return {
      analysis: {
        conciseSummary:
          notes.length > 80 ? notes.slice(0, 150) + '...' : 'Extracted core actions and discussion items.',
        keyPoints: lines.slice(0, 3).map((l) => l.replace(/^[*\-•\d.]+\s*/, '')),
        extractedActions: lines.slice(0, 3).map((l, i) => ({
          title: l.replace(/^[*\-•\d.]+\s*/, '') || 'Follow up on discussion note',
          priority: (i === 0 ? 'high' : 'medium') as any,
          estimatedMinutes: 20,
        })),
        explicitDates: [],
        openQuestionsOrAmbiguities: ['Are there specific dependencies needed before starting?'],
      },
      source: 'client_fallback',
    };
  }
}

export async function generateSlowSchedule(
  tasks: Task[],
  availableHours: number
): Promise<{ schedule: TimeBlock[]; source: string }> {
  try {
    const res = await fetch('/api/ai/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks, availableHours }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { schedule: data.schedule, source: data.source || 'demo' };
  } catch (err) {
    return {
      schedule: [
        {
          id: `block-${Date.now()}-1`,
          startTime: '09:00',
          endTime: '09:45',
          title: tasks[0]?.title || 'Morning Unhurried Focus',
          isBreak: false,
          taskId: tasks[0]?.id,
          energyLevel: 'normal',
        },
        {
          id: `block-${Date.now()}-2`,
          startTime: '09:45',
          endTime: '10:05',
          title: 'Sloth herbal tea & mindful breathing',
          isBreak: true,
          energyLevel: 'low',
        },
        {
          id: `block-${Date.now()}-3`,
          startTime: '10:05',
          endTime: '10:50',
          title: tasks[1]?.title || 'Main objective progress',
          isBreak: false,
          taskId: tasks[1]?.id,
          energyLevel: 'high',
        },
        {
          id: `block-${Date.now()}-4`,
          startTime: '10:50',
          endTime: '11:15',
          title: 'Gentle break: stretch & gaze',
          isBreak: true,
          energyLevel: 'low',
        },
      ],
      source: 'client_fallback',
    };
  }
}
