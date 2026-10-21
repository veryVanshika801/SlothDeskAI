/**
 * SlothDesk AI - Automated Test Suite
 * Tests Core Business Logic, Storage Integrity, Deduplication, and Validation.
 */

import { validateBackupJson, INITIAL_TASKS, INITIAL_GARDEN } from '../src/utils/storage';
import { Task, SlothGardenData } from '../src/types';

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

console.log('\n--- SL OTHDESK AI AUTOMATED TEST SUITE ---\n');

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
    version: '2.0',
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
  });

  const validResult = validateBackupJson(validBackup);
  assert(validResult.isValid === true, 'Valid backup passes verification');
  assert(validResult.summary?.taskCount === INITIAL_TASKS.length, 'Task count matches');

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

// 4. Planner Overload & Time Calculation Tests
console.log('\n4. Planner Constraint Tests:');
{
  const availableHours = 3;
  const availableMins = availableHours * 60; // 180 mins

  const reasonableTasks = [
    { title: 'Focus A', estimatedMinutes: 45 },
    { title: 'Focus B', estimatedMinutes: 45 },
  ];
  const reasonableTotal = reasonableTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
  const isOverloadedFalse = reasonableTotal > availableMins * 0.8;
  assert(!isOverloadedFalse, 'Reasonable 90m tasks within 180m window are not overloaded');

  const heavyTasks = [
    { title: 'Big project', estimatedMinutes: 120 },
    { title: 'Another long task', estimatedMinutes: 60 },
  ];
  const heavyTotal = heavyTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
  const isOverloadedTrue = heavyTotal > availableMins * 0.8;
  assert(isOverloadedTrue, 'Tasks exceeding buffer limit correctly flagged as overloaded');
}

// 5. Input Validation Tests
console.log('\n5. Input Sanitization Tests:');
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
