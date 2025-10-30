import React, { useState, useCallback, useEffect, useRef, useReducer } from 'react';
import { InteractionInput } from './components/InteractionInput';
import { InteractionResultDisplay } from './components/InteractionResultDisplay';
import { ExampleQueries } from './components/ExampleQueries';
import { HistorySidebar } from './components/HistorySidebar';
import { WelcomeModal } from './components/WelcomeModal';
import { ToastContainer } from './components/ToastContainer';
import { useToasts } from './hooks/useToasts';
import { checkInteraction } from './services/geminiService';
import type { InteractionResult, HistoryItem } from './types';
import { PillIcon, UtensilsCrossedIcon, HistoryIcon, SunIcon, MoonIcon, ArrowUpIcon } from './components/Icons';

type Theme = 'light' | 'dark';

// --- Reducer for core interaction state ---

interface AppState {
  medications: string;
  food: string;
  isLoading: boolean;
  error: string | null;
  result: InteractionResult | null;
}

type AppAction =
  | { type: 'SET_FIELD'; field: 'medications' | 'food'; payload: string }
  | { type: 'START_CHECK' }
  | { type: 'CHECK_SUCCESS'; payload: { result: InteractionResult; medications: string; food: string } }
  | { type: 'CHECK_FAILURE'; payload: string }
  | { type: 'RESET_FORM' }
  | { type: 'SET_FROM_HISTORY'; payload: HistoryItem };

const initialState: AppState = {
  medications: '',
  food: '',
  isLoading: false,
  error: null,
  result: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.payload,
        result: null,
        error: null,
      };
    case 'START_CHECK':
      return {
        ...state,
        isLoading: true,
        error: null,
        result: null,
      };
    case 'CHECK_SUCCESS':
      return {
        ...state,
        isLoading: false,
        result: action.payload.result,
        medications: action.payload.medications,
        food: action.payload.food,
      };
    case 'CHECK_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'RESET_FORM':
      return {
        ...initialState,
      };
    case 'SET_FROM_HISTORY':
      return {
        ...state,
        medications: action.payload.medications,
        food: action.payload.food,
        result: action.payload.result,
        error: null,
        isLoading: false,
      };
    default:
      return state;
  }
}


