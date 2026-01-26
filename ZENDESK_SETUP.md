# Zendesk Support Portal Setup Guide

This support portal is now configured to work with Zendesk. Follow these steps to set it up:

## Prerequisites

- A Zendesk account (trial or paid)
- Node.js 18+ installed
- Access to Zendesk Admin Center

## Step 1: Get Your Zendesk Subdomain

Your subdomain is the first part of your Zendesk URL. For example, if your Zendesk URL is `https://mycompany.zendesk.com`, your subdomain is `mycompany`.

## Step 2: Create Zendesk OAuth Client

1. Log into your Zendesk account
2. Go to **Admin Center** (gear icon → Admin Center)
3. Navigate to **Apps and integrations** → **APIs** → **OAuth Clients**
4. Click **Add OAuth Client**
5. Fill in the details:
   - **Client Name**: Support Portal (or any name)
   - **Redirect URLs**: Add `http://localhost:3000/api/auth/callback/zendesk`
   - **Scopes**: Select **read** and **write**
6. Click **Save**
7. Copy the **Client ID** and **Secret** (you'll need these for your `.env.local`)

## Step 3: Configure Environment Variables

1. Open `.env.local` in the project root
2. Update the following values:

```env
ZENDESK_SUBDOMAIN=your-subdomain
ZENDESK_OAUTH_CLIENT_ID=your_client_id_from_step_2
ZENDESK_OAUTH_CLIENT_SECRET=your_client_secret_from_step_2
AUTH_SECRET=generate_a_random_secret
```

## Step 4: Install Dependencies and Run

```bash
npm install
npm run dev
```

The support portal will be available at http://localhost:3000

## How It Works

### For End Users:

- Users can sign up with their email and create a Zendesk account
- They can view their submitted tickets
- They can add comments to their tickets
- They can see all communication history

### For Agents:

- Agents can log in with their Zendesk credentials
- They can view tickets assigned to them
- They can respond to tickets

## Important Notes

### Authentication

- This implementation uses basic authentication with email lookup
- For production, you should implement proper OAuth or JWT authentication
- Passwords are currently stored in user fields (not secure for production)

### Recommended Production Setup:

1. **OAuth-based authentication**: All user operations use OAuth tokens (already implemented)
2. **Audit trail**: All actions are performed with user's own credentials
3. Use HTTPS in production
4. Set strong `AUTH_SECRET` and `SESSION_SECRET` values
5. Add production redirect URI to Zendesk OAuth client

### API Limitations:

- Zendesk API has rate limits (check your plan)
- The free trial has limited API requests
- Some features require specific Zendesk plans

## Features

✅ User authentication (basic email lookup)
✅ User registration (creates Zendesk end-user)
✅ View tickets (requester for end-users, assigned for agents)
✅ View ticket details and comments
✅ Add comments to tickets
✅ Real-time status updates
✅ Search and filter tickets

## Troubleshooting

### "Authentication failed"

- Check that your API token is correct
- Verify your admin email is correct
- Make sure token access is enabled in Zendesk

### "Failed to fetch tickets"

- Verify your subdomain is correct (no https:// or .zendesk.com)
- Check API token permissions
- Ensure the user exists in Zendesk

### "User not found"

- The email must exist in Zendesk
- Users need to be created first through signup

## Next Steps

1. Customize the UI to match your brand
2. Add more Zendesk features (ticket creation, file attachments, etc.)
3. Implement proper authentication (OAuth/JWT)
4. Add analytics and reporting
5. Set up email notifications

## Resources

- [Zendesk API Documentation](https://developer.zendesk.com/api-reference/)
- [Zendesk Authentication](https://developer.zendesk.com/documentation/api-basics/authentication/)
- [Zendesk Web Widget](https://developer.zendesk.com/documentation/live-chat/getting-started/getting-started-with-the-embeddable-framework/)
