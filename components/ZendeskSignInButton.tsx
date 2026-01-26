"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

interface ZendeskSignInButtonProps {
  callbackUrl?: string;
  text?: string;
}

export default function ZendeskSignInButton({
  callbackUrl = "/dashboard",
  text = "Sign in with Zendesk",
}: ZendeskSignInButtonProps) {
  const handleSignIn = () => {
    signIn("zendesk", { callbackUrl });
  };

  return (
    <button
      onClick={handleSignIn}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <Image
        src="/zendesk-icon.svg"
        alt="Zendesk"
        width={20}
        height={20}
        className="h-5 w-5"
      />
      {text}
    </button>
  );
}
