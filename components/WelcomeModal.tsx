import React from 'react';
import { BookOpenIcon, WarningIcon } from './Icons';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg m-4 p-6 text-left transform transition-all animate-fade-in"
      >
        <div className="text-center">
            <BookOpenIcon className="mx-auto h-12 w-12 text-cyan-600 dark:text-cyan-400" />
            <h3 className="mt-4 text-2xl leading-6 font-bold text-gray-900 dark:text-gray-100" id="modal-title">
              Welcome to Dish & Dose
            </h3>
            <div className="mt-2">
              <p className="text-base text-gray-600 dark:text-gray-400">
                Your AI-powered guide to understanding food and drug interactions.
              </p>
            </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/40 rounded-lg flex items-start gap-3 border border-yellow-200 dark:border-yellow-500/30">
            <WarningIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Important Disclaimer</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300/90 mt-1">
                    This tool is for informational purposes only and is not a substitute for professional medical advice. Always consult your doctor or pharmacist for personalized guidance.
                </p>
            </div>
        </div>

        <div className="mt-8">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-3 bg-cyan-600 text-base font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-800"
            onClick={onClose}
          >
            I Understand, Get Started
          </button>
        </div>
      </div>
    </div>
  );
};
