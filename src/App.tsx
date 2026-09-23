import { useState, useEffect } from 'react';
import { RoomCategory, DayRecord, ActivePage } from './types';
import {
  loadCategories,
  saveCategories,
  loadDayRecords,
  saveDayRecords,
} from './data/inventoryStore';
import { CalendarDashboard } from './components/CalendarDashboard';
import { TimelineSummary } from './components/TimelineSummary';
import { DailyEntryModal } from './components/DailyEntryModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  CalendarDays,
  ListOrdered,
  SlidersHorizontal,
  Building2,
  Check,
} from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('calendar');
  const [categories, setCategories] = useState<RoomCategory[]>(() => loadCategories());
  const [dayRecords, setDayRecords] = useState<Record<string, DayRecord>>(() => loadDayRecords());

  // Active date for Daily Entry modal
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  // Category management modal
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Status banner notice
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Persist categories
  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  // Persist records
  useEffect(() => {
    saveDayRecords(dayRecords);
  }, [dayRecords]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Handler: Update category (e.g. rename from the global pencil icon!)
  const handleUpdateCategory = (updatedCategory: RoomCategory) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c))
    );
    showToast(`Category "${updatedCategory.name}" updated globally across all dates.`);
  };

  // Handler: Update full categories list
  const handleUpdateAllCategories = (updatedCategories: RoomCategory[]) => {
    setCategories(updatedCategories);
    showToast('Categories updated successfully.');
  };

  // Handler: Save day record
  const handleSaveDayRecord = (record: DayRecord) => {
    setDayRecords((prev) => ({
      ...prev,
      [record.date]: record,
    }));
    showToast(`Bookings for ${record.date} updated.`);
  };

  return (
    <div className="min-h-screen bg-[#EDF2F9] text-[#111827] flex flex-col antialiased pb-24 sm:pb-28">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E2E8F4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          {/* Brand & Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#4B70E2] text-white flex items-center justify-center shadow-xs shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
                GuestLog
              </h1>
              <span className="text-[9px] sm:text-[11px] font-semibold text-[#4B70E2] uppercase tracking-tight sm:tracking-wider whitespace-nowrap block mt-0.5">
                Internal Management Portal
              </span>
            </div>
          </div>

          {/* Quick Utility Tools */}
          <div className="flex items-center gap-2">
            <button
              id="header-category-manager-btn"
              type="button"
              onClick={() => setIsCategoryManagerOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#D5E1F6] bg-[#EEF4FE] hover:bg-[#E1EDFD] text-[#2F5BD8] shadow-2xs flex items-center gap-1.5 transition-colors"
              title="Configure global room categories"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#4B70E2]" />
              <span className="hidden sm:inline">Categories</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 right-4 z-50 animate-bounce duration-300">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white text-xs font-medium rounded-xl shadow-xl border border-slate-700">
            <Check className="w-4 h-4 text-[#60A5FA]" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activePage === 'calendar' ? (
          <CalendarDashboard
            categories={categories}
            dayRecords={dayRecords}
            onSelectDate={(dateKey) => setSelectedDateKey(dateKey)}
            onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
          />
        ) : (
          <TimelineSummary
            categories={categories}
            dayRecords={dayRecords}
            onEditDate={(dateKey) => setSelectedDateKey(dateKey)}
          />
        )}
      </main>

      {/* Bottom Navigation Bar styled matching the sleek frosted pill in the image */}
      <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <nav
          aria-label="App Navigation"
          className="pointer-events-auto flex items-center gap-1.5 bg-white/95 p-1.5 rounded-2xl shadow-xl border border-[#DCE5F5] backdrop-blur-md"
        >
          {/* Calendar Icon Button (Page 1: Calendar Dashboard) */}
          <button
            id="tab-calendar-dashboard"
            type="button"
            onClick={() => setActivePage('calendar')}
            aria-label="Calendar Dashboard"
            title="Page 1: Calendar Dashboard"
            className={`relative p-2.5 sm:px-4 sm:py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium text-xs ${
              activePage === 'calendar'
                ? 'bg-[#4B70E2] text-white shadow-sm scale-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="hidden sm:inline font-semibold">Calendar</span>
          </button>

          {/* Pointers / Timeline Icon Button (Page 2: Timeline Summary) */}
          <button
            id="tab-timeline-summary"
            type="button"
            onClick={() => setActivePage('timeline')}
            aria-label="Timeline Summary Pointers"
            title="Page 2: Timeline Summary & Pointers"
            className={`relative p-2.5 sm:px-4 sm:py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium text-xs ${
              activePage === 'timeline'
                ? 'bg-[#4B70E2] text-white shadow-sm scale-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <ListOrdered className="w-5 h-5" />
            <span className="hidden sm:inline font-semibold">Timeline</span>
          </button>
        </nav>
      </div>

      {/* Daily Entry Form Modal */}
      {selectedDateKey && (
        <DailyEntryModal
          dateKey={selectedDateKey}
          isOpen={Boolean(selectedDateKey)}
          onClose={() => setSelectedDateKey(null)}
          categories={categories}
          dayRecord={dayRecords[selectedDateKey]}
          onSaveDayRecord={handleSaveDayRecord}
          onUpdateCategory={handleUpdateCategory}
        />
      )}

      {/* Global Category Manager Modal */}
      <CategoryManagerModal
        categories={categories}
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        onUpdateCategories={handleUpdateAllCategories}
      />

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator />
    </div>
  );
}
