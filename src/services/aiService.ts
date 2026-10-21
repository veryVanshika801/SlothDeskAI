import {
  AIServiceStatus,
  OrganizedTaskProposal,
  LowEnergyPlan,
  NoteAnalysisResult,
  Subtask,
  TimeBlock,
  Task,
  EnergyLevel,
  QuickCaptureItem,
  ReschedulePlan,
} from '../types';

// Helper to safely parse JSON responses or throw meaningful error
async function parseResponseOrThrow(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const errorJson = await res.json();
      throw new Error(errorJson.error || errorJson.message || `Server error (${res.status})`);
    } else {
      const errorText = await res.text();
      throw new Error(`Server returned status ${res.status}: ${errorText.slice(0, 120)}`);
    }
  }

  if (!contentType.includes('application/json')) {
    throw new Error('Unexpected server response format (expected JSON)');
  }

  return res.json();
}

export async function fetchAIStatus(): Promise<AIServiceStatus> {
  try {
    const res = await fetch('/api/ai/status');
    const data = await parseResponseOrThrow(res);
    return data;
  } catch (err: any) {
    return {
      isConfigured: false,
      provider: 'demo',
      providerLabel: 'Local Heuristics Engine',
      modelName: 'Local Deterministic Fallback',
      isOpenWeight: true,
      statusMessage: `Demo Mode Active: ${err.message || 'API endpoint offline'}. Local deterministic helpers active.`,
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

    const data = await parseResponseOrThrow(res);
    return {
      tasks: (data.tasks || []).map((t: any) => ({
        ...t,
        category: t.category || 'General',
        suggestedNextAction: t.suggestedNextAction || 'Take first 5 minutes to start',
        selected: true,
      })),
      source: data.source || 'demo_fallback',
    };
  } catch (err: any) {
    console.warn('API organize call failed, applying client-side fallback:', err.message);
    const lines = text
      .split(/[\n,;•·\-]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);

    const fallback: OrganizedTaskProposal[] = lines.slice(0, 6).map((line, i) => ({
      id: `task-client-${Date.now()}-${i}`,
      title: line.charAt(0).toUpperCase() + line.slice(1),
      description: 'Extracted with calm clarity from your input.',
      priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
      category: i === 0 ? 'Focus' : 'General',
      estimatedMinutes: i === 0 ? 30 : 20,
      tags: ['Organized', 'Calm'],
      suggestedNextAction: `Open materials for ${line.slice(0, 25)}`,
      suggestedDue: null,
      selected: true,
    }));

    return { tasks: fallback, source: 'demo_fallback' };
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
      body: JSON.stringify({
        tasks: tasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority })),
        energyLevel,
        availableMinutes,
      }),
    });

    const data = await parseResponseOrThrow(res);
    return { plan: data.plan, source: data.source || 'demo_fallback' };
  } catch (err: any) {
    console.warn('API low-energy call failed, applying client fallback:', err.message);
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
      source: 'demo_fallback',
    };
  }
}

export async function breakdownTaskIntoSteps(
  taskTitle: string,
  taskDescription?: string,
  stepCount = 4
): Promise<{ steps: Subtask[]; source: string }> {
  try {
    const res = await fetch('/api/ai/breakdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskTitle, taskDescription, stepCount }),
    });

    const data = await parseResponseOrThrow(res);
    return {
      steps: (data.steps || []).map((s: any, idx: number) => ({
        id: s.id || `step-${Date.now()}-${idx}`,
        title: s.title,
        completed: false,
        estimatedMinutes: s.estimatedMinutes || 10,
        starterAction: s.starterAction || 'Spend 2 minutes setting up',
      })),
      source: data.source || 'demo_fallback',
    };
  } catch (err: any) {
    console.warn('API breakdown call failed, applying client fallback:', err.message);
    return {
      steps: [
        { id: `step-${Date.now()}-1`, title: `Open files and blank workspace for "${taskTitle}"`, completed: false, estimatedMinutes: 5, starterAction: 'Launch application' },
        { id: `step-${Date.now()}-2`, title: 'Draft a quick 3-bullet outline', completed: false, estimatedMinutes: 10, starterAction: 'Type 3 bullets' },
        { id: `step-${Date.now()}-3`, title: 'Execute the first bullet only', completed: false, estimatedMinutes: 15, starterAction: 'Work for 10 minutes' },
        { id: `step-${Date.now()}-4`, title: 'Review and close session calmly', completed: false, estimatedMinutes: 5, starterAction: 'Save changes' },
      ],
      source: 'demo_fallback',
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

    const data = await parseResponseOrThrow(res);
    return { analysis: data.analysis, source: data.source || 'demo_fallback' };
  } catch (err: any) {
    console.warn('API notes distillation call failed, using client fallback:', err.message);
    const lines = notes.split('\n').filter((l) => l.trim().length > 0);
    return {
      analysis: {
        conciseSummary:
          notes.length > 80 ? notes.slice(0, 150) + '...' : 'Extracted core actions and discussion items.',
        keyPoints: lines.slice(0, 3).map((l) => l.replace(/^[*\-•\d.]+\s*/, '')),
        decisions: ['Prioritized calm forward motion.'],
        extractedActions: lines.slice(0, 3).map((l, i) => ({
          title: l.replace(/^[*\-•\d.]+\s*/, '') || 'Follow up on discussion note',
          priority: (i === 0 ? 'high' : 'medium') as any,
          estimatedMinutes: 20,
          explicitDateMentioned: null,
          isExplicitInSource: true,
        })),
        explicitDates: [],
        openQuestionsOrAmbiguities: ['Are there specific dependencies needed before starting?'],
      },
      source: 'demo_fallback',
    };
  }
}

