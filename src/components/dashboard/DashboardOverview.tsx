import React from 'react';
import { Task, SlothGardenData, MascotState } from '../../types';
import { SlothMascot } from '../mascot/SlothMascot';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Scissors,
  CalendarDays,
  NotebookPen,
  ArrowRight,
  Check,
  Play,
  Trees,
  Layers,
  Coffee,
} from 'lucide-react';

interface DashboardOverviewProps {
  tasks: Task[];
  garden: SlothGardenData;
  onOpenTab: (tab: string) => void;
  onToggleComplete: (taskId: string) => void;
  onOpenMakeSmaller: (taskTitle: string) => void;
  onStartFocusOnTask: (taskId: string) => void;
  onOpenQuickCapture: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tasks,
  garden,
  onOpenTab,
  onToggleComplete,
  onOpenMakeSmaller,
  onStartFocusOnTask,
  onOpenQuickCapture,
}) => {
  const openTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const highPriorityTasks = openTasks.filter((t) => t.priority === 'high');

  const totalFocusMinutes = openTasks.reduce(
    (acc, t) => acc + (t.estimatedMinutes || 20),
    0
  );

  const topNextTask = openTasks[0];

  // Contextual sloth message based on real data
  let slothMessage = "Everything's calm. Move at your natural pace.";
  let mascotState: MascotState = 'idle';

  if (openTasks.length === 0) {
    slothMessage = 'All tasks cleared! Time for a warm cup of herbal tea.';
    mascotState = 'encouragement';
  } else if (highPriorityTasks.length > 0) {
    slothMessage = `You have ${highPriorityTasks.length} high priority item. Pick just one, take a breath, and begin gently.`;
    mascotState = 'idle';
  } else {
    slothMessage = `${openTasks.length} gentle tasks open today. Small steps compound beautifully.`;
    mascotState = 'idle';
  }

  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12
      ? 'Good morning'
      : hour < 18
      ? 'Good afternoon'
      : 'Good evening';

  const dateString = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* Personalized Header & Sloth Companion Panel */}
      <div className="bg-[#E9E0D2] rounded-2xl p-6 md:p-8 border border-[#A6AD99]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-6">
          <SlothMascot state={mascotState} size="lg" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#77766E] uppercase tracking-wider font-semibold">
              <span>{dateString}</span>
              <span>·</span>
              <span className="text-[#39483B]">Sloth Companion Online</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#22221F]">
              {timeGreeting}. Let's make today a little easier.
            </h1>
            <p className="text-sm text-[#77766E] max-w-lg italic">
              "{slothMessage}"
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={onOpenQuickCapture}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F5F0E7] text-[#22221F] text-xs font-semibold transition-colors border border-[#A6AD99]/40 flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#39483B]" />
            <span>Quick Brain Dump</span>
          </button>
          <button
            onClick={() => onOpenTab('low-energy')}
            className="px-4 py-2.5 rounded-xl bg-[#39483B] hover:bg-[#2c392e] text-[#F5F0E7] text-xs font-semibold transition-colors shadow-sm flex items-center gap-2"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Low-Energy Mode</span>
          </button>
        </div>
      </div>

      {/* Recommended Next Action Focus Strip */}
      {topNextTask && (
        <div className="bg-[#E3E8DD]/80 rounded-2xl p-5 border border-[#A6AD99]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#39483B] text-white flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#39483B] block">
                Single Next Action
              </span>
              <span className="text-sm font-semibold text-[#22221F] block">
                {topNextTask.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => onStartFocusOnTask(topNextTask.id)}
              className="px-4 py-2 rounded-xl bg-[#39483B] text-white text-xs font-semibold hover:bg-[#2c392e] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Enter Focus Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Real Application Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Open Tasks',
            value: openTasks.length,
            unit: 'to do',
            color: 'text-[#39483B]',
          },
          {
            label: 'Completed Tasks',
            value: completedTasks.length,
            unit: 'leaves earned',
            color: 'text-[#39483B]',
          },
          {
            label: 'High Priority',
            value: highPriorityTasks.length,
            unit: 'key outcomes',
            color: 'text-[#C47D61]',
          },
          {
            label: 'Focus Time',
            value: `${Math.round(totalFocusMinutes / 60 * 10) / 10}`,
            unit: 'hours estimated',
            color: 'text-[#22221F]',
          },
        ].map((metric, idx) => (
          <div
            key={idx}
            className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#A6AD99]/30 shadow-xs flex flex-col justify-between"
          >
            <span className="text-xs uppercase tracking-wider text-[#77766E] font-medium">
              {metric.label}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-3xl font-bold font-serif tabular-nums ${metric.color}`}>
                {metric.value}
              </span>
              <span className="text-xs text-[#77766E]">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-serif font-bold text-[#22221F]">
            AI Intelligent Flow Tools
          </h2>
          <span className="text-xs text-[#77766E]">Calm, transparent workflows</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'organizer',
              title: 'Organize My Mess',
              desc: 'Turn chaotic brain dumps into prioritized structured tasks.',
              icon: Sparkles,
              cta: 'Dump Notes',
            },
            {
              id: 'breakdown',
              title: 'Make It Smaller',
              desc: 'Slice overwhelming projects into tiny 10-minute actions.',
              icon: Scissors,
              cta: 'Deconstruct',
            },
            {
              id: 'notes',
              title: 'Summarize Notes',
              desc: 'Extract key points and action items from transcripts & docs.',
              icon: NotebookPen,
              cta: 'Extract Actions',
            },
            {
              id: 'planner',
              title: 'Slow Planner',
              desc: 'Build an unhurried daily schedule with mindful breathing room.',
              icon: CalendarDays,
              cta: 'Plan Flow',
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={() => onOpenTab(action.id)}
                className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#A6AD99]/30 hover:border-[#39483B] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[#E3E8DD] text-[#39483B] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#22221F] mb-1">
                    {action.title}
                  </h3>
                  <p className="text-xs text-[#77766E] leading-relaxed">
                    {action.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#A6AD99]/20 flex items-center justify-between text-xs font-semibold text-[#39483B]">
                  <span>{action.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Priorities & Garden Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Today's Priorities List */}
        <div className="lg:col-span-2 bg-[#FFFFFF] rounded-2xl p-6 border border-[#A6AD99]/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#A6AD99]/20 pb-4">
            <div>
              <h2 className="text-base font-serif font-bold text-[#22221F]">
                Today's Key Priorities
              </h2>
              <p className="text-xs text-[#77766E] mt-0.5">
                Focus on these items without feeling pressured to clear everything.
              </p>
            </div>
            <button
              onClick={() => onOpenTab('tasks')}
              className="text-xs font-semibold text-[#39483B] hover:underline flex items-center gap-1"
            >
              <span>View All Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {openTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-[#F5F0E7]/40 border border-[#A6AD99]/25 hover:border-[#A6AD99] flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className="w-5 h-5 rounded border border-[#A6AD99] bg-white hover:border-[#39483B] flex items-center justify-center transition-colors shrink-0"
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 text-[#39483B]" />}
                  </button>

                  <div>
                    <div className="text-sm font-medium text-[#22221F]">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#77766E] mt-0.5">
                      <span
                        className={`font-semibold ${
                          task.priority === 'high'
                            ? 'text-[#C47D61]'
                            : task.priority === 'medium'
                            ? 'text-[#39483B]'
                            : 'text-[#77766E]'
                        }`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                      {task.estimatedMinutes && (
                        <>
                          <span>·</span>
                          <span>~{task.estimatedMinutes} mins</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onStartFocusOnTask(task.id)}
                    className="p-2 rounded-lg text-[#39483B] hover:bg-[#E9E0D2] transition-colors"
                    title="Focus on this task"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => onOpenMakeSmaller(task.title)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#39483B] bg-[#E3E8DD] hover:bg-[#d6ded0] transition-colors"
                  >
                    <Scissors className="w-3 h-3" />
                    <span>Simplify</span>
                  </button>
                </div>
              </div>
            ))}

            {openTasks.length === 0 && (
              <div className="py-8 text-center text-xs text-[#77766E]">
                No active tasks remaining. Add one from the tasks tab or dump messy notes!
              </div>
            )}
          </div>
        </div>

        {/* Right: Sloth Garden Preview */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#A6AD99]/30 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#A6AD99]/20 pb-3">
              <div className="flex items-center gap-2">
                <Trees className="w-4 h-4 text-[#39483B]" />
                <span className="font-serif font-bold text-sm text-[#22221F]">Sloth Garden</span>
              </div>
              <span className="text-xs text-[#39483B] font-semibold font-mono">Stage {garden.treeStage}/5</span>
            </div>

            <div className="text-center py-2">
              <SlothMascot state="garden" size="md" />
              <div className="mt-3 text-3xl font-serif font-bold text-[#39483B] tabular-nums">
                {garden.leafCount}
              </div>
              <span className="text-xs text-[#77766E] font-medium block">Permanent Leaves Sprouted</span>
              <p className="text-[11px] text-[#77766E] mt-2 italic">
                "No guilt for quiet days. Your tree waits peacefully."
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenTab('garden')}
            className="w-full mt-4 py-2 rounded-xl bg-[#E3E8DD] hover:bg-[#d5dfd0] text-[#39483B] text-xs font-semibold transition-colors"
          >
            Visit Garden Sanctuary
          </button>
        </div>
      </div>
    </div>
  );
};
