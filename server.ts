import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Transparent status endpoint
app.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json({
    isConfigured: !!aiClient,
    modelName: 'Gemma 2 / Gemini 3.8 Flash',
    provider: aiClient ? 'gemini' : 'demo',
    statusMessage: aiClient
      ? 'Live AI Inference Active (Gemini 3.8 Flash / Gemma Open-Weight)'
      : 'Demo Mode Active (Local Heuristics & Deterministic Parsing). Set GEMINI_API_KEY to activate live AI inference.',
    isDemoMode: !aiClient,
  });
});

// 1. Lazy Task Organizer
app.post('/api/ai/organize', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Please provide task notes to organize.' });
  }

  if (aiClient) {
    try {
      const prompt = `You are SlothDesk AI, a calm, intelligent productivity companion.
Analyze the following messy thoughts or task dump and convert them into a structured JSON list of tasks.
Never invent fictitious requirements or strict deadlines unless explicitly stated.
Output ONLY raw JSON matching this schema:
[
  {
    "id": "gen-1",
    "title": "string (clear, active task title)",
    "description": "string (brief context or helpful tip)",
    "priority": "low" | "medium" | "high",
    "estimatedMinutes": number (realistic duration, e.g. 15, 25, 45),
    "tags": ["string"],
    "suggestedDue": "string (optional, only if clearly implied, otherwise null)"
  }
]

User notes:
"""${text}"""`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text?.trim() || '[]';
      const parsed = JSON.parse(responseText);
      return res.json({ tasks: parsed, source: 'live_ai' });
    } catch (err: any) {
      console.warn('AI inference failed, falling back to smart heuristic:', err?.message);
    }
  }

  // Fallback / Demo Mode parser
  const lines = text
    .split(/[\n,;•·\-]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  const fallbackTasks = lines.slice(0, 8).map((line, idx) => {
    let priority: 'low' | 'medium' | 'high' = 'normal' as any;
    const lower = line.toLowerCase();
    if (lower.includes('urgent') || lower.includes('exam') || lower.includes('deadline') || lower.includes('submit')) {
      priority = 'high';
    } else if (lower.includes('tea') || lower.includes('read') || lower.includes('walk') || lower.includes('water')) {
      priority = 'low';
    } else {
      priority = idx === 0 ? 'high' : 'medium';
    }

    return {
      id: `task-parsed-${Date.now()}-${idx}`,
      title: line.charAt(0).toUpperCase() + line.slice(1),
      description: 'Extracted with calm clarity from your notes.',
      priority,
      estimatedMinutes: priority === 'high' ? 30 : priority === 'medium' ? 20 : 15,
      tags: ['Organized', priority === 'low' ? 'Calm' : 'Action'],
      suggestedDue: null,
    };
  });

  return res.json({ tasks: fallbackTasks, source: 'demo_heuristic' });
});

