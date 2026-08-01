"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";

type ToastTone = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

type ConfirmTone = "primary" | "danger" | "warning";

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
}

interface AdminFeedbackContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
  };
}

const AdminFeedbackContext = createContext<AdminFeedbackContextValue | null>(
  null
);

export function useAdminFeedback(): AdminFeedbackContextValue {
  const ctx = useContext(AdminFeedbackContext);
  if (!ctx) {
    throw new Error("useAdminFeedback must be used within AdminFeedbackProvider");
  }
  return ctx;
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function AdminFeedbackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev.slice(-4), { id, tone, title, description }]);
      const timer = setTimeout(() => dismissToast(id), 4200);
      timers.current.set(id, timer);
    },
    [dismissToast]
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((t) => clearTimeout(t));
      activeTimers.clear();
    };
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const closeConfirm = useCallback((value: boolean) => {
    setPending((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  const value = useMemo<AdminFeedbackContextValue>(
    () => ({
      confirm,
      toast: {
        success: (title, description) => pushToast("success", title, description),
        error: (title, description) => pushToast("error", title, description),
        info: (title, description) => pushToast("info", title, description),
        warning: (title, description) => pushToast("warning", title, description),
      },
    }),
    [confirm, pushToast]
  );

  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeConfirm(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, closeConfirm]);

  const tone = pending?.tone ?? "primary";

  return (
    <AdminFeedbackContext.Provider value={value}>
      {children}

      <AnimatePresence>
        {pending && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-[#05070c]/70 backdrop-blur-[6px]"
              aria-label="Fermer"
              onClick={() => closeConfirm(false)}
            />
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="admin-confirm-title"
              aria-describedby="admin-confirm-desc"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-md admin-card overflow-hidden"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 ${
                  tone === "danger"
                    ? "bg-gradient-to-r from-rose-500 to-rose-400"
                    : tone === "warning"
                      ? "bg-gradient-to-r from-amber-500 to-amber-300"
                      : "bg-gradient-to-r from-secondary-500 to-teal-300"
                }`}
                aria-hidden
              />
              <div className="p-6 pt-7">
                <div className="flex items-start gap-3.5">
                  <span
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                      tone === "danger"
                        ? "bg-rose-400/10 text-rose-300 border-rose-400/25"
                        : tone === "warning"
                          ? "bg-amber-400/10 text-amber-300 border-amber-400/25"
                          : "bg-teal-400/10 text-teal-300 border-teal-400/25"
                    }`}
                  >
                    {tone === "danger" || tone === "warning" ? (
                      <AlertTriangle className="w-5 h-5" aria-hidden />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2
                      id="admin-confirm-title"
                      className="font-display font-bold text-lg text-white tracking-tight"
                    >
                      {pending.title}
                    </h2>
                    <p
                      id="admin-confirm-desc"
                      className="text-sm text-white/55 mt-1.5 leading-relaxed"
                    >
                      {pending.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => closeConfirm(false)}
                    className="admin-btn-ghost min-w-9 min-h-9 p-0 shrink-0"
                    aria-label="Fermer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 mt-6">
                  <button
                    type="button"
                    onClick={() => closeConfirm(false)}
                    className="admin-btn-ghost min-h-11 px-5"
                  >
                    {pending.cancelLabel ?? "Annuler"}
                  </button>
                  <button
                    type="button"
                    onClick={() => closeConfirm(true)}
                    className={`admin-btn min-h-11 px-5 text-white ${
                      tone === "danger"
                        ? "bg-gradient-to-r from-rose-600 to-rose-500 border border-rose-400/40 shadow-[0_8px_24px_rgba(244,63,94,0.28)]"
                        : tone === "warning"
                          ? "bg-gradient-to-r from-amber-600 to-amber-500 border border-amber-400/40 shadow-[0_8px_24px_rgba(245,158,11,0.28)]"
                          : "admin-btn-primary"
                    }`}
                  >
                    {pending.confirmLabel ?? "Confirmer"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[90] flex flex-col gap-2.5 sm:max-w-sm pointer-events-none"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto admin-card-soft px-4 py-3.5 flex items-start gap-3 border ${
                t.tone === "success"
                  ? "border-teal-400/30"
                  : t.tone === "error"
                    ? "border-rose-400/30"
                    : t.tone === "warning"
                      ? "border-amber-400/30"
                      : "border-sky-400/25"
              }`}
            >
              <span
                className={`mt-0.5 shrink-0 ${
                  t.tone === "success"
                    ? "text-teal-300"
                    : t.tone === "error"
                      ? "text-rose-300"
                      : t.tone === "warning"
                        ? "text-amber-300"
                        : "text-sky-300"
                }`}
              >
                {t.tone === "success" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : t.tone === "error" ? (
                  <XCircle className="w-5 h-5" />
                ) : t.tone === "warning" ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white leading-snug">
                  {t.title}
                </p>
                {t.description && (
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="admin-btn-ghost min-w-8 min-h-8 p-0 shrink-0 opacity-70 hover:opacity-100"
                aria-label="Fermer la notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AdminFeedbackContext.Provider>
  );
}
