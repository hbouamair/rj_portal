import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";
import { AdminFeedbackProvider } from "@/components/admin/AdminFeedback";

export const metadata: Metadata = {
  title: "Administration | RJ Studio",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <AdminFeedbackProvider>
      <div className="admin-shell">
        <AdminNav userEmail={user.email ?? ""} />
        <main className="lg:pl-80">
          <div className="px-4 sm:px-6 lg:px-8 py-6 pt-20 lg:pt-6 lg:pr-6 min-h-screen admin-scroll-area">
            {children}
          </div>
        </main>
      </div>
    </AdminFeedbackProvider>
  );
}
