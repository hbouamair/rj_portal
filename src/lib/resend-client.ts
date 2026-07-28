import { Resend } from "resend";

/** Lazy Resend client — never instantiate at module load (build must work without env). */
export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}
