'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Something went wrong!</h2>
          <p className="mt-2 text-sm text-gray-600">
            {error.message || 'Failed to load dashboard'}
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
