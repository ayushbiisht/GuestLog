import { useState } from 'react';
import { RoomCategory, DayRecord, BookingPlanCode, BOOKING_PLANS } from '../types';
import { RenameCategoryModal } from './RenameCategoryModal';
import {
  X,
  Pencil,
  Plus,
  Minus,
  Trash2,
  Calendar as CalendarIcon,
  CheckCircle2,
  UtensilsCrossed,
  Info,
} from 'lucide-react';

interface DailyEntryModalProps {
  dateKey: string; // "YYYY-MM-DD"
  isOpen: boolean;
  onClose: () => void;
  categories: RoomCategory[];
  dayRecord?: DayRecord;
  onSaveDayRecord: (record: DayRecord) => void;
  onUpdateCategory: (updatedCategory: RoomCategory) => void;
}

export function DailyEntryModal({
  dateKey,
  isOpen,
  onClose,
  categories,
  dayRecord,
  onSaveDayRecord,
  onUpdateCategory,
}: DailyEntryModalProps) {
  // Selected category in dropdown
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories[0]?.id || ''
  );
  // Renaming modal toggle
  const [isRenamingCategory, setIsRenamingCategory] = useState(false);

  // Current booking entries for this day
  const [bookings, setBookings] = useState<
    { categoryId: string; bookedCount: number; plan?: BookingPlanCode }[]
  >(dayRecord?.bookings || []);

  const [notes, setNotes] = useState<string>(dayRecord?.notes || '');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Selected category object
  const currentCategory =
    categories.find((c) => c.id === selectedCategoryId) || categories[0];

  // Current booking entry for the currently selected category in dropdown
  const currentBooking = bookings.find((b) => b.categoryId === currentCategory?.id);
  const currentBookedCount = currentBooking?.bookedCount || 0;
  const currentPlan: BookingPlanCode = currentBooking?.plan || 'EP';

  // Format date readable
  const [y, m, d] = dateKey.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate totals for this day
  const totalCapacity = categories.reduce((sum, c) => sum + c.totalRooms, 0);
  const totalBookedToday = bookings.reduce((sum, b) => sum + b.bookedCount, 0);
  const totalAvailableToday = Math.max(0, totalCapacity - totalBookedToday);
  const occupancyPct =
    totalCapacity > 0 ? Math.round((totalBookedToday / totalCapacity) * 100) : 0;

  // Set booked count for a specific category
  const handleSetCategoryCount = (catId: string, count: number) => {
    const targetCat = categories.find((c) => c.id === catId);
    const maxCapacity = targetCat ? targetCat.totalRooms : 99;
    const clampedCount = Math.max(0, Math.min(count, maxCapacity));

    setBookings((prev) => {
      const existing = prev.find((b) => b.categoryId === catId);
      if (clampedCount === 0) {
        return prev.filter((b) => b.categoryId !== catId);
      }
      if (existing) {
        return prev.map((b) =>
          b.categoryId === catId ? { ...b, bookedCount: clampedCount } : b
        );
      }
      return [...prev, { categoryId: catId, bookedCount: clampedCount, plan: 'EP' }];
    });
  };

  // Set booking plan (e.g. MAP, EP, AP, CP) for a specific category
  const handleSetCategoryPlan = (catId: string, plan: BookingPlanCode) => {
    setBookings((prev) => {
      const existing = prev.find((b) => b.categoryId === catId);
      if (existing) {
        return prev.map((b) => (b.categoryId === catId ? { ...b, plan } : b));
      }
      // If no booked rooms yet, initialize with 1 room on this plan
      return [...prev, { categoryId: catId, bookedCount: 1, plan }];
    });
  };

  const handleSaveAndClose = () => {
    onSaveDayRecord({
      date: dateKey,
      bookings: bookings.filter((b) => b.bookedCount > 0),
      notes: notes.trim() ? notes.trim() : undefined,
    });
    onClose();
  };

  const handleClearAllBookings = () => {
    setBookings([]);
    setFeedbackMsg('Bookings cleared for this date');
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  return (
    <>
      <div
        id="daily-entry-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity overflow-y-auto"
        onClick={onClose}
      >
        <div
          id="daily-entry-modal-card"
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#DCE5F5] overflow-hidden transform transition-all my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBF0F8] bg-[#F8FAFD]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EEF4FE] flex items-center justify-center text-[#4B70E2] shadow-xs">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 text-base leading-tight">
                  {formattedDate}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily Inventory & Booking Plan Log
                </p>
              </div>
            </div>
            <button
              id="close-daily-entry-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Summary Pill Bar */}
          <div className="px-6 py-3 bg-[#F8FAFD] border-b border-[#EBF0F8] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Occupancy:</span>
              <span className="font-semibold text-slate-800">
                {totalBookedToday} of {totalCapacity} rooms ({occupancyPct}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#4B70E2]"></span>
              <span className="font-semibold text-[#2552D0]">
                {totalAvailableToday} Available
              </span>
            </div>
          </div>

          {feedbackMsg && (
            <div className="mx-6 mt-3 px-3.5 py-2 bg-[#EEF4FE] border border-[#BED6FA] rounded-xl text-xs text-[#2552D0] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4B70E2]" />
              {feedbackMsg}
            </div>
          )}

          {/* Main Form Body */}
          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Category Dropdown and Global Pencil Feature */}
            <div className="bg-[#F8FAFD] p-4 rounded-xl border border-[#E2E8F4] space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="room-category-select"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                  >
                    1. Select Room Category
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Capacity: {currentCategory?.totalRooms || 0} rooms
                  </span>
                </div>

                {/* Selector row with the small pencil icon right next to it */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      id="room-category-select"
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B70E2] focus:border-transparent transition-all cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.totalRooms} rooms total)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* THE "GLOBAL" PENCIL ICON (KEY FEATURE) */}
                  <button
                    id="global-rename-pencil-btn"
                    type="button"
                    onClick={() => setIsRenamingCategory(true)}
                    title="Rename category globally across entire app"
                    className="p-2.5 bg-white hover:bg-[#EEF4FE] active:bg-[#E0ECFC] text-slate-700 hover:text-[#2552D0] rounded-xl border border-slate-300 hover:border-[#BED6FA] transition-all shadow-2xs group flex items-center justify-center"
                    aria-label="Rename room category globally"
                  >
                    <Pencil className="w-4 h-4 text-slate-600 group-hover:text-[#4B70E2] transition-colors" />
                  </button>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Tap pencil to rename globally across all dates</span>
                  <button
                    type="button"
                    onClick={() => setIsRenamingCategory(true)}
                    className="text-[#4B70E2] hover:underline font-semibold"
                  >
                    Edit "{currentCategory?.name}"
                  </button>
                </div>
              </div>

              {/* BOOKING PLAN SELECTION (EP, CP, MAP, AP) */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="booking-plan-select"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5 text-[#4B70E2]" />
                    <span>2. Booking Plan (Hotel Meal Plan)</span>
                  </label>
                  <span className="text-[11px] font-semibold text-[#2552D0]">
                    Selected: {currentPlan}
                  </span>
                </div>

                {/* Dropdown for Booking Plan */}
                <div className="relative">
                  <select
                    id="booking-plan-select"
                    value={currentPlan}
                    onChange={(e) =>
                      handleSetCategoryPlan(
                        currentCategory.id,
                        e.target.value as BookingPlanCode
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B70E2] focus:border-transparent transition-all cursor-pointer"
                  >
                    {BOOKING_PLANS.map((plan) => (
                      <option key={plan.code} value={plan.code}>
                        {plan.code} — {plan.name} ({plan.shortDesc})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick 1-Tap Plan Selector Chips */}
                <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                  {BOOKING_PLANS.map((plan) => {
                    const isSelected = currentPlan === plan.code;
                    return (
                      <button
                        key={plan.code}
                        type="button"
                        onClick={() =>
                          handleSetCategoryPlan(currentCategory.id, plan.code)
                        }
                        className={`p-2 rounded-xl text-center border transition-all ${
                          isSelected
                            ? 'bg-[#4B70E2] text-white border-[#3B62D6] shadow-xs'
                            : 'bg-white hover:bg-[#EEF4FE] text-slate-700 hover:text-[#4B70E2] border-slate-200'
                        }`}
                      >
                        <div className="font-bold text-xs">{plan.code}</div>
                        <div
                          className={`text-[9px] leading-tight truncate mt-0.5 ${
                            isSelected ? 'text-white/90' : 'text-slate-400'
                          }`}
                        >
                          {plan.shortDesc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number of Rooms Booked Counter */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    3. Rooms Booked for {currentCategory?.name}
                  </label>
                  <span className="text-xs font-semibold text-[#2552D0]">
                    {currentBookedCount} / {currentCategory?.totalRooms} booked
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleSetCategoryCount(
                        currentCategory.id,
                        currentBookedCount - 1
                      )
                    }
                    disabled={currentBookedCount <= 0}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-300 hover:bg-[#EEF4FE] active:bg-[#E0ECFC] disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 shadow-2xs transition-colors"
                    aria-label="Decrease booked rooms"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="flex-1 text-center">
                    <input
                      id="booked-rooms-number-input"
                      type="number"
                      min="0"
                      max={currentCategory?.totalRooms || 99}
                      value={currentBookedCount}
                      onChange={(e) =>
                        handleSetCategoryCount(
                          currentCategory.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full text-center text-2xl font-bold py-1 px-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B70E2]"
                    />
                    <p className="text-[11px] text-[#4B70E2] font-semibold mt-1">
                      {Math.max(
                        0,
                        (currentCategory?.totalRooms || 0) - currentBookedCount
                      )}{' '}
                      rooms remaining available
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleSetCategoryCount(
                        currentCategory.id,
                        currentBookedCount + 1
                      )
                    }
                    disabled={
                      currentBookedCount >= (currentCategory?.totalRooms || 0)
                    }
                    className="w-10 h-10 rounded-xl bg-white border border-slate-300 hover:bg-[#EEF4FE] active:bg-[#E0ECFC] disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 shadow-2xs transition-colors"
                    aria-label="Increase booked rooms"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Selection Presets */}
                <div className="flex items-center gap-2 mt-3 pt-2">
                  <span className="text-[11px] text-slate-400">Quick set:</span>
                  <button
                    type="button"
                    onClick={() => handleSetCategoryCount(currentCategory.id, 0)}
                    className="text-xs px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors"
                  >
                    0 (Empty)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSetCategoryCount(
                        currentCategory.id,
                        Math.ceil((currentCategory?.totalRooms || 0) / 2)
                      )
                    }
                    className="text-xs px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors"
                  >
                    Half ({Math.ceil((currentCategory?.totalRooms || 0) / 2)})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSetCategoryCount(
                        currentCategory.id,
                        currentCategory?.totalRooms || 0
                      )
                    }
                    className="text-xs px-2.5 py-1 bg-[#EEF4FE] hover:bg-[#E0ECFC] border border-[#BED6FA] rounded-lg text-[#2552D0] font-semibold transition-colors"
                  >
                    Full ({currentCategory?.totalRooms || 0})
                  </button>
                </div>
              </div>
            </div>

            {/* Overview of All Categories for This Day with Plans */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  All Room Categories & Plans (This Date)
                </h4>
                {bookings.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllBookings}
                    className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear Day
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {categories.map((cat) => {
                  const booking = bookings.find((b) => b.categoryId === cat.id);
                  const booked = booking?.bookedCount || 0;
                  const planCode = booking?.plan || 'EP';
                  const available = Math.max(0, cat.totalRooms - booked);
                  const isFullyBooked = booked >= cat.totalRooms;
                  const hasSomeBookings = booked > 0;

                  return (
                    <div
                      key={cat.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                        hasSomeBookings
                          ? isFullyBooked
                            ? 'bg-[#EEF4FE] border-[#BED6FA]'
                            : 'bg-[#F8FAFD] border-[#DCE5F5]'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm truncate">
                            {cat.name}
                          </span>
                          {hasSomeBookings && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#4B70E2] text-white">
                              {planCode}
                            </span>
                          )}
                          {isFullyBooked && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#1E3A8A] text-white">
                              Full
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">{booked} booked</span>
                          <span>•</span>
                          <span>{available} free</span>
                          <span>•</span>
                          <span className="text-[#2552D0] font-semibold">
                            Plan: {planCode}
                          </span>
                        </div>
                      </div>

                      {/* Mini inline stepper */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSetCategoryCount(cat.id, booked - 1)}
                          disabled={booked <= 0}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-300 disabled:opacity-30 text-slate-700 flex items-center justify-center hover:bg-slate-50 text-xs"
                          aria-label={`Decrease ${cat.name}`}
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-slate-800">
                          {booked}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSetCategoryCount(cat.id, booked + 1)}
                          disabled={booked >= cat.totalRooms}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-300 disabled:opacity-30 text-slate-700 flex items-center justify-center hover:bg-slate-50 text-xs"
                          aria-label={`Increase ${cat.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Daily Notes / Memo */}
            <div>
              <label
                htmlFor="day-notes-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Daily Notes &amp; Shift Memo (Optional)
              </label>
              <input
                id="day-notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. MAP guests arriving at 6 PM, special food requests"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B70E2] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-[#F8FAFD]">
            <span className="text-xs text-slate-500">
              Total {totalBookedToday} rooms booked on this date
            </span>
            <div className="flex items-center gap-2.5">
              <button
                id="cancel-daily-entry-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                id="save-daily-entry-btn"
                type="button"
                onClick={handleSaveAndClose}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#4B70E2] hover:bg-[#3D60CE] active:bg-[#3352B8] rounded-xl shadow-xs transition-colors"
              >
                Save & Update
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Rename Category Modal */}
      {currentCategory && (
        <RenameCategoryModal
          category={currentCategory}
          isOpen={isRenamingCategory}
          onClose={() => setIsRenamingCategory(false)}
          onSave={(updated) => {
            onUpdateCategory(updated);
            setFeedbackMsg(`Category renamed to "${updated.name}" globally.`);
            setTimeout(() => setFeedbackMsg(null), 3000);
          }}
        />
      )}
    </>
  );
}
