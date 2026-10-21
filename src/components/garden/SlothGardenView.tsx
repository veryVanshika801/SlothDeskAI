import React, { useState } from 'react';
import { SlothGardenData } from '../../types';
import { SlothMascot } from '../mascot/SlothMascot';
import { RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';

interface SlothGardenViewProps {
  garden: SlothGardenData;
  onResetGarden: () => void;
  celebratingTaskId?: string | null;
}

export const SlothGardenView: React.FC<SlothGardenViewProps> = ({
  garden,
  onResetGarden,
  celebratingTaskId,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [waterAnimation, setWaterAnimation] = useState(false);

  const leaves = Math.min(garden.leafCount, 40);
  const stage = garden.leafCount < 4 ? 1 : garden.leafCount < 9 ? 2 : garden.leafCount < 16 ? 3 : garden.leafCount < 26 ? 4 : 5;

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

  // Generate leaf coordinates across the tree canopy based on leaf count
  const leafPositions = Array.from({ length: leaves }).map((_, i) => {
    // Distribute leaves organically in an elliptical cloud around cx=200, cy=140
    const angle = (i * 137.5) * (Math.PI / 180); // Golden angle
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
      <div className="bg-[#E9E0D2] rounded-2xl p-6 border border-[#A6AD99]/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <SlothMascot state="garden" size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#77766E]">
                Mindful Progress
              </span>
              <span className="text-[#A6AD99]">·</span>
              <span className="text-xs font-medium text-[#39483B]">No Streaks. No Guilt.</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#22221F] font-semibold mt-1">
              The Sloth Garden
            </h2>
            <p className="text-sm text-[#77766E] max-w-md mt-1">
              Every completed task sprouts a permanent green leaf on your tree. Progress grows slowly, just as nature intended.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#F5F0E7] px-6 py-4 rounded-xl border border-[#A6AD99]/30 text-center">
          <div>
            <div className="text-3xl font-bold text-[#39483B] tabular-nums">{garden.leafCount}</div>
            <div className="text-xs text-[#77766E] font-medium uppercase tracking-wider mt-0.5">Leaves Sprouted</div>
          </div>
          <div className="w-[1px] h-10 bg-[#A6AD99]/40" />
          <div>
            <div className="text-sm font-semibold text-[#22221F]">{stageTitles[stage - 1]}</div>
            <div className="text-xs text-[#77766E]">Growth Stage {stage} of 5</div>
          </div>
        </div>
      </div>

      {celebratingTaskId && (
        <div className="bg-[#E3E8DD] text-[#39483B] px-5 py-3 rounded-xl border border-[#A6AD99]/40 flex items-center justify-between animate-gentle-pulse">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#39483B]" />
            <span className="text-sm font-medium">
              A fresh leaf has sprouted in your garden for finishing your task!
            </span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#39483B]/80">+1 Leaf</span>
        </div>
      )}

      {/* Main Garden Canvas */}
      <div className="relative bg-[#F5F0E7] rounded-2xl border border-[#A6AD99]/30 p-6 md:p-10 flex flex-col items-center justify-center min-h-[460px] overflow-hidden">
        {/* Soft atmospheric background rings */}
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
              d="M185 295 Q190 230 180 180 Q170 140 160 120 M180 180 Q215 160 240 125 M190 220 Q225 200 230 185 M180 200 Q150 170 140 155"
              stroke="#5E4834"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M195 295 Q192 235 186 185 Q178 145 168 125"
              stroke="#7A5D43"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Foliage Canopy Cloud Base (grows with stage) */}
            <g opacity={stage >= 2 ? 0.35 : 0.15}>
              <ellipse cx="200" cy="145" rx={60 + stage * 16} ry={45 + stage * 12} fill="#A6AD99" />
              <ellipse cx="160" cy="130" rx={40 + stage * 10} ry={35 + stage * 8} fill="#E3E8DD" />
              <ellipse cx="240" cy="135" rx={45 + stage * 10} ry={38 + stage * 8} fill="#E3E8DD" />
            </g>

            {/* Rendered sprouted leaves */}
            {leafPositions.map((leaf) => (
              <g
                key={leaf.id}
                transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rot})`}
                className="transition-all duration-700 ease-out hover:scale-125 cursor-pointer"
              >
                <path
                  d="M0 0 Q-8 -12 0 -18 Q8 -12 0 0 Z"
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
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleNurture}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-medium hover:bg-[#2c392e] transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {waterAnimation ? 'Watering Canopy...' : 'Nurture Garden'}
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#77766E] hover:text-[#C47D61] hover:bg-[#E9E0D2]/50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Garden
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F5F0E7] rounded-2xl max-w-sm w-full p-6 border border-[#A6AD99] shadow-xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#22221F]">Reset Garden Leaves?</h3>
            <p className="text-xs text-[#77766E] leading-relaxed">
              This will return your tree to a quiet newborn sapling (0 leaves). Completed tasks in your history will remain untouched.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#77766E] hover:bg-[#E9E0D2]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetGarden();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#C47D61] text-white hover:bg-[#b06f55]"
              >
                Yes, Reset Garden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Harvest / History Notes */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#A6AD99]/30">
        <h3 className="text-base font-serif font-semibold text-[#22221F]">Garden Reflection Log</h3>
        <p className="text-xs text-[#77766E] mt-1 mb-4">
          Recent leaf earnings without streaks or punishment for quiet days.
        </p>

        <div className="space-y-2">
          {garden.historyLogs.map((log, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-[#F5F0E7]/60"
            >
              <span className="font-mono text-[#77766E]">{log.date}</span>
              <span className="font-medium text-[#39483B]">+{log.leavesEarned} leaves sprouted 🌿</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
