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
    
    type ZendeskUser = {
      id: number;
      name: string;
      email?: string;
      role?: string;
      agent?: boolean;
    };

    // Create a user lookup map
    const userMap = new Map<number, ZendeskUser>();
    if (ticketData.users) {
      ticketData.users.forEach((user: ZendeskUser) => {
        userMap.set(user.id, user);
      });
    }

    messages = ticketData.comments.map((comment: ZendeskComment) => {
      const createdAt = comment.created_at
        ? Math.floor(new Date(comment.created_at).getTime() / 1000)
        : 0; // deterministic fallback (avoid calling Date.now in render)

      const author = userMap.get(comment.author_id || 0);
      // Note: session.user.id might be a different ID format, so we compare names as fallback
      const isCurrentUser = 
        comment.author_id === session.user.id ||
        (author?.name === session.user.name && author?.agent === false);
      const isAgent = author?.agent === true;

      return {
        id: comment.id,
        content: comment.body || comment.html_body,
        created_at: createdAt,
        message_type: comment.public
          ? isCurrentUser
            ? "outgoing"
            : "incoming"
          : "activity",
        sender: {
          id: comment.author_id,
          name: author?.name || (isCurrentUser ? session.user.name : "User"),
          type: isCurrentUser ? session.user.type : (isAgent ? "agent" : "contact"),
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
