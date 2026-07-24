import { fetchSettings } from "@/lib/booking/db";
import SettingsForm from "@/components/admin/SettingsForm";
import AdminDbError from "@/components/admin/AdminDbError";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  try {
    const settings = await fetchSettings();

    return (
      <div className="space-y-5 max-w-3xl">
        <div>
          <p className="admin-eyebrow">Configuration</p>
          <h1 className="admin-page-title">Paramètres</h1>
          <p className="admin-page-subtitle">
            Horaires, heures pleines, paiements et délai de confirmation.
          </p>
        </div>
        <SettingsForm settings={settings} />
      </div>
    );
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message.replace(/^fetchSettings: /, "")
        : "Impossible de charger les paramètres.";
    return <AdminDbError message={message} />;
  }
}
