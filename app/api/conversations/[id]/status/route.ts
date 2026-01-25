/**
 * Ticket Status API Route
 * PATCH /api/conversations/[id]/status - Update ticket status.
 *
 * @param {NextRequest} request - The incoming Next.js request containing a JSON body
 * with a `status` field specifying the new ticket status.
 * @param {{ params: Promise<{ id: string }> }} params - Route context containing
 * a promise that resolves to the URL parameters, including the ticket `id`.
 * @returns {Promise<NextResponse>} A JSON response. On success (200), returns the
 * updated ticket `{ id, status, updated_at }`. On error, returns:
 * - 400 if `status` is missing or invalid,
 * - 401 if the user is unauthorized,
 * - 500 if updating the ticket status fails on the server.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { updateTicketStatus } from "@/lib/zendesk";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate input
    if (!status || typeof status !== "string") {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    // Validate status value
    const validStatuses = ["new", "open", "pending", "solved", "closed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    // Get session
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update ticket status in Zendesk
    const ticket = await updateTicketStatus(parseInt(id), status);

    // Return the updated ticket data
    return NextResponse.json({
      id: ticket.id,
      status: ticket.status,
      updated_at: ticket.updated_at,
    });
  } catch (error) {
    console.error("Failed to update status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 },
    );
  }
}
