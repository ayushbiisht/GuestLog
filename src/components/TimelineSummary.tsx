import { useState } from 'react';
import { RoomCategory, DayRecord, BOOKING_PLANS } from '../types';
import {
  Calendar,
  RotateCcw,
  Pencil,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';

interface TimelineSummaryProps {
  categories: RoomCategory[];
  dayRecords: Record<string, DayRecord>;
  onEditDate: (dateKey: string) => void;
}

export function TimelineSummary({
  categories,
  dayRecords,
  onEditDate,
}: TimelineSummaryProps) {
  const todayKey = '2026-09-22';
  const [searchDate, setSearchDate] = useState<string>(todayKey);
  const [filterPlan, setFilterPlan] = useState<string>('ALL');

  // Total capacity of the property
  const totalPropertyCapacity = categories.reduce((sum, c) => sum + c.totalRooms, 0);

  // Generate 14 days for timeline view starting from searched date
  const daysToShow = 14;
  const [sYear, sMonth, sDay] = (searchDate || todayKey).split('-').map(Number);
  const startDate = new Date(sYear, (sMonth || 1) - 1, sDay || 1);

  const timelineDays: { dateKey: string; dateObj: Date }[] = [];
  for (let i = 0; i < daysToShow; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    timelineDays.push({
      dateKey: `${y}-${m}-${day}`,
      dateObj: d,
    });
  }

  // Compute aggregate stats across these 14 days
  let totalBookedAcrossWindow = 0;
  let totalCapacityAcrossWindow = totalPropertyCapacity * daysToShow;
  let fullDaysCount = 0;
  let planCounts: Record<string, number> = { EP: 0, CP: 0, MAP: 0, AP: 0 };

  timelineDays.forEach(({ dateKey }) => {
    const record = dayRecords[dateKey];
    if (record?.bookings) {
      const dayTotal = record.bookings.reduce((sum, b) => {
        if (b.plan && planCounts[b.plan] !== undefined) {
          planCounts[b.plan] += b.bookedCount;
        } else if (b.bookedCount > 0) {
          planCounts['EP'] += b.bookedCount;
        }
        return sum + b.bookedCount;
      }, 0);
      totalBookedAcrossWindow += dayTotal;
      if (dayTotal >= totalPropertyCapacity && totalPropertyCapacity > 0) {
        fullDaysCount++;
      }
    }
  });

  const avgOccupancy =
    totalCapacityAcrossWindow > 0
      ? Math.round((totalBookedAcrossWindow / totalCapacityAcrossWindow) * 100)
      : 0;

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F4] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Timeline Summary
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF4FE] text-[#2552D0]">
              {daysToShow}-Day Overview
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily room occupancy, availability, and meal plans
          </p>
        </div>

        {/* Easy Date Search Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#F8FAFD] border border-[#DCE5F5] rounded-xl px-2.5 py-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-[#4B70E2]/30 focus-within:border-[#4B70E2] transition-all">
            <Calendar className="w-4 h-4 text-[#4B70E2] shrink-0" />
            <label htmlFor="timeline-date-search-input" className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Date:
            </label>
            <input
              id="timeline-date-search-input"
              type="date"
              value={searchDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSearchDate(e.target.value);
                }
              }}
              className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
              title="Search by date"
            />
          </div>

          {searchDate !== todayKey && (
            <button
              id="timeline-reset-today-btn"
              type="button"
              onClick={() => setSearchDate(todayKey)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DCE5F5] bg-[#EEF4FE] hover:bg-[#E1EDFD] text-[#2552D0] text-xs font-semibold shadow-2xs transition-colors"
              title="Reset to today's date"
            >
              <RotateCcw className="w-3 h-3 text-[#4B70E2]" />
              <span>Today</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-[#E2E8F4] shadow-2xs">
          <span className="text-slate-400 text-[11px] font-semibold block uppercase tracking-wider">
            Average Occupancy
          </span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">
            {avgOccupancy}%
          </div>
          <div className="text-[11px] text-[#4B70E2] font-semibold mt-1">
            {totalBookedAcrossWindow} / {totalCapacityAcrossWindow} room nights
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#E2E8F4] shadow-2xs">
          <span className="text-slate-400 text-[11px] font-semibold block uppercase tracking-wider">
            Full Capacity Days
          </span>
          <div className="text-xl font-bold text-[#2552D0] mt-0.5">
            {fullDaysCount} of {daysToShow}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            100% full house days
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#E2E8F4] shadow-2xs">
          <span className="text-slate-400 text-[11px] font-semibold block uppercase tracking-wider">
            Total Inventory
          </span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">
            {totalPropertyCapacity} Rooms
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {categories.length} categories
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#E2E8F4] shadow-2xs">
          <span className="text-slate-400 text-[11px] font-semibold block uppercase tracking-wider flex items-center gap-1">
            <UtensilsCrossed className="w-3 h-3 text-[#4B70E2]" />
            <span>Booking Plans</span>
          </span>
          <div className="text-xs font-bold text-[#2552D0] mt-1 space-y-0.5">
            <div className="flex justify-between">
              <span>MAP: {planCounts.MAP}</span>
              <span>EP: {planCounts.EP}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>AP: {planCounts.AP}</span>
              <span>CP: {planCounts.CP}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Filter Bar */}
      <div className="flex items-center gap-1.5 flex-wrap bg-white px-4 py-2.5 rounded-2xl border border-[#E2E8F4] text-xs shadow-2xs">
        <span className="text-slate-400 text-[11px] font-semibold mr-1">Filter Plan:</span>
        <button
          type="button"
          onClick={() => setFilterPlan('ALL')}
          className={`px-3 py-1 rounded-xl font-semibold transition-colors ${
            filterPlan === 'ALL'
              ? 'bg-[#4B70E2] text-white shadow-2xs'
              : 'bg-[#EEF4FE] text-[#2552D0] hover:bg-[#E0ECFC]'
          }`}
        >
          All Plans
        </button>
        {BOOKING_PLANS.map((p) => (
          <button
            key={p.code}
            type="button"
            onClick={() => setFilterPlan(p.code)}
            className={`px-3 py-1 rounded-xl font-semibold transition-colors ${
              filterPlan === p.code
                ? 'bg-[#4B70E2] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-[#EEF4FE] hover:text-[#4B70E2]'
            }`}
          >
            {p.code} ({p.shortDesc})
          </button>
        ))}
      </div>

      {/* Clean Stream of Day Cards */}
      <div className="space-y-3">
        {timelineDays.map(({ dateKey, dateObj }) => {
          const isToday = dateKey === todayKey;

          const record = dayRecords[dateKey];
          let bookingsList = record?.bookings || [];

          // If plan filter active, filter bookings
          if (filterPlan !== 'ALL') {
            bookingsList = bookingsList.filter((b) => (b.plan || 'EP') === filterPlan);
          }

          // Calculate day statistics
          const totalBooked = bookingsList.reduce((sum, b) => sum + b.bookedCount, 0);
          const totalAvailable = Math.max(0, totalPropertyCapacity - totalBooked);
          const occupancyPct =
            totalPropertyCapacity > 0
              ? Math.round((totalBooked / totalPropertyCapacity) * 100)
              : 0;
          const hasBookings = totalBooked > 0;
          const isFull = totalBooked >= totalPropertyCapacity && totalPropertyCapacity > 0;

          const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const monthDay = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          const year = dateObj.getFullYear();

          const bookedCategories = categories.filter((cat) => {
            const booking = bookingsList.find((b) => b.categoryId === cat.id);
            return (booking?.bookedCount || 0) > 0;
          });

          return (
            <div
              key={dateKey}
              id={`timeline-item-${dateKey}`}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isToday
                  ? 'bg-white border-[#4B70E2] ring-1 ring-[#4B70E2]/20 shadow-xs'
                  : hasBookings
                  ? isFull
                    ? 'bg-[#EEF4FE]/80 border-[#BED6FA] shadow-2xs'
                    : 'bg-white border-[#D6E3F8] shadow-2xs'
                  : 'bg-white/80 border-[#E5EDF8] hover:border-slate-300'
              }`}
            >
              {/* Top Row: Date, Badges, and Quick Edit */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Visual Date Badge */}
                  <div
                    className={`flex flex-col items-center justify-center w-11 h-11 rounded-xl text-center shrink-0 ${
                      isToday
                        ? 'bg-[#4B70E2] text-white shadow-xs'
                        : isFull
                        ? 'bg-[#3B62D6] text-white'
                        : hasBookings
                        ? 'bg-[#EEF4FE] text-[#1E40AF]'
                        : 'bg-[#F1F5F9] text-slate-600'
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
                      {weekday}
                    </span>
                    <span className="text-base font-bold leading-none mt-1">
                      {dateObj.getDate()}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-slate-900">
                        {monthDay}, {year}
                      </span>

                      {isToday && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#4B70E2] text-white tracking-wide">
                          TODAY
                        </span>
                      )}

                      {dateKey === searchDate && !isToday && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EEF4FE] text-[#2552D0] border border-[#BFDBFE]">
                          SEARCHED
                        </span>
                      )}

                      {isFull ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#2552D0] text-white">
                          Fully Booked (100%)
                        </span>
                      ) : hasBookings ? (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#EEF4FE] text-[#2552D0]">
                          {totalBooked}/{totalPropertyCapacity} Booked ({occupancyPct}%)
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                          100% Vacant
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {hasBookings
                        ? `${totalAvailable} ${totalAvailable === 1 ? 'room' : 'rooms'} still available`
                        : `All ${totalPropertyCapacity} rooms available`}
                    </p>
                  </div>
                </div>

                {/* Edit Day Button */}
                <button
                  id={`timeline-edit-btn-${dateKey}`}
                  type="button"
                  onClick={() => onEditDate(dateKey)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DCE5F5] bg-white hover:bg-[#EEF4FE] text-[#2552D0] text-xs font-semibold shadow-2xs hover:border-[#BED6FA] transition-colors shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#4B70E2]" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Smooth Occupancy Progress Bar */}
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFull ? 'bg-[#2552D0]' : 'bg-[#4B70E2]'
                  }`}
                  style={{ width: `${Math.min(100, occupancyPct)}%` }}
                />
              </div>

              {/* Booked Categories & Plan Pills */}
              {bookedCategories.length > 0 && (
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  {bookedCategories.map((cat) => {
                    const booking = bookingsList.find((b) => b.categoryId === cat.id);
                    const booked = booking?.bookedCount || 0;
                    const planCode = booking?.plan || 'EP';

                    return (
                      <span
                        key={cat.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F0F5FF] text-slate-800 text-xs font-medium border border-[#DCE7FC]"
                      >
                        <span className="font-semibold text-[#1E40AF]">{cat.name}:</span>
                        <span className="font-bold text-slate-900">{booked}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-[#2552D0] border border-[#BFDBFE]">
                          {planCode}
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Day Note snippet if present */}
              {record?.notes && (
                <div className="mt-2.5 text-xs bg-amber-50/80 border border-amber-200/50 px-3 py-1.5 rounded-xl text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{record.notes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
