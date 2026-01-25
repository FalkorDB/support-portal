/**
 * Chatwoot API Client
 * Server-side utilities for interacting with Chatwoot Client API
 */

import {
  AuthResponse,
  ConversationsResponse,
  MessagesResponse,
  Message,
} from "@/types";

const CHATWOOT_BASE_URL =
  process.env.CHATWOOT_BASE_URL || "https://app.chatwoot.com";
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;

if (!CHATWOOT_ACCOUNT_ID) {
  console.warn("CHATWOOT_ACCOUNT_ID is not set in environment variables");
}

/**
 * Authenticate user with Chatwoot
 * This can authenticate both agents and contacts
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  console.log("Authenticating with Chatwoot:", CHATWOOT_BASE_URL);

  const response = await fetch(`${CHATWOOT_BASE_URL}/auth/sign_in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Agent authentication failed:", response.status, errorText);

    // If agent auth fails, try to authenticate as a contact
    return await authenticateContact(email, password);
  }

  const data = await response.json();
  console.log("Authentication response:", JSON.stringify(data, null, 2));

  // For Chatwoot agent/admin users, the response includes user data with access_token
  const userData = data.data || data;
  const accessToken = userData.access_token;

  if (!accessToken) {
    console.error("No access token in response:", data);
    throw new Error(
      "No access token received from Chatwoot. Make sure you're logging in with an agent/admin account.",
    );
  }

  console.log("User account_id:", userData.account_id);
  console.log("User type:", userData.type);

  return {
    data: userData,
    access_token: accessToken,
  };
}

/**
 * Authenticate a contact (end user/customer)
 * This uses custom authentication logic since contacts don't have traditional Chatwoot login
 */
async function authenticateContact(
  email: string,
  password: string,
): Promise<AuthResponse> {
  console.log("Attempting contact authentication for:", email);

  const platformApiToken = process.env.CHATWOOT_PLATFORM_API_TOKEN;

  if (!platformApiToken) {
    throw new Error("Authentication failed. Please check your credentials.");
  }

  // Search for contact by email
  const searchResponse = await fetch(
    `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts/search?q=${encodeURIComponent(email)}`,
    {
      headers: {
        "Content-Type": "application/json",
        api_access_token: platformApiToken,
      },
    },
  );

  if (!searchResponse.ok) {
    throw new Error("Authentication failed. Please check your credentials.");
  }

  const searchData = await searchResponse.json();

  type ChatwootContact = {
    id?: number;
    email?: string;
    name?: string;
    custom_attributes?: Record<string, unknown> | null;
  };

  const contact = searchData.payload?.find(
    (c: ChatwootContact) => c.email?.toLowerCase() === email.toLowerCase(),
  );

  if (!contact) {
    throw new Error("No account found with this email address.");
  }

  // Verify password from custom attributes
  const storedPassword = contact.custom_attributes?.portal_password;

  if (!storedPassword || storedPassword !== password) {
    throw new Error("Invalid email or password.");
  }

  // Return contact data with platform token for API access
  return {
    data: {
      id: contact.id,
      email: contact.email,
      name: contact.name,
      account_id: parseInt(CHATWOOT_ACCOUNT_ID || "1"),
      type: "contact",
    },
    access_token: platformApiToken,
  };
}

/**
 * Fetch conversations for authenticated user
 */
export async function fetchConversations(
  accessToken: string,
  client: string,
  uid: string,
  accountId?: number,
  userId?: number,
  userType?: string,
): Promise<ConversationsResponse> {
  // Use the account ID from the authenticated user if available
  const targetAccountId = accountId || CHATWOOT_ACCOUNT_ID;

  // Build URL with filters based on user type
  let url = `${CHATWOOT_BASE_URL}/api/v1/accounts/${targetAccountId}/conversations`;

  // For agents, filter by assignee_id
  // For contacts, filter by contact_id (which is the user id for contacts)
  const params = new URLSearchParams();
  if (userId) {
    if (userType === "contact") {
      params.append("contact_id", userId.toString());
    } else {
      params.append("assignee_id", userId.toString());
    }
  }

  if (params.toString()) {
    url += "?" + params.toString();
  }

  console.log("Fetching conversations from:", url);
  console.log("Using account ID:", targetAccountId);
  console.log("User type:", userType, "User ID:", userId);
  console.log("Auth headers:", {
    accessToken: accessToken ? "present" : "missing",
  });

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      api_access_token: accessToken,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetch conversations failed:", response.status, errorText);
    console.error(
      "Check that the account ID is correct and the user has access",
    );
    throw new Error(
      `Failed to fetch conversations: ${response.status} - ${errorText}`,
    );
  }

  return response.json();
}

/**
 * Fetch specific conversation details
 */
export async function fetchConversation(
  conversationId: number,
  accessToken: string,
  client: string,
  uid: string,
  accountId?: number,
) {
  const targetAccountId = accountId || CHATWOOT_ACCOUNT_ID;
  const response = await fetch(
    `${CHATWOOT_BASE_URL}/api/v1/accounts/${targetAccountId}/conversations/${conversationId}`,
    {
      headers: {
        "Content-Type": "application/json",
        api_access_token: accessToken,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetch conversation failed:", response.status, errorText);
    throw new Error(`Failed to fetch conversation: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch messages for a conversation
 */
export async function fetchMessages(
  conversationId: number,
  accessToken: string,
  client: string,
  uid: string,
  accountId?: number,
): Promise<MessagesResponse> {
  const targetAccountId = accountId || CHATWOOT_ACCOUNT_ID;
  const url = `${CHATWOOT_BASE_URL}/api/v1/accounts/${targetAccountId}/conversations/${conversationId}/messages`;

  console.log("Fetching messages from:", url);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      api_access_token: accessToken,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetch messages failed:", response.status, errorText);
    throw new Error(`Failed to fetch messages: ${response.status}`);
  }

  const data = await response.json();
  console.log("Messages response:", JSON.stringify(data, null, 2));

  return data;
}

/**
 * Send a message to a conversation
 */
export async function sendMessage(
  conversationId: number,
  content: string,
  accessToken: string,
  client: string,
  uid: string,
  accountId?: number,
  userType?: string,
  userId?: number,
): Promise<Message> {
  const targetAccountId = accountId || CHATWOOT_ACCOUNT_ID;

  console.log("Sending message as:", userType, "userId:", userId);

  // For contacts, use the authenticated API but with contact's perspective
  // Chatwoot should automatically determine the sender based on the access token
  type ChatwootMessageBody = {
    content: string;
    private?: boolean;
    message_type?: string | number;
  };

  const messageBody: ChatwootMessageBody = {
    content,
    private: false,
  };

  // Only add message_type for agents
  if (userType !== "contact") {
    messageBody.message_type = "outgoing";
  }

  console.log("Message body:", messageBody);

  const response = await fetch(
    `${CHATWOOT_BASE_URL}/api/v1/accounts/${targetAccountId}/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_access_token: accessToken,
      },
      body: JSON.stringify(messageBody),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Send message failed:", response.status, errorText);
    throw new Error(`Failed to send message: ${response.status}`);
  }

  return response.json();
}
