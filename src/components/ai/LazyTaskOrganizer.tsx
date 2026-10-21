import React, { useState } from 'react';
import { Task, OrganizedTaskProposal, Priority } from '../../types';
import { organizeMessyNotes } from '../../services/aiService';
import { SlothMascot } from '../mascot/SlothMascot';
import { Sparkles, Check, Plus, Copy, RotateCcw, Clock, AlertCircle } from 'lucide-react';

interface LazyTaskOrganizerProps {
  onAddTasks: (newTasks: Task[]) => void;
  onOpenTaskTab: () => void;
}

export const LazyTaskOrganizer: React.FC<LazyTaskOrganizerProps> = ({
  onAddTasks,
  onOpenTaskTab,
}) => {
  const [inputText, setInputText] = useState(
    'Finish the assignment, email my professor about the extension, prepare slides for Thursday meeting, pick up green tea and fruit, and read chapter 4.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [proposals, setProposals] = useState<OrganizedTaskProposal[]>([]);
  const [sourceStatus, setSourceStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);

  const handleOrganize = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessSaved(false);

    try {
      const res = await organizeMessyNotes(inputText);
      setProposals(res.tasks);
      setSourceStatus(res.source);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Inference encountered an issue. Preserved your original notes.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setProposals((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const updateProposal = (id: string, field: keyof OrganizedTaskProposal, value: any) => {
    setProposals((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleAddSelected = () => {
    const selected = proposals.filter((p) => p.selected);
    if (selected.length === 0) return;

    const formattedTasks: Task[] = selected.map((p) => ({
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: p.title,
      description: p.description,
      priority: p.priority,
      completed: false,
      estimatedMinutes: p.estimatedMinutes,
      tags: p.tags,
      dueDate: p.suggestedDue || undefined,
      createdAt: new Date().toISOString(),
      energyLevel: p.priority === 'high' ? 'high' : p.priority === 'low' ? 'low' : 'normal',
    }));

    onAddTasks(formattedTasks);
    setSuccessSaved(true);
    setTimeout(() => {
      onOpenTaskTab();
    }, 1200);
  };

  const handleCopy = () => {
    const text = proposals
      .map((p) => `- [${p.priority.toUpperCase()}] ${p.title} (~${p.estimatedMinutes}m)`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#E9E0D2] rounded-2xl p-6 border border-[#A6AD99]/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <SlothMascot state={isLoading ? 'thinking' : 'idle'} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#77766E]">
                AI Toolkit
              </span>
              <span className="text-[#A6AD99]">·</span>
              <span className="text-xs font-medium text-[#39483B]">Lazy Task Organizer</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#22221F] font-semibold mt-1">
              Dump Your Thoughts, Get Organized
            </h2>
            <p className="text-sm text-[#77766E] max-w-xl mt-1">
              Paste unstructured brainstorms, message fragments, or scribbled to-do lists. The sloth parses priorities, realistic timeframes, and actions.
            </p>
          </div>
        </div>

        {sourceStatus && (
          <div className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-[#F5F0E7] text-[#39483B] border border-[#A6AD99]/40 shrink-0">
            Engine: {sourceStatus === 'live_ai' ? 'Live Gemini / Gemma' : 'Deterministic Heuristic'}
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#A6AD99]/30 space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#77766E]">
          Messy Thought Stream
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. Email John, buy cat food, fix landing bug, send invoice..."
          rows={4}
          className="w-full p-4 rounded-xl bg-[#F5F0E7]/60 border border-[#A6AD99]/40 text-sm text-[#22221F] placeholder:text-[#77766E] focus:outline-none focus:ring-2 focus:ring-[#39483B]/30 resize-none font-sans"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-[#77766E]">
            <span>Raw text will be structured without inventing false deadlines.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setInputText('')}
              className="px-3.5 py-2 rounded-xl text-xs text-[#77766E] hover:text-[#22221F] hover:bg-[#E9E0D2]/50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleOrganize}
              disabled={isLoading || !inputText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] disabled:opacity-50 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isLoading ? 'Organizing Gently...' : 'Organize My Mess'}
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-[#C47D61]/10 border border-[#C47D61]/30 text-[#C47D61] p-4 rounded-xl text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Structured Output Cards */}
      {proposals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-semibold text-[#22221F]">
              Structured Proposals ({proposals.filter((p) => p.selected).length} selected)
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#77766E] hover:bg-[#E9E0D2] transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy List'}
              </button>
              <button
                onClick={handleOrganize}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#77766E] hover:bg-[#E9E0D2] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposals.map((prop) => (
              <div
                key={prop.id}
                className={`p-4 rounded-xl border transition-all ${
                  prop.selected
                    ? 'bg-[#FFFFFF] border-[#39483B]/40 shadow-xs'
                    : 'bg-[#F5F0E7]/60 border-[#A6AD99]/20 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={prop.selected}
                    onChange={() => toggleSelect(prop.id)}
                    className="mt-1 w-4 h-4 rounded text-[#39483B] focus:ring-[#39483B] cursor-pointer"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={prop.title}
                      onChange={(e) => updateProposal(prop.id, 'title', e.target.value)}
                      className="w-full text-sm font-medium text-[#22221F] bg-transparent border-b border-transparent hover:border-[#A6AD99] focus:border-[#39483B] focus:outline-none pb-0.5"
                    />

                    <textarea
                      value={prop.description}
                      onChange={(e) => updateProposal(prop.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full text-xs text-[#77766E] bg-transparent border-b border-transparent hover:border-[#A6AD99] focus:border-[#39483B] focus:outline-none resize-none"
                    />

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      {/* Priority selector */}
                      <select
                        value={prop.priority}
                        onChange={(e) =>
                          updateProposal(prop.id, 'priority', e.target.value as Priority)
                        }
                        className="bg-[#F5F0E7] text-[#22221F] px-2 py-1 rounded text-xs border border-[#A6AD99]/40 focus:outline-none"
                      >
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>

                      {/* Estimated duration */}
                      <div className="flex items-center gap-1 text-[#77766E]">
                        <Clock className="w-3.5 h-3.5" />
                        <input
                          type="number"
                          value={prop.estimatedMinutes}
                          onChange={(e) =>
                            updateProposal(prop.id, 'estimatedMinutes', Number(e.target.value))
                          }
                          className="w-12 bg-[#F5F0E7] text-center rounded px-1 py-0.5 border border-[#A6AD99]/40 text-xs text-[#22221F]"
                        />
                        <span>mins</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#77766E]">
              Click any card title or details to customize before adding.
            </span>
            <button
              onClick={handleAddSelected}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              {successSaved ? 'Added! Redirecting...' : `Add Selected to Tasks (${proposals.filter((p) => p.selected).length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
