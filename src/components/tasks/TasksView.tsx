import React, { useState } from 'react';
import { Task, Priority } from '../../types';
import { SlothMascot } from '../mascot/SlothMascot';
import {
  Check,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Search,
  Filter,
  Scissors,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onOpenMakeSmaller: (taskTitle: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onOpenMakeSmaller,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'completed'>('open');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  // Quick-Add form state
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newMinutes, setNewMinutes] = useState<number>(25);
  const [newDueDate, setNewDueDate] = useState('');
  const [showQuickAddDetails, setShowQuickAddDetails] = useState(false);

  // Undo support
  const [lastDeletedTask, setLastDeletedTask] = useState<Task | null>(null);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      priority: newPriority,
      completed: false,
      estimatedMinutes: newMinutes,
      dueDate: newDueDate || undefined,
      createdAt: new Date().toISOString(),
      energyLevel: newPriority === 'high' ? 'high' : 'normal',
    };

    onAddTask(task);
    setNewTitle('');
    setShowQuickAddDetails(false);
  };

  const handleDeleteWithUndo = (task: Task) => {
    setLastDeletedTask(task);
    onDeleteTask(task.id);
  };

  const handleRestoreLastDeleted = () => {
    if (lastDeletedTask) {
      onAddTask(lastDeletedTask);
      setLastDeletedTask(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubtask = (task: Task, subtaskId: string) => {
    if (!task.subtasks) return;
    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'open' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchTags = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Undo Notification Bar */}
      {lastDeletedTask && (
        <div className="bg-[#E9E0D2] p-4 rounded-xl border border-[#A6AD99] flex items-center justify-between text-xs">
          <span>Deleted task "{lastDeletedTask.title}".</span>
          <button
            onClick={handleRestoreLastDeleted}
            className="px-3 py-1 rounded bg-[#39483B] text-[#F5F0E7] font-medium hover:bg-[#2c392e]"
          >
            Undo
          </button>
        </div>
      )}

      {/* Quick Add Card */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#A6AD99]/30 space-y-4 shadow-xs">
        <form onSubmit={handleQuickAdd} className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs gentle attention today? (Press Enter to add)"
              className="flex-1 p-3 rounded-xl bg-[#F5F0E7]/60 border border-[#A6AD99]/40 text-sm text-[#22221F] placeholder:text-[#77766E] focus:outline-none focus:ring-2 focus:ring-[#39483B]/30"
            />
            <button
              type="button"
              onClick={() => setShowQuickAddDetails(!showQuickAddDetails)}
              className="px-3 py-3 rounded-xl border border-[#A6AD99]/40 text-xs text-[#77766E] hover:bg-[#F5F0E7]"
              title="Toggle options"
            >
              {showQuickAddDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] disabled:opacity-50 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>

          {showQuickAddDetails && (
            <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-[#F5F0E7]/40 border border-[#A6AD99]/20 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#77766E]">Priority:</span>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Priority)}
                  className="bg-[#FFFFFF] px-2.5 py-1 rounded border border-[#A6AD99]/40 text-xs text-[#22221F]"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#77766E]">Est. Time:</span>
                <input
                  type="number"
                  value={newMinutes}
                  onChange={(e) => setNewMinutes(Number(e.target.value))}
                  className="w-16 bg-[#FFFFFF] px-2 py-1 rounded border border-[#A6AD99]/40 text-xs text-center"
                />
                <span className="text-[#77766E]">mins</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#77766E]">Due:</span>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="bg-[#FFFFFF] px-2 py-1 rounded border border-[#A6AD99]/40 text-xs"
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77766E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, note, or tag..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#A6AD99]/30 text-xs text-[#22221F] placeholder:text-[#77766E] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Tabs (functional buttons) */}
          <div className="flex items-center p-1 bg-[#E9E0D2] rounded-xl border border-[#A6AD99]/30 text-xs">
            {(['all', 'open', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-[#39483B] text-[#F5F0E7] shadow-xs'
                    : 'text-[#77766E] hover:text-[#22221F]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#A6AD99]/30 text-xs text-[#77766E] focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-2xl p-10 border border-[#A6AD99]/30 flex flex-col items-center justify-center text-center space-y-3">
            <SlothMascot state="empty-state" size="lg" />
            <h4 className="text-base font-serif font-bold text-[#22221F]">All Clear at Sloth Pace</h4>
            <p className="text-xs text-[#77766E] max-w-sm">
              No tasks match this filter. Take a breath, drink some tea, or add your next outcome when ready.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isExpanded = !!expandedTaskIds[task.id];
            const hasSubtasks = (task.subtasks?.length || 0) > 0;
            const completedSubCount = task.subtasks?.filter((s) => s.completed).length || 0;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-[#E3E8DD]/30 border-[#A6AD99]/20 opacity-70'
                    : 'bg-[#FFFFFF] border-[#A6AD99]/30 hover:border-[#A6AD99] shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => onToggleComplete(task.id)}
                      className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        task.completed
                          ? 'bg-[#39483B] border-[#39483B] text-[#F5F0E7]'
                          : 'border-[#A6AD99] hover:border-[#39483B] bg-white'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-medium ${
                            task.completed
                              ? 'line-through text-[#77766E]'
                              : 'text-[#22221F]'
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Priority indicator text (no pill boxes) */}
                        <span className="text-[11px] text-[#77766E]">
                          ·{' '}
                          <span
                            className={
                              task.priority === 'high'
                                ? 'text-[#C47D61] font-semibold'
                                : task.priority === 'medium'
                                ? 'text-[#39483B] font-medium'
                                : 'text-[#77766E]'
                            }
                          >
                            {task.priority.toUpperCase()}
                          </span>
                        </span>

                        {task.estimatedMinutes && (
                          <span className="text-[11px] text-[#77766E]">
                            · ~{task.estimatedMinutes}m
                          </span>
                        )}

                        {task.dueDate && (
                          <span className="text-[11px] text-[#77766E] flex items-center gap-1">
                            · <Calendar className="w-3 h-3" /> {task.dueDate}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-[#77766E] leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Subtask count indicator */}
                      {hasSubtasks && (
                        <button
                          onClick={() => toggleExpand(task.id)}
                          className="flex items-center gap-1.5 text-xs text-[#39483B] font-medium pt-1 hover:underline"
                        >
                          <span>
                            {completedSubCount}/{task.subtasks!.length} subtasks done
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Task Card Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenMakeSmaller(task.title)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#39483B] bg-[#E3E8DD] hover:bg-[#d5ded0] transition-colors"
                      title="Deconstruct this task into micro-actions with AI"
                    >
                      <Scissors className="w-3 h-3" />
                      <span className="hidden sm:inline">Make Smaller</span>
                    </button>

                    <button
                      onClick={() => handleDeleteWithUndo(task)}
                      className="p-1.5 rounded-lg text-[#77766E] hover:text-[#C47D61] hover:bg-[#F5F0E7]"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Subtasks List */}
                {isExpanded && hasSubtasks && (
                  <div className="mt-3 pl-8 pr-2 pt-3 border-t border-[#A6AD99]/20 space-y-2">
                    {task.subtasks!.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => toggleSubtask(task, sub.id)}
                        className="flex items-center gap-2.5 text-xs cursor-pointer text-[#22221F] hover:text-[#39483B]"
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                            sub.completed
                              ? 'bg-[#39483B] border-[#39483B] text-white'
                              : 'border-[#A6AD99]'
                          }`}
                        >
                          {sub.completed && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span className={sub.completed ? 'line-through text-[#77766E]' : ''}>
                          {sub.title}
                        </span>
                        {sub.estimatedMinutes && (
                          <span className="text-[#77766E] text-[10px]">
                            (~{sub.estimatedMinutes}m)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
