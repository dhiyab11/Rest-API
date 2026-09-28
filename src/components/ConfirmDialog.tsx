import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from './Modal.js';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm text-emerald-900/80 dark:text-slate-300 leading-relaxed pt-1">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-emerald-100/60 dark:border-emerald-900/30 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold rounded-xl text-white transition-all shadow-xs ${
              confirmVariant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 active:scale-98'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
            }`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
