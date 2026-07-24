import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AdminDbError({ message }: { message: string }) {
  return (
    <div className="admin-card p-8 max-w-xl border-l-4 !border-l-rose-400/70">
      <div className="flex items-start gap-4">
        <span className="w-11 h-11 rounded-xl bg-rose-400/10 text-rose-300 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-xl font-display font-bold text-white mb-2 tracking-tight">
            Tableau de bord indisponible
          </h2>
          <p className="text-sm text-white/50 leading-relaxed mb-4">
            {message}
          </p>
          <ol className="text-sm text-white/80 space-y-2 list-decimal list-inside mb-5">
            <li>
              Ouvrez Supabase → <strong>SQL Editor</strong>
            </li>
            <li>
              Exécutez{" "}
              <code className="text-xs bg-white/[0.07] px-1.5 py-0.5 rounded-md">
                supabase/migration.sql
              </code>
            </li>
            <li>Redémarrez le serveur de dev</li>
          </ol>
          <Link
            href="/admin/login"
            className="admin-btn-ghost inline-flex text-teal-300 cursor-pointer"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
