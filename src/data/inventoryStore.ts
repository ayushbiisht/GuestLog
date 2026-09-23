import { RoomCategory, DayRecord, BookingPlanCode } from '../types';

export const INITIAL_CATEGORIES: RoomCategory[] = [
  { id: 'cat-1', name: 'Double Bed', totalRooms: 6 },
  { id: 'cat-2', name: 'Three Bed', totalRooms: 4 },
  { id: 'cat-3', name: 'Deluxe Balcony', totalRooms: 2 },
];

// Helper to format date string to YYYY-MM-DD
export function formatDateKey(year: number, monthZeroIndexed: number, day: number): string {
  const y = year.toString();
  const m = (monthZeroIndexed + 1).toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateKey.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

// Default clean state: no rooms booked
export function getInitialDayRecords(): Record<string, DayRecord> {
  return {};
}

const STORAGE_KEY_CATEGORIES = 'hotel_inventory_categories_v2';
const STORAGE_KEY_RECORDS = 'hotel_inventory_records_v3';

export function loadCategories(): RoomCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load categories from localStorage', e);
  }
  return INITIAL_CATEGORIES;
}

export function saveCategories(categories: RoomCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
}

export function loadDayRecords(): Record<string, DayRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.error('Failed to load records from localStorage', e);
  }
  return getInitialDayRecords();
}

export function saveDayRecords(records: Record<string, DayRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save day records', e);
  }
}
