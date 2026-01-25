"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
            Sign in or create an account with Google
          </p>
        </div>

        {/* Google Sign-In */}
        <div className="mt-8">
          <GoogleSignInButton
            callbackUrl={searchParams.get("from") || "/dashboard"}
            text="Sign in with Google"
          />
          
          <p className="mt-4 text-center text-xs text-gray-500">
            New users will be automatically registered on first sign-in
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
