"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

interface ZendeskSignInButtonProps {
  callbackUrl?: string;
  text?: string;
}

export default function ZendeskSignInButton({
  callbackUrl = "/dashboard",
  text = "Sign in with Zendesk",
}: ZendeskSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (isLoading) return; // Prevent multiple clicks

    setIsLoading(true);
    try {
      const result = await signIn("zendesk", {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        console.error("Sign-in error:", result.error);
        setIsLoading(false);
        return;
      }

      if (result?.url) {
        window.location.href = result.url;
      } else {
        // No redirect URL provided; reset loading so the user can retry.
        setIsLoading(false);
      }
    } catch (error) {
      // Handle unexpected errors (e.g., network or internal issues)
      console.error("Sign-in unexpected error:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
    >
      {isLoading ? (
        <>
          <svg
            className="h-5 w-5 animate-spin text-gray-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Signing in...
        </>
      ) : (
        <>
          <Image
            src="/zendesk-icon.svg"
            alt="Zendesk"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          {text}
        </>
      )}
    </button>
  );
}
