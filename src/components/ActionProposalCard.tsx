import React from 'react';
import { Check, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { TaskActionProposal } from '../types/ai';

interface ActionProposalCardProps {
  proposal: TaskActionProposal;
  onApply: (proposal: TaskActionProposal) => void;
  onDismiss: (proposalId: string) => void;
}

export const ActionProposalCard: React.FC<ActionProposalCardProps> = ({
  proposal,
  onApply,
  onDismiss,
}) => {
  const isApplied = proposal.status === 'applied';
  const isDismissed = proposal.status === 'dismissed';

  return (
    <div className="mt-3 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 text-xs space-y-2.5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-indigo-900 dark:text-indigo-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Proposed Action</span>
        </div>
        {isApplied ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3" /> Applied
          </span>
        ) : isDismissed ? (
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 italic">
            Dismissed
          </span>
        ) : (
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            Requires Confirmation
          </span>
        )}
      </div>

      <p className="text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
        {proposal.title}
      </p>

      {/* Details Preview */}
      {proposal.data.subtasks && proposal.data.subtasks.length > 0 && (
        <div className="pl-2 border-l-2 border-indigo-300 dark:border-indigo-800 space-y-1">
          {proposal.data.subtasks.map((st, idx) => (
            <div key={idx} className="text-neutral-600 dark:text-neutral-400 text-[11px] flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-indigo-500" />
              <span>{st}</span>
            </div>
          ))}
        </div>
      )}

      {proposal.data.newPriority && (
        <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
          Update priority to: <span className="font-semibold uppercase">{proposal.data.newPriority}</span>
        </div>
      )}

      {proposal.data.newDueDate && (
        <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
          Update deadline to: <span className="font-semibold">{proposal.data.newDueDate}</span>
        </div>
      )}

      {/* Action Buttons (when pending) */}
      {!isApplied && !isDismissed && (
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => onDismiss(proposal.id)}
            className="px-2.5 py-1 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] font-medium transition-colors cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => onApply(proposal)}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-3 h-3 stroke-[3]" />
            Confirm & Apply
          </button>
        </div>
      )}
    </div>
  );
};
