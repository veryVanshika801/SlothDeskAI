import React, { useState, useEffect } from 'react';
import { AppSettings, AIServiceStatus } from '../../types';
import { fetchAIStatus } from '../../services/aiService';
import { SlothMascot } from '../mascot/SlothMascot';
import {
  Sliders,
  Sparkles,
  Download,
  Trash2,
  Shield,
  Eye,
  Check,
  Zap,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onExportData: () => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onClearAllData,
}) => {
  const [aiStatus, setAiStatus] = useState<AIServiceStatus | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isExported, setIsExported] = useState(false);

  useEffect(() => {
    fetchAIStatus().then(setAiStatus);
  }, []);

  const handleExport = () => {
    onExportData();
    setIsExported(true);
    setTimeout(() => setIsExported(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#E9E0D2] rounded-2xl p-6 border border-[#A6AD99]/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <SlothMascot state="idle" size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#77766E]">
                Preferences & Trust
              </span>
              <span className="text-[#A6AD99]">·</span>
              <span className="text-xs font-medium text-[#39483B]">Application Settings</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#22221F] font-semibold mt-1">
              Honest Settings & Open Transparency
            </h2>
            <p className="text-sm text-[#77766E] max-w-xl mt-1">
              Configure your sanctuary, manage your local data, and review exact model architecture without deceptive claims.
            </p>
          </div>
        </div>
      </div>

      {/* AI Transparency & Architecture Panel */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 border border-[#A6AD99]/30 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#39483B]">
          <Sparkles className="w-4 h-4" />
          <span>AI Architecture & Connection Transparency</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#F5F0E7]/60 border border-[#A6AD99]/30 space-y-2">
            <span className="text-xs text-[#77766E] font-medium">Configured Model</span>
            <div className="text-sm font-semibold text-[#22221F]">
              {aiStatus?.modelName || 'Gemma 2 9B / Gemini 3.8 Flash'}
            </div>
            <p className="text-xs text-[#77766E] leading-relaxed">
              Open-weight Gemma 2 and Gemini 3.8 Flash inference via server-side secure proxy.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F0E7]/60 border border-[#A6AD99]/30 space-y-2">
            <span className="text-xs text-[#77766E] font-medium">Connection Status</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#39483B]">
              <span className="w-2 h-2 rounded-full bg-[#39483B]" />
              <span>{aiStatus?.isDemoMode ? 'Demo Mode (Offline / Local Heuristics)' : 'Live AI Connected'}</span>
            </div>
            <p className="text-xs text-[#77766E] leading-relaxed">
              {aiStatus?.statusMessage || 'Checking API connection...'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#E3E8DD]/50 border border-[#A6AD99]/30 text-xs text-[#22221F] space-y-1">
          <span className="font-semibold text-[#39483B]">Privacy Commitment:</span>
          <p className="text-[#77766E]">
            Your tasks and notes are stored strictly in your browser's private local storage. When you submit text to AI tools, it is sent securely to the server endpoint without user tracking or telemetry profiling.
          </p>
        </div>
      </div>

      {/* Experience Preferences */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 border border-[#A6AD99]/30 space-y-6">
        <h3 className="text-base font-serif font-bold text-[#22221F] border-b border-[#A6AD99]/20 pb-3">
          Experience Preferences
        </h3>

        <div className="space-y-4">
          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F0E7]/40 border border-[#A6AD99]/20">
            <div>
              <div className="text-sm font-medium text-[#22221F]">Reduced Motion</div>
              <div className="text-xs text-[#77766E]">
                Minimizes swaying mascot animations and scroll transitions for a still experience.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) =>
                onUpdateSettings({ ...settings, reducedMotion: e.target.checked })
              }
              className="w-5 h-5 rounded text-[#39483B] focus:ring-[#39483B] cursor-pointer"
            />
          </div>

          {/* Default Energy */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F0E7]/40 border border-[#A6AD99]/20">
            <div>
              <div className="text-sm font-medium text-[#22221F]">Default Startup Energy</div>
              <div className="text-xs text-[#77766E]">
                Preselects your typical daily capacity level for AI scheduling.
              </div>
            </div>
            <select
              value={settings.defaultEnergy}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  defaultEnergy: e.target.value as any,
                })
              }
              className="bg-[#FFFFFF] px-3 py-1.5 rounded-lg border border-[#A6AD99]/40 text-xs text-[#22221F]"
            >
              <option value="low">Low Energy (Gentle pace)</option>
              <option value="normal">Normal Energy (Balanced)</option>
              <option value="high">High Energy (Sprint flow)</option>
            </select>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F0E7]/40 border border-[#A6AD99]/20">
            <div>
              <div className="text-sm font-medium text-[#22221F]">Surface Theme</div>
              <div className="text-xs text-[#77766E]">
                Warm ivory background with calming forest green and muted taupe.
              </div>
            </div>
            <span className="text-xs font-semibold text-[#39483B]">Soft Cream Sanctuary</span>
          </div>
        </div>
      </div>

      {/* Data Management & Export */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 border border-[#A6AD99]/30 space-y-4">
        <h3 className="text-base font-serif font-bold text-[#22221F] border-b border-[#A6AD99]/20 pb-3">
          Data Ownership
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-[#22221F]">Export Workspace Data</div>
            <div className="text-xs text-[#77766E]">
              Download all tasks, tree progress, and history logs as a clean JSON file.
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E3E8DD] text-[#39483B] text-xs font-semibold hover:bg-[#d6ded0] transition-colors"
          >
            <Download className="w-4 h-4" />
            {isExported ? 'Exported Successfully!' : 'Download JSON Export'}
          </button>
        </div>

        <div className="pt-4 border-t border-[#A6AD99]/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-[#C47D61]">Reset & Clear All Data</div>
            <div className="text-xs text-[#77766E]">
              Wipes all local browser tasks, garden history, and planner blocks.
            </div>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#C47D61] hover:bg-[#C47D61]/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Local Data
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F5F0E7] rounded-2xl max-w-sm w-full p-6 border border-[#A6AD99] shadow-xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#22221F]">Wipe all local data?</h3>
            <p className="text-xs text-[#77766E] leading-relaxed">
              This will permanently reset tasks, the tree garden, and logs to the fresh initial state. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#77766E] hover:bg-[#E9E0D2]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  setShowClearConfirm(false);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#C47D61] text-white hover:bg-[#b06f55]"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