export async function generateSlowSchedule(
  tasks: Task[],
  availableHours: number
): Promise<{ schedule: TimeBlock[]; source: string; isOverloaded?: boolean }> {
  try {
    const res = await fetch('/api/ai/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: tasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority, estimatedMinutes: t.estimatedMinutes })),
        availableHours,
      }),
    });

    const data = await parseResponseOrThrow(res);
    return {
      schedule: data.schedule || [],
      source: data.source || 'demo_fallback',
      isOverloaded: Boolean(data.isOverloaded),
    };
  } catch (err: any) {
    console.warn('API planner call failed, applying client fallback:', err.message);
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
      source: 'demo_fallback',
      isOverloaded: false,
    };
  }
}

export async function quickCaptureBrainDump(
  rawText: string
): Promise<{ result: QuickCaptureItem; source: string }> {
  try {
    const res = await fetch('/api/ai/quick-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });

    const data = await parseResponseOrThrow(res);
    const parsed = data.result;

    return {
      result: {
        tasks: (parsed.tasks || []).map((t: any) => ({ ...t, selected: true })),
        notes: (parsed.notes || []).map((text: string) => ({ text, selected: true })),
        ideas: (parsed.ideas || []).map((text: string) => ({ text, selected: true })),
        deadlines: (parsed.deadlines || []).map((d: any) => ({ ...d, selected: true })),
      },
      source: data.source || 'demo_fallback',
    };
  } catch (err: any) {
    console.warn('API quick-capture call failed, applying client fallback:', err.message);
    const lines = rawText.split(/[\n;•]+/).map((l) => l.trim()).filter((l) => l.length > 2);
    return {
      result: {
        tasks: lines.slice(0, 3).map((l, i) => ({
          title: l,
          priority: i === 0 ? 'high' : 'medium',
          estimatedMinutes: 20,
          selected: true,
        })),
        notes: lines.slice(3, 5).map((text) => ({ text, selected: true })),
        ideas: [],
        deadlines: [],
      },
      source: 'demo_fallback',
    };
  }
}

export async function requestSmartReschedule(
  openTasks: Task[],
  remainingMinutesToday: number
): Promise<{ reschedule: ReschedulePlan; source: string }> {
  try {
    const res = await fetch('/api/ai/reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        openTasks: openTasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority })),
        remainingMinutesToday,
      }),
    });

    const data = await parseResponseOrThrow(res);
    return { reschedule: data.reschedule, source: data.source || 'demo_fallback' };
  } catch (err: any) {
    console.warn('API reschedule call failed, applying client fallback:', err.message);
    const topTask = openTasks[0] || { title: 'Tidy up and close workspace' };
    return {
      reschedule: {
        headline: 'Guilt-Free Downshift: Preserve Tonight\'s Rest',
        explanation: 'When plans change, scaling back intentionally prevents late-night fatigue and keeps momentum.',
        adjustedBlocks: [
          {
            id: `adj-${Date.now()}-1`,
            startTime: '15:00',
            endTime: '15:35',
            title: topTask.title,
            isBreak: false,
            energyLevel: 'normal',
          },
          {
            id: `adj-${Date.now()}-2`,
            startTime: '15:35',
            endTime: '16:00',
            title: 'Close tabs, drink tea, rest',
            isBreak: true,
            energyLevel: 'low',
          },
        ],
        deferredTasks: openTasks.slice(1).map((t) => t.title),
      },
      source: 'demo_fallback',
    };
  }
}
