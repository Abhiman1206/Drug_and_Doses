import React from 'react';
import type { InteractionResult } from '../types';
import { InteractionStatus, SeverityLevel } from '../types';
import { InfoIcon, CheckCircleIcon, CautionIcon, WarningIcon, DangerIcon, SparklesIcon,ClipboardListIcon, NoteIcon, ErrorIcon, CopyIcon, PrinterIcon, ShareIcon } from './Icons';
import { InteractionResultSkeleton } from './InteractionResultSkeleton';
import { useToasts } from '../hooks/useToasts';

interface InteractionResultDisplayProps {
  result: InteractionResult | null;
  isLoading: boolean;
  error: string | null;
  medications?: string;
  food?: string;
}

const statusConfig = {
  [InteractionStatus.SAFE]: {
    bgColor: 'bg-green-100 dark:bg-green-900/50 print:bg-green-50',
    borderColor: 'border-green-500 print:border-green-500',
    textColor: 'text-green-800 dark:text-green-300 print:text-green-800',
    icon: <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400 print:text-green-600" />,
    title: 'Safe to Consume',
  },
  [InteractionStatus.CAUTION]: {
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/50 print:bg-yellow-50',
    borderColor: 'border-yellow-500 print:border-yellow-500',
    textColor: 'text-yellow-800 dark:text-yellow-300 print:text-yellow-800',
    icon: <CautionIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400 print:text-yellow-600" />,
    title: 'Use with Caution',
  },
  [InteractionStatus.WARNING]: {
    bgColor: 'bg-orange-100 dark:bg-orange-900/50 print:bg-orange-50',
    borderColor: 'border-orange-500 print:border-orange-500',
    textColor: 'text-orange-800 dark:text-orange-300 print:text-orange-800',
    icon: <WarningIcon className="h-8 w-8 text-orange-600 dark:text-orange-400 print:text-orange-600" />,
    title: 'Warning: Potential Interaction',
  },
  [InteractionStatus.DANGEROUS]: {
    bgColor: 'bg-red-100 dark:bg-red-900/50 print:bg-red-50',
    borderColor: 'border-red-500 print:border-red-500',
    textColor: 'text-red-800 dark:text-red-300 print:text-red-800',
    icon: <DangerIcon className="h-8 w-8 text-red-600 dark:text-red-400 print:text-red-600" />,
    title: 'Dangerous Interaction',
  },
};

// A simple component to render text content that may contain newlines or simple markdown lists.
const ContentRenderer: React.FC<{ text: string }> = ({ text }) => {
  if (!text) {
    return null;
  }
  
  // Split content into lines and filter out empty ones
  const lines = text.trim().split('\n').filter(line => line.trim() !== '');
  
  // Heuristic: If the first line starts with a list marker, treat the whole block as a list.
  const isList = lines.length > 0 && (lines[0].trim().startsWith('* ') || lines[0].trim().startsWith('- '));

  if (isList) {
    return (
      <ul className="list-disc pl-5 space-y-1">
        {lines.map((line, index) => (
          <li key={index}>{line.trim().replace(/^(\*|-)\s/, '')}</li>
        ))}
      </ul>
    );
  }

  // Otherwise, render each line as a paragraph to respect line breaks.
  return (
    <div className="space-y-2">
      {lines.map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </div>
  );
};


const ResultSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="mt-6">
        <h3 className="flex items-center text-xl font-semibold text-gray-700 dark:text-gray-300 print:text-black mb-2">
            {icon}
            <span className="ml-2">{title}</span>
        </h3>
        <div className="prose prose-sm md:prose-base max-w-none text-gray-600 dark:text-gray-400 print:text-black pl-8">
           {children}
        </div>
    </div>
);


