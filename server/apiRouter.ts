import { Router, Request, Response } from 'express';
import {
  getProviderStatus,
  organizeMessyNotesAI,
  generateLowEnergyPlanAI,
  breakdownTaskAI,
  convertNotesToActionsAI,
  generateSlowScheduleAI,
  quickCaptureAI,
  smartRescheduleAI,
  rescueUnstuckAI,
  weeklyReflectionAI,
} from './aiProvider';

export const apiRouter = Router();

// Status & Transparency endpoint
apiRouter.get('/ai/status', (_req: Request, res: Response) => {
  try {
    const status = getProviderStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve AI provider status', details: err?.message });
  }
});

// 1. Lazy Task Organizer
apiRouter.post('/ai/organize', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide notes or a brain dump to organize.' });
  }

  if (text.length > 50000) {
    return res.status(413).json({ error: 'Input notes exceed maximum allowed size (50,000 characters).' });
  }

  try {
    const result = await organizeMessyNotesAI(text.trim());
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Task organization failed', message: err?.message });
  }
});

// 2. Low-Energy Mode
apiRouter.post('/ai/low-energy', async (req: Request, res: Response) => {
  const { tasks = [], energyLevel = 'low', availableMinutes = 45 } = req.body;

  if (!['low', 'normal', 'high'].includes(energyLevel)) {
    return res.status(400).json({ error: 'Invalid energy level specified.' });
  }

  try {
    const result = await generateLowEnergyPlanAI(
      Array.isArray(tasks) ? tasks : [],
      energyLevel,
      Number(availableMinutes) || 45
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate low-energy plan', message: err?.message });
  }
});

// 3. Make It Smaller
apiRouter.post('/ai/breakdown', async (req: Request, res: Response) => {
  const { taskTitle, taskDescription, stepCount = 4 } = req.body;

  if (!taskTitle || typeof taskTitle !== 'string' || taskTitle.trim().length === 0) {
    return res.status(400).json({ error: 'Task title is required for breakdown.' });
  }

  try {
    const result = await breakdownTaskAI(
      taskTitle.trim(),
      typeof taskDescription === 'string' ? taskDescription.trim() : '',
      Math.min(8, Math.max(3, Number(stepCount) || 4))
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Task breakdown failed', message: err?.message });
  }
});

// 4. Note-to-Action Converter
apiRouter.post('/ai/notes-to-action', async (req: Request, res: Response) => {
  const { notes } = req.body;

  if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
    return res.status(400).json({ error: 'Notes content is required.' });
  }

  if (notes.length > 50000) {
    return res.status(413).json({ error: 'Notes exceed maximum size limit (50,000 characters).' });
  }

  try {
    const result = await convertNotesToActionsAI(notes.trim());
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Note distillation failed', message: err?.message });
  }
});

// 5. Slow Planner
apiRouter.post('/ai/planner', async (req: Request, res: Response) => {
  const { tasks = [], availableHours = 4, energyLevel = 'normal' } = req.body;

  try {
    const result = await generateSlowScheduleAI(
      Array.isArray(tasks) ? tasks : [],
      Math.min(12, Math.max(1, Number(availableHours) || 4)),
      ['low', 'normal', 'high'].includes(energyLevel) ? energyLevel : 'normal'
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Slow schedule generation failed', message: err?.message });
  }
});

// 6. Quick Capture / Brain Dump (Feature 6A)
apiRouter.post('/ai/quick-capture', async (req: Request, res: Response) => {
  const { rawText } = req.body;

  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return res.status(400).json({ error: 'Brain dump text is required.' });
  }

  try {
    const result = await quickCaptureAI(rawText.trim());
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Quick capture classification failed', message: err?.message });
  }
});

// 7. Smart Rescheduling (Feature 6C)
apiRouter.post('/ai/reschedule', async (req: Request, res: Response) => {
  const { openTasks = [], remainingMinutesToday = 90 } = req.body;

  try {
    const result = await smartRescheduleAI(
      Array.isArray(openTasks) ? openTasks : [],
      Math.min(480, Math.max(15, Number(remainingMinutesToday) || 90))
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Smart rescheduling failed', message: err?.message });
  }
});

// 8. Sloth Rescue Mode (Part 2)
apiRouter.post('/ai/rescue', async (req: Request, res: Response) => {
  const { situation, challengeType, variationIndex = 0 } = req.body;

  if (!situation || typeof situation !== 'string' || situation.trim().length === 0) {
    return res.status(400).json({ error: 'Please describe what feels difficult or overwhelming.' });
  }

  if (situation.length > 50000) {
    return res.status(413).json({ error: 'Input situation exceeds maximum allowed size (50,000 characters).' });
  }

  try {
    const result = await rescueUnstuckAI(
      situation.trim(),
      typeof challengeType === 'string' ? challengeType.trim() : undefined,
      Number(variationIndex) || 0
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Rescue suggestion failed', message: err?.message });
  }
});

// 9. Weekly Sloth Reflection (Part 6)
apiRouter.post('/ai/weekly-reflection', async (req: Request, res: Response) => {
  const { completedTasks = [], pendingTasks = [], focusMinutes = 0, userReflection, variationIndex = 0 } = req.body;

  try {
    const result = await weeklyReflectionAI(
      Array.isArray(completedTasks) ? completedTasks : [],
      Array.isArray(pendingTasks) ? pendingTasks : [],
      Number(focusMinutes) || 0,
      typeof userReflection === 'string' ? userReflection.trim() : undefined,
      Number(variationIndex) || 0
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Weekly reflection generation failed', message: err?.message });
  }
});

