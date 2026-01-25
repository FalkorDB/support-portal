export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-white shadow-sm"></div>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-white"></div>
          <div className="h-10 w-40 animate-pulse rounded-lg bg-white"></div>
        </div>

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-white shadow-sm"></div>
          ))}
        </div>
      </main>
    </div>
  );
}
