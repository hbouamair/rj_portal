import { fetchAllStudios } from "@/lib/booking/db";
import StudioEditor from "@/components/admin/StudioEditor";
import AdminDbError from "@/components/admin/AdminDbError";

export const dynamic = "force-dynamic";

export default async function AdminStudiosPage() {
  try {
    const studios = await fetchAllStudios();

    return (
      <div className="space-y-5">
        <div>
          <p className="admin-eyebrow">Catalogue</p>
          <h1 className="admin-page-title">Studios</h1>
          <p className="admin-page-subtitle">
            Tarifs, photos et infos — appliqués immédiatement aux nouvelles
            réservations.
          </p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
          {studios.map((studio) => (
            <StudioEditor key={studio.id} studio={studio} />
          ))}
        </div>
      </div>
    );
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message.replace(/^fetchAllStudios: /, "")
        : "Impossible de charger les studios.";
    return <AdminDbError message={message} />;
  }
}
