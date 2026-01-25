import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import DashboardClient from './DashboardClient';
import { fetchUserTickets } from '@/lib/zendesk';
import { Conversation } from '@/types';

export default async function DashboardPage() {
  // Get session server-side
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch tickets server-side
  let conversations: Conversation[] = [];
  let error = null;

  try {
    const tickets = await fetchUserTickets(session.user.id, session.user.type);
    
    // Transform Zendesk tickets to our Conversation format
    conversations = tickets.map((ticket: any) => ({
      id: ticket.id,
      status: ticket.status,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      messages: [],
      meta: {
        sender: {
          id: ticket.requester_id,
          name: ticket.requester?.name || 'Unknown',
          email: ticket.requester?.email || '',
        },
      },
      last_non_activity_message: {
        content: ticket.subject,
      },
    }));
  } catch (err) {
    error = 'Failed to load tickets';
  }

  return (
    <DashboardClient
      initialConversations={conversations}
      user={session.user}
      error={error}
    />
  );
}
