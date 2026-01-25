"use client";

import Link from "next/link";

export default function CaseError({
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
          <h2 className="text-2xl font-bold text-gray-900">
            Failed to load case
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error.message || "Something went wrong while loading this case"}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={reset}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className="rounded-lg bg-gray-100 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
