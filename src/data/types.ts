export interface DanceClass {
  id: string;
  title: string;
  style: DanceStyle;
  instructor: string;
  level: string;
  duration: number; // in minutes
  description: string;
  image?: string;
  color: string;
}

export type DanceStyle = 
  | "Ballet" 
  | "Hip Hop" 
  | "Contemporary" 
  | "Jazz" 
  | "Salsa" 
  | "Ballroom"
  | "Tap"
  | "Lyrical";

export interface ScheduleSlot {
  id: string;
  classId: string;
  className: string;
  instructor: string;
  style: DanceStyle;
  day: string; // e.g., "Monday"
  startTime: string; // e.g., "10:00"
  endTime: string; // e.g., "11:30"
  spotsTotal: number;
  spotsAvailable: number;
  level: string;
  color: string;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  bio: string;
  image?: string;
  yearsExperience: number;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  slotId: string;
  specialRequests?: string;
}

