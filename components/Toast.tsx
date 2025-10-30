import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ErrorIcon, InfoIcon, XIcon } from './Icons';
import type { ToastType } from '../hooks/useToasts';

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

const toastConfig = {
  success: {
    icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
    style: 'bg-green-50 dark:bg-green-900/70 border-green-400 dark:border-green-600',
    textColor: 'text-green-800 dark:text-green-200'
  },
  error: {
    icon: <ErrorIcon className="h-6 w-6 text-red-500" />,
    style: 'bg-red-50 dark:bg-red-900/70 border-red-400 dark:border-red-600',
    textColor: 'text-red-800 dark:text-red-200'
  },
  info: {
    icon: <InfoIcon className="h-6 w-6 text-cyan-500" />,
    style: 'bg-cyan-50 dark:bg-cyan-900/70 border-cyan-400 dark:border-cyan-600',
    textColor: 'text-cyan-800 dark:text-cyan-200'
  }
};

export const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in on mount
    const timer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const config = toastConfig[type];

  return (
    <div
      className={`max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4 ${config.style} transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0 sm:translate-x-0' : 'opacity-0 translate-y-2 sm:translate-y-0 sm:translate-x-2'}`}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm font-medium ${config.textColor}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <span className="sr-only">Close</span>
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
