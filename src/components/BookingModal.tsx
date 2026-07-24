"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Users, Check, Sparkles } from "lucide-react";
import { ScheduleSlot, DanceStyle } from "@/data/types";
import { schedule, weekDays } from "@/data/schedule";
import { formatTime, getAvailabilityMessage } from "@/lib/utils";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClassId?: string;
}

export default function BookingModal({ isOpen, onClose, preselectedClassId }: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(weekDays[0]);
  const [filterStyle, setFilterStyle] = useState<DanceStyle | "All">("All");
  const [bookingStep, setBookingStep] = useState<"schedule" | "form" | "success">("schedule");
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  });
  
  const filteredSchedule = schedule.filter(slot => {
    const matchesDay = slot.day === selectedDay;
    const matchesStyle = filterStyle === "All" || slot.style === filterStyle;
    const matchesClass = !preselectedClassId || slot.classId === preselectedClassId;
    return matchesDay && matchesStyle && matchesClass;
  });
  
  const handleBookSlot = (slot: ScheduleSlot) => {
    if (slot.spotsAvailable > 0) {
      setSelectedSlot(slot);
      setBookingStep("form");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setBookingStep("success");
  };
  
  const handleClose = () => {
    setBookingStep("schedule");
    setSelectedSlot(null);
    setFormData({ name: "", email: "", phone: "", specialRequests: "" });
    onClose();
  };
  
  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setBookingStep("schedule");
        setSelectedSlot(null);
        setFormData({ name: "", email: "", phone: "", specialRequests: "" });
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
  
  const danceStyles: (DanceStyle | "All")[] = ["All", "Ballet", "Hip Hop", "Contemporary", "Jazz", "Salsa"];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.preventDefault();
              handleClose();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleClose();
            }}
          />
          
          {/* Modal */}
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4 lg:p-8 overflow-y-auto"
            onClick={(e) => {
              // Close if clicking on the backdrop (not the modal content)
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}
          >
            <motion.div
              className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-5xl md:rounded-4xl bg-white shadow-2xl flex flex-col my-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full overflow-hidden">
              {/* Header - Sticky */}
              <div className="sticky top-0 z-[210] bg-white border-b border-charcoal/10 px-4 sm:px-6 md:px-8 py-4 md:py-6 flex items-center justify-between flex-shrink-0 shadow-sm">
                <div className="flex-1 min-w-0 pr-3">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold text-charcoal truncate">
                    {bookingStep === "schedule" && "Book Your Class"}
                    {bookingStep === "form" && "Complete Booking"}
                    {bookingStep === "success" && "Booking Confirmed!"}
                  </h2>
                  {bookingStep === "schedule" && (
                    <p className="text-xs sm:text-sm md:text-base text-soft-charcoal mt-1">Select your preferred time slot</p>
                  )}
                </div>
                
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClose();
                  }}
                  className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full text-white flex items-center justify-center cursor-pointer transition-all flex-shrink-0 shadow-lg hover:shadow-xl z-[220]"
                  style={{ 
                    background: 'linear-gradient(to right, #1E3A5F, #182E4C)',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #182E4C, #1E3A5F)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #1E3A5F, #182E4C)';
                  }}
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.85 }}
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={3} />
                </motion.button>
              </div>
              
              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 md:p-8">
                {/* Schedule View */}
                {bookingStep === "schedule" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {/* Style Filter */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {danceStyles.map((style) => (
                        <motion.button
                          key={style}
                          onClick={() => setFilterStyle(style)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-interactive ${
                            filterStyle === style
                              ? "bg-primary-500 text-white shadow-skeu-sm"
                              : "bg-white text-soft-charcoal shadow-skeu-sm hover:shadow-skeu-md"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {style}
                        </motion.button>
                      ))}
                    </div>
                    
                    {/* Day Selector - Mobile Optimized */}
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-6 sm:mb-8">
                      {weekDays.map((day) => {
                        const daySchedule = schedule.filter(s => s.day === day);
                        const hasClasses = daySchedule.length > 0;
                        
                        return (
                          <motion.button
                            key={day}
                            onClick={() => hasClasses && setSelectedDay(day)}
                            disabled={!hasClasses}
                            className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl text-center transition-all cursor-interactive min-h-[60px] sm:min-h-[70px] flex flex-col items-center justify-center ${
                              selectedDay === day
                                ? "text-white shadow-md"
                                : hasClasses
                                ? "bg-cream border border-charcoal/10 text-charcoal hover:border-primary-500/30 hover:bg-primary-500/5"
                                : "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200"
                            }`}
                            style={selectedDay === day ? {
                              background: 'linear-gradient(to bottom right, #1E3A5F, #182E4C)',
                              color: '#ffffff'
                            } : undefined}
                            whileHover={hasClasses ? { scale: 1.03 } : {}}
                            whileTap={hasClasses ? { scale: 0.97 } : {}}
                          >
                            <div className="text-[10px] sm:text-xs font-semibold mb-1">{day.slice(0, 3)}</div>
                            <div className={`text-xs sm:text-sm font-bold ${selectedDay === day ? 'text-white' : hasClasses ? 'text-charcoal' : 'text-gray-400'}`}>
                              {daySchedule.length}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                    
                    {/* Time Slots */}
                    <div className="space-y-4">
                      {filteredSchedule.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-soft-charcoal">No classes available for this selection.</p>
                        </div>
                      ) : (
                        filteredSchedule.map((slot, index) => {
                          const availability = getAvailabilityMessage(slot.spotsAvailable, slot.spotsTotal);
                          const isFull = slot.spotsAvailable === 0;
                          
                          return (
                            <motion.div
                              key={slot.id}
                              className={`bg-white border border-charcoal/10 rounded-2xl p-4 sm:p-6 cursor-pointer transition-all mb-3 ${
                                isFull ? "opacity-50" : "hover:border-primary-500/30 hover:shadow-md"
                              }`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={!isFull ? { scale: 1.01 } : {}}
                              whileTap={!isFull ? { scale: 0.99 } : {}}
                              onClick={() => handleBookSlot(slot)}
                            >
                              <div className="flex flex-col gap-3">
                                <div className="flex-1 w-full">
                                  <div className="flex items-start gap-2 mb-2">
                                    <div
                                      className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                                      style={{ backgroundColor: slot.color }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-display font-bold text-base sm:text-lg text-charcoal mb-1">
                                        {slot.className}
                                      </h4>
                                      
                                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-soft-charcoal">
                                        <div className="flex items-center gap-1.5">
                                          <Clock className="w-3.5 h-3.5 text-primary-500" />
                                          <span className="whitespace-nowrap font-medium">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5">
                                          <Users className="w-3.5 h-3.5 text-primary-500" />
                                          <span className="truncate font-medium">{slot.instructor}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                  <div className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-center ${
                                    availability.urgency === "high" ? "bg-red-50 text-red-700 border border-red-200" :
                                    availability.urgency === "medium" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
                                    availability.urgency === "full" ? "bg-gray-50 text-gray-600 border border-gray-200" :
                                    "bg-green-50 text-green-700 border border-green-200"
                                  }`}>
                                    {availability.message}
                                  </div>
                                  
                                  {!isFull && (
                                    <motion.button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleBookSlot(slot);
                                      }}
                                      className="w-full px-4 py-2.5 text-white rounded-lg font-semibold text-sm shadow-sm"
                                      style={{ 
                                        background: 'linear-gradient(to right, #1E3A5F, #182E4C)',
                                        color: '#ffffff'
                                      }}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Réserver
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
                
                {/* Booking Form */}
                {bookingStep === "form" && selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {/* Selected Class Info */}
                    <div className="bg-cream border border-charcoal/10 rounded-2xl p-4 sm:p-6 mb-6">
                      <h3 className="font-display font-bold text-lg sm:text-xl text-charcoal mb-4">
                        Selected Class
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm text-soft-charcoal mb-1">Date & Time</div>
                            <div className="font-semibold text-sm sm:text-base break-words">{selectedSlot.day}, {formatTime(selectedSlot.startTime)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm text-soft-charcoal mb-1">Instructor</div>
                            <div className="font-semibold text-sm sm:text-base break-words">{selectedSlot.instructor}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none transition-all bg-white text-base"
                          placeholder="Jane Doe"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none transition-all bg-white text-base"
                          placeholder="jane@example.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none transition-all bg-white text-base"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">
                          Special Requests (Optional)
                        </label>
                        <textarea
                          value={formData.specialRequests}
                          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none transition-all bg-white resize-none text-base"
                          placeholder="Any special requirements or notes..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <motion.button
                          type="button"
                          onClick={() => setBookingStep("schedule")}
                          className="flex-1 py-3.5 px-6 rounded-xl border-2 border-gray-300 text-charcoal font-semibold hover:border-primary-500 hover:bg-primary-500/5 transition-all cursor-interactive bg-white"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          Back
                        </motion.button>
                        
                        <motion.button
                          type="submit"
                          className="flex-1 py-3.5 px-6 text-white rounded-xl font-semibold shadow-md cursor-interactive"
                          style={{ 
                            background: 'linear-gradient(to right, #1E3A5F, #182E4C)',
                            color: '#ffffff'
                          }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          Confirm Booking
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
                
                {/* Success View */}
                {bookingStep === "success" && (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                  >
                    <motion.div
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", delay: 0.4, duration: 0.6 }}
                      >
                        <Check className="w-12 h-12 text-white" strokeWidth={3} />
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h3 className="text-3xl font-display font-bold text-charcoal mb-4">
                        You&apos;re All Set! <Sparkles className="inline-block w-8 h-8 text-primary-500" />
                      </h3>
                      <p className="text-lg text-soft-charcoal mb-8">
                        Your class has been booked successfully. We&apos;ve sent a confirmation email to <strong>{formData.email}</strong>
                      </p>
                      
                      <motion.button
                        onClick={handleClose}
                        className="px-10 py-4 text-white rounded-full font-semibold shadow-skeu-md cursor-interactive"
                        style={{ 
                          background: 'linear-gradient(to right, #1E3A5F, #182E4C)',
                          color: '#ffffff'
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Book Another Class
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

