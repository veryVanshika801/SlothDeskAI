import React, { useState } from 'react';
import { QuickCaptureItem, Task, Priority } from '../../types';
import { quickCaptureBrainDump } from '../../services/aiService';
import { SlothMascot } from '../mascot/SlothMascot';
import { X, Sparkles, Check, Plus, AlertCircle, Lightbulb, Clock, BookOpen, CheckSquare } from 'lucide-react';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTasks: (newTasks: Task[]) => void;
  onSaveNotes: (notes: string[]) => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  onSaveTasks,
  onSaveNotes,
}) => {
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [classifiedResult, setClassifiedResult] = useState<QuickCaptureItem | null>(null);
  const [sourceStatus, setSourceStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleClassify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rawText.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSavedSuccess(false);

    try {
      const res = await quickCaptureBrainDump(rawText);
      setClassifiedResult(res.result);
      setSourceStatus(res.source);
    } catch (err: any) {
      setErrorMsg(err.message || 'Classification encountered an issue.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskSelection = (idx: number) => {
    if (!classifiedResult) return;
    const tasks = [...classifiedResult.tasks];
    tasks[idx].selected = !tasks[idx].selected;
    setClassifiedResult({ ...classifiedResult, tasks });
  };

  const toggleNoteSelection = (idx: number) => {
    if (!classifiedResult) return;
    const notes = [...classifiedResult.notes];
    notes[idx].selected = !notes[idx].selected;
    setClassifiedResult({ ...classifiedResult, notes });
  };

  const toggleIdeaSelection = (idx: number) => {
    if (!classifiedResult) return;
    const ideas = [...classifiedResult.ideas];
    ideas[idx].selected = !ideas[idx].selected;
    setClassifiedResult({ ...classifiedResult, ideas });
  };

  const handleSaveSelected = () => {
    if (!classifiedResult) return;

    const selectedTasks: Task[] = classifiedResult.tasks
      .filter((t) => t.selected)
      .map((t) => ({
        id: `task-qc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: t.title,
        priority: t.priority,
        completed: false,
        estimatedMinutes: t.estimatedMinutes,
        tags: ['QuickCapture'],
        createdAt: new Date().toISOString(),
        energyLevel: t.priority === 'high' ? 'high' : 'normal',
      }));

    const selectedNotes = [
      ...classifiedResult.notes.filter((n) => n.selected).map((n) => n.text),
      ...classifiedResult.ideas.filter((i) => i.selected).map((i) => `💡 Idea: ${i.text}`),
      ...classifiedResult.deadlines.filter((d) => d.selected).map((d) => `⏰ Deadline: ${d.title} (${d.date})`),
    ];

    if (selectedTasks.length > 0) onSaveTasks(selectedTasks);
    if (selectedNotes.length > 0) onSaveNotes(selectedNotes);

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
      setRawText('');
      setClassifiedResult(null);
      setSavedSuccess(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F5F0E7] rounded-3xl max-w-2xl w-full border border-[#A6AD99] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-6 bg-[#E9E0D2] border-b border-[#A6AD99]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#39483B] text-[#F5F0E7] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#22221F]">
                Quick Capture & Brain Dump
              </h3>
              <p className="text-xs text-[#77766E]">
                Drop raw thoughts — AI classifies them into Tasks, Notes, and Deadlines.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#77766E] hover:text-[#22221F] hover:bg-[#F5F0E7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!classifiedResult ? (
            <form onSubmit={handleClassify} className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#77766E]">
                What's on your mind? (Type or paste freely)
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="e.g. Remember to buy milk, idea for blog post on slow productivity, finish tax document by Friday, research ergonomic keyboard..."
                rows={5}
                autoFocus
                className="w-full p-4 rounded-2xl bg-white border border-[#A6AD99]/40 text-sm text-[#22221F] placeholder:text-[#77766E] focus:outline-none focus:ring-2 focus:ring-[#39483B]/30 resize-none"
              />

              {errorMsg && (
                <div className="p-3 rounded-xl bg-[#C47D61]/10 border border-[#C47D61]/30 text-xs text-[#C47D61] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#77766E]">
                  Tip: Press <kbd className="font-mono bg-[#E9E0D2] px-1.5 py-0.5 rounded text-[11px]">Cmd+K</kbd> anytime to open
                </span>
                <button
                  type="submit"
                  disabled={isLoading || !rawText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isLoading ? 'Sorting Thoughts...' : 'Classify Stream'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#39483B]">
                  <Check className="w-4 h-4" />
                  <span>Classified successfully ({sourceStatus === 'live_ai' ? 'Live AI' : 'Deterministic Mode'})</span>
                </div>
                <button
                  onClick={() => setClassifiedResult(null)}
                  className="text-xs text-[#77766E] hover:underline"
                >
                  Edit Brain Dump
                </button>
              </div>

              {/* Tasks Section */}
              {classifiedResult.tasks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#39483B]">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Tasks ({classifiedResult.tasks.filter((t) => t.selected).length})</span>
                  </div>
                  <div className="space-y-2">
                    {classifiedResult.tasks.map((task, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleTaskSelection(idx)}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          task.selected
                            ? 'bg-white border-[#39483B]/40'
                            : 'bg-white/40 border-[#A6AD99]/30 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={task.selected}
                            onChange={() => {}}
                            className="rounded text-[#39483B]"
                          />
                          <span className="font-medium text-[#22221F]">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#77766E]">
                          <span className="uppercase text-[10px] font-semibold">{task.priority}</span>
                          <span>·</span>
                          <span>~{task.estimatedMinutes}m</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {classifiedResult.notes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#77766E]">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Reference Notes</span>
                  </div>
                  <div className="space-y-1.5">
                    {classifiedResult.notes.map((note, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleNoteSelection(idx)}
                        className="p-2.5 rounded-xl bg-white border border-[#A6AD99]/30 text-xs flex items-center gap-2.5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={note.selected}
                          onChange={() => {}}
                          className="rounded text-[#39483B]"
                        />
                        <span className="text-[#22221F]">{note.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ideas Section */}
              {classifiedResult.ideas.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C47D61]">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Creative Ideas</span>
                  </div>
                  <div className="space-y-1.5">
                    {classifiedResult.ideas.map((idea, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleIdeaSelection(idx)}
                        className="p-2.5 rounded-xl bg-white border border-[#A6AD99]/30 text-xs flex items-center gap-2.5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={idea.selected}
                          onChange={() => {}}
                          className="rounded text-[#39483B]"
                        />
                        <span className="text-[#22221F]">{idea.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deadlines Section */}
              {classifiedResult.deadlines.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#39483B]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Important Deadlines</span>
                  </div>
                  <div className="space-y-1.5">
                    {classifiedResult.deadlines.map((dl, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#E3E8DD]/60 border border-[#A6AD99]/30 text-xs flex items-center justify-between"
                      >
                        <span className="text-[#22221F] font-medium">{dl.title}</span>
                        <span className="text-[#77766E] font-mono text-[11px]">{dl.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {classifiedResult && (
          <div className="p-4 bg-[#E9E0D2] border-t border-[#A6AD99]/30 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-[#77766E] hover:text-[#22221F]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSelected}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{savedSuccess ? 'Saved to Workspace!' : 'Save Selected Items'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
