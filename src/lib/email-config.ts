/** Shared email env — read at send time, never at module load. */
export function getFromEmail(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim();
  if (!raw) {
    return "RJ Studio <onboarding@resend.dev>";
  }
  return raw.replace(/^["']|["']$/g, "");
}

export function getFromAddress(): string | null {
  const from = getFromEmail();
  const match = from.match(/<([^>]+)>/);
  return (match?.[1] ?? from).trim().toLowerCase();
}

export function formatResendError(error: unknown): string {
  if (!error) return "Erreur Resend inconnue.";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const e = error as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
    if (typeof e.error === "string") return e.error;
    try {
      return JSON.stringify(error);
    } catch {
      return "Erreur Resend inconnue.";
    }
  }
  return String(error);
}
