import SiteContentEditor from "@/components/admin/SiteContentEditor";
import AdminDbError from "@/components/admin/AdminDbError";
import { fetchAllSiteContent } from "@/lib/site-content/db";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  try {
    const { contact, about } = await fetchAllSiteContent();

    return (
      <div className="space-y-5">
        <div>
          <p className="admin-eyebrow">Site web</p>
          <h1 className="admin-page-title">Contenu des pages</h1>
          <p className="admin-page-subtitle">
            Modifiez les textes affichés sur Contact et À propos.
          </p>
        </div>
        <SiteContentEditor contact={contact} about={about} />
      </div>
    );
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message.replace(/^fetch\w+: /, "")
        : "Impossible de charger le contenu du site.";
    return <AdminDbError message={message} />;
  }
}
