import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, AIServiceStatus } from '../../types';
import { fetchAIStatus } from '../../services/aiService';
import { SlothMascot } from '../mascot/SlothMascot';
import { generateExportBackup, validateBackupJson, restoreBackup } from '../../utils/storage';
import {
  Sliders,
  Sparkles,
  Download,
  Upload,
  Trash2,
  Shield,
  Eye,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClearAllData: () => void;
  onLoadSampleData: () => void;
  onRestoreData: (backup: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearAllData,
  onLoadSampleData,
  onRestoreData,
}) => {
  const [aiStatus, setAiStatus] = useState<AIServiceStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isExported, setIsExported] = useState(false);

  // Import states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importPreview, setImportPreview] = useState<{
    backup: any;
    summary: { taskCount: number; leafCount: number; plannerBlocks: number };
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const checkStatus = () => {
    setIsCheckingStatus(true);
    fetchAIStatus()
      .then(setAiStatus)
      .finally(() => setIsCheckingStatus(false));
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleExport = () => {
    const jsonStr = generateExportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slothdesk_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExported(true);
    setTimeout(() => setIsExported(false), 2500);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateBackupJson(content);
      if (validation.isValid && validation.data && validation.summary) {
        setImportPreview({ backup: validation.data, summary: validation.summary });
      } else {
        setImportError(validation.error || 'Failed to parse backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (importPreview) {
      restoreBackup(importPreview.backup);
      onRestoreData(importPreview.backup);
      setImportPreview(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#E9E0D2] rounded-2xl p-6 border border-[#A6AD99]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
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
              Manage your offline local vault, backup and restore data, and inspect verified model inference architecture.
            </p>
          </div>
        </div>
      </div>

      {/* AI Transparency & Architecture Panel */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 border border-[#A6AD99]/30 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#A6AD99]/20 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#39483B]">
            <Sparkles className="w-4 h-4" />
            <span>AI Inference & Model Architecture</span>
          </div>
          <button
            onClick={checkStatus}
            disabled={isCheckingStatus}
            className="flex items-center gap-1.5 text-xs text-[#77766E] hover:text-[#22221F]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
            <span>Check Status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-[#F5F0E7]/60 border border-[#A6AD99]/30 space-y-2">
            <span className="text-xs text-[#77766E] font-medium">Configured Model & Engine</span>
            <div className="text-sm font-semibold text-[#22221F]">
              {aiStatus?.modelName || 'Checking model...'}
            </div>
            <div className="text-xs text-[#77766E]">
              Provider: <span className="font-semibold text-[#39483B]">{aiStatus?.providerLabel || 'Local'}</span>
              {aiStatus?.isOpenWeight ? ' (Open-Weight Architecture)' : ' (Google GenAI Architecture)'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F0E7]/60 border border-[#A6AD99]/30 space-y-2">
            <span className="text-xs text-[#77766E] font-medium">Active Inference Mode</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#39483B]">
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus?.isDemoMode ? 'bg-[#C47D61]' : 'bg-[#39483B]'
                }`}
              />
              <span>{aiStatus?.isDemoMode ? 'Demo Mode (Local Heuristics)' : 'Live AI Inference Active'}</span>
            </div>
            <p className="text-xs text-[#77766E] leading-relaxed">
              {aiStatus?.statusMessage}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#E3E8DD]/50 border border-[#A6AD99]/30 text-xs text-[#22221F] space-y-1">
          <span className="font-semibold text-[#39483B]">Zero-Tracking Privacy Promise:</span>
          <p className="text-[#77766E]">
            All task descriptions, subtasks, and garden leaves are saved locally in your browser's private local storage. When submitting notes to an AI tool, text is sent securely to the server endpoint without user tracking or model training.
          </p>
        </div>
      </div>

      {/* Experience Preferences */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 border border-[#A6AD99]/30 space-y-6 shadow-xs">
        <h3 className="text-base font-serif font-bold text-[#22221F] border-b border-[#A6AD99]/20 pb-3">
          Experience Preferences
        </h3>

        <div className="space-y-4">
          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F0E7]/40 border border-[#A6AD99]/20">
            <div>
              <div className="text-sm font-medium text-[#22221F]">Reduced Motion Mode</div>
              <div className="text-xs text-[#77766E]">
                Silences swaying animations and reduces transitions for a completely still interface.
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

          {/* Default Startup Energy */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F0E7]/40 border border-[#A6AD99]/20">
            <div>
              <div className="text-sm font-medium text-[#22221F]">Default Daily Energy</div>
              <div className="text-xs text-[#77766E]">
                Calibrates the starting pacing when opening Low-Energy Mode.
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
              <option value="low">Low Energy (Gentle single-focus)</option>
              <option value="normal">Normal Energy (Balanced flow)</option>
              <option value="high">High Energy (Sprint mode)</option>
            </select>
          </div>

          {/* Theme Palette */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F0E7]/40 border border-[#A6AD99]/20">
            <div>
              <div className="text-sm font-medium text-[#22221F]">Color Scheme</div>
              <div className="text-xs text-[#77766E]">
                Warm ivory with forest green and pale sage accents.
              </div>
            </div>
            <span className="text-xs font-semibold text-[#39483B]">Soft Cream Sanctuary</span>
          </div>
        </div>
      </div>

      {/* Data Management & Backup Restoration */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 border border-[#A6AD99]/30 space-y-6 shadow-xs">
        <h3 className="text-base font-serif font-bold text-[#22221F] border-b border-[#A6AD99]/20 pb-3">
          Data Ownership & Backup
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export Button */}
          <div className="p-4 rounded-xl bg-[#F5F0E7]/40 border border-[#A6AD99]/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-sm font-medium text-[#22221F]">Export Workspace Backup</div>
              <div className="text-xs text-[#77766E] mt-0.5">
                Download tasks, tree growth, logs, and schedule as a JSON file.
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E3E8DD] text-[#39483B] text-xs font-semibold hover:bg-[#d6ded0] transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{isExported ? 'Backup Downloaded!' : 'Export JSON Backup'}</span>
            </button>
          </div>

          {/* Import Button */}
          <div className="p-4 rounded-xl bg-[#F5F0E7]/40 border border-[#A6AD99]/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-sm font-medium text-[#22221F]">Restore from Backup</div>
              <div className="text-xs text-[#77766E] mt-0.5">
                Restore previously exported SlothDesk JSON with schema validation.
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#A6AD99]/40 text-[#22221F] text-xs font-semibold hover:bg-[#F5F0E7] transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Backup JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {importError && (
          <div className="p-3 rounded-xl bg-[#C47D61]/10 border border-[#C47D61]/30 text-xs text-[#C47D61] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {/* Import Confirmation Preview Modal */}
        {importPreview && (
          <div className="p-4 rounded-xl bg-[#E3E8DD]/80 border border-[#39483B]/40 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-semibold text-[#39483B]">
              <Check className="w-4 h-4" />
              <span>Valid Backup Detected</span>
            </div>
            <div className="text-[#22221F]">
              Contains <strong>{importPreview.summary.taskCount} tasks</strong>,{' '}
              <strong>{importPreview.summary.leafCount} garden leaves</strong>, and{' '}
              <strong>{importPreview.summary.plannerBlocks} planner blocks</strong>.
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleConfirmImport}
                className="px-4 py-2 rounded-xl bg-[#39483B] text-white font-semibold hover:bg-[#2c392e]"
              >
                Confirm Restoration
              </button>
              <button
                onClick={() => setImportPreview(null)}
                className="px-3 py-2 rounded-xl text-[#77766E] hover:text-[#22221F]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Starter Data Options */}
        <div className="pt-4 border-t border-[#A6AD99]/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-[#22221F]">Demo Sample Data</div>
            <div className="text-xs text-[#77766E]">
              Reload initial peaceful tasks and tree growth if you wish to explore.
            </div>
          </div>
          <button
            onClick={onLoadSampleData}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#39483B] bg-[#E3E8DD] hover:bg-[#d6ded0] transition-colors"
          >
            Load Sample Data
          </button>
        </div>

        {/* Destructive Clear */}
        <div className="pt-4 border-t border-[#A6AD99]/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-[#C47D61]">Wipe SlothDesk Vault</div>
            <div className="text-xs text-[#77766E]">
              Safely removes all SlothDesk storage keys from your browser.
            </div>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#C47D61] hover:bg-[#C47D61]/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Local Vault</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F5F0E7] rounded-3xl max-w-sm w-full p-6 border border-[#A6AD99] shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#22221F]">Clear all local data?</h3>
            <p className="text-xs text-[#77766E] leading-relaxed">
              This will safely clear your SlothDesk tasks and progress. Other website cookies and storage remain completely untouched.
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
                Yes, Clear Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
