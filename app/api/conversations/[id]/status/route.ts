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
import {
  updateTicketStatusSchema,
  updateTicketStatusEndUserSchema,
  ticketIdSchema,
  validateAndSanitize,
} from "@/lib/validation";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RATE_LIMITS,
} from "@/lib/rate-limit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Validate ticket ID
    const idValidation = validateAndSanitize(ticketIdSchema, id);
    if (!idValidation.success) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    // Get session
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.accessToken) {
      return NextResponse.json(
        { error: "No access token available" },
        { status: 401 },
      );
    }

    // Check rate limit
    const rateLimitId = getRateLimitIdentifier(request, session.user.id);
    const rateLimit = checkRateLimit(
      rateLimitId,
      RATE_LIMITS.general,
      "general",
    );

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.remainingTime || 0) / 1000);
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": retryAfter.toString() },
        },
      );
    }

    // Parse and validate request body with role-specific validation
    const body = await request.json();
    const validationSchema =
      session.user.type === "end-user"
        ? updateTicketStatusEndUserSchema
        : updateTicketStatusSchema;
    const validation = validateAndSanitize(validationSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { status } = validation.data;

    console.log("API: Updating ticket status:", {
      ticketId: id,
      requestedStatus: status,
      userType: session.user.type,
    });

    // Update ticket status in Zendesk using OAuth token
    const ticket = await updateTicketStatus(
      parseInt(id),
      status,
      session.accessToken,
      session.user.type,
    );

    console.log("API: Zendesk returned:", {
      ticketId: ticket.id,
      returnedStatus: ticket.status,
    });

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
