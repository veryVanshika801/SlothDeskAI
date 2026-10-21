import React from 'react';
import { Task, SlothGardenData, MascotState, EnergyLevel } from '../../types';
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
  LifeBuoy,
  BookOpen,
  Battery,
  BatteryMedium,
  BatteryFull,
} from 'lucide-react';

interface DashboardOverviewProps {
  tasks: Task[];
  garden: SlothGardenData;
  energyLevel?: EnergyLevel;
  onOpenTab: (tab: string) => void;
  onToggleComplete: (taskId: string) => void;
  onOpenMakeSmaller: (taskTitle: string) => void;
  onStartFocusOnTask: (taskId: string) => void;
  onOpenQuickCapture: () => void;
  onOpenRescueMode: () => void;
  onUpdateEnergy?: (energy: EnergyLevel) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tasks,
  garden,
  energyLevel = 'normal',
  onOpenTab,
  onToggleComplete,
  onOpenMakeSmaller,
  onStartFocusOnTask,
  onOpenQuickCapture,
  onOpenRescueMode,
  onUpdateEnergy,
}) => {
  const openTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const highPriorityTasks = openTasks.filter((t) => t.priority === 'high');

  const totalFocusMinutes = openTasks.reduce(
    (acc, t) => acc + (t.estimatedMinutes || 20),
    0
  );

  const topNextTask = openTasks[0];

  // Contextual sloth message based on real data & energy
  let slothMessage = "Everything's calm. Move at your natural pace.";
  let mascotState: MascotState = 'idle';

  if (energyLevel === 'low') {
    slothMessage = "Low-energy mode active. Do just one tiny move, or rest without guilt.";
    mascotState = 'low-energy';
  } else if (openTasks.length === 0) {
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
      <div className="bg-[#E9E0D2] rounded-3xl p-6 md:p-8 border border-[#A6AD99]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
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
            <p className="text-xs sm:text-sm text-[#77766E] max-w-lg italic leading-relaxed">
              "{slothMessage}"
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          {/* Sloth Rescue Mode Trigger Button (Part 2) */}
          <button
            onClick={onOpenRescueMode}
            className="px-4 py-2.5 rounded-xl bg-[#C47D61] text-white hover:bg-[#b06f55] text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Help me get unstuck</span>
          </button>

          <button
            onClick={onOpenQuickCapture}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F5F0E7] text-[#22221F] text-xs font-semibold transition-colors border border-[#A6AD99]/40 flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#39483B]" />
            <span>Quick Dump</span>
          </button>

          <button
            onClick={() => onOpenTab('low-energy')}
            className="px-4 py-2.5 rounded-xl bg-[#39483B] hover:bg-[#2c392e] text-[#F5F0E7] text-xs font-semibold transition-colors shadow-sm flex items-center gap-2"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Low-Energy</span>
          </button>
        </div>
      </div>

      {/* Energy Level Selector Bar (Part 3) */}
      <div className="bg-white rounded-2xl p-4 border border-[#A6AD99]/30 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-bold text-[#77766E]">
            Today's Energy Level:
          </span>
          <div className="flex items-center gap-1.5 bg-[#F5F0E7] p-1 rounded-xl border border-[#A6AD99]/30 text-xs">
            {(
              [
                { level: 'low', label: 'Low Energy', desc: '1–2 essential tasks, gentle pacing', icon: Battery },
                { level: 'normal', label: 'Medium Energy', desc: 'Balanced focus & mindful pauses', icon: BatteryMedium },
                { level: 'high', label: 'High Energy', desc: 'Deeper focus sessions', icon: BatteryFull },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const isSelected = energyLevel === opt.level;
              return (
                <button
                  key={opt.level}
                  type="button"
                  onClick={() => onUpdateEnergy && onUpdateEnergy(opt.level)}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                    isSelected
                      ? 'bg-[#39483B] text-white shadow-xs'
                      : 'text-[#77766E] hover:text-[#22221F]'
                  }`}
                  title={opt.desc}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <span className="text-xs text-[#77766E] italic">
          {energyLevel === 'low'
            ? 'Pacing adjusted to minimize cognitive load & burnout.'
            : energyLevel === 'high'
            ? 'Ready for deeper blocks with scheduled mindful breaks.'
            : 'Balanced rhythm respecting your natural capacity.'}
        </span>
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
            label: 'Garden Growth',
            value: garden.leafCount,
            unit: 'leaves sprouted 🌿',
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
            value: `${Math.round((totalFocusMinutes / 60) * 10) / 10}`,
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

      {/* AI Quick Actions Grid (Updated with Rescue and Weekly Reflection) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-serif font-bold text-[#22221F]">
            AI Intelligent Flow Tools
          </h2>
          <span className="text-xs text-[#77766E]">Calm, transparent workflows</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 'rescue',
              title: 'Sloth Rescue Mode',
              desc: 'Paralyzed or overwhelmed? Get unblocked with 1 micro step.',
              icon: LifeBuoy,
              cta: 'Unstick Me',
              onClick: onOpenRescueMode,
            },
            {
              id: 'organizer',
              title: 'Organize My Mess',
              desc: 'Turn chaotic brain dumps into prioritized structured tasks.',
              icon: Sparkles,
              cta: 'Dump Notes',
              onClick: () => onOpenTab('organizer'),
            },
            {
              id: 'breakdown',
              title: 'Make It Smaller',
              desc: 'Slice overwhelming projects into tiny 10-minute actions.',
              icon: Scissors,
              cta: 'Deconstruct',
              onClick: () => onOpenTab('breakdown'),
            },
            {
              id: 'planner',
              title: 'Slow Planner',
              desc: 'Build an unhurried daily schedule adapted to your energy.',
              icon: CalendarDays,
              cta: 'Plan Rhythm',
              onClick: () => onOpenTab('planner'),
            },
            {
              id: 'reflection',
              title: 'Weekly Reflection',
              desc: 'Review real accomplishments and small wins without guilt.',
              icon: BookOpen,
              cta: 'View Reflection',
              onClick: () => onOpenTab('reflection'),
            },
            {
              id: 'notes',
              title: 'Summarize Notes',
              desc: 'Extract key points and action items from transcripts & docs.',
              icon: NotebookPen,
              cta: 'Extract Actions',
              onClick: () => onOpenTab('notes'),
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={action.onClick}
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
    </div>
  );
};
