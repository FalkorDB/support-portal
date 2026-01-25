/**
 * Zendesk API Client
 * Handles all interactions with Zendesk API
 */

const ZENDESK_SUBDOMAIN = process.env.ZENDESK_SUBDOMAIN;
const ZENDESK_EMAIL = process.env.ZENDESK_EMAIL;
const ZENDESK_API_TOKEN = process.env.ZENDESK_API_TOKEN;

if (!ZENDESK_SUBDOMAIN || !ZENDESK_EMAIL || !ZENDESK_API_TOKEN) {
  console.warn(
    "Zendesk configuration is incomplete. Please check your environment variables.",
  );
}

const ZENDESK_BASE_URL = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2`;

/**
 * Create basic auth header for Zendesk API
 */
function getAuthHeader(): string {
  const credentials = `${ZENDESK_EMAIL}/token:${ZENDESK_API_TOKEN}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
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
 * Authenticate a user with email and password
 * Returns user data if successful
 */
export async function authenticateUser(email: string, _password?: string) {
  try {
    // Zendesk doesn't support password authentication via API for end users
    // Instead, we'll verify the user exists and use their email as authentication
    // In production, you should implement proper OAuth or JWT authentication

    const response = await fetch(
      `${ZENDESK_BASE_URL}/users/search.json?query=email:${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Authentication failed. Please check your credentials.");
    }

    const data = await response.json();

    if (!data.users || data.users.length === 0) {
      throw new Error("No account found with this email address.");
    }

    const user = data.users[0];

    // In a real implementation, verify the password here (not supported via API)
    // For now, we'll return the user data
    return {
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        type: getUserType(user.role),
      },
      // We'll use the API token for all requests
      access_token: ZENDESK_API_TOKEN,
    };
  } catch (error) {
    console.error("Zendesk authentication error:", error);
    throw error;
  }
}

/**
 * Register a new end user in Zendesk
 */
export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  try {
    const response = await fetch(`${ZENDESK_BASE_URL}/users.json`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          name,
          email,
          role: "end-user",
          verified: false,
          // Store password hint in user fields (not secure - use proper auth in production)
          user_fields: {
            portal_password: password,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create user");
    }

    const data = await response.json();

    return {
      data: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        type: getUserType(data.user.role),
      },
      access_token: ZENDESK_API_TOKEN,
      requiresConfirmation: false,
    };
  } catch (error) {
    console.error("Zendesk registration error:", error);
    throw error;
  }
}

/**
 * Find or create a user in Zendesk (for OAuth flows)
 * Used when users sign in with Google or other OAuth providers
 */
export async function findOrCreateZendeskUser(name: string, email: string) {
  try {
    // First, try to find existing user
    const searchResponse = await fetch(
      `${ZENDESK_BASE_URL}/users/search.json?query=email:${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
      },
    );

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.users && searchData.users.length > 0) {
        const user = searchData.users[0];
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          type: getUserType(user.role),
        };
      }
    }

    // User doesn't exist, create a new one
    const createResponse = await fetch(`${ZENDESK_BASE_URL}/users.json`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          name,
          email,
          role: "end-user",
          verified: true, // Auto-verify OAuth users
        },
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.error || "Failed to create user");
    }

    const createData = await createResponse.json();
    return {
      id: createData.user.id,
      email: createData.user.email,
      name: createData.user.name,
      role: createData.user.role,
      type: getUserType(createData.user.role),
    };
  } catch (error) {
    console.error("Zendesk find/create user error:", error);
    throw error;
  }
}

/**
 * Fetch tickets for a specific user
 */
export async function fetchUserTickets(userId: number, userRole: string) {
  try {
    let url = `${ZENDESK_BASE_URL}/tickets.json`;

    // For end users, only fetch their tickets
    if (userRole === "end-user") {
      url = `${ZENDESK_BASE_URL}/users/${userId}/tickets/requested.json`;
    } else {
      // For agents, fetch assigned tickets
      url = `${ZENDESK_BASE_URL}/users/${userId}/tickets/assigned.json`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tickets: ${response.status}`);
    }

    const data = await response.json();
    return data.tickets || [];
  } catch (error) {
    console.error("Zendesk fetch tickets error:", error);
    throw error;
  }
}

/**
 * Fetch a specific ticket with comments
 */
export async function fetchTicket(ticketId: number) {
  try {
    const [ticketResponse, commentsResponse] = await Promise.all([
      fetch(`${ZENDESK_BASE_URL}/tickets/${ticketId}.json`, {
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
      }),
      fetch(`${ZENDESK_BASE_URL}/tickets/${ticketId}/comments.json`, {
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
      }),
    ]);

    if (!ticketResponse.ok || !commentsResponse.ok) {
      throw new Error("Failed to fetch ticket details");
    }

    const ticketData = await ticketResponse.json();
    const commentsData = await commentsResponse.json();

    return {
      ticket: ticketData.ticket,
      comments: commentsData.comments || [],
    };
  } catch (error) {
    console.error("Zendesk fetch ticket error:", error);
    throw error;
  }
}

/**
 * Add a comment to a ticket
 */
export async function addComment(
  ticketId: number,
  body: string,
  userId: number,
  isPublic: boolean = true,
) {
  try {
    const response = await fetch(
      `${ZENDESK_BASE_URL}/tickets/${ticketId}.json`,
      {
        method: "PUT",
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket: {
            comment: {
              body,
              public: isPublic,
              author_id: userId,
            },
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add comment");
    }

    const data = await response.json();
    return data.ticket;
  } catch (error) {
    console.error("Zendesk add comment error:", error);
    throw error;
  }
}

/**
 * Create a new ticket
 */
export async function createTicket(
  subject: string,
  description: string,
  userId: number,
  priority: string = "normal",
) {
  try {
    const response = await fetch(`${ZENDESK_BASE_URL}/tickets.json`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticket: {
          subject,
          comment: {
            body: description,
          },
          requester_id: userId,
          priority,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create ticket");
    }

    const data = await response.json();
    return data.ticket;
  } catch (error) {
    console.error("Zendesk create ticket error:", error);
    throw error;
  }
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  ticketId: number,
  status: string,
) {
  try {
    const response = await fetch(
      `${ZENDESK_BASE_URL}/tickets/${ticketId}.json`,
      {
        method: "PUT",
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket: {
            status,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update ticket status");
    }

    const data = await response.json();
    return data.ticket;
  } catch (error) {
    console.error("Zendesk update ticket status error:", error);
    throw error;
  }
}
