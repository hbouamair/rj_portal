export interface Studio {
  id: number;
  name: string;
  subtitle: string | null;
  size_label: string | null;
  capacity_label: string | null;
  price_peak_mad: number;
  price_offpeak_mad: number;
  image_url: string | null;
  gallery_urls?: string[];
  features: string[];
  popular: boolean;
  active: boolean;
  sort_order: number;
}

/** Peak-price window. `days`: 0 = Sunday .. 6 = Saturday. Times "HH:mm". */
export interface PeakWindow {
  days: number[];
  start: string;
  end: string;
}

/** Keyed by weekday "0".."6" (0 = Sunday). Null = closed that day. */
export type OpeningHours = Record<string, { open: string; close: string } | null>;

export interface Settings {
  id: number;
  opening_hours: OpeningHours;
  peak_windows: PeakWindow[];
  paypal_email: string | null;
  paypal_link: string | null;
  bank_details: string | null;
  confirmation_deadline_hours: number;
  reminder_hours_before: number;
}

export type PromoDiscountType = "percent" | "fixed";

export interface PromoCode {
  id: number;
  code: string;
  label: string | null;
  discount_type: PromoDiscountType;
  discount_value: number;
  min_amount_mad: number | null;
  max_uses: number | null;
  uses_count: number;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type CourseType = "group" | "private";

export const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  group: "Cours en groupe (3 personnes et +)",
  private: "Cours privé (max 3 personnes)",
};

export type PaymentMethod = "paypal" | "virement" | "cash";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "expired"
  | "completed";

export interface Booking {
  id: string;
  reference: string;
  studio_id: number;
  date: string; // YYYY-MM-DD
  start_minutes: number;
  duration_minutes: number;
  total_price_mad: number;
  subtotal_price_mad: number | null;
  discount_amount_mad: number | null;
  promo_code: string | null;
  course_type?: CourseType;
  regular_course_count?: number | null;
  /** Shared by all sessions of a multi-booking package. */
  package_group_id?: string | null;
  /** 1-based index within the package. */
  package_index?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  note: string | null;
  payment_method: PaymentMethod;
  status: BookingStatus;
  payment_deadline: string; // ISO timestamp
  admin_note: string | null;
  client_reminder_sent_at: string | null;
  admin_reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithStudio extends Booking {
  studios: Pick<Studio, "id" | "name"> | null;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  paypal: "PayPal",
  virement: "Virement bancaire",
  cash: "Espèces au studio",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "En attente de paiement",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  expired: "Expirée",
  completed: "Terminée",
};
