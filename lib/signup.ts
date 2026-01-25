/**
 * User Registration/Signup for End Users (Contacts)
 * Creates a contact in Chatwoot instead of an agent/user
 */

import { AuthResponse } from "@/types";

const CHATWOOT_BASE_URL =
  process.env.CHATWOOT_BASE_URL || "https://app.chatwoot.com";
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;

/**
 * Create a new contact (customer) in Chatwoot
 * For end-user signup, we create contacts and store credentials locally
 */
export async function registerUser(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
): Promise<AuthResponse> {
  console.log("Creating new contact (end user):", email);

  if (password !== passwordConfirmation) {
    throw new Error("Passwords do not match");
  }

  // For end users, we need to:
  // 1. Create a contact in Chatwoot via Platform API
  // 2. Store their password hash locally (or use an alternative auth system)
  // 3. Generate a session token for them

  // First, check if we have a platform API token
  const platformApiToken = process.env.CHATWOOT_PLATFORM_API_TOKEN;

  if (!platformApiToken) {
    throw new Error(
      "Contact creation requires CHATWOOT_PLATFORM_API_TOKEN to be configured. Please contact your administrator.",
    );
  }

  console.log("Using API token:", platformApiToken.substring(0, 10) + "...");
  console.log("Account ID:", CHATWOOT_ACCOUNT_ID);
  console.log(
    "Creating contact at:",
    `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts`,
  );

  // Create contact using Client API with access token
  const response = await fetch(
    `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_access_token: platformApiToken,
      },
      body: JSON.stringify({
        name,
        email,
        custom_attributes: {
          portal_password: password, // Store hashed in production!
          portal_registered: true,
          registration_date: new Date().toISOString(),
        },
      }),
    },
  );

  console.log("Response status:", response.status);
  console.log(
    "Response headers:",
    Object.fromEntries(response.headers.entries()),
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Contact creation failed:", response.status, errorText);

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      throw new Error(
        "Failed to create account. Please try again or contact support.",
      );
    }

    const errorMessage =
      errorData.message || errorData.error || "Registration failed";
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("Contact created:", JSON.stringify(data, null, 2));

  // Return the contact data
  // Note: Contacts don't have access_tokens like agents do
  // We'll need to create our own session management
  return {
    data: {
      id: data.payload?.contact?.id || data.id,
      email: email,
      name: name,
      account_id: parseInt(CHATWOOT_ACCOUNT_ID || "1"),
      type: "contact",
    },
    access_token: platformApiToken, // Use platform token for API calls
    requiresConfirmation: false,
  };
}