export const InteractionResultDisplay: React.FC<InteractionResultDisplayProps> = ({ result, isLoading, error, medications, food }) => {
  const { addToast } = useToasts();

  const getReportText = () => {
    if (!result) return '';
    return `
Dish & Dose Interaction Report
--------------------------------
Interaction Status: ${result.interactionStatus}
Severity Level: ${result.severityLevel}

Interaction Details:
${result.interactionDetails}

Recommendations:
${result.recommendations}

Additional Notes:
${result.additionalNotes && result.additionalNotes.toLowerCase() !== 'none' ? result.additionalNotes : 'None'}
--------------------------------
Disclaimer: This tool is for informational purposes only. Always consult your doctor or pharmacist for personalized guidance.
    `.trim();
  };

  const handleCopy = () => {
    const textToCopy = getReportText();
    if (!textToCopy) return;
  
    navigator.clipboard.writeText(textToCopy).then(() => {
      addToast('Report copied to clipboard', 'success');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      addToast('Failed to copy report', 'error');
    });
  };

  const handleShare = async () => {
    const shareText = getReportText();
    if (!shareText) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Dish & Dose Report: ${medications} + ${food}`,
          text: shareText,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
            console.error('Error sharing:', error);
            addToast('Could not share report', 'error');
        }
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(shareText).then(() => {
        addToast('Sharing not supported, report copied instead', 'info');
      }).catch(err => {
        console.error('Failed to copy text for fallback share: ', err);
        addToast('Failed to copy report', 'error');
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };


  if (isLoading) {
    return <InteractionResultSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center p-6 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-2xl border border-red-300 dark:border-red-500/50 animate-fade-in print:hidden">
        <ErrorIcon className="h-6 w-6 mr-3 flex-shrink-0" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 print:hidden">
        <InfoIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Ready to Check</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your medication and a food or beverage to see potential interactions.</p>
      </div>
    );
  }

  const config = statusConfig[result.interactionStatus];

  if (!config) {
    return (
      <div className="flex items-center p-6 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-2xl border border-red-300 dark:border-red-500/50 animate-fade-in print:hidden">
        <ErrorIcon className="h-6 w-6 mr-3 flex-shrink-0" />
        <p className="font-medium">The AI returned a result in an unexpected format. Please try rephrasing your query.</p>
      </div>
    );
  }

  return (
    <div className="print:p-4">
      {/* --- Print-Only Header --- */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-black">Dish & Dose Report</h1>
        {medications && food && 
          <p className="mt-1 text-base text-gray-700">
            Showing results for <strong>{medications}</strong> + <strong>{food}</strong>
          </p>
        }
         <p className="mt-1 text-sm text-gray-500">
            Generated on: {new Date().toLocaleString()}
          </p>
      </div>

      <div className={`${config.bgColor} ${config.borderColor} rounded-2xl shadow-lg border-l-8 p-6 md:p-8 relative animate-fade-in print:shadow-none print:border print:rounded-lg`}>
        <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/5 dark:bg-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
              aria-label="Copy results to clipboard"
            >
              <CopyIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span>Copy</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/5 dark:bg-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
              aria-label="Share results"
            >
              <ShareIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span>Share</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/5 dark:bg-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
              aria-label="Print results"
            >
              <PrinterIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span>Print</span>
            </button>
        </div>

        <div className="flex items-center">
            {config.icon}
            <div className="ml-4">
                <h2 className={`text-2xl font-bold ${config.textColor}`}>{config.title}</h2>
                <p className={`font-semibold ${config.textColor}`}>Severity Level: {result.severityLevel}</p>
            </div>
        </div>
        
        <ResultSection title="Interaction Details" icon={<InfoIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 print:text-gray-600" />}>
            <ContentRenderer text={result.interactionDetails} />
        </ResultSection>

        <ResultSection title="Recommendations" icon={<ClipboardListIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 print:text-gray-600" />}>
            <ContentRenderer text={result.recommendations} />
        </ResultSection>

        {result.additionalNotes && result.additionalNotes.toLowerCase() !== 'none' && (
             <ResultSection title="Additional Notes" icon={<NoteIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 print:text-gray-600" />}>
                 <ContentRenderer text={result.additionalNotes} />
            </ResultSection>
        )}
      </div>

       {/* --- Print-Only Footer --- */}
       <div className="hidden print:block mt-6 text-sm text-gray-600">
        <p className="font-semibold">Disclaimer:</p>
        <p>This tool is for informational purposes only and is not a substitute for professional medical advice. Always consult your doctor or pharmacist for personalized guidance.</p>
      </div>
    </div>
  );
};