import React, { useState, useEffect } from 'react';
import { SlothMascot } from '../mascot/SlothMascot';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  Scissors,
  NotebookPen,
  Coffee,
  Trees,
  Shield,
  ChevronDown,
  Clock,
  Layers,
  Heart,
  Sparkle,
} from 'lucide-react';

interface LandingPageProps {
  onEnterWorkspace: () => void;
  onSelectFeature: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterWorkspace,
  onSelectFeature,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [interactiveLeaves, setInteractiveLeaves] = useState(6);
  const [transformationProgress, setTransformationProgress] = useState(0); // 0 (messy) to 1 (organized)
  const [selectedEnergyTab, setSelectedEnergyTab] = useState<'low' | 'normal' | 'high'>('low');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSproutDemoLeaf = () => {
    setInteractiveLeaves((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E7] text-[#22221F] overflow-x-hidden selection:bg-[#39483B] selection:text-[#F5F0E7]">
      {/* 1. TOP BAR NAVIGATION */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#F5F0E7]/90 backdrop-blur-md border-b border-[#A6AD99]/30 py-3.5 shadow-xs'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between gap-8">
          {/* Zone 1: Single Brand Title */}
          <a
            href="#"
            className="flex items-center gap-2.5 font-serif text-xl font-bold tracking-tight text-[#22221F] whitespace-nowrap shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-[#39483B] text-[#F5F0E7] flex items-center justify-center font-serif text-base font-bold shadow-xs">
              S
            </div>
            <span>SlothDesk AI</span>
          </a>

          {/* Zone 2: 4-5 Clean Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-[#77766E]">
            <a href="#features" className="hover:text-[#22221F] transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#transformation" className="hover:text-[#22221F] transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#garden" className="hover:text-[#22221F] transition-colors whitespace-nowrap shrink-0">
              Sloth Garden
            </a>
            <a href="#transparency" className="hover:text-[#22221F] transition-colors whitespace-nowrap shrink-0">
              AI & Privacy
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onEnterWorkspace}
              className="px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              Open Workspace
            </button>
          </div>
        </div>
      </header>

      {/* 2. CINEMATIC HERO SECTION */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-28 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Soft atmospheric background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#E3E8DD]/60 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Hero Sloth Mascot */}
        <div className="mb-6 relative">
          <SlothMascot state="idle" size="hero" />
          <div className="absolute -bottom-2 -right-4 px-3 py-1 rounded-full bg-[#E9E0D2] border border-[#A6AD99]/40 text-[11px] font-medium text-[#39483B] shadow-xs animate-leaf-float">
            🌿 Moving slow, getting there
          </div>
        </div>

        {/* Tagline & Headline */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs uppercase tracking-widest font-semibold text-[#77766E] flex items-center justify-center gap-2">
            <span>Work Smarter</span>
            <span className="text-[#A6AD99]">·</span>
            <span>Move Slower</span>
            <span className="text-[#A6AD99]">·</span>
            <span className="text-[#39483B]">Get There</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-[#22221F] tracking-tight leading-[1.08] text-balance">
            Your day, without the chaos.
          </h1>

          <p className="text-base sm:text-lg text-[#77766E] max-w-2xl mx-auto leading-relaxed pt-2 font-sans">
            Turn scattered thoughts into gentle plans, slice intimidating projects into tiny 10-minute actions, and let your AI sloth handle the mental weight.
          </p>
        </div>

        {/* Hero CTA Button Cluster */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onEnterWorkspace}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#39483B] text-[#F5F0E7] text-sm font-semibold hover:bg-[#2c392e] transition-all shadow-md hover:scale-[1.02]"
          >
            <span>Get Started — Free Vault</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#transformation"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#E9E0D2] text-[#22221F] text-sm font-semibold hover:bg-[#ded4c3] transition-colors border border-[#A6AD99]/30"
          >
            <span>See How It Works</span>
          </a>
        </div>

        {/* Floating preview mini cards beneath hero */}
        <div className="mt-14 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-[#FFFFFF]/80 backdrop-blur-xs border border-[#A6AD99]/30 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C47D61]">
              Messy Brain Dump
            </span>
            <p className="text-xs text-[#22221F] font-medium truncate">
              "Need to submit assignment, email prof, buy tea..."
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF]/80 backdrop-blur-xs border border-[#39483B]/40 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#39483B]">
              AI Deconstruction
            </span>
            <p className="text-xs text-[#22221F] font-medium truncate">
              → 3 micro-actions (~15m each) with 0 friction
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF]/80 backdrop-blur-xs border border-[#A6AD99]/30 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#77766E]">
              Sloth Garden
            </span>
            <p className="text-xs text-[#22221F] font-medium truncate">
              🌿 +1 Leaf sprouted on your progress tree
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <a
          href="#transformation"
          className="mt-12 text-[#77766E] hover:text-[#22221F] transition-colors flex flex-col items-center gap-1.5 text-xs uppercase tracking-wider font-medium"
        >
          <span>Explore Flow</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </a>
      </section>

      {/* 3. PROBLEM-TO-SOLUTION INTERACTIVE TRANSFORMATION */}
      <section
        id="transformation"
        className="py-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#A6AD99]/20"
      >
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#77766E]">
            From Overwhelm to Clarity
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#22221F]">
            Watch Chaos Dissolve into Calm
          </h2>
          <p className="text-sm text-[#77766E]">
            Drag the slider to see how SlothDesk transforms everyday sensory overload into a serene, structured plan.
          </p>

          {/* Interactive slider */}
          <div className="pt-4 max-w-md mx-auto">
            <div className="flex justify-between text-xs font-semibold text-[#77766E] mb-2">
              <span className={transformationProgress === 0 ? 'text-[#C47D61]' : ''}>
                Messy Input (Chaos)
              </span>
              <span className={transformationProgress === 1 ? 'text-[#39483B]' : ''}>
                SlothDesk AI (Calm)
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={transformationProgress}
              onChange={(e) => setTransformationProgress(Number(e.target.value))}
              className="w-full accent-[#39483B] cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left: The Problem */}
          <div
            className={`p-6 md:p-8 rounded-3xl border transition-all duration-500 flex flex-col justify-between ${
              transformationProgress > 0.5
                ? 'bg-[#F5F0E7]/60 border-[#A6AD99]/20 opacity-60'
                : 'bg-[#FFFFFF] border-[#C47D61]/30 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C47D61] mb-2">
                <span>The Common Problem</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#22221F] mb-4">
                Scattered Thoughts & Crippling Dread
              </h3>
              <div className="space-y-3 text-xs text-[#22221F]">
                <div className="p-3.5 rounded-xl bg-[#F5F0E7] border border-[#A6AD99]/30">
                  <span className="font-semibold text-[#C47D61]">1. Too Many Tasks:</span>
                  <p className="text-[#77766E] mt-0.5">37 tabs open, endless notes apps, fragmented mental bookmarks.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F5F0E7] border border-[#A6AD99]/30">
                  <span className="font-semibold text-[#C47D61]">2. Too Much Information:</span>
                  <p className="text-[#77766E] mt-0.5">Paragraph-long emails and lecture slides with vague expectations.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F5F0E7] border border-[#A6AD99]/30">
                  <span className="font-semibold text-[#C47D61]">3. Zero Mental Energy:</span>
                  <p className="text-[#77766E] mt-0.5">Waking up tired, facing impossible 8-hour schedules, feeling guilty.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#A6AD99]/20 text-xs text-[#77766E] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C47D61]" />
              <span>Result: Paralysis, guilt, and burnout.</span>
            </div>
          </div>

          {/* Right: The Sloth Transformation */}
          <div
            className={`p-6 md:p-8 rounded-3xl border transition-all duration-500 flex flex-col justify-between ${
              transformationProgress < 0.5
                ? 'bg-[#F5F0E7]/60 border-[#A6AD99]/20 opacity-60'
                : 'bg-[#FFFFFF] border-[#39483B]/40 shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#39483B] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The SlothDesk Transformation</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#22221F] mb-4">
                Organized Priorities & Unhurried Action
              </h3>
              <div className="space-y-3 text-xs text-[#22221F]">
                <div className="p-3.5 rounded-xl bg-[#E3E8DD]/60 border border-[#A6AD99]/30">
                  <span className="font-semibold text-[#39483B]">1. Single Clear Priority:</span>
                  <p className="text-[#77766E] mt-0.5">Identifies the ONE task that brings the most relief right now.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#E3E8DD]/60 border border-[#A6AD99]/30">
                  <span className="font-semibold text-[#39483B]">2. Micro-Bite Slices:</span>
                  <p className="text-[#77766E] mt-0.5">Tasks broken into 10-minute actions that start in 5 seconds.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#E3E8DD]/60 border border-[#A6AD99]/30">
                  <span className="font-semibold text-[#39483B]">3. Guilt-Free Postponement:</span>
                  <p className="text-[#77766E] mt-0.5">Explicitly shelves lower-priority burdens without shame.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#A6AD99]/20 text-xs text-[#39483B] flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Result: Calm forward motion, peaceful sleep, growing garden.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LOW-ENERGY SANCTUARY SPOTLIGHT */}
      <section className="py-16 md:py-24 bg-[#E9E0D2] border-y border-[#A6AD99]/30 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#39483B]">
              <Coffee className="w-4 h-4" />
              <span>Compassionate Pacing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#22221F]">
              Low-Energy Mode
            </h2>
            <p className="text-sm text-[#77766E] leading-relaxed">
              Most productivity apps treat you like an industrial conveyor belt. SlothDesk honors that your energy naturally ebbs and flows. When fatigue hits, switch to Low-Energy Mode for a gentle, supportive plan that lets you rest while still moving forward.
            </p>

            <div className="flex gap-2 pt-2">
              {(['low', 'normal', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedEnergyTab(lvl)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                    selectedEnergyTab === lvl
                      ? 'bg-[#39483B] text-[#F5F0E7] shadow-xs'
                      : 'bg-[#F5F0E7] text-[#77766E] hover:text-[#22221F]'
                  }`}
                >
                  {lvl} Energy
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectFeature('low-energy')}
                className="flex items-center gap-2 text-xs font-semibold text-[#39483B] hover:underline"
              >
                <span>Try Low-Energy Mode in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 flex items-center justify-center">
            <div className="bg-[#F5F0E7] p-8 rounded-3xl border border-[#A6AD99]/30 shadow-md flex flex-col items-center max-w-md w-full text-center">
              <SlothMascot state="low-energy" size="xl" />
              <div className="mt-4 font-serif text-lg font-bold text-[#22221F]">
                {selectedEnergyTab === 'low'
                  ? 'Sanctuary Mode Active'
                  : selectedEnergyTab === 'normal'
                  ? 'Steady Flow Active'
                  : 'Deep Sprint Active'}
              </div>
              <p className="text-xs text-[#77766E] mt-1 max-w-xs">
                {selectedEnergyTab === 'low'
                  ? '"We picked just one 15-minute task. Everything else can wait until tomorrow."'
                  : selectedEnergyTab === 'normal'
                  ? '"Steady progress with mindful tea breaks every 45 minutes."'
                  : '"Full focus unlocked. Let\'s clear the hardest bottleneck first."'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURE SHOWCASE CARDS */}
      <section id="features" className="py-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#77766E]">
            Intelligent Tool Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#22221F]">
            Tools Built for Peace of Mind
          </h2>
          <p className="text-sm text-[#77766E]">
            Every feature has a complete, working workflow. No mockups or placeholder buttons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: 'organizer',
              title: 'Lazy Task Organizer',
              desc: 'Dump messy brain streams. The sloth infers priority, realistic durations, and tags.',
              icon: Sparkles,
            },
            {
              id: 'low-energy',
              title: 'Low-Energy Mode',
              desc: 'Create compassionate plans calibrated to your current battery level with zero guilt.',
              icon: Coffee,
            },
            {
              id: 'breakdown',
              title: 'Make It Smaller',
              desc: 'Deconstruct overwhelming monsters into 5 to 15-minute friction-free micro-steps.',
              icon: Scissors,
            },
            {
              id: 'notes',
              title: 'Note-to-Action Converter',
              desc: 'Extract key points, verifiable dates, and concrete tasks from transcripts.',
              icon: NotebookPen,
            },
            {
              id: 'planner',
              title: 'The Slow Planner',
              desc: 'Time blocking that respects human energy with scheduled tea and breathing buffers.',
              icon: CalendarDays,
            },
            {
              id: 'garden',
              title: 'The Sloth Garden',
              desc: 'Sprout permanent leaves on your illustrated tree for every task completed.',
              icon: Trees,
            },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onSelectFeature(feat.id)}
                className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#A6AD99]/30 hover:border-[#39483B] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-[#E3E8DD] text-[#39483B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#22221F] mb-1.5">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#77766E] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#A6AD99]/20 flex items-center justify-between text-xs font-semibold text-[#39483B]">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. SLOTH GARDEN INTERACTIVE PREVIEW */}
      <section
        id="garden"
        className="py-20 md:py-28 bg-[#E3E8DD]/40 border-t border-[#A6AD99]/30 px-6 md:px-12"
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#39483B]">
              <Trees className="w-4 h-4" />
              <span>Anti-Streak Progress</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#22221F]">
              The Sloth Garden Tree
            </h2>
            <p className="text-sm text-[#77766E] leading-relaxed">
              Productivity streaks generate anxiety: if you miss a day, you feel like a failure. SlothDesk replaces streaks with a living tree. Every completed task sprouts a leaf that stays forever. Take a break for a week, and your tree will be waiting peacefully for you.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={handleSproutDemoLeaf}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#39483B] text-[#F5F0E7] text-xs font-semibold hover:bg-[#2c392e] transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Complete Sample Task (+1 Leaf)</span>
              </button>
              <span className="text-xs text-[#77766E] tabular-nums font-mono">
                {interactiveLeaves} leaves sprouted
              </span>
            </div>
          </div>

          <div className="lg:w-1/2 flex items-center justify-center">
            <div className="bg-[#F5F0E7] p-8 rounded-3xl border border-[#A6AD99]/30 shadow-md max-w-md w-full flex flex-col items-center">
              <SlothMascot state="garden" size="lg" />
              <div className="mt-4 text-center">
                <span className="text-3xl font-serif font-bold text-[#39483B] tabular-nums">
                  {interactiveLeaves}
                </span>
                <span className="text-xs text-[#77766E] block font-medium">Leaves Flourishing</span>
              </div>
              <p className="text-[11px] text-[#77766E] mt-3 text-center italic">
                "Growth happens ring by ring, quiet and enduring."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. OPEN AI & TRANSPARENCY */}
      <section
        id="transparency"
        className="py-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto"
      >
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#77766E]">
            Integrity First
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#22221F]">
            Transparent AI & Honest Privacy
          </h2>
          <p className="text-sm text-[#77766E]">
            We never make exaggerated claims about local privacy or fake magic scores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#A6AD99]/30 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-[#E3E8DD] text-[#39483B] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#22221F]">
              Private Browser Vault
            </h3>
            <p className="text-xs text-[#77766E] leading-relaxed">
              Your tasks and planner stay strictly in your browser's private local storage. No corporate user databases or analytics trackers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#A6AD99]/30 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-[#E3E8DD] text-[#39483B] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#22221F]">
              Open-Weight AI Support
            </h3>
            <p className="text-xs text-[#77766E] leading-relaxed">
              Powered by Gemma 2 and Gemini 3.8 Flash models with transparent status badges distinguishing live inference from demo heuristics.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#A6AD99]/30 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-[#E3E8DD] text-[#39483B] flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#22221F]">
              Complete Data Ownership
            </h3>
            <p className="text-xs text-[#77766E] leading-relaxed">
              Export your full workspace anytime as clean JSON, or wipe your local records with a single click. Zero lock-in.
            </p>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA & FOOTER */}
      <section className="py-20 md:py-28 bg-[#E9E0D2] border-t border-[#A6AD99]/30 px-6 md:px-12 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <SlothMascot state="encouragement" size="lg" />
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#22221F]">
            Ready to make room for a calmer day?
          </h2>
          <p className="text-base text-[#77766E] max-w-xl mx-auto">
            Step into SlothDesk AI. Turn everyday chaos into quiet, deliberate forward progress at your own pace.
          </p>

          <div className="pt-2">
            <button
              onClick={onEnterWorkspace}
              className="px-8 py-4 rounded-2xl bg-[#39483B] text-[#F5F0E7] text-sm font-semibold hover:bg-[#2c392e] transition-all shadow-md hover:scale-[1.02]"
            >
              Enter SlothDesk Workspace
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#A6AD99]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77766E]">
        <div className="flex items-center gap-2 font-serif font-semibold text-[#22221F]">
          <span>SlothDesk AI</span>
          <span>·</span>
          <span className="font-sans font-normal text-[#77766E]">Work smarter. Move slower. Get there.</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#features" className="hover:text-[#22221F] transition-colors">Features</a>
          <a href="#garden" className="hover:text-[#22221F] transition-colors">Sloth Garden</a>
          <a href="#transparency" className="hover:text-[#22221F] transition-colors">AI & Privacy</a>
          <button onClick={onEnterWorkspace} className="hover:text-[#39483B] font-semibold transition-colors">Workspace</button>
        </div>
      </footer>
    </div>
  );
};
