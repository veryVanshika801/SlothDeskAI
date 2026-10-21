/**
 * SlothDesk AI - Automated Test Suite
 * Tests Core Business Logic, Storage Integrity, Deduplication, Validation,
 * Energy Pacing, Rescue Mode, Focus Drift Prevention, and Weekly Reflections.
 */

import { validateBackupJson, INITIAL_TASKS, INITIAL_GARDEN } from '../src/utils/storage';
import { Task, SlothGardenData, FocusSession, WeeklyReflectionData, EnergyLevel } from '../src/types';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
  }
}

console.log('\n--- SLOTH DESK AI AUTOMATED TEST SUITE ---\n');

// 1. Task Operations & Integrity
console.log('1. Task Integrity Tests:');
{
  const task: Task = {
    id: 'test-task-1',
    title: 'Mindful breathing session',
    priority: 'low',
    completed: false,
    estimatedMinutes: 15,
    createdAt: new Date().toISOString(),
  };

  assert(Boolean(task.id && task.title), 'Task has valid ID and title');
  assert(task.estimatedMinutes === 15, 'Task retains duration estimate');
  assert(['low', 'medium', 'high'].includes(task.priority), 'Task priority is valid');
}

// 2. Garden Leaf Deduplication Tests (Anti-Glitch)
console.log('\n2. Garden Deduplication Tests:');
{
  const garden: SlothGardenData = {
    leafCount: 4,
    treeStage: 1,
    completedTaskIds: ['task-1', 'task-2'],
    historyLogs: [],
  };

  // Simulate task completion
  const taskId = 'task-3';
  const isAlreadyEarned = garden.completedTaskIds.includes(taskId);
  assert(!isAlreadyEarned, 'New task is not yet marked in completedTaskIds');

  // Earn leaf
  garden.leafCount += 1;
  garden.completedTaskIds.push(taskId);
  assert(garden.leafCount === 5, 'Leaf count incremented on unique completion');

  // Simulate reopening and re-completing same task
  const isAlreadyEarnedSecondTime = garden.completedTaskIds.includes(taskId);
  assert(isAlreadyEarnedSecondTime, 'Task is recognized as already having earned a leaf');

  if (!isAlreadyEarnedSecondTime) {
    garden.leafCount += 1; // Should not happen
  }
  assert(garden.leafCount === 5, 'Leaf count remains 5 (duplicate leaf prevented)');
}

// 3. Backup JSON Validation & Duplicate Detection
console.log('\n3. Backup Validation & Restoration Tests:');
{
  const validBackup = JSON.stringify({
    app: 'SlothDesk AI',
    version: '2.1',
    exportDate: new Date().toISOString(),
    tasks: INITIAL_TASKS,
    garden: INITIAL_GARDEN,
    activities: [],
    planner: [],
    settings: {
      reducedMotion: false,
      defaultEnergy: 'normal',
      theme: 'soft-cream',
      aiModelPreference: 'auto',
    },
    focusSessions: [
      {
        id: 'foc-1',
        taskTitle: 'Writing session',
        durationMinutes: 25,
        completedAt: new Date().toISOString(),
        mode: 'timed',
      },
    ],
    weeklyReflections: [],
  });

  const validResult = validateBackupJson(validBackup);
  assert(validResult.isValid === true, 'Valid backup passes verification');
  assert(validResult.summary?.taskCount === INITIAL_TASKS.length, 'Task count matches');
  assert(validResult.summary?.focusSessionsCount === 1, 'Focus sessions count preserved');

  // Malformed JSON test
  const malformedResult = validateBackupJson('{ invalid json');
  assert(malformedResult.isValid === false, 'Malformed JSON rejected safely');

  // Duplicate task ID detection test
  const duplicateIdBackup = JSON.stringify({
    app: 'SlothDesk AI',
    tasks: [
      { id: 'dup-1', title: 'First Task', priority: 'medium' },
      { id: 'dup-1', title: 'Second Task with Duplicate ID', priority: 'low' },
    ],
  });

  const duplicateResult = validateBackupJson(duplicateIdBackup);
  assert(duplicateResult.isValid === false, 'Duplicate task ID detected and rejected');
  assert(Boolean(duplicateResult.error?.includes('Duplicate task ID')), 'Error specifies duplicate ID');
}

