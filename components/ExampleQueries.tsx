import React from 'react';

interface Example {
  medications: string;
  food: string;
}

const examples: Example[] = [
  { medications: 'Warfarin', food: 'Leafy greens' },
  { medications: 'Atorvastatin', food: 'Grapefruit juice' },
  { medications: 'Lisinopril', food: 'Potassium-rich foods' },
  { medications: 'Metronidazole', food: 'Alcohol' },
];

interface ExampleQueriesProps {
  onExampleClick: (medications: string, food: string) => void;
  isLoading: boolean;
}

export const ExampleQueries: React.FC<ExampleQueriesProps> = ({ onExampleClick, isLoading }) => {
  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Or try an example:</p>
      <div className="flex flex-wrap justify-center gap-2">
        {examples.map((ex, index) => (
          <button
            key={index}
            onClick={() => onExampleClick(ex.medications, ex.food)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ex.medications} + {ex.food}
          </button>
        ))}
      </div>
    </div>
  );
};