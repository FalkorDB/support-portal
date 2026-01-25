import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createTicket } from "@/lib/zendesk";

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { subject, description, priority = "normal" } = body;

    // Validate required fields
    if (!subject || !description) {
      return NextResponse.json(
        { error: "Subject and description are required" },
        { status: 400 },
      );
    }

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