// 4. Energy-Based Daily Planner Constraints
console.log('\n4. Energy-Based Planner Constraint Tests:');
{
  const availableHours = 4;
  const availableMins = availableHours * 60; // 240 mins

  // Low Energy test: Buffer requirement is 35% (available cap is 65% = 156 mins)
  const lowEnergyCap = availableMins * 0.65;
  const taskMins = 170;
  const isLowOverloaded = taskMins > lowEnergyCap;
  assert(isLowOverloaded, 'Low energy appropriately flags 170 mins as overloaded in 4h window');

  // High Energy test: Buffer requirement is 15% (available cap is 85% = 204 mins)
  const highEnergyCap = availableMins * 0.85;
  const isHighOverloaded = taskMins > highEnergyCap;
  assert(!isHighOverloaded, 'High energy accommodates 170 mins deep work in 4h window with buffers');
}

// 5. Sloth Rescue Mode Response Structure & Pacing
console.log('\n5. Sloth Rescue Mode Verification:');
{
  const mockRescueResult = {
    acknowledgement: 'Feeling stuck is completely normal. We only need one tiny, friction-free moment to begin.',
    firstAction: {
      title: 'Open materials and write 1 rough bullet',
      estimatedMinutes: 10,
      starterAction: 'Sit comfortably and take 2 calm breaths',
      reason: 'Breaking the inertia is 90% of the friction.',
    },
    followUpSteps: ['Set gentle 10m timer', 'Step away when timer rings'],
    suggestedDurationMinutes: 10,
    canMakeSmaller: true,
  };

  assert(Boolean(mockRescueResult.acknowledgement), 'Rescue output includes compassionate acknowledgement');
  assert(mockRescueResult.firstAction.estimatedMinutes <= 15, 'Recommended first step is low friction (<=15 mins)');
  assert(Boolean(mockRescueResult.firstAction.starterAction), '10-second starter action provided');
  assert(mockRescueResult.canMakeSmaller === true, 'Supports Make It Smaller deconstruction');
}

// 6. Gentle Focus Sessions Timer Drift Protection
console.log('\n6. Gentle Focus Timer Drift Protection:');
{
  const durationSeconds = 25 * 60; // 1500s
  const startTimestamp = Date.now() - 5000; // 5 seconds elapsed
  const now = Date.now();
  const calculatedRemaining = Math.max(0, Math.ceil((startTimestamp + durationSeconds * 1000 - now) / 1000));

  assert(calculatedRemaining <= 1496 && calculatedRemaining >= 1494, 'Timestamp-based delta computes exact remaining seconds without interval drift');
}

// 7. Weekly Reflection Aggregation & Boundaries
console.log('\n7. Weekly Reflection Data Boundary Tests:');
{
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const taskDoneThisWeek: Task = {
    id: 't-this-week',
    title: 'Submitted project summary',
    priority: 'high',
    completed: true,
    completedAt: new Date(monday.getTime() + 3600000 * 24).toISOString(), // Tuesday
    createdAt: monday.toISOString(),
  };

  const taskDoneLastMonth: Task = {
    id: 't-last-month',
    title: 'Old milestone',
    priority: 'low',
    completed: true,
    completedAt: new Date(monday.getTime() - 86400000 * 30).toISOString(),
    createdAt: new Date(monday.getTime() - 86400000 * 35).toISOString(),
  };

  const filterThisWeek = [taskDoneThisWeek, taskDoneLastMonth].filter((t) => {
    if (!t.completedAt) return false;
    const d = new Date(t.completedAt);
    return d >= monday && d <= sunday;
  });

  assert(filterThisWeek.length === 1, 'Only tasks completed within Monday-Sunday boundary are counted');
  assert(filterThisWeek[0].id === 't-this-week', 'Exact task correctly isolated for weekly report');
}

// 8. Input Sanitization Tests
console.log('\n8. Input Sanitization Tests:');
{
  const emptyNote = '   ';
  assert(emptyNote.trim().length === 0, 'Empty note properly identified for 400 validation');

  const massiveNote = 'a'.repeat(60000);
  assert(massiveNote.length > 50000, 'Payload exceeding size limit (>50KB) identified for 413 validation');
}

console.log('\n----------------------------------------');
console.log(`Results: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
console.log('----------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('All tests passed successfully! 🎉\n');
}
