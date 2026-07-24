"use server";

import { BookingFormData } from "@/data/types";

/**
 * Server Action for handling class bookings
 * In a real application, this would:
 * - Validate the data
 * - Store booking in database
 * - Send confirmation emails
 * - Update class availability
 * - Process payments if needed
 */
export async function bookClass(data: BookingFormData) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data.slotId) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        error: "Invalid email address",
      };
    }
    
    // In production, you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Update availability
    // 4. Process payment
    
    console.log("Booking received:", data);
    
    return {
      success: true,
      bookingId: `BOOK-${Date.now()}`,
      message: "Your class has been booked successfully!",
    };
  } catch (error) {
    console.error("Booking error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server Action for getting real-time availability
 * This would fetch from a database in production
 */
export async function getSlotAvailability(slotId: string) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In production, query database for current availability
  return {
    slotId,
    spotsAvailable: Math.floor(Math.random() * 15),
    lastUpdated: new Date().toISOString(),
  };
}

