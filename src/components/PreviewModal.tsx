'use client';

import { useEffect, ReactNode } from 'react';
import { FiX, FiLoader, FiGift, FiCheckCircle, FiRefreshCw, FiAlertTriangle, FiDollarSign } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: ReactNode;
  isSubmitting?: boolean;
  status: "BOOKED" | "MODIFIED" | "CANCELLED" | "REFUND" | "VOUCHER";
}

export default function Modal({ isOpen, onClose, onSubmit, title, children, isSubmitting = false, status }: ModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Enhanced button configuration with icons and professional styling
  const getButtonConfig = () => {
    switch (status) {
      case "BOOKED":
        return {
          text: 'Send Booking Confirmation',
          color: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
          hover: 'hover:shadow-lg transform hover:scale-105',
          loadingText: 'Sending Confirmation...',
          icon: FiCheckCircle,
          iconColor: 'text-white'
        };
      case "MODIFIED":
        return {
          text: 'Send Modification Details',
          color: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
          hover: 'hover:shadow-lg transform hover:scale-105',
          loadingText: 'Sending Modification...',
          icon: FiRefreshCw,
          iconColor: 'text-white'
        };
      case "CANCELLED":
        return {
          text: 'Send Cancellation Notice',
          color: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
          hover: 'hover:shadow-lg transform hover:scale-105',
          loadingText: 'Sending Cancellation...',
          icon: FiAlertTriangle,
          iconColor: 'text-white'
        };
      case "REFUND":
        return {
          text: 'Send Refund Confirmation',
          color: 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700',
          hover: 'hover:shadow-lg transform hover:scale-105',
          loadingText: 'Processing Refund...',
          icon: FiDollarSign,
          iconColor: 'text-white'
        };
      case "VOUCHER":
        return {
          text: 'Send Gift Voucher',
          color: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
          hover: 'hover:shadow-lg transform hover:scale-105',
          loadingText: 'Sending Voucher...',
          icon: FiGift,
          iconColor: 'text-white'
        };
      default:
        return {
          text: 'Send Email',
          color: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
          hover: 'hover:shadow-lg transform hover:scale-105',
          loadingText: 'Sending...',
          icon: FiCheckCircle,
          iconColor: 'text-white'
        };
    }
  };

  const buttonConfig = getButtonConfig();
  const IconComponent = buttonConfig.icon;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${status === "VOUCHER" ? "bg-purple-100" :
                status === "BOOKED" ? "bg-green-100" :
                  status === "MODIFIED" ? "bg-blue-100" :
                    status === "CANCELLED" ? "bg-red-100" :
                      status === "REFUND" ? "bg-orange-100" : "bg-gray-100"
              }`}>
              <IconComponent className={`h-5 w-5 ${status === "VOUCHER" ? "text-purple-600" :
                  status === "BOOKED" ? "text-green-600" :
                    status === "MODIFIED" ? "text-blue-600" :
                      status === "CANCELLED" ? "text-red-600" :
                        status === "REFUND" ? "text-orange-600" : "text-gray-600"
                }`} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Enhanced Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="text-sm text-gray-600">
            {status === "VOUCHER" && "Gift voucher will be sent to the customer's email"}
            {status === "BOOKED" && "Booking confirmation with all details will be sent"}
            {status === "MODIFIED" && "Modified booking details will be sent"}
            {status === "CANCELLED" && "Cancellation confirmation will be sent"}
            {status === "REFUND" && "Refund processing details will be sent"}
          </div>

          <div className="flex justify-end items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 border border-gray-300 hover:border-gray-400 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              onClick={onSubmit}
              className={`px-8 py-3 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md flex items-center justify-center space-x-2 ${buttonConfig.color} ${buttonConfig.hover} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-md`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin h-4 w-4" />
                  <span>{buttonConfig.loadingText}</span>
                </>
              ) : (
                <>
                  <IconComponent className="h-4 w-4" />
                  <span>{buttonConfig.text}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}