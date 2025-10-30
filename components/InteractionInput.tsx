import React, { forwardRef } from 'react';
import { PillIcon, UtensilsIcon, XCircleIcon } from './Icons';

interface InteractionInputProps {
  medications: string;
  setMedications: (value: string) => void;
  food: string;
  setFood: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  isLoading: boolean;
  hasResult: boolean;
  hasError: boolean;
}

export const InteractionInput = forwardRef<HTMLInputElement, InteractionInputProps>(({
  medications,
  setMedications,
  food,
  setFood,
  onSubmit,
  onReset,
  isLoading,
  hasResult,
  hasError
}, ref) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSubmit();
    }
  };

  const baseInputClasses = "w-full pl-4 pr-10 py-3 border rounded-lg focus:ring-2 transition-shadow bg-transparent dark:text-gray-200 dark:placeholder-gray-500";
  const errorClasses = "border-red-500 focus:border-red-500 focus:ring-red-500";
  const medInputClasses = hasError ? errorClasses : "border-gray-300 dark:border-gray-600 focus:border-cyan-500 focus:ring-cyan-500";
  const foodInputClasses = hasError ? errorClasses : "border-gray-300 dark:border-gray-600 focus:border-amber-500 focus:ring-amber-500";

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="medications" className="flex items-center text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          <PillIcon className="h-5 w-5 mr-2 text-cyan-600 dark:text-cyan-400" />
          Medication(s)
        </label>
        <div className="relative">
          <input
            ref={ref}
            id="medications"
            type="text"
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Atorvastatin, Lisinopril"
            className={`${baseInputClasses} ${medInputClasses}`}
            disabled={isLoading}
            aria-invalid={hasError}
          />
          {medications && !isLoading && (
            <button
              onClick={() => setMedications('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Clear medications input"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Separate multiple medications with a comma.</p>
      </div>
      <div>
        <label htmlFor="food" className="flex items-center text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          <UtensilsIcon className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
          Food / Beverage
        </label>
        <div className="relative">
          <input
            id="food"
            type="text"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Grapefruit juice"
            className={`${baseInputClasses} ${foodInputClasses}`}
            disabled={isLoading}
            aria-invalid={hasError}
          />
          {food && !isLoading && (
            <button
              onClick={() => setFood('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Clear food/beverage input"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        {hasResult ? (
          <button
            onClick={onReset}
            className="w-full flex-1 text-center py-3 px-6 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            disabled={isLoading}
          >
            Check Another
          </button>
        ) : (
          <button
            onClick={onSubmit}
            className="w-full flex-1 text-center py-3 px-6 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 disabled:bg-cyan-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </div>
            ) : 'Check for Interactions'}
          </button>
        )}
      </div>
    </div>
  );
});