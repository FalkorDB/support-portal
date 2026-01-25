/**
 * Conversation Detail API Route
 * GET /api/conversations/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { fetchConversation } from "@/lib/chatwoot";

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

    // Fetch conversation from Chatwoot
    const conversation = await fetchConversation(
      parseInt(id),
      session.accessToken,
      session.client,
      session.uid,
      session.user.account_id,
    );

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Failed to fetch conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 },
    );
  }
}
