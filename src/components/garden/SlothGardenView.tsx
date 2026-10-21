import React, { useState } from 'react';
import { SlothGardenData, Task } from '../../types';
import { SlothMascot } from '../mascot/SlothMascot';
import { SmartRescheduleModal } from '../planner/SmartRescheduleModal';
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Trees,
  Sun,
  Coffee,
  Calendar,
  RefreshCw,
  Heart,
  Info,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface SlothGardenViewProps {
  garden: SlothGardenData;
  openTasks?: Task[];
  onResetGarden: () => void;
  onDailyReset?: () => void;
  celebratingTaskId?: string | null;
}

export const SlothGardenView: React.FC<SlothGardenViewProps> = ({
  garden,
  openTasks = [],
  onResetGarden,
  onDailyReset,
  celebratingTaskId,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDailyResetConfirm, setShowDailyResetConfirm] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [waterAnimation, setWaterAnimation] = useState(false);

  const leaves = Math.min(garden.leafCount, 40);
  const stage =
    garden.leafCount === 0
      ? 1
      : garden.leafCount < 4
      ? 1
      : garden.leafCount < 9
      ? 2
      : garden.leafCount < 16
      ? 3
      : garden.leafCount < 26
      ? 4
      : 5;

  const stageTitles = [
    'Tender Sapling',
    'Young Branching Tree',
    'Flourishing Canopy',
    'Majestic Haven Tree',
    'Ancient Sloth Sanctuary',
  ];

  const handleNurture = () => {
    setWaterAnimation(true);
    setTimeout(() => setWaterAnimation(false), 2000);
  };

  // Generate leaf coordinates organically across tree canopy
  const leafPositions = Array.from({ length: leaves }).map((_, i) => {
    const angle = (i * 137.5) * (Math.PI / 180); // Golden angle distribution
    const r = Math.min(85, 20 + Math.sqrt(i) * 12);
    const x = 200 + r * Math.cos(angle);
    const y = 145 + r * 0.75 * Math.sin(angle);
    const rot = (i * 45) % 360;
    const isSpecial = i % 5 === 0;
    return { x, y, rot, isSpecial, id: i };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#E9E0D2] rounded-3xl p-6 md:p-8 border border-[#A6AD99]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-5">
          <SlothMascot state="garden" size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#77766E]">
                Mindful Progress
              </span>
              <span className="text-[#A6AD99]">·</span>
              <span className="text-xs font-semibold text-[#39483B]">No Streaks. No Guilt.</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#22221F] font-bold mt-1">
              The Sloth Garden
            </h1>
            <p className="text-xs text-[#77766E] max-w-md mt-1 leading-relaxed">
              Every completed task sprouts a permanent green leaf on your tree. Progress compounds slowly, without punishing broken streaks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-[#A6AD99]/30 text-center shadow-xs">
          <div>
            <div className="text-3xl font-bold font-serif text-[#39483B] tabular-nums">
              {garden.leafCount}
            </div>
            <div className="text-[10px] text-[#77766E] font-semibold uppercase tracking-wider mt-0.5">
              Leaves Sprouted
            </div>
          </div>
          <div className="w-[1px] h-10 bg-[#A6AD99]/30" />
          <div className="text-left">
            <div className="text-xs font-bold text-[#22221F]">{stageTitles[stage - 1]}</div>
            <div className="text-[11px] text-[#77766E]">Stage {stage} of 5</div>
          </div>
        </div>
      </div>

      {celebratingTaskId && (
        <div className="bg-[#E3E8DD] text-[#39483B] px-5 py-3.5 rounded-2xl border border-[#A6AD99]/40 flex items-center justify-between animate-gentle-pulse shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#39483B]" />
            <span className="text-xs sm:text-sm font-semibold">
              A fresh leaf has sprouted on your canopy! Slow, steady growth celebrated.
            </span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#39483B] bg-white/70 px-2.5 py-1 rounded-lg">
            +1 Leaf 🌿
          </span>
        </div>
      )}

      {/* Main Garden Canvas */}
      <div className="relative bg-white rounded-3xl border border-[#A6AD99]/30 p-6 md:p-10 flex flex-col items-center justify-center min-h-[460px] overflow-hidden shadow-xs">
        {/* Empty State Overlay if 0 leaves */}
        {garden.leafCount === 0 && (
          <div className="absolute inset-0 z-10 bg-white/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center space-y-4">
            <SlothMascot state="empty-state" size="lg" />
            <div className="space-y-1.5 max-w-sm">
              <h2 className="text-lg font-serif font-bold text-[#22221F]">
                Your Sanctuary Awaits Its First Sprout
              </h2>
              <p className="text-xs text-[#77766E] leading-relaxed">
                Complete any task or gentle focus session in your workspace to sprout your first leaf. Take all the time you need.
              </p>
            </div>
          </div>
        )}

        {/* Soft background rings */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
          <div className="w-[320px] h-[320px] rounded-full border border-[#A6AD99]/40" />
          <div className="w-[480px] h-[480px] rounded-full border border-[#A6AD99]/20 absolute" />
        </div>

        {/* Tree Illustration */}
        <div className="relative w-full max-w-[420px] h-[340px]">
          <svg viewBox="0 0 400 340" className="w-full h-full" fill="none">
            {/* Ground mound */}
            <path
              d="M50 300 Q200 280 350 300 Q200 320 50 300 Z"
              fill="#E3E8DD"
              stroke="#A6AD99"
              strokeWidth="2"
            />
            {/* Moss and grass tufts */}
            <path d="M120 292 Q125 284 130 293" stroke="#39483B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M260 294 Q265 285 270 295" stroke="#39483B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M180 298 Q185 290 190 299" stroke="#39483B" strokeWidth="2.5" strokeLinecap="round" />

            {/* Tree Trunk */}
            <path
              d="M185 300 C185 250 170 220 160 190 C150 160 130 140 100 120 C140 130 165 150 175 175 C185 150 205 130 250 105 C220 130 205 155 200 180 C210 165 235 150 290 140 C250 160 225 180 215 200 C225 240 215 270 215 300 Z"
              fill="#745C47"
              stroke="#534030"
              strokeWidth="2"
            />

            {/* Trunk Wood Grain texture */}
            <path d="M195 240 Q193 265 197 290" stroke="#534030" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            <path d="M205 250 Q207 270 204 290" stroke="#534030" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

            {/* Background cloud canopy shape for fuller stages */}
            {stage >= 2 && (
              <path
                d="M130 140 C110 110 140 70 180 75 C210 50 260 65 270 100 C300 110 305 150 280 175 C260 200 210 205 170 195 C130 190 110 160 130 140 Z"
                fill="#E3E8DD"
                fillOpacity={0.6}
                stroke="#A6AD99"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            )}

            {/* Dynamically Rendered Leaves */}
            {leafPositions.map((leaf) => (
              <g
                key={leaf.id}
                transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rot})`}
                className="transition-all duration-300"
              >
                <path
                  d="M0 0 C-6 -8 -8 -16 0 -22 C8 -16 6 -8 0 0 Z"
                  fill={leaf.isSpecial ? '#C47D61' : leaf.id % 2 === 0 ? '#39483B' : '#6B7E67'}
                  stroke="#22221F"
                  strokeWidth="0.8"
                />
                <line x1="0" y1="-2" x2="0" y2="-15" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.6" />
              </g>
            ))}

            {/* Cute Sloth relaxing on the main trunk fork */}
            <g transform="translate(195, 175) scale(0.4)">
              <circle cx="50" cy="50" r="30" fill="#9B846C" />
              <path d="M30 52 C30 38 70 38 70 52 C70 66 30 66 30 52 Z" fill="#E9E0D2" />
              <ellipse cx="40" cy="50" rx="5" ry="8" fill="#745C47" transform="rotate(-15 40 50)" />
              <ellipse cx="60" cy="50" rx="5" ry="8" fill="#745C47" transform="rotate(15 60 50)" />
              <path d="M37 50 Q40 46 43 50" stroke="#22221F" strokeWidth="2" strokeLinecap="round" />
              <path d="M57 50 Q60 46 63 50" stroke="#22221F" strokeWidth="2" strokeLinecap="round" />
              <ellipse cx="50" cy="56" rx="5" ry="3.5" fill="#39483B" />
              <path d="M47 60 Q50 63 53 60" stroke="#22221F" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {/* Tree Footer Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleNurture}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{waterAnimation ? 'Nurturing Canopy...' : 'Nurture Canopy'}</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs text-[#77766E] hover:text-[#C47D61] hover:bg-[#F5F0E7] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Tree</span>
          </button>
        </div>
      </div>

      {/* Progress Without Guilt Section (Part 5) */}
      <div className="bg-[#E9E0D2]/60 rounded-3xl p-6 md:p-8 border border-[#A6AD99]/30 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#39483B] text-white flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#22221F]">
                Progress Without Guilt Experience
              </h2>
              <p className="text-xs text-[#77766E]">
                Practical tools to protect mental well-being when life gets in the way.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gentle Daily Reset */}
          <div className="bg-white p-5 rounded-2xl border border-[#A6AD99]/30 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#22221F] flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-[#C47D61]" />
                <span>Gentle Daily Reset</span>
              </span>
              <p className="text-xs text-[#77766E] leading-relaxed">
                Had an interrupted day? Reset today's slate cleanly. Unfinished tasks are postponed without shame.
              </p>
            </div>
            <button
              onClick={() => setShowDailyResetConfirm(true)}
              className="w-full py-2 px-3 rounded-xl bg-[#F5F0E7] hover:bg-[#E9E0D2] text-[#22221F] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Perform Daily Reset</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reschedule Unfinished */}
          <div className="bg-white p-5 rounded-2xl border border-[#A6AD99]/30 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#22221F] flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-[#39483B]" />
                <span>Smart Downshift</span>
              </span>
              <p className="text-xs text-[#77766E] leading-relaxed">
                Running late? Downshift immediately to preserve your evening rest rather than stress-multitasking.
              </p>
            </div>
            <button
              onClick={() => setShowRescheduleModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-[#F5F0E7] hover:bg-[#E9E0D2] text-[#22221F] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Reschedule Unfinished</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Anti-Glitch Leaf Rule Explained */}
          <div className="bg-white p-5 rounded-2xl border border-[#A6AD99]/30 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#22221F] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#39483B]" />
                <span>Clear Reward Rules</span>
              </span>
              <p className="text-xs text-[#77766E] leading-relaxed">
                Each unique task earns 1 leaf upon completion. Reopening and checking it again maintains honesty without duplicate leaf exploits.
              </p>
            </div>
            <div className="text-[11px] text-[#39483B] font-semibold bg-[#E3E8DD]/60 p-2 rounded-xl text-center">
              1 Unique Task = 1 Leaf 🌿
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F5F0E7] rounded-3xl max-w-sm w-full p-6 border border-[#A6AD99] shadow-xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#22221F]">Reset Garden Leaves?</h3>
            <p className="text-xs text-[#77766E] leading-relaxed">
              This will return your tree to a quiet newborn sapling (0 leaves). Your completed task history will remain intact.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#77766E] hover:bg-[#E9E0D2]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetGarden();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C47D61] text-white hover:bg-[#b06f55]"
              >
                Yes, Reset Garden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Daily Reset */}
      {showDailyResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F5F0E7] rounded-3xl max-w-md w-full p-6 border border-[#A6AD99] shadow-xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#22221F]">Gentle Daily Reset</h3>
            <p className="text-xs text-[#77766E] leading-relaxed">
              This gently clears today's pressure. Open tasks are acknowledged as deferred to tomorrow with full permission to rest tonight.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDailyResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#77766E] hover:bg-[#E9E0D2]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDailyReset) onDailyReset();
                  setShowDailyResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#39483B] text-white hover:bg-[#2c392e]"
              >
                Apply Gentle Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Harvest / History Notes */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#A6AD99]/30 shadow-xs space-y-4">
        <h3 className="text-base font-serif font-bold text-[#22221F]">Garden Sprout Log</h3>
        <p className="text-xs text-[#77766E]">
          Recent growth milestones recorded without punishment for quiet days.
        </p>

        <div className="space-y-2">
          {garden.historyLogs && garden.historyLogs.length > 0 ? (
            garden.historyLogs.map((log, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-2.5 px-4 rounded-xl bg-[#F5F0E7]/60 border border-[#A6AD99]/20"
              >
                <span className="font-mono text-[#77766E]">{log.date}</span>
                <span className="font-semibold text-[#39483B]">+{log.leavesEarned} leaves sprouted 🌿</span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-[#77766E]">
              No sprouts logged yet. Complete tasks at your own pace!
            </div>
          )}
        </div>
      </div>

      <SmartRescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        openTasks={openTasks}
        onApplySchedule={() => {}}
      />
    </div>
  );
};
