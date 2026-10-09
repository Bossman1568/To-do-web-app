import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Settings, CheckCircle2, Volume2, Target } from 'lucide-react';
import { Task } from '../types/task';
import confetti from 'canvas-confetti';

interface PomodoroTimerProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ tasks, onToggleComplete }) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);

  const activeTasks = tasks.filter(t => !t.completed);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Audio beep generator using Web Audio API
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // Audio not supported or blocked
    }
  };

  // Set time left when mode or duration changes
  const setModeAndReset = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'focus') setTimeLeft(focusDuration * 60);
    else if (newMode === 'shortBreak') setTimeLeft(shortBreakDuration * 60);
    else if (newMode === 'longBreak') setTimeLeft(longBreakDuration * 60);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      playChime();
      if (mode === 'focus') {
        setCompletedSessions(prev => prev + 1);
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // safe
        }
        // Switch to break
        if ((completedSessions + 1) % 4 === 0) {
          setModeAndReset('longBreak');
        } else {
          setModeAndReset('shortBreak');
        }
      } else {
        setModeAndReset('focus');
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, completedSessions, focusDuration, shortBreakDuration, longBreakDuration]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'focus') setTimeLeft(focusDuration * 60);
    else if (mode === 'shortBreak') setTimeLeft(shortBreakDuration * 60);
    else if (mode === 'longBreak') setTimeLeft(longBreakDuration * 60);
  };

  const skipTimer = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setModeAndReset('shortBreak');
    } else {
      setModeAndReset('focus');
    }
  };

  const totalDuration =
    mode === 'focus'
      ? focusDuration * 60
      : mode === 'shortBreak'
      ? shortBreakDuration * 60
      : longBreakDuration * 60;

  const progressPercent = Math.max(0, Math.min(100, Math.round(((totalDuration - timeLeft) / totalDuration) * 100)));

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-sm p-6 sm:p-8 transition-colors text-center">
        {/* Mode Selector Tabs */}
        <div className="inline-flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-6">
          <button
            onClick={() => setModeAndReset('focus')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'focus'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Focus ({focusDuration}m)
          </button>
          <button
            onClick={() => setModeAndReset('shortBreak')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'shortBreak'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Short Break ({shortBreakDuration}m)
          </button>
          <button
            onClick={() => setModeAndReset('longBreak')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'longBreak'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Long Break ({longBreakDuration}m)
          </button>
        </div>

        {/* Circular Progress & Big Digital Timer */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center mb-6">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-neutral-100 dark:stroke-neutral-800"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Active progress ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className={`${
                mode === 'focus'
                  ? 'stroke-indigo-600 dark:stroke-indigo-400'
                  : 'stroke-emerald-500'
              } transition-all duration-300 ease-linear`}
              strokeWidth="5"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white tabular-nums">
              {formattedTime}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 mt-2">
              {mode === 'focus' ? 'Deep Work Session' : 'Rest & Recharge'}
            </span>
          </div>
        </div>

        {/* Action Controls: Start/Pause, Reset, Skip */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-2xl font-semibold text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              isRunning
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700'
                : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={resetTimer}
            title="Reset timer"
            className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={skipTimer}
            title="Skip to next phase"
            className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Timer Settings"
            className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
              showSettings
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Sessions stats */}
        <div className="flex items-center justify-center gap-6 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
          <span>Completed: {completedSessions} Pomodoros</span>
          <span>·</span>
          <span>Today: {completedSessions * focusDuration} min focused</span>
        </div>

        {/* Inline Settings Drawer */}
        {showSettings && (
          <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-3 gap-3 text-left">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Focus (min)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={focusDuration}
                onChange={e => {
                  const val = parseInt(e.target.value, 10) || 25;
                  setFocusDuration(val);
                  if (mode === 'focus') setTimeLeft(val * 60);
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Short Break
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={shortBreakDuration}
                onChange={e => {
                  const val = parseInt(e.target.value, 10) || 5;
                  setShortBreakDuration(val);
                  if (mode === 'shortBreak') setTimeLeft(val * 60);
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Long Break
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={longBreakDuration}
                onChange={e => {
                  const val = parseInt(e.target.value, 10) || 15;
                  setLongBreakDuration(val);
                  if (mode === 'longBreak') setTimeLeft(val * 60);
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Selected Task Anchor Panel */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-sm p-5 transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-indigo-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            Current Focus Task
          </h3>
        </div>

        <select
          value={selectedTaskId}
          onChange={e => setSelectedTaskId(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="">Select a task to anchor this focus session...</option>
          {activeTasks.map(t => (
            <option key={t.id} value={t.id}>
              [{t.priority.toUpperCase()}] {t.title}
            </option>
          ))}
        </select>

        {selectedTask && (
          <div className="mt-4 p-4 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/30 dark:bg-indigo-950/20 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                {selectedTask.title}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {selectedTask.description || `Priority: ${selectedTask.priority}`}
              </p>
            </div>
            <button
              onClick={() => {
                onToggleComplete(selectedTask.id);
                setSelectedTaskId('');
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