// 2. Low-Energy Mode
app.post('/api/ai/low-energy', async (req: Request, res: Response) => {
  const { tasks = [], energyLevel = 'low', availableMinutes = 60 } = req.body;

  if (aiClient) {
    try {
      const prompt = `You are SlothDesk AI. A user has ${energyLevel} energy and approximately ${availableMinutes} minutes available.
Review their task list and create a realistic, compassionate plan that prevents burnout.
Rules:
- Never assume they are lazy. Use supportive, comforting language.
- Select ONE single most manageable and satisfying task.
- Provide 3 tiny, frictionless steps to start it immediately without dread.
- Choose 1-2 optional low-effort bonus tasks.
- Explicitly list which heavier tasks can be shelved/postponed without guilt today.

User's tasks:
${JSON.stringify(tasks.map((t: any) => ({ id: t.id, title: t.title, priority: t.priority })))}

Output raw JSON strictly matching:
{
  "headline": "string (calm headline, e.g. One Gentle Step is Plenty)",
  "compassionateNote": "string (2-3 comforting sentences)",
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

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const responseText = response.text?.trim() || '{}';
      return res.json({ plan: JSON.parse(responseText), source: 'live_ai' });
    } catch (err: any) {
      console.warn('AI low-energy call failed, using fallback:', err?.message);
    }
  }

  // Fallback low energy response
  const chosenTask = tasks.find((t: any) => !t.completed) || {
    id: 'sample-task',
    title: 'Review weekly notes at an easy pace',
    priority: 'medium',
  };

  const otherTasks = tasks
    .filter((t: any) => t.id !== chosenTask.id && !t.completed)
    .map((t: any) => t.title);

  return res.json({
    plan: {
      headline: 'Low-Energy Sanctuary: Just One Thing',
      compassionateNote:
        'It is completely okay to have lower stamina today. Progress is not about pushing until you collapse; it is about gentle consistency at your own natural pace.',
      primaryManageableTask: {
        id: chosenTask.id,
        title: chosenTask.title,
        whyThisFirst: 'Completing just this one item will clear mental space without draining your reserves.',
        immediateSmallSteps: [
          'Take a sip of water and open the workspace without expecting perfection.',
          'Focus on just the first 5 minutes — stop whenever friction feels heavy.',
          'Save your work and step away with zero guilt.',
        ],
        estimatedMinutes: Math.min(25, Number(availableMinutes) || 25),
      },
      optionalGentleTasks: [
        { title: 'Gentle hydration & window gazing', estimatedMinutes: 10 },
        { title: 'Tidy just one small corner of your desk', estimatedMinutes: 5 },
      ],
      canPostponeWithoutGuilt: otherTasks.slice(0, 3),
    },
    source: 'demo_heuristic',
  });
});

// 3. Make It Smaller
app.post('/api/ai/breakdown', async (req: Request, res: Response) => {
  const { taskTitle, taskDescription } = req.body;
  if (!taskTitle) {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  if (aiClient) {
    try {
      const prompt = `You are SlothDesk AI. Break down this task into 4 to 6 microscopic, low-friction actionable steps.
Each step must:
- Start with a clear action verb.
- Be small enough that anyone can begin in under 10 seconds.
- Have a realistic estimated minutes (5-15 mins max).
- Include one introductory "micro-starter" step (e.g. "Open document and title the header").

Task: "${taskTitle}"
Description: "${taskDescription || ''}"

Return JSON array:
[
  {
    "id": "step-1",
    "title": "string",
    "estimatedMinutes": number
  }
]`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text?.trim() || '[]';
      return res.json({ steps: JSON.parse(responseText), source: 'live_ai' });
    } catch (err: any) {
      console.warn('AI breakdown failed, using fallback:', err?.message);
    }
  }

  // Fallback breakdown
  const fallbackSteps = [
    { id: `step-${Date.now()}-1`, title: `Open relevant files/tools for "${taskTitle}"`, estimatedMinutes: 5 },
    { id: `step-${Date.now()}-2`, title: 'Jot down 2 key points or rough bullet notes', estimatedMinutes: 10 },
    { id: `step-${Date.now()}-3`, title: 'Work steadily for 15 minutes with no multitasking', estimatedMinutes: 15 },
    { id: `step-${Date.now()}-4`, title: 'Review progress, save, and breathe', estimatedMinutes: 5 },
  ];

  return res.json({ steps: fallbackSteps, source: 'demo_heuristic' });
});

// 4. Note-to-Action Converter
app.post('/api/ai/notes-to-action', async (req: Request, res: Response) => {
  const { notes } = req.body;
  if (!notes || typeof notes !== 'string') {
    return res.status(400).json({ error: 'Please provide notes text.' });
  }

  if (aiClient) {
    try {
      const prompt = `You are SlothDesk AI. Analyze the following user notes, meeting text, or brainstorm.
Extract:
- conciseSummary: 2-3 clear sentences summarizing key takeaways.
- keyPoints: 3-5 bullet insights.
- extractedActions: actionable items with priority ('low'|'medium'|'high'), estimatedMinutes, and explicitDateMentioned (only if explicitly in text).
- explicitDates: array of date references explicitly mentioned in text (do NOT fabricate dates).
- openQuestionsOrAmbiguities: items that need clarification.

Notes:
"""${notes}"""

Return JSON:
{
  "conciseSummary": "string",
  "keyPoints": ["string"],
  "extractedActions": [
    {
      "title": "string",
      "priority": "low" | "medium" | "high",
      "estimatedMinutes": number,
      "explicitDateMentioned": "string or null"
    }
  ],
  "explicitDates": ["string"],
  "openQuestionsOrAmbiguities": ["string"]
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text?.trim() || '{}';
      return res.json({ analysis: JSON.parse(responseText), source: 'live_ai' });
    } catch (err: any) {
      console.warn('AI notes analysis failed, using fallback:', err?.message);
    }
  }

  // Fallback notes analysis
  const lines = notes.split('\n').filter((l) => l.trim().length > 0);
  const actions = lines
    .filter((l) => /todo|action|must|should|need to|prepare|send|write/i.test(l))
    .slice(0, 5)
    .map((l, i) => ({
      title: l.replace(/^[*\-•\d.]+\s*/, '').trim(),
      priority: (i === 0 ? 'high' : 'medium') as any,
      estimatedMinutes: 20,
      explicitDateMentioned: undefined,
    }));

  if (actions.length === 0) {
    actions.push({
      title: 'Review key points from raw notes',
      priority: 'medium',
      estimatedMinutes: 15,
      explicitDateMentioned: undefined,
    });
  }

  return res.json({
    analysis: {
      conciseSummary:
        notes.length > 100
          ? notes.slice(0, 160) + '...'
          : 'Extracted key insights and distilled action items calmly from your notes.',
      keyPoints: lines.slice(0, 3).map((l) => l.replace(/^[*\-•\d.]+\s*/, '').trim()),
      extractedActions: actions,
      explicitDates: [],
      openQuestionsOrAmbiguities: ['Are there specific target deadlines for these items?'],
    },
    source: 'demo_heuristic',
  });
});

// 5. Slow Planner
app.post('/api/ai/planner', async (req: Request, res: Response) => {
  const { availableHours = 4, tasks = [], preferredBreakInterval = 45 } = req.body;

  if (aiClient) {
    try {
      const prompt = `You are SlothDesk AI, designing a calm, realistic daily schedule that honors human energy rhythms.
Generate a non-overlapping sequence of time blocks starting at 09:00 for ${availableHours} hours.
Include mindful pauses and tea/stretch breaks between focus blocks. Never overload the schedule.

Tasks available:
${JSON.stringify(tasks.map((t: any) => ({ id: t.id, title: t.title, priority: t.priority })))}

Output JSON array:
[
  {
    "id": "block-1",
    "startTime": "09:00",
    "endTime": "09:45",
    "title": "string",
    "isBreak": false,
    "taskId": "string or null",
    "energyLevel": "low" | "normal" | "high"
  }
]`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text?.trim() || '[]';
      return res.json({ schedule: JSON.parse(responseText), source: 'live_ai' });
    } catch (err: any) {
      console.warn('AI planner failed, using fallback:', err?.message);
    }
  }

  // Fallback slow planner
  const blocks = [
    {
      id: `block-${Date.now()}-1`,
      startTime: '09:00',
      endTime: '09:45',
      title: tasks[0]?.title || 'Morning Calm Focus',
      isBreak: false,
      taskId: tasks[0]?.id || undefined,
      energyLevel: 'normal',
    },
    {
      id: `block-${Date.now()}-2`,
      startTime: '09:45',
      endTime: '10:05',
      title: 'Sloth herbal tea & balcony gaze',
      isBreak: true,
      energyLevel: 'low',
    },
    {
      id: `block-${Date.now()}-3`,
      startTime: '10:05',
      endTime: '10:50',
      title: tasks[1]?.title || 'Deep focus on primary objective',
      isBreak: false,
      taskId: tasks[1]?.id || undefined,
      energyLevel: 'high',
    },
    {
      id: `block-${Date.now()}-4`,
      startTime: '10:50',
      endTime: '11:10',
      title: 'Mindful stretch & hydration',
      isBreak: true,
      energyLevel: 'low',
    },
    {
      id: `block-${Date.now()}-5`,
      startTime: '11:10',
      endTime: '11:45',
      title: tasks[2]?.title || 'Gentle wrap-up & inbox calm',
      isBreak: false,
      taskId: tasks[2]?.id || undefined,
      energyLevel: 'low',
    },
  ];

  return res.json({ schedule: blocks, source: 'demo_heuristic' });
});

// Vite middleware for development or static serve for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SlothDesk AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
