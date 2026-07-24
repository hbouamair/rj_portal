interface Props {
  message: string;
  title?: string;
}

/** Shown when Supabase data cannot load on public pages. */
export default function SupabaseLoadError({
  message,
  title = "Données indisponibles",
}: Props) {
  const isMigration =
    message.includes("tables manquantes") ||
    message.includes("does not exist") ||
    message.includes("Could not find");
  const isEnv =
    message.includes("manquant") || message.includes("NEXT_PUBLIC");

  return (
    <div className="book-card max-w-xl mx-auto p-8 text-center">
      <p className="text-base font-display font-bold text-charcoal mb-2">
        {title}
      </p>
      <p className="text-sm text-soft-charcoal leading-relaxed mb-5">{message}</p>
      {isEnv && (
        <div className="text-left text-xs text-soft-charcoal bg-charcoal/[0.03] rounded-xl p-4 space-y-2">
          <p className="font-semibold text-charcoal">Vercel → Environment Variables :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <code className="text-[11px]">NEXT_PUBLIC_SUPABASE_URL</code>
            </li>
            <li>
              <code className="text-[11px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
              (JWT eyJ…)
            </li>
            <li>
              <code className="text-[11px]">SUPABASE_SECRET_KEY</code> (sb_secret_…,
              admin + réservations)
            </li>
          </ul>
          <p className="pt-1">Puis redéployez le projet.</p>
        </div>
      )}
      {isMigration && (
        <p className="text-xs text-soft-charcoal mt-4">
          Supabase → SQL Editor → exécutez{" "}
          <code className="bg-charcoal/[0.05] px-1 rounded">supabase/migration.sql</code>
        </p>
      )}
      <p className="text-[11px] text-soft-charcoal/80 mt-5">
        Diagnostic :{" "}
        <code className="bg-charcoal/[0.05] px-1 rounded">/api/health/supabase</code>
      </p>
    </div>
  );
}
