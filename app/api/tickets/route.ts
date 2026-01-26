import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createTicket } from "@/lib/zendesk";
import { createTicketSchema, validateAndSanitize } from "@/lib/validation";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RATE_LIMITS,
} from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit
    const rateLimitId = getRateLimitIdentifier(request, session.user.id);
    const rateLimit = checkRateLimit(rateLimitId, RATE_LIMITS.createTicket, "createTicket");

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.remainingTime || 0) / 1000);
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
          },
        },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateAndSanitize(createTicketSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { subject, description, priority } = validation.data;

    // Create ticket in Zendesk
    const ticket = await createTicket(
      subject,
      description,
      session.user.id,
      priority,
    );

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 },
    );
  }
}
