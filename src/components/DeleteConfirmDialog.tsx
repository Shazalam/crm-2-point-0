'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  noteText?: string;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  noteText,
}: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-center text-gray-900">
          Delete This Note?
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 mt-2">
          This action cannot be undone. The note will be permanently removed.
        </p>

        {/* Optional note preview */}
        {noteText && (
          <div className="mt-4 text-gray-700 text-sm bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-24 overflow-y-auto shadow-inner">
            <p className="italic text-center">“{noteText}”</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>

          <Button
            onClick={handleConfirm}
            loading={loading}
            className="bg-red-600 text-white hover:bg-red-700 px-5 py-2.5 rounded-lg shadow-md"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
