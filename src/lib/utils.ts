import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function getAvailabilityMessage(spotsAvailable: number, spotsTotal: number): {
  message: string;
  urgency: "low" | "medium" | "high" | "full";
} {
  if (spotsAvailable === 0) {
    return { message: "Class Full", urgency: "full" };
  }
  
  const percentAvailable = (spotsAvailable / spotsTotal) * 100;
  
  if (percentAvailable <= 20) {
    return { message: `Only ${spotsAvailable} spot${spotsAvailable === 1 ? '' : 's'} left!`, urgency: "high" };
  } else if (percentAvailable <= 50) {
    return { message: `${spotsAvailable} spots available`, urgency: "medium" };
  } else {
    return { message: `${spotsAvailable} spots available`, urgency: "low" };
  }
}

