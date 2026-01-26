/**
 * Zendesk API Client
 * Handles all interactions with Zendesk API
 */

const ZENDESK_SUBDOMAIN = process.env.ZENDESK_SUBDOMAIN;

if (!ZENDESK_SUBDOMAIN) {
  console.warn(
    "Zendesk SUBDOMAIN is required. Please check your environment variables.",
  );
}

const ZENDESK_BASE_URL = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2`;

/**
 * Create OAuth bearer token header for user operations
 * All API calls use the user's OAuth access token from their session
 */
function getOAuthHeader(accessToken: string): string {
  return `Bearer ${accessToken}`;
}

/**
 * Convert Zendesk role to user type
 * Currently, 'type' is the same as 'role' for simplicity and consistency.
 * This helper function exists to centralize the logic in case future
 * requirements need different type mapping (e.g., grouping multiple roles
 * into broader types).
 */
function getUserType(role: string): string {
  return role;
}

/**
 * Fetch tickets for a specific user
 * @param userId - The user's Zendesk ID
 * @param userRole - The user's role (end-user or agent)
 * @param accessToken - OAuth access token from the user's session
 * 
 * Note: When using OAuth, /tickets.json automatically filters based on the
 * authenticated user's permissions. End-users see their requested tickets,
 * agents see tickets they have access to.
 */
export async function fetchUserTickets(
  userId: number,
  userRole: string,
  accessToken: string,
) {
  try {
    // Different endpoints for different roles when using OAuth:
    // - End-users: /requests.json (shows their submitted requests)
    // - Agents/Admins: /tickets.json (shows tickets they have access to)
    let url: string;
    
    if (userRole === "end-user") {
      // End-users use the /requests.json endpoint with OAuth
      url = `${ZENDESK_BASE_URL}/requests.json`;
    } else {
      // Agents and admins use /tickets.json
      url = `${ZENDESK_BASE_URL}/tickets.json`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: getOAuthHeader(accessToken),
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Zendesk API error:", response.status, errorText);
      throw new Error(`Failed to fetch tickets: ${response.status}`);
    }

    const data = await response.json();
    
    // The /requests.json endpoint returns "requests" not "tickets"
    // Transform requests to match ticket format for consistency
    if (userRole === "end-user" && data.requests) {
      return data.requests.map((request: any) => ({
        id: request.id,
        status: request.status,
        subject: request.subject,
        description: request.description,
        created_at: request.created_at,
        updated_at: request.updated_at,
        requester_id: request.requester_id,
      }));
    }
    
    return data.tickets || [];
  } catch (error) {
    console.error("Zendesk fetch tickets error:", error);
    throw error;
  }
}

/**
 * Fetch a specific ticket with comments
 * @param ticketId - The ticket ID
 * @param accessToken - OAuth access token from the user's session
 * @param userRole - The user's role (end-user or agent) - needed to determine correct endpoint
 */
export async function fetchTicket(
  ticketId: number,
  accessToken: string,
  userRole: string,
) {
  try {
    // Different endpoints for different roles:
    // - End-users: /requests/{id}.json (for their submitted requests)
    // - Agents/Admins: /tickets/{id}.json (for any ticket they can access)
    const ticketUrl =
      userRole === "end-user"
        ? `${ZENDESK_BASE_URL}/requests/${ticketId}.json`
        : `${ZENDESK_BASE_URL}/tickets/${ticketId}.json`;

    const commentsUrl =
      userRole === "end-user"
        ? `${ZENDESK_BASE_URL}/requests/${ticketId}/comments.json?include=users`
        : `${ZENDESK_BASE_URL}/tickets/${ticketId}/comments.json?include=users`;

    const [ticketResponse, commentsResponse] = await Promise.all([
      fetch(ticketUrl, {
        headers: {
          Authorization: getOAuthHeader(accessToken),
          "Content-Type": "application/json",
        },
      }),
      fetch(commentsUrl, {
        headers: {
          Authorization: getOAuthHeader(accessToken),
          "Content-Type": "application/json",
        },
      }),
    ]);

    if (!ticketResponse.ok || !commentsResponse.ok) {
      const ticketError = !ticketResponse.ok ? await ticketResponse.text() : "";
      const commentsError = !commentsResponse.ok
        ? await commentsResponse.text()
        : "";
      console.error(
        "Zendesk API error:",
        ticketResponse.status,
        commentsResponse.status,
        { ticketError, commentsError },
      );
      throw new Error("Failed to fetch ticket details");
    }

    const ticketData = await ticketResponse.json();
    const commentsData = await commentsResponse.json();

    // Handle different response formats
    const ticket =
      userRole === "end-user" ? ticketData.request : ticketData.ticket;
    const comments = commentsData.comments || [];
    
    // Extract users data if available (agents get this, end-users might not)
    const users = commentsData.users || ticketData.users || [];

    return {
      ticket,
      comments,
      users,
    };
  } catch (error) {
    console.error("Zendesk fetch ticket error:", error);
    throw error;
  }
}

/**
 * Add a comment to a ticket
 * @param ticketId - The ticket ID
 * @param body - The comment text
 * @param userId - The user's ID (for response data)
 * @param accessToken - OAuth access token from the user's session
 * @param isPublic - Whether the comment is public
 */
export async function addComment(
  ticketId: number,
  body: string,
  userId: number,
  accessToken: string,
  userRole: string,
  isPublic: boolean = true,
) {
  try {
    // End-users use /requests/{id}.json, agents use /tickets/{id}.json
    const url =
      userRole === "end-user"
        ? `${ZENDESK_BASE_URL}/requests/${ticketId}.json`
        : `${ZENDESK_BASE_URL}/tickets/${ticketId}.json`;

    // Different payload structure
    const payload =
      userRole === "end-user"
        ? {
            request: {
              comment: {
                body,
              },
            },
          }
        : {
            ticket: {
              comment: {
                body,
                public: isPublic,
                author_id: userId,
              },
            },
          };

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: getOAuthHeader(accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Zendesk add comment error:", response.status, errorText);
      let errorMessage = "Failed to add comment";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = JSON.stringify(errorData);
      } catch {
        errorMessage = errorText || "Failed to add comment";
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return userRole === "end-user" ? data.request : data.ticket;
  } catch (error) {
    console.error("Zendesk add comment error:", error);
    throw error;
  }
}

/**
 * Create a new ticket
 * @param subject - The ticket subject
 * @param description - The ticket description
 * @param userId - The requester's user ID
 * @param accessToken - OAuth access token from the user's session
 * @param userRole - The user's role (end-user or agent)
 * @param priority - The ticket priority
 */
export async function createTicket(
  subject: string,
  description: string,
  userId: number,
  accessToken: string,
  userRole: string,
  priority: string = "normal",
) {
  try {
    // End-users use /requests.json, agents use /tickets.json
    const url =
      userRole === "end-user"
        ? `${ZENDESK_BASE_URL}/requests.json`
        : `${ZENDESK_BASE_URL}/tickets.json`;

    // Different payload structure for requests vs tickets
    const body =
      userRole === "end-user"
        ? JSON.stringify({
            request: {
              subject,
              comment: {
                body: description,
              },
              priority,
            },
          })
        : JSON.stringify({
            ticket: {
              subject,
              comment: {
                body: description,
              },
              requester_id: userId,
              priority,
            },
          });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: getOAuthHeader(accessToken),
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Zendesk create ticket error:", response.status, errorText);
      let errorMessage = "Failed to create ticket";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = JSON.stringify(errorData);
      } catch {
        errorMessage = errorText || "Failed to create ticket";
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return userRole === "end-user" ? data.request : data.ticket;
  } catch (error) {
    console.error("Zendesk create ticket error:", error);
    throw error;
  }
}

/**
 * Update ticket status.
 *
 * @param {number} ticketId - The ID of the Zendesk ticket to update.
 * @param {string} status - The new status to apply to the ticket.
 * @param {string} accessToken - OAuth access token from the user's session.
 * @param {string} userRole - The user's role (end-user or agent).
 * @returns {Promise<any>} A promise that resolves with the updated ticket object.
 * @throws {Error} If the request to Zendesk fails or returns a non-OK response.
 */
export async function updateTicketStatus(
  ticketId: number,
  status: string,
  accessToken: string,
  userRole: string,
) {
  try {
    // End-users use /requests/{id}.json, agents use /tickets/{id}.json
    const url =
      userRole === "end-user"
        ? `${ZENDESK_BASE_URL}/requests/${ticketId}.json`
        : `${ZENDESK_BASE_URL}/tickets/${ticketId}.json`;

    // Different payload structure for end-users vs agents
    // End-users use 'solved' boolean field, not 'status' field
    // Note: Setting solved to true works for both "solved" and "closed" status
    const body =
      userRole === "end-user"
        ? JSON.stringify({
            request: {
              solved: status === "solved" || status === "closed",
              // Zendesk auto-sets status based on solved field:
              // solved: true  -> status becomes "solved"
              // solved: false -> status becomes "open"
            },
          })
        : JSON.stringify({
            ticket: {
              status,
            },
          });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: getOAuthHeader(accessToken),
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Zendesk update ticket status error:",
        response.status,
        errorText,
      );
      let errorMessage = "Failed to update ticket status";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = JSON.stringify(errorData);
      } catch {
        errorMessage = errorText || "Failed to update ticket status";
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return userRole === "end-user" ? data.request : data.ticket;
  } catch (error) {
    console.error("Zendesk update ticket status error:", error);
    throw error;
  }
}
