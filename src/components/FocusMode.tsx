import React, { useState, useEffect } from 'react';
import { Minimize2, Check, ArrowRight, Play, Pause, RotateCcw, Target } from 'lucide-react';
import { Task } from '../types/task';
import confetti from 'canvas-confetti';

interface FocusModeProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onExit: () => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ tasks, onToggleComplete, onExit }) => {
  const activeTasks = tasks.filter(t => !t.completed);
  // Default to highest priority active task (urgent -> high -> medium -> low)
  const sortedActive = [...activeTasks].sort((a, b) => {
    const weights = { urgent: 4, high: 3, medium: 2, low: 1 };
    return weights[b.priority] - weights[a.priority];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const currentTask = sortedActive[currentIndex] || null;

  // Escape key handler to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  // Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const handleCompleteCurrent = () => {
    if (!currentTask) return;
    try {
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
    } catch {
      // safe
    }
    onToggleComplete(currentTask.id);
    if (currentIndex >= sortedActive.length - 1) {
      setCurrentIndex(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < sortedActive.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const minStr = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secStr = String(seconds % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-white flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
            Focus Mode · Zero Distraction
          </span>
        </div>

        <button
          onClick={onExit}
          className="px-3.5 py-1.5 rounded-xl border border-neutral-800 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Exit Focus (Esc)</span>
        </button>
      </div>

      {/* Main Focus Centerpiece */}
      <div className="max-w-2xl w-full mx-auto text-center my-auto py-8">
        {currentTask ? (
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <span
                className={`w-2 h-2 rounded-full ${
                  currentTask.priority === 'urgent'
                    ? 'bg-rose-500'
                    : currentTask.priority === 'high'
                    ? 'bg-orange-500'
                    : 'bg-emerald-500'
                }`}
              />
              <span>{currentTask.priority} Priority · {currentTask.category}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {currentTask.title}
            </h1>

            {currentTask.description && (
              <p className="text-neutral-400 text-base max-w-lg mx-auto leading-relaxed">
                {currentTask.description}
              </p>
            )}

            {/* Subtasks checklist if any */}
            {currentTask.subtasks && currentTask.subtasks.length > 0 && (
              <div className="max-w-md mx-auto text-left bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 space-y-2 mt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Subtasks Checklist
                </span>
                {currentTask.subtasks.map(s => (
                  <div key={s.id} className="flex items-center gap-2.5 text-xs text-neutral-300">
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        s.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-neutral-700'
                      }`}
                    >
                      {s.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className={s.completed ? 'line-through text-neutral-500' : ''}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Minimal Timer Display */}
            <div className="pt-4 flex items-center justify-center gap-4">
              <span className="text-4xl font-mono font-bold tabular-nums text-neutral-300">
                {minStr}:{secStr}
              </span>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
              >
                {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setSeconds(25 * 60);
                }}
                className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Big Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={handleCompleteCurrent}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Mark Completed</span>
              </button>

              {sortedActive.length > 1 && (
                <button
                  onClick={handleNext}
                  className="px-5 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Next Task</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">No active tasks to focus on!</h2>
            <p className="text-neutral-400 text-sm">
              All tasks are completed. Exit focus mode to create new goals.
            </p>
            <button
              onClick={onExit}
              className="px-5 py-2.5 rounded-xl bg-white text-neutral-950 text-xs font-semibold hover:bg-neutral-200 transition-colors"
            >
              Back to Workspace
            </button>
          </div>
        )}
      </div>

      {/* Footer Navigation Info */}
      <div className="max-w-4xl w-full mx-auto text-center text-neutral-500 text-xs">
        {sortedActive.length > 0 && (
          <span>
            Task {currentIndex + 1} of {sortedActive.length} active tasks · Press Esc anytime to exit
          </span>
        )}
      </div>
    </div>
  );
};
