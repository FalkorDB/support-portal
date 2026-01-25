import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import DashboardClient from "./DashboardClient";
import { fetchUserTickets } from "@/lib/zendesk";
import { Conversation } from "@/types";

type ZendeskTicket = {
  id: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  requester_id?: number;
  requester?: { name?: string; email?: string };
  subject?: string;
};

export default async function DashboardPage() {
  // Get session server-side
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch tickets server-side
  let conversations: Conversation[] = [];
  let error = null;

  try {
    const tickets = await fetchUserTickets(session.user.id, session.user.type);

    // Transform Zendesk tickets to our Conversation format
    conversations = tickets.map((ticket: ZendeskTicket) => ({
      id: ticket.id,
      status: ticket.status,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      messages: [],
      meta: {
        sender: {
          id: ticket.requester_id,
          name: ticket.requester?.name || "Unknown",
          email: ticket.requester?.email || "",
        },
      },
      last_non_activity_message: {
        content: ticket.subject,
      },
    }));
  } catch {
    error = "Failed to load tickets";
  }

  return (
    <DashboardClient
      initialConversations={conversations}
      user={session.user}
      error={error}
    />
  );
}
