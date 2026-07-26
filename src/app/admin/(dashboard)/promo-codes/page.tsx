import { fetchAllPromoCodes } from "@/lib/booking/db";
import PromoCodeManager from "@/components/admin/PromoCodeManager";
import AdminDbError from "@/components/admin/AdminDbError";

export const dynamic = "force-dynamic";

export default async function AdminPromoCodesPage() {
  try {
    const promos = await fetchAllPromoCodes();

    return (
      <div className="space-y-5">
        <div>
          <p className="admin-eyebrow">Marketing</p>
          <h1 className="admin-page-title">Codes promo</h1>
          <p className="admin-page-subtitle">
            Créez des réductions en pourcentage ou en montant fixe pour vos
            clients lors de la réservation.
          </p>
        </div>
        <PromoCodeManager promos={promos} />
      </div>
    );
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message.replace(/^fetchAllPromoCodes: /, "")
        : "Impossible de charger les codes promo.";
    return (
      <AdminDbError
        message={
          message.includes("promo_codes")
            ? "Table promo_codes manquante. Exécutez supabase/promo-codes-migration.sql dans Supabase."
            : message
        }
      />
    );
  }
}
