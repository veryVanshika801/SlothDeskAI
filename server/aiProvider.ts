import { GoogleGenAI } from '@google/genai';

export interface AIProviderStatus {
  isConfigured: boolean;
  provider: 'gemini' | 'openweight' | 'demo';
  providerLabel: string;
  modelName: string;
  isOpenWeight: boolean;
  statusMessage: string;
  isDemoMode: boolean;
}

export interface TaskOrganizerOutput {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimatedMinutes: number;
  tags: string[];
  suggestedNextAction: string;
  suggestedDue: string | null;
}

export interface LowEnergyOutput {
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

export interface BreakdownStepOutput {
  id: string;
  title: string;
  estimatedMinutes: number;
  starterAction: string;
}

export interface NoteAnalysisOutput {
  conciseSummary: string;
  keyPoints: string[];
  decisions: string[];
  extractedActions: {
    title: string;
    priority: 'low' | 'medium' | 'high';
    estimatedMinutes: number;
    explicitDateMentioned: string | null;
    isExplicitInSource: boolean;
  }[];
  explicitDates: string[];
  openQuestionsOrAmbiguities: string[];
}

export interface ScheduleBlockOutput {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  isBreak: boolean;
  taskId?: string;
  energyLevel: 'low' | 'normal' | 'high';
}

export interface QuickCaptureOutput {
  tasks: {
    title: string;
    priority: 'low' | 'medium' | 'high';
    estimatedMinutes: number;
  }[];
  notes: string[];
  ideas: string[];
  deadlines: {
    title: string;
    date: string;
  }[];
}

export interface RescheduleOutput {
  headline: string;
  explanation: string;
  adjustedBlocks: ScheduleBlockOutput[];
  deferredTasks: string[];
}

// ---------------------------------------------------------------------------
// Provider Detection & Factory
// ---------------------------------------------------------------------------

export function getAIProviderConfig() {
  const preferredProvider = process.env.AI_PROVIDER?.toLowerCase() || '';
  const geminiKey = process.env.GEMINI_API_KEY;
  const hasGemini = Boolean(geminiKey && geminiKey !== 'MY_GEMINI_API_KEY');

  const openweightKey = process.env.OPENWEIGHT_API_KEY;
  const openweightBase = process.env.OPENWEIGHT_BASE_URL || 'https://api.groq.com/openai/v1';
  const openweightModel = process.env.OPENWEIGHT_MODEL || 'google/gemma-2-9b-it';
  const hasOpenWeight = Boolean(openweightKey && openweightKey !== 'MY_OPENWEIGHT_API_KEY');

  if (preferredProvider === 'openweight' && hasOpenWeight) {
    return {
      type: 'openweight' as const,
      model: openweightModel,
      apiKey: openweightKey!,
      baseUrl: openweightBase,
    };
  }

  if (hasGemini) {
    return {
      type: 'gemini' as const,
      model: 'gemini-3.8-flash',
      apiKey: geminiKey!,
    };
  }

  if (hasOpenWeight) {
    return {
      type: 'openweight' as const,
      model: openweightModel,
      apiKey: openweightKey!,
      baseUrl: openweightBase,
    };
  }

  return {
    type: 'demo' as const,
    model: 'Local Deterministic Heuristic Engine',
  };
}

export function getProviderStatus(): AIProviderStatus {
  const config = getAIProviderConfig();

  if (config.type === 'gemini') {
    return {
      isConfigured: true,
      provider: 'gemini',
      providerLabel: 'Google Gemini',
      modelName: 'gemini-3.8-flash',
      isOpenWeight: false,
      statusMessage: 'Live Google Gemini 3.8 Flash model connected via server proxy.',
      isDemoMode: false,
    };
  }

  if (config.type === 'openweight') {
    return {
      isConfigured: true,
      provider: 'openweight',
      providerLabel: 'Open-Weight Inference Engine',
      modelName: config.model,
      isOpenWeight: true,
      statusMessage: `Live genuine open-weight model (${config.model}) connected via compatible inference provider.`,
      isDemoMode: false,
    };
  }

  return {
    isConfigured: false,
    provider: 'demo',
    providerLabel: 'Local Heuristics Engine',
    modelName: 'Deterministic Client Heuristics',
    isOpenWeight: true,
    statusMessage:
      'Running in clearly labelled Demo Mode. Configure GEMINI_API_KEY or OPENWEIGHT_API_KEY to activate live AI inference.',
    isDemoMode: true,
  };
}

// ---------------------------------------------------------------------------
// Unified Generation Dispatcher with Timeout & Schema Validation
// ---------------------------------------------------------------------------

async function callProvider(prompt: string, systemInstruction: string, timeoutMs = 15000): Promise<string> {
  const config = getAIProviderConfig();

  if (config.type === 'demo') {
    throw new Error('DEMO_MODE_ACTIVE');
  }

  // 1. Google Gemini Provider
  if (config.type === 'gemini') {
    const ai = new GoogleGenAI({
      apiKey: config.apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI inference request timed out (15s limit)')), timeoutMs)
    );

    const generatePromise = ai.models.generateContent({
      model: config.model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const text = response.text?.trim();
    if (!text) throw new Error('Received empty response from Gemini model');
    return text;
  }

  // 2. Open-Weight Provider (OpenAI/OpenRouter/Groq compatible)
  if (config.type === 'openweight') {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Open-weight inference provider error (${res.status}): ${errorText.slice(0, 150)}`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('Empty response from open-weight model');
      return content;
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error('Unsupported AI provider configuration');
}

// ---------------------------------------------------------------------------
// 1. Task Organizer
// ---------------------------------------------------------------------------

export async function organizeMessyNotesAI(text: string): Promise<{ tasks: TaskOrganizerOutput[]; source: string }> {
  const systemInstruction = `You are SlothDesk AI, a calm, intelligent productivity companion.
Your goal is to turn unstructured brain dumps, messages, or fragmented notes into a clean, prioritized list of actionable tasks.
Preserve the user's authentic intent. Remove clear duplicates.
Never invent artificial deadlines unless explicitly mentioned.
Always output pure valid JSON matching this schema:
{
  "tasks": [
    {
      "id": "string",
      "title": "string (clear, active task title)",
      "description": "string (helpful context)",
      "priority": "low" | "medium" | "high",
      "category": "string (e.g. Work, Study, Self-Care, Admin, Home)",
      "estimatedMinutes": number (realistic duration: 10, 15, 25, 45, 60),
      "tags": ["string"],
      "suggestedNextAction": "string (first 2-minute step)",
      "suggestedDue": "string or null (only if explicitly in input)"
    }
  ]
}`;

  try {
    const rawJson = await callProvider(
      `Please convert this messy brain dump into organized tasks:\n"""${text}"""`,
      systemInstruction
    );
    const parsed = JSON.parse(rawJson);
    const taskList = Array.isArray(parsed) ? parsed : parsed.tasks || [];
    if (!Array.isArray(taskList) || taskList.length === 0) {
      throw new Error('Model returned an empty task list');
    }

    const validated: TaskOrganizerOutput[] = taskList.map((t: any, idx: number) => ({
      id: t.id || `ai-task-${Date.now()}-${idx}`,
      title: String(t.title || 'Untitled Task').trim(),
      description: String(t.description || '').trim(),
      priority: ['low', 'medium', 'high'].includes(t.priority) ? t.priority : 'medium',
      category: String(t.category || 'General').trim(),
      estimatedMinutes: Number(t.estimatedMinutes) > 0 ? Number(t.estimatedMinutes) : 25,
      tags: Array.isArray(t.tags) ? t.tags.map(String) : ['Organized'],
      suggestedNextAction: String(t.suggestedNextAction || 'Open materials and begin first small step'),
      suggestedDue: t.suggestedDue ? String(t.suggestedDue) : null,
    }));

    return { tasks: validated, source: 'live_ai' };
  } catch (err: any) {
    if (err.message !== 'DEMO_MODE_ACTIVE') {
      console.warn('Live AI organize error, utilizing safe deterministic fallback:', err.message);
    }

    // High quality deterministic fallback
    const items = text
      .split(/[\n,;•·\-]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);

    const fallbackTasks: TaskOrganizerOutput[] = items.slice(0, 8).map((line, idx) => {
      const lower = line.toLowerCase();
      let priority: 'low' | 'medium' | 'high' = 'medium';
      let category = 'General';
      let mins = 20;

      if (lower.includes('urgent') || lower.includes('deadline') || lower.includes('exam') || lower.includes('submit')) {
        priority = 'high';
        mins = 35;
      } else if (lower.includes('tea') || lower.includes('water') || lower.includes('walk') || lower.includes('stretch')) {
        priority = 'low';
        category = 'Self-Care';
        mins = 10;
      } else if (lower.includes('study') || lower.includes('read') || lower.includes('chapter')) {
        category = 'Study';
        mins = 30;
      } else if (lower.includes('email') || lower.includes('meeting') || lower.includes('slides')) {
        category = 'Work';
        mins = 25;
      }

      return {
        id: `demo-task-${Date.now()}-${idx}`,
        title: line.charAt(0).toUpperCase() + line.slice(1),
        description: 'Organized calmly from your notes.',
        priority,
        category,
        estimatedMinutes: mins,
        tags: [category, priority === 'high' ? 'Priority' : 'Gentle'],
        suggestedNextAction: `Spend 5 minutes setting up for ${line}`,
        suggestedDue: null,
      };
    });

    return { tasks: fallbackTasks, source: 'demo_fallback' };
  }
}

// ---------------------------------------------------------------------------
// 2. Low-Energy Mode
// ---------------------------------------------------------------------------

export async function generateLowEnergyPlanAI(
  tasks: Array<{ id: string; title: string; priority: string }>,
  energyLevel: 'low' | 'normal' | 'high',
  availableMinutes: number
): Promise<{ plan: LowEnergyOutput; source: string }> {
  const systemInstruction = `You are SlothDesk AI. A user is experiencing ${energyLevel} energy with ~${availableMinutes} minutes available.
Create a supportive, realistic plan that prevents burnout.
Rules:
- Never assume they are lazy. Use calm, compassionate language.
- If tasks list is empty, gently suggest 1 restful, grounding activity instead of hallucinating tasks.
- If tasks exist, select ONE single most manageable and emotionally relieving task.
- Provide 3 tiny, frictionless steps to start it immediately without dread.
- Select 1-2 optional gentle bonus tasks.
- Explicitly list which heavier tasks can be shelved/postponed without guilt.

Output JSON strictly:
{
  "headline": "string",
  "compassionateNote": "string",
  "primaryManageableTask": {
    "id": "string",
    "title": "string",
    "whyThisFirst": "string",
    "immediateSmallSteps": ["string", "string", "string"],
    "estimatedMinutes": number
  },
  "optionalGentleTasks": [
    { "title": "string", "estimatedMinutes": number }
  ],
  "canPostponeWithoutGuilt": ["string"]
}`;

  try {
    const rawJson = await callProvider(
      `Current tasks: ${JSON.stringify(tasks)}. Available time: ${availableMinutes} mins. Energy: ${energyLevel}`,
      systemInstruction
    );
    const plan: LowEnergyOutput = JSON.parse(rawJson);
    return { plan, source: 'live_ai' };
  } catch (err: any) {
    if (err.message !== 'DEMO_MODE_ACTIVE') {
      console.warn('Live AI low-energy error, using safe fallback:', err.message);
    }

    const firstTask = tasks[0] || {
      id: 'rest-task',
      title: 'Tidy one corner of desk and drink warm water',
      priority: 'low',
    };

    return {
      plan: {
        headline: energyLevel === 'low' ? 'Low-Energy Sanctuary: Just One Thing' : 'Gentle Pacing Mode',
        compassionateNote:
          'Energy naturally ebbs and flows. Progress is not about pushing until exhaustion; it is about honoring today\'s capacity.',
        primaryManageableTask: {
          id: firstTask.id,
          title: firstTask.title,
          whyThisFirst: 'Brings high mental relief with minimum cognitive strain.',
          immediateSmallSteps: [
            'Pour yourself a glass of water or tea.',
            'Open the workspace for just 5 minutes with zero expectation of finishing.',
            'Stop when friction feels too heavy and acknowledge your effort.',
          ],
          estimatedMinutes: Math.min(20, availableMinutes),
        },
        optionalGentleTasks: [
          { title: 'Gentle hydration & gaze out the window', estimatedMinutes: 5 },
          { title: 'Tidy loose desktop notes', estimatedMinutes: 10 },
        ],
        canPostponeWithoutGuilt: tasks.slice(1, 4).map((t) => t.title),
      },
      source: 'demo_fallback',
    };
  }
}

// ---------------------------------------------------------------------------
// 3. Make It Smaller
// ---------------------------------------------------------------------------

export async function breakdownTaskAI(
  taskTitle: string,
  taskDescription: string,
  stepCount = 4
): Promise<{ steps: BreakdownStepOutput[]; source: string }> {
  const systemInstruction = `You are SlothDesk AI. Break down the user's specific task into ${stepCount} distinct, task-specific, low-friction micro-actions.
IMPORTANT: The breakdown MUST be customized to the domain of the task (e.g. coding tasks get code-specific steps; writing gets writing-specific steps; cleaning gets room-specific steps).
Each step must:
- Start with a concrete action verb.
- Be small enough that anyone can begin in under 10 seconds.
- Have a realistic duration between 5 and 15 minutes.
- Include a 30-second "starterAction" to eliminate friction.

Output JSON strictly:
{
  "steps": [
    {
      "id": "string",
      "title": "string",
      "estimatedMinutes": number,
      "starterAction": "string"
    }
  ]
}`;

  try {
    const rawJson = await callProvider(
      `Task: "${taskTitle}"\nContext: "${taskDescription || ''}"\nDesired steps: ${stepCount}`,
      systemInstruction
    );
    const parsed = JSON.parse(rawJson);
    const steps = Array.isArray(parsed) ? parsed : parsed.steps || [];
    return { steps, source: 'live_ai' };
  } catch (err: any) {
    if (err.message !== 'DEMO_MODE_ACTIVE') {
      console.warn('Live AI breakdown error, using safe fallback:', err.message);
    }

    const domain = taskTitle.toLowerCase();
    let sampleSteps: BreakdownStepOutput[] = [];

    if (domain.includes('code') || domain.includes('bug') || domain.includes('api') || domain.includes('build')) {
      sampleSteps = [
        { id: `step-${Date.now()}-1`, title: 'Open editor and locate the specific file or function', estimatedMinutes: 5, starterAction: 'Launch IDE' },
        { id: `step-${Date.now()}-2`, title: 'Add console logs or reproduce the target behavior', estimatedMinutes: 10, starterAction: 'Run local dev command' },
        { id: `step-${Date.now()}-3`, title: 'Write the simplest 10 lines of code to test the hypothesis', estimatedMinutes: 15, starterAction: 'Type one test line' },
        { id: `step-${Date.now()}-4`, title: 'Verify, clean up comments, and commit changes', estimatedMinutes: 10, starterAction: 'Run git status' },
      ];
    } else if (domain.includes('write') || domain.includes('essay') || domain.includes('thesis') || domain.includes('draft')) {
      sampleSteps = [
        { id: `step-${Date.now()}-1`, title: 'Open a blank document and write 3 rough bullet points', estimatedMinutes: 5, starterAction: 'Create document' },
        { id: `step-${Date.now()}-2`, title: 'Flesh out the first bullet with 2 paragraphs without editing', estimatedMinutes: 15, starterAction: 'Type rough thoughts' },
        { id: `step-${Date.now()}-3`, title: 'Add supporting evidence or examples to section', estimatedMinutes: 15, starterAction: 'Paste 1 reference' },
        { id: `step-${Date.now()}-4`, title: 'Quick read-through for flow, then step away', estimatedMinutes: 10, starterAction: 'Save file' },
      ];
    } else {
      sampleSteps = [
        { id: `step-${Date.now()}-1`, title: `Gather files and tools needed for "${taskTitle}"`, estimatedMinutes: 5, starterAction: 'Clear immediate surface' },
        { id: `step-${Date.now()}-2`, title: 'Identify and outline the very first milestone', estimatedMinutes: 10, starterAction: 'Jot down 2 notes' },
        { id: `step-${Date.now()}-3`, title: 'Work steadily for 15 minutes with no distractions', estimatedMinutes: 15, starterAction: 'Put phone face down' },
        { id: `step-${Date.now()}-4`, title: 'Review progress, save state, and celebrate small step', estimatedMinutes: 5, starterAction: 'Take 3 deep breaths' },
      ];
    }

    return { steps: sampleSteps.slice(0, stepCount), source: 'demo_fallback' };
  }
}

// ---------------------------------------------------------------------------
// 4. Note-to-Action Converter
// ---------------------------------------------------------------------------

export async function convertNotesToActionsAI(notes: string): Promise<{ analysis: NoteAnalysisOutput; source: string }> {
  const systemInstruction = `You are SlothDesk AI. Analyze the provided meeting notes, lecture, or thoughts.
Rules:
- conciseSummary: 2-3 clear sentences.
- keyPoints: 3-5 high-signal takeaways.
- decisions: items explicitly decided upon.
- extractedActions: concrete tasks. Mark isExplicitInSource=true only if explicitly stated by author; false if inferred.
- explicitDates: array of dates EXPLICITLY written in source (do NOT invent dates).
- openQuestionsOrAmbiguities: unresolved questions or missing context.

Output JSON strictly:
{
  "conciseSummary": "string",
  "keyPoints": ["string"],
  "decisions": ["string"],
  "extractedActions": [
    {
      "title": "string",
      "priority": "low" | "medium" | "high",
      "estimatedMinutes": number,
      "explicitDateMentioned": "string or null",
      "isExplicitInSource": boolean
    }
  ],
  "explicitDates": ["string"],
  "openQuestionsOrAmbiguities": ["string"]
}`;

  try {
    const rawJson = await callProvider(`Notes to analyze:\n"""${notes}"""`, systemInstruction);
    const analysis: NoteAnalysisOutput = JSON.parse(rawJson);
    return { analysis, source: 'live_ai' };
  } catch (err: any) {
    if (err.message !== 'DEMO_MODE_ACTIVE') {
      console.warn('Live AI notes analysis error, using safe fallback:', err.message);
    }

    const lines = notes.split('\n').filter((l) => l.trim().length > 0);
    const actions = lines
      .filter((l) => /todo|action|must|should|need to|prepare|send|write|discuss/i.test(l))
      .slice(0, 5)
      .map((l, i) => ({
        title: l.replace(/^[*\-•\d.]+\s*/, '').trim(),
        priority: (i === 0 ? 'high' : 'medium') as any,
        estimatedMinutes: 20,
        explicitDateMentioned: null,
        isExplicitInSource: true,
      }));

    if (actions.length === 0) {
      actions.push({
        title: 'Review key points and confirm next milestones',
        priority: 'medium',
        estimatedMinutes: 15,
        explicitDateMentioned: null,
        isExplicitInSource: false,
      });
    }

    return {
      analysis: {
        conciseSummary:
          notes.length > 80
            ? notes.slice(0, 150) + '...'
            : 'Extracted key decisions and actionable outcomes from your notes.',
        keyPoints: lines.slice(0, 3).map((l) => l.replace(/^[*\-•\d.]+\s*/, '').trim()),
        decisions: ['Agreed to keep steady, unhurried pace on deliverables.'],
        extractedActions: actions,
        explicitDates: [],
        openQuestionsOrAmbiguities: ['Are there external dependencies before starting these tasks?'],
      },
      source: 'demo_fallback',
    };
  }
}

// ---------------------------------------------------------------------------
// 5. Slow Planner
// ---------------------------------------------------------------------------

export async function generateSlowScheduleAI(
  tasks: Array<{ id: string; title: string; priority: string; estimatedMinutes?: number }>,
  availableHours: number
): Promise<{ schedule: ScheduleBlockOutput[]; source: string; isOverloaded: boolean }> {
  const totalTaskMins = tasks.reduce((acc, t) => acc + (t.estimatedMinutes || 25), 0);
  const totalAvailableMins = availableHours * 60;
  const isOverloaded = totalTaskMins > totalAvailableMins * 0.8; // Need at least 20% buffer

  const systemInstruction = `You are SlothDesk AI, an unhurried daily planner.
Schedule non-overlapping time blocks starting at 09:00 for ${availableHours} hours total.
Rules:
- NEVER overlap time blocks.
- Schedule mindful pauses and tea/stretch breaks between focus blocks.
- Respect the total available duration strictly.
- Format all times in 24h format (e.g. "09:00", "09:45").

Output JSON array:
[
  {
    "id": "block-1",
    "startTime": "09:00",
    "endTime": "09:45",
    "title": "string",
    "isBreak": boolean,
    "taskId": "string or null",
    "energyLevel": "low" | "normal" | "high"
  }
]`;

  try {
    const rawJson = await callProvider(
      `Tasks: ${JSON.stringify(tasks)}\nAvailable hours: ${availableHours}`,
      systemInstruction
    );
    const parsed = JSON.parse(rawJson);
    const schedule: ScheduleBlockOutput[] = Array.isArray(parsed) ? parsed : parsed.schedule || [];
    return { schedule, source: 'live_ai', isOverloaded };
  } catch (err: any) {
    if (err.message !== 'DEMO_MODE_ACTIVE') {
      console.warn('Live AI planner error, using safe fallback:', err.message);
    }

    const blocks: ScheduleBlockOutput[] = [
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
        title: 'Sloth herbal tea & mindful window gazing',
        isBreak: true,
        energyLevel: 'low',
      },
      {
        id: `block-${Date.now()}-3`,
        startTime: '10:05',
        endTime: '10:50',
        title: tasks[1]?.title || 'Main objective deep work',
        isBreak: false,
        taskId: tasks[1]?.id,
        energyLevel: 'high',
      },
      {
        id: `block-${Date.now()}-4`,
        startTime: '10:50',
        endTime: '11:15',
        title: 'Calm stretch & posture reset',
        isBreak: true,
        energyLevel: 'low',
      },
      {
        id: `block-${Date.now()}-5`,
        startTime: '11:15',
        endTime: '11:45',
        title: tasks[2]?.title || 'Gentle wrap-up & inbox review',
        isBreak: false,
        taskId: tasks[2]?.id,
        energyLevel: 'low',
      },
    ];

    return { schedule: blocks.slice(0, Math.max(3, availableHours + 1)), source: 'demo_fallback', isOverloaded };
  }
}

// ---------------------------------------------------------------------------
// 6. Quick Capture / Brain Dump (Feature 6A)
// ---------------------------------------------------------------------------

export async function quickCaptureAI(rawText: string): Promise<{ result: QuickCaptureOutput; source: string }> {
  const systemInstruction = `You are SlothDesk AI. The user entered an unstructured brain dump.
Classify every thought into:
- tasks: actionable to-dos with priority and estimatedMinutes.
- notes: valuable reference thoughts or observations.
- ideas: creative or future possibilities.
- deadlines: time-sensitive commitments mentioned.

Output pure JSON:
{
  "tasks": [{ "title": "string", "priority": "low"|"medium"|"high", "estimatedMinutes": number }],
  "notes": ["string"],
  "ideas": ["string"],
  "deadlines": [{ "title": "string", "date": "string" }]
}`;

  try {
    const rawJson = await callProvider(`Brain dump:\n"""${rawText}"""`, systemInstruction);
    const result: QuickCaptureOutput = JSON.parse(rawJson);
    return { result, source: 'live_ai' };
  } catch (err: any) {
    if (err.message !== 'DEMO_MODE_ACTIVE') {
      console.warn('Live AI quick capture error, using safe fallback:', err.message);
    }

    const lines = rawText.split(/[\n;•]+/).map((l) => l.trim()).filter((l) => l.length > 2);
    const tasks: any[] = [];
    const notes: string[] = [];
    const ideas: string[] = [];
    const deadlines: any[] = [];

    lines.forEach((line) => {
      const lower = line.toLowerCase();
      if (lower.includes('idea') || lower.includes('maybe') || lower.includes('what if')) {
        ideas.push(line);
      } else if (lower.includes('due') || lower.includes('by') || lower.includes('tomorrow') || lower.includes('friday')) {
        deadlines.push({ title: line, date: 'Upcoming' });
      } else if (lower.includes('note') || lower.includes('remember') || lower.includes('info')) {
        notes.push(line);
      } else {
        tasks.push({
          title: line,
          priority: lower.includes('urgent') ? 'high' : 'medium',
          estimatedMinutes: 20,
        });
      }
    });

    return {
      result: {
        tasks: tasks.length > 0 ? tasks : [{ title: rawText.slice(0, 40), priority: 'medium', estimatedMinutes: 20 }],
        notes,
        ideas,
        deadlines,
      },
      source: 'demo_fallback',
    };
  }
}

// ---------------------------------------------------------------------------
// 7. Smart Rescheduling (Feature 6C)
// ---------------------------------------------------------------------------

export async function smartRescheduleAI(
  openTasks: Array<{ id: string; title: string; priority: string; estimatedMinutes?: number }>,
  remainingMinutesToday: number
): Promise<{ reschedule: RescheduleOutput; source: string }> {
  const systemInstruction = `You are SlothDesk AI, a compassionate productivity coach.
The user is running behind schedule or energy has dropped. They have only ${remainingMinutesToday} minutes left today.
Select ONLY what fits comfortably within the remaining time.
Explicitly defer all lower-priority or heavy tasks to tomorrow with zero guilt or shame.

Output pure JSON:
{
  "headline": "string (reassuring headline)",
  "explanation": "string (calm explanation)",
  "adjustedBlocks": [
    {
      "id": "string",
      "startTime": "string (e.g. 14:00)",
      "endTime": "string",
      "title": "string",
      "isBreak": boolean,
      "energyLevel": "low" | "normal"
    }
  ],
  "deferredTasks": ["string"]
}`;

  try {
    const rawJson = await callProvider(
      `Open tasks: ${JSON.stringify(openTasks)}\nRemaining minutes today: ${remainingMinutesToday}`,
      systemInstruction
    );
    const reschedule: RescheduleOutput = JSON.parse(rawJson);
    return { reschedule, source: 'live_ai' };
  } catch (err: any) {
    if (err.message !== 'DEMO_MODE_ACTIVE') {
      console.warn('Live AI reschedule error, using safe fallback:', err.message);
    }

    const topTask = openTasks[0] || { title: 'Tidy up and close tabs for the day' };
    const deferred = openTasks.slice(1).map((t) => t.title);

    return {
      reschedule: {
        headline: 'Gentle Recovery Schedule: Protect Your Evening',
        explanation:
          'When plans get disrupted, the smartest move is to downshift cleanly rather than stress-multitasking. We preserved just one essential outcome.',
        adjustedBlocks: [
          {
            id: `adj-${Date.now()}-1`,
            startTime: '14:00',
            endTime: '14:35',
            title: topTask.title,
            isBreak: false,
            energyLevel: 'normal',
          },
          {
            id: `adj-${Date.now()}-2`,
            startTime: '14:35',
            endTime: '15:00',
            title: 'Evening close-down & tea ritual',
            isBreak: true,
            energyLevel: 'low',
          },
        ],
        deferredTasks: deferred.length > 0 ? deferred : ['Non-critical inbox processing'],
      },
      source: 'demo_fallback',
    };
  }
}
