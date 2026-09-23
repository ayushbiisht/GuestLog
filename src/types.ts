export interface RoomCategory {
  id: string;
  name: string;
  totalRooms: number;
}

// Common Hotel Meal/Booking Plans
// EP: European Plan (Room Only)
// CP: Continental Plan (Room + Breakfast)
// MAP: Modified American Plan (Room + Breakfast + Lunch or Dinner - Half Board)
// AP: American Plan (Room + All Meals: Breakfast, Lunch, Dinner - Full Board)
export type BookingPlanCode = 'EP' | 'CP' | 'MAP' | 'AP';

export interface BookingPlanOption {
  code: BookingPlanCode;
  name: string;
  shortDesc: string;
}

export const BOOKING_PLANS: BookingPlanOption[] = [
  { code: 'EP', name: 'European Plan (EP)', shortDesc: 'Room Only' },
  { code: 'CP', name: 'Continental Plan (CP)', shortDesc: 'Room + Breakfast' },
  { code: 'MAP', name: 'Modified American Plan (MAP)', shortDesc: 'Room + Breakfast + Dinner' },
  { code: 'AP', name: 'American Plan (AP)', shortDesc: 'All Meals Included' },
];

export interface CategoryBooking {
  categoryId: string;
  bookedCount: number;
  plan?: BookingPlanCode; // Default is EP or selected plan
}

export interface DayRecord {
  date: string; // ISO format "YYYY-MM-DD"
  bookings: CategoryBooking[];
  notes?: string;
}

export type ActivePage = 'calendar' | 'timeline';
