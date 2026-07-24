export default function AdminLoading() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Chargement">
      <div className="space-y-2">
        <div className="h-3 w-20 rounded-md bg-white/[0.07]" />
        <div className="h-9 w-52 rounded-xl bg-white/[0.07]" />
        <div className="h-4 w-72 rounded-md bg-white/[0.07]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="admin-card h-24" />
        ))}
      </div>
      <div className="admin-card h-48" />
      <div className="admin-card h-14" />
      <div className="admin-card h-96" />
    </div>
  );
}
