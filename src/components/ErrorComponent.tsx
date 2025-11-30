'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Server, WifiOff, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorComponentProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onHome?: () => void;
  variant?: 'default' | 'network' | 'server' | 'not-found' | 'permission';
  fullScreen?: boolean;
  className?: string;
}

const errorVariants = {
  default: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  network: {
    icon: WifiOff,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  server: {
    icon: Server,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  'not-found': {
    icon: AlertTriangle,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  permission: {
    icon: ShieldAlert,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
};

export default function ErrorComponent({
  title = 'Something went wrong',
  message = 'We couldn’t load the content. Please try again later.',
  onRetry,
  onHome,
  variant = 'default',
  fullScreen = false,
  className = '',
}: ErrorComponentProps) {
  const { icon: Icon, color, bgColor, borderColor } = errorVariants[variant];

  const containerClasses = `
    flex flex-col items-center justify-center text-center p-8 
    rounded-2xl border-2 ${borderColor} ${bgColor}
    ${fullScreen ? 'min-h-screen w-full' : 'min-h-[400px] w-full max-w-md'}
    ${className}
  `;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={containerClasses}
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className={`flex items-center justify-center w-24 h-24 rounded-full ${bgColor} mb-6`}
      >
        <Icon className={`w-12 h-12 ${color}`} />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-gray-900 mb-3"
      >
        {title}
      </motion.h2>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 text-lg mb-8 leading-relaxed"
      >
        {message}
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-xs"
      >
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex-1"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </motion.button>
        )}

        {onHome && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onHome}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-700 font-semibold border-2 border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-200 flex-1"
          >
            <Home className="w-4 h-4" />
            Go Home
          </motion.button>
        )}
      </motion.div>

      {/* Error Code (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-3 bg-gray-100 rounded-lg text-sm text-gray-500 font-mono"
        >
          Error: {variant}
        </motion.div>
      )}
    </motion.div>
  );
}

// Pre-styled variants for common error types
export function NetworkError(props: Omit<ErrorComponentProps, 'variant'>) {
  return <ErrorComponent {...props} variant="network" />;
}

export function ServerError(props: Omit<ErrorComponentProps, 'variant'>) {
  return <ErrorComponent {...props} variant="server" />;
}

export function NotFoundError(props: Omit<ErrorComponentProps, 'variant'>) {
  return <ErrorComponent {...props} variant="not-found" />;
}

export function PermissionError(props: Omit<ErrorComponentProps, 'variant'>) {
  return <ErrorComponent {...props} variant="permission" />;
}