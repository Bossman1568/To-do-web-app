import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  AlertCircle,
  Minimize2,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { ChatMessage, TaskActionProposal, AIProductivityContext } from '../types/ai';
import { sendChatMessage } from '../services/aiService';
import { ActionProposalCard } from './ActionProposalCard';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context: AIProductivityContext;
  onApplyAction: (proposal: TaskActionProposal) => void;
}

const DEFAULT_WELCOME: ChatMessage = {
  id: 'welcome-1',
  role: 'assistant',
  content: `Hello! I'm your **TaskFlow AI Productivity Coach**. I have real-time visibility into your tasks, deadlines, and daily goals.\n\nHow can I help you be more productive today?`,
  timestamp: new Date().toISOString(),
};

const SUGGESTED_PROMPTS = [
  'Help me plan my day.',
  'Which tasks should I prioritize?',
  'Break a large task into smaller steps.',
  'Help me overcome procrastination.',
  'Summarize my pending tasks.',
];

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  isOpen,
  onClose,
  context,
  onApplyAction,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('taskflow_ai_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return [DEFAULT_WELCOME];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('taskflow_ai_history', JSON.stringify(messages));
    } catch {
      // safe
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText ?? input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    setMessages(prev => [...prev, userMsg]);
    if (!messageText) setInput('');
    setIsLoading(true);
    setLastFailedMessage(null);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const result = await sendChatMessage(textToSend, historyPayload, context);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        actionProposal: result.actionProposal,
        isDemoMode: result.isDemoMode,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: unknown) {
      setLastFailedMessage(textToSend);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an issue generating a response. Please check your connection and try again.',
        timestamp: new Date().toISOString(),
        status: 'error',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear your conversation history with the assistant?')) {
      setMessages([DEFAULT_WELCOME]);
      localStorage.removeItem('taskflow_ai_history');
      setLastFailedMessage(null);
    }
  };

  const handleApplyProposal = (proposal: TaskActionProposal) => {
    onApplyAction(proposal);
    // Mark as applied in message state
    setMessages(prev =>
      prev.map(m => {
        if (m.actionProposal?.id === proposal.id) {
          return {
            ...m,
            actionProposal: { ...m.actionProposal, status: 'applied' },
          };
        }
        return m;
      })
    );
  };

  const handleDismissProposal = (proposalId: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.actionProposal?.id === proposalId) {
          return {
            ...m,
            actionProposal: { ...m.actionProposal, status: 'dismissed' },
          };
        }
        return m;
      })
    );
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="TaskFlow AI Productivity Assistant"
      className="fixed inset-x-2 bottom-2 sm:inset-auto sm:bottom-5 sm:right-5 z-40 w-auto sm:w-[420px] max-w-[calc(100vw-1rem)] h-[85vh] sm:h-[620px] max-h-[700px] bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-6 duration-200"
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
              TaskFlow AI
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                Productivity Coach
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            title="Clear Chat History"
            aria-label="Clear chat"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="Close Assistant"
            aria-label="Close"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map(m => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white ${
                  isUser
                    ? 'bg-neutral-800 dark:bg-neutral-700'
                    : 'bg-indigo-600 dark:bg-indigo-500'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                  isUser
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-medium'
                    : m.status === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
                    : 'bg-neutral-100/90 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 border border-neutral-200/60 dark:border-neutral-700/60'
                }`}
              >
                {/* Text Content (with basic markdown parsing for bullet points and bold) */}
                <div className="space-y-1.5 break-words whitespace-pre-wrap">
                  {m.content}
                </div>

                {/* Structured Action Proposal Card */}
                {m.actionProposal && (
                  <ActionProposalCard
                    proposal={m.actionProposal}
                    onApply={handleApplyProposal}
                    onDismiss={handleDismissProposal}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl px-3.5 py-2.5 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[11px] text-neutral-400 ml-1">Analyzing tasks...</span>
            </div>
          </div>
        )}

        {/* Retry option if failed */}
        {lastFailedMessage && !isLoading && (
          <div className="flex justify-center pt-1">
            <button
              onClick={() => handleSend(lastFailedMessage)}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Retry last message
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-3 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors whitespace-nowrap disabled:opacity-50 cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Composer */}
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
        <div className="relative flex items-end gap-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500">
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI coach... (Press Enter to send, Shift+Enter for newline)"
            className="flex-1 bg-transparent border-none text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none resize-none px-1"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
