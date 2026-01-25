"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import GoogleSignInButton from "@/components/GoogleSignInButton";

function LoginForm() {
  const searchParams = useSearchParams();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <Image
            className="mx-auto h-12 w-auto mb-4"
            src="/falkordb-logo.svg"
            alt="FalkorDB"
            width={48}
            height={48}
          />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Support Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your Google account to view your support cases
          </p>
        </div>

        {/* Google Sign-In Option */}
        <div className="mt-8">
          <GoogleSignInButton
            callbackUrl={searchParams.get("from") || "/dashboard"}
            text="Sign in with Google"
          />
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
