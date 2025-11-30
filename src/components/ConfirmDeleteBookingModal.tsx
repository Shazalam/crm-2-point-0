"use client";

import { FiXCircle } from "react-icons/fi";

interface ConfirmDeleteBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteBookingModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmDeleteBookingModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
      onClick={onClose}
    >
      {/* ✅ Stop click propagation so modal doesn’t close when clicking inside */}
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 text-red-600 rounded-full p-2">
            <FiXCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Delete Booking
          </h2>
        </div>

        {/* Body */}
        <p className="text-gray-600 mb-6">
          Are you sure you want to <span className="font-semibold text-red-600">delete</span> this booking? 
          This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            No, Keep Booking
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Yes, Delete It
          </button>
        </div>
      </div>
    </div>
  );
}
