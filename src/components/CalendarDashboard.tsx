import { useState } from 'react';
import { RoomCategory, DayRecord } from '../types';
import { formatDateKey } from '../data/inventoryStore';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CalendarDashboardProps {
  categories: RoomCategory[];
  dayRecords: Record<string, DayRecord>;
  onSelectDate: (dateKey: string) => void;
  onOpenCategoryManager: () => void;
}

export function CalendarDashboard({
  categories,
  dayRecords,
  onSelectDate,
  onOpenCategoryManager,
}: CalendarDashboardProps) {
  // Anchor on September 2026 as per sample dataset
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 0-indexed: 8 is September

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Current calendar math
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const monthName = firstDayOfMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8);
  };

  const todayKey = '2026-09-22';
  const totalPropertyRooms = categories.reduce((sum, cat) => sum + cat.totalRooms, 0);

  // Month-wide stats
  let monthTotalBookedNights = 0;
  let monthBookedDaysCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const key = formatDateKey(currentYear, currentMonth, d);
    const rec = dayRecords[key];
    if (rec && rec.bookings && rec.bookings.length > 0) {
      const dayTotal = rec.bookings.reduce((sum, b) => sum + b.bookedCount, 0);
      if (dayTotal > 0) {
        monthTotalBookedNights += dayTotal;
        monthBookedDaysCount++;
      }
    }
  }

  // Today specific stats
  const todayRecord = dayRecords[todayKey];
  const todayBooked = todayRecord?.bookings?.reduce((s, b) => s + b.bookedCount, 0) || 0;
  const todayAvailable = Math.max(0, totalPropertyRooms - todayBooked);
  const todayOccupancyPct = totalPropertyRooms > 0 ? Math.round((todayBooked / totalPropertyRooms) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F4] shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Total Inventory
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalPropertyRooms}</span>
            <span className="text-xs text-slate-500">Rooms Total</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Across {categories.length} room categories
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F4] shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Today Booked
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#4B70E2]">{todayBooked}</span>
            <span className="text-xs text-slate-500">/ {totalPropertyRooms} Rooms</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[#EEF2F9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4B70E2] rounded-full transition-all"
                style={{ width: `${todayOccupancyPct}%` }}
              ></div>
            </div>
            <span className="text-[11px] font-semibold text-[#4B70E2]">{todayOccupancyPct}%</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F4] shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Today Available
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{todayAvailable}</span>
            <span className="text-xs text-slate-500">Rooms Vacant</span>
          </div>
          <p className="text-[11px] text-[#3B62D6] mt-1 font-medium">
            Ready for check-in today
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F4] shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            {firstDayOfMonth.toLocaleDateString('en-US', { month: 'short' })} Activity
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{monthBookedDaysCount}</span>
            <span className="text-xs text-slate-500">of {daysInMonth} days active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {monthTotalBookedNights} room-nights booked
          </p>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-xs overflow-hidden">
        {/* Calendar Month Navigation Header */}
        <div className="p-4 sm:p-5 border-b border-[#EBF0F8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8FAFD]">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-[#DCE5F5] rounded-xl p-1 shadow-2xs">
              <button
                id="prev-month-btn"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-[#4B70E2] hover:bg-[#EEF4FE] transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                id="next-month-btn"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-[#4B70E2] hover:bg-[#EEF4FE] transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {monthName}
              </h2>
              <p className="text-xs text-slate-500">
                Tap any square date box to log rooms booked or manage room categories
              </p>
            </div>
          </div>

          {/* Quick buttons & Legend */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              id="jump-today-btn"
              onClick={handleGoToToday}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#DCE5F5] bg-white hover:bg-[#EEF4FE] text-slate-700 hover:text-[#4B70E2] shadow-2xs transition-colors"
            >
              Today
            </button>

            <button
              id="manage-categories-btn"
              onClick={onOpenCategoryManager}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#D1E1FC] bg-[#EEF4FE] hover:bg-[#E2EDFD] text-[#2552D0] transition-colors flex items-center gap-1.5"
            >
              <span>Manage Categories ({categories.length})</span>
            </button>

            {/* Blue & Periwinkle Legend */}
            <div className="hidden md:flex items-center gap-3 pl-2 border-l border-slate-200 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#EEF4FE] border border-[#C5DAFC] inline-block"></span>
                <span>Has Bookings (Blue)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#4B70E2] border border-[#3B62D6] inline-block"></span>
                <span>Full House</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legend for Mobile */}
        <div className="md:hidden px-4 py-2 bg-[#F8FAFD] border-b border-[#EBF0F8] flex items-center justify-around text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#EEF4FE] border border-[#C5DAFC] inline-block"></span>
            <span>Blue = Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#4B70E2] border border-[#3B62D6] inline-block"></span>
            <span>Deep Blue = Full</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white border border-slate-200 inline-block"></span>
            <span>Available</span>
          </div>
        </div>

        {/* Day-of-week Headers */}
        <div className="grid grid-cols-7 border-b border-[#E2E8F4] bg-[#F1F5FB] text-center text-xs font-semibold text-slate-600 py-2.5">
          {daysOfWeek.map((day, idx) => (
            <div key={day} className={idx === 0 || idx === 6 ? 'text-[#4B70E2]' : ''}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid - All date boxes are true 1:1 squares (aspect-square) */}
        <div className="grid grid-cols-7 gap-px bg-[#E2E8F4]">
          {/* Previous month trailing days */}
          {Array.from({ length: startDayOfWeek }).map((_, idx) => {
            const dayNum = prevMonthDays - startDayOfWeek + idx + 1;
            return (
              <div
                key={`prev-${idx}`}
                className="aspect-square p-1.5 sm:p-2.5 bg-[#F8FAFD]/70 text-slate-300 opacity-60 flex flex-col justify-between select-none"
              >
                <span className="text-[11px] sm:text-xs font-medium">{dayNum}</span>
              </div>
            );
          })}

          {/* Current Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateKey = formatDateKey(currentYear, currentMonth, dayNum);
            const record = dayRecords[dateKey];
            const isToday = dateKey === todayKey;

            // Compute bookings for this day
            const bookingsList = record?.bookings || [];
            const bookedCount = bookingsList.reduce((sum, b) => sum + b.bookedCount, 0);
            const hasBookings = bookedCount > 0;
            const availableCount = Math.max(0, totalPropertyRooms - bookedCount);
            const isFullyBooked = totalPropertyRooms > 0 && bookedCount >= totalPropertyRooms;

            // Visual Styling: highlighted in modern periwinkle & cobalt
            let cellBg = 'bg-white hover:bg-[#F4F8FD]';
            if (hasBookings) {
              if (isFullyBooked) {
                cellBg = 'bg-[#4366DB] hover:bg-[#3858C9] border-[#314FB5] text-white';
              } else {
                cellBg = 'bg-[#EEF4FE] hover:bg-[#E3EDFD] border-[#C8DCFB]';
              }
            }

            return (
              <div
                key={dateKey}
                id={`calendar-day-${dateKey}`}
                onClick={() => onSelectDate(dateKey)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDate(dateKey);
                  }
                }}
                className={`aspect-square p-2 sm:p-2.5 transition-all cursor-pointer flex flex-col justify-between group relative border ${cellBg} ${
                  isToday ? 'ring-2 ring-[#4B70E2] ring-offset-1 z-10' : ''
                }`}
                title={`${monthName} ${dayNum}: ${bookedCount} rooms booked (${availableCount} available)`}
                aria-label={`${monthName} ${dayNum}, ${bookedCount} rooms booked, ${availableCount} available`}
              >
                {/* Date header with clean date number */}
                <div className="flex items-start justify-between">
                  <span
                    className={`text-xs sm:text-sm font-semibold inline-flex items-center justify-center rounded-full ${
                      isToday
                        ? 'w-6 h-6 bg-[#4B70E2] text-white shadow-xs text-xs'
                        : isFullyBooked
                        ? 'text-white'
                        : hasBookings
                        ? 'text-[#1D4ED8]'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Subtle clean booking status indicator dot */}
                  {isFullyBooked ? (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-white/80 mt-1 mr-0.5"
                      title="Full House"
                    ></span>
                  ) : hasBookings ? (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#4B70E2] mt-1 mr-0.5"
                      title="Booked"
                    ></span>
                  ) : null}
                </div>

                {/* Minimalist clean cell interior without room numbers */}
                <div className="mt-auto"></div>
              </div>
            );
          })}

          {/* Next month trailing days to complete grid with square cells */}
          {(() => {
            const totalCellsSoFar = startDayOfWeek + daysInMonth;
            const remainingCells = (7 - (totalCellsSoFar % 7)) % 7;
            return Array.from({ length: remainingCells }).map((_, idx) => (
              <div
                key={`next-${idx}`}
                className="aspect-square p-1.5 sm:p-2.5 bg-[#F8FAFD]/70 text-slate-300 opacity-60 flex flex-col justify-between select-none"
              >
                <span className="text-[11px] sm:text-xs font-medium">{idx + 1}</span>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
