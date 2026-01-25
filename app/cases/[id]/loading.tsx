export default function CaseLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-200"></div>
            <div className="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
              >
                <div className="h-20 w-2/3 animate-pulse rounded-lg bg-white shadow-sm"></div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex gap-3">
            <div className="h-20 flex-1 animate-pulse rounded-lg bg-gray-100"></div>
            <div className="h-20 w-20 animate-pulse self-end rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
