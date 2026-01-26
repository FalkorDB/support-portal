import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { fetchTicket } from "@/lib/zendesk";
import CaseDetailClient from "./CaseDetailClient";
import { Message } from "@/types";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Get session server-side
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.accessToken) {
    // If no access token, redirect to login to re-authenticate
    redirect("/login");
  }

  // Fetch ticket and comments server-side
  let conversation = null;
  let messages: Message[] = [];
  let error = null;

  try {
    const ticketData = await fetchTicket(
      parseInt(id),
      session.accessToken,
      session.user.type,
    );

    // Transform Zendesk ticket to conversation format
    conversation = {
      id: ticketData.ticket.id,
      status: ticketData.ticket.status,
      created_at: ticketData.ticket.created_at,
      updated_at: ticketData.ticket.updated_at,
    };

    // Transform comments to messages
    type ZendeskComment = {
      id: number;
      body?: string;
      html_body?: string;
      created_at?: string;
      public?: boolean;
      author_id?: number;
    };

    messages = ticketData.comments.map((comment: ZendeskComment) => {
      const createdAt = comment.created_at
        ? Math.floor(new Date(comment.created_at).getTime() / 1000)
        : 0; // deterministic fallback (avoid calling Date.now in render)

      return {
        id: comment.id,
        content: comment.body || comment.html_body,
        created_at: createdAt,
        message_type: comment.public
          ? comment.author_id === session.user.id
            ? "outgoing"
            : "incoming"
          : "activity",
        sender: {
          id: comment.author_id,
          name: "User",
          type:
            comment.author_id === session.user.id ? session.user.type : "user",
        },
      };
    });
  } catch {
    error = "Failed to load case details";
  }

  if (!conversation) {
    redirect("/dashboard");
  }

  return (
    <CaseDetailClient
      conversation={conversation}
      initialMessages={messages}
      user={session.user}
      error={error}
    />
  );
}