const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { medications, food, result, isLoading, error } = state;

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    return 'light';
  });
  
  const [showScroll, setShowScroll] = useState<boolean>(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);

  const { addToast } = useToasts();

  // Refs for focus management & scrolling
  const historyButtonRef = useRef<HTMLButtonElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 400) {
        setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 400) {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  useEffect(() => {
    // Auto-scroll to results when they appear after loading
    if ((result || error) && !isLoading) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [result, error, isLoading]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error("Failed to save theme to localStorage", e);
    }
  }, [theme]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('dish-dose-history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
      
      const hasBeenWelcomed = localStorage.getItem('dish-dose-welcomed');
      if (!hasBeenWelcomed) {
        setShowWelcomeModal(true);
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      setHistory([]);
    }
  }, []);

  const handleSubmit = useCallback(async (meds?: string, foodItem?: string) => {
    const medsToCheck = meds ?? medications;
    const foodToCheck = foodItem ?? food;

    if (!medsToCheck || !foodToCheck) {
      dispatch({ type: 'CHECK_FAILURE', payload: 'Please enter both medication(s) and a food/beverage.' });
      return;
    }

    dispatch({ type: 'START_CHECK' });

    try {
      const interactionResult = await checkInteraction(medsToCheck, foodToCheck);
      dispatch({ type: 'CHECK_SUCCESS', payload: { result: interactionResult, medications: medsToCheck, food: foodToCheck } });
      
      setHistory(prevHistory => {
        const normalizedMeds = medsToCheck.trim().toLowerCase();
        const normalizedFood = foodToCheck.trim().toLowerCase();

        const existingItemIndex = prevHistory.findIndex(
          item =>
            item.medications.trim().toLowerCase() === normalizedMeds &&
            item.food.trim().toLowerCase() === normalizedFood
        );
        
        const existingItem = existingItemIndex !== -1 ? prevHistory[existingItemIndex] : undefined;

        const newHistoryItem: HistoryItem = {
          id: existingItem?.id || new Date().toISOString(),
          timestamp: Date.now(),
          medications: medsToCheck,
          food: foodToCheck,
          result: interactionResult,
          isFavorite: existingItem?.isFavorite || false,
        };

        const historyWithoutOldItem = existingItem
          ? prevHistory.filter((_, index) => index !== existingItemIndex)
          : prevHistory;
        
        const newHistory = [newHistoryItem, ...historyWithoutOldItem];

        try {
          localStorage.setItem('dish-dose-history', JSON.stringify(newHistory));
        } catch (e) {
          console.error("Failed to save history to localStorage", e);
        }
        return newHistory;
      });
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      dispatch({ type: 'CHECK_FAILURE', payload: errorMessage });
    }
  }, [medications, food, addToast]);
  
  const handleFormSubmit = useCallback(() => handleSubmit(), [handleSubmit]);
  const handleExampleClick = useCallback((meds: string, foodItem: string) => handleSubmit(meds, foodItem), [handleSubmit]);

  const handleReset = useCallback(() => dispatch({ type: 'RESET_FORM' }), []);
  const handleMedicationsChange = useCallback((value: string) => dispatch({ type: 'SET_FIELD', field: 'medications', payload: value }), []);
  const handleFoodChange = useCallback((value: string) => dispatch({ type: 'SET_FIELD', field: 'food', payload: value }), []);

  const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
    dispatch({ type: 'SET_FROM_HISTORY', payload: item });
    setIsHistoryOpen(false);
    historyButtonRef.current?.focus();
  }, []);
  
  const handleCloseHistory = useCallback(() => {
    setIsHistoryOpen(false);
    historyButtonRef.current?.focus();
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory(() => {
      try {
        localStorage.setItem('dish-dose-history', JSON.stringify([]));
        addToast('History cleared successfully', 'success');
      } catch (e) {
        console.error("Failed to clear history in localStorage", e);
        addToast('Failed to clear history', 'error');
      }
      return [];
    });
  }, [addToast]);

  const handleToggleFavorite = useCallback((id: string) => {
    setHistory(prevHistory => {
      let toggledItem: { isNowFavorite: boolean } | undefined;

      const newHistory = prevHistory.map(item => {
        if (item.id === id) {
          const isNowFavorite = !item.isFavorite;
          toggledItem = { isNowFavorite };
          return { ...item, isFavorite: isNowFavorite };
        }
        return item;
      });
      
      if (toggledItem) {
        try {
          localStorage.setItem('dish-dose-history', JSON.stringify(newHistory));
          if (toggledItem.isNowFavorite) {
              addToast('Added to favorites', 'success');
          } else {
              addToast('Removed from favorites', 'info');
          }
        } catch (e) {
          console.error("Failed to save favorite status to localStorage", e);
          addToast('Could not save favorite status', 'error');
        }
      }

      return newHistory;
    });
  }, [addToast]);
  
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const handleCloseWelcomeModal = useCallback(() => {
    setShowWelcomeModal(false);
    try {
      localStorage.setItem('dish-dose-welcomed', 'true');
    } catch (e) {
      console.error("Failed to save welcome status to localStorage", e);
    }
    firstInputRef.current?.focus();
  }, []);

  return (
    <>
      <ToastContainer />
      <WelcomeModal isOpen={showWelcomeModal} onClose={handleCloseWelcomeModal} />
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={handleCloseHistory}
        history={history}
        onSelect={handleSelectHistoryItem}
        onClear={handleClearHistory}
        onToggleFavorite={handleToggleFavorite}
      />
      <div 
        className="min-h-screen font-sans text-gray-800 dark:text-gray-200 antialiased"
        aria-hidden={isHistoryOpen || showWelcomeModal}
      >
        <main className="container mx-auto px-4 py-8 md:py-12">
          <header className="text-center mb-8 md:mb-12 relative print:hidden">
             <div className="absolute top-0 right-0 flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                </button>
                <button
                    ref={historyButtonRef}
                    onClick={() => setIsHistoryOpen(true)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                    aria-label="View search history"
                >
                    <HistoryIcon className="h-7 w-7" />
                </button>
            </div>
            <div className="inline-flex items-center gap-4">
                <PillIcon className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
                <UtensilsCrossedIcon className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mt-4">
              Dish & Dose
            </h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Your AI-powered guide to understanding food and drug interactions.
            </p>
          </header>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 print:hidden">
              <InteractionInput
                ref={firstInputRef}
                medications={medications}
                setMedications={handleMedicationsChange}
                food={food}
                setFood={handleFoodChange}
                onSubmit={handleFormSubmit}
                onReset={handleReset}
                isLoading={isLoading}
                hasResult={!!result}
                hasError={!!error}
              />
              {!isLoading && !result && !error && (
                <ExampleQueries onExampleClick={handleExampleClick} isLoading={isLoading} />
              )}
            </div>
            
            <div ref={resultsRef} className="mt-8 print:mt-0" aria-live="polite" aria-atomic="true">
              <InteractionResultDisplay 
                result={result} 
                isLoading={isLoading} 
                error={error} 
                medications={medications}
                food={food}
              />
            </div>
            
            <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400 print:hidden">
              <p className="font-semibold">Disclaimer:</p>
              <p>This tool is for informational purposes only and is not a substitute for professional medical advice. Always consult your doctor or pharmacist for personalized guidance.</p>
            </footer>
          </div>
        </main>
        {showScroll && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-900 transition-opacity duration-300 z-30 print:hidden"
            aria-label="Scroll to top"
          >
            <ArrowUpIcon className="h-6 w-6" />
          </button>
        )}
      </div>
    </>
  );
};

export default App;