import React, { useState, useMemo, useRef, useCallback } from 'react';
import type { HistoryItem } from '../types';
import { InteractionStatus } from '../types';
import { TrashIcon, XIcon, CheckCircleIcon, CautionIcon, WarningIcon, DangerIcon, StarIcon, SearchIcon, XCircleIcon } from './Icons';
import { ConfirmationModal } from './ConfirmationModal';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onToggleFavorite: (id: string) => void;
}

const severityIcons = {
  [InteractionStatus.SAFE]: <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />,
  [InteractionStatus.CAUTION]: <CautionIcon className="h-5 w-5 text-yellow-500 flex-shrink-0" />,
  [InteractionStatus.WARNING]: <WarningIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />,
  [InteractionStatus.DANGEROUS]: <DangerIcon className="h-5 w-5 text-red-500 flex-shrink-0" />,
};

const formatTimeAgo = (timestamp: number): string => {
  const now = new Date();
  const secondsPast = (now.getTime() - timestamp) / 1000;

  if (secondsPast < 60) {
    return 'just now';
  }
  if (secondsPast < 3600) {
    const minutes = Math.floor(secondsPast / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (secondsPast <= 86400) { // 24 hours
    const hours = Math.floor(secondsPast / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (secondsPast <= 172800) { // 48 hours
    return 'yesterday';
  }
  
  const day = new Date(timestamp);
  return `on ${day.toLocaleDateString()}`;
};


const HistoryListItem: React.FC<{ item: HistoryItem; onSelect: (item: HistoryItem) => void; onToggleFavorite: (id: string) => void; }> = ({ item, onSelect, onToggleFavorite }) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent li's onClick from firing
    onToggleFavorite(item.id);
  };

  return (
    <li
      onClick={() => onSelect(item)}
      className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
      // Use role="button" and tabindex="0" for better accessibility for non-button elements with onClick
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(item)}
    >
      <div className="pt-0.5">
        {severityIcons[item.result.interactionStatus]}
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={item.medications}>{item.medications}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={item.food}>+ {item.food}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTimeAgo(item.timestamp)}</p>
      </div>
       <button
        onClick={handleFavoriteClick}
        className="p-1 text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
        aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <StarIcon className={`h-5 w-5 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : 'fill-none'}`} />
      </button>
    </li>
  );
};

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onSelect, onClear, onToggleFavorite }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const sidebarRef = useFocusTrap<HTMLElement>(isOpen && !isModalOpen, onClose);
  const clearButtonRef = useRef<HTMLButtonElement>(null);


  const handleClearRequest = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    clearButtonRef.current?.focus();
  }, []);

  const handleConfirmClear = useCallback(() => {
    onClear();
    handleCloseModal();
  }, [onClear, handleCloseModal]);
  
  const sortedHistory = useMemo(() => {
    const filtered = history.filter(item => {
      const query = searchQuery.toLowerCase();
      return (
        item.medications.toLowerCase().includes(query) ||
        item.food.toLowerCase().includes(query)
      );
    });

    return [...filtered].sort((a, b) => {
      const aIsFav = a.isFavorite ?? false;
      const bIsFav = b.isFavorite ?? false;
      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;
      return b.timestamp - a.timestamp; // most recent first
    });
  }, [history, searchQuery]);

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmClear}
        title="Clear Search History"
        confirmText="Clear All"
      >
        <p>Are you sure you want to delete your entire search history? This action cannot be undone.</p>
      </ConfirmationModal>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 print:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <aside
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out print:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-heading"
      >
        <div className="flex flex-col h-full">
          <header className="p-4 border-b dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="history-heading" className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Search History
                {history.length > 0 && (
                  <span className="text-base font-medium text-gray-500 dark:text-gray-400 ml-2">
                    ({searchQuery ? `${sortedHistory.length} of ${history.length}` : history.length})
                  </span>
                )}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label="Close history"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            {history.length > 0 && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 transition"
                  aria-label="Search through history"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Clear search"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
          </header>

          <div className="flex-grow overflow-y-auto p-4">
            {history.length === 0 ? (
               <div className="text-center text-gray-500 dark:text-gray-400 pt-16">
                <p className="font-semibold">No history yet</p>
                <p className="text-sm mt-1">Your past searches will appear here.</p>
              </div>
            ) : sortedHistory.length > 0 ? (
              <ul className="space-y-2">
                {sortedHistory.map(item => (
                  <HistoryListItem key={item.id} item={item} onSelect={onSelect} onToggleFavorite={onToggleFavorite} />
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 pt-16">
                <p className="font-semibold">No results found</p>
                <p className="text-sm mt-1">Try a different search term.</p>
              </div>
            )}
          </div>
          
          {history.length > 0 && (
            <footer className="p-4 border-t dark:border-gray-700">
              <button
                ref={clearButtonRef}
                onClick={handleClearRequest}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
                Clear All History
              </button>
            </footer>
          )}
        </div>
      </aside>
    </>
  );
};