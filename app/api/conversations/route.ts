/**
 * Conversations API Route - List all conversations
 * GET /api/conversations
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { fetchConversations } from "@/lib/chatwoot";

export async function GET() {
  try {
    // Get session
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch conversations from Chatwoot
    const conversations = await fetchConversations(
      session.accessToken,
      session.client,
      session.uid,
      session.user.account_id,
    );

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}
