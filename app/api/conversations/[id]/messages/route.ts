/**
 * Ticket Comments API Route
 * GET /api/conversations/[id]/messages - Fetch ticket comments
 * POST /api/conversations/[id]/messages - Add comment to ticket
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { fetchTicket, addComment } from "@/lib/zendesk";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get session
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch ticket comments from Zendesk
    const ticketData = await fetchTicket(parseInt(id));

    // Transform comments to message format
    type ZendeskComment = {
      id: number;
      body?: string;
      html_body?: string;
      created_at?: string;
      public?: boolean;
      author_id?: number;
    };

    const messages = ticketData.comments.map((comment: ZendeskComment) => {
      const createdAt = comment.created_at
        ? Math.floor(new Date(comment.created_at).getTime() / 1000)
        : Math.floor(Date.now() / 1000);

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

    return NextResponse.json({ payload: messages });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    // Validate input
    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 },
      );
    }

    // Get session
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Add comment to Zendesk ticket
    const ticket = await addComment(
      parseInt(id),
      content.trim(),
      session.user.id,
      true,
    );

    // Return the ticket data
    return NextResponse.json({
      id: ticket.id,
      content: content.trim(),
      created_at: Date.now() / 1000,
      message_type: "outgoing",
      sender: {
        id: session.user.id,
        name: session.user.name,
        type: session.user.type,
      },
    });
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
