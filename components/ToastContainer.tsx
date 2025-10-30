import React from 'react';
import { Toast } from './Toast';
import { useToasts } from '../hooks/useToasts';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToasts();

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6 z-50 print:hidden"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};
