# Zendesk Support Portal Setup Guide

This support portal is now configured to work with Zendesk. Follow these steps to set it up:

## Prerequisites

- A Zendesk account (trial or paid)
- Node.js 18+ installed
- Access to Zendesk Admin Center

## Step 1: Get Your Zendesk Credentials

### 1.1 Find Your Subdomain

Your subdomain is the first part of your Zendesk URL. For example, if your Zendesk URL is `https://mycompany.zendesk.com`, your subdomain is `mycompany`.

### 1.2 Get Your API Token

1. Log into your Zendesk account
2. Go to **Admin Center** (gear icon → Admin Center)
3. Navigate to **Apps and integrations** → **APIs** → **Zendesk API**
4. Click on **Settings** tab
5. Under **Token Access**, enable token access if it's not already enabled
6. Click **Add API token**
7. Give it a description (e.g., "Support Portal")
8. Click **Create**
9. **Copy the API token** (you won't be able to see it again!)

### 1.3 Your Admin Email

This is the email address of your Zendesk admin account.

## Step 2: Configure Environment Variables

1. Open `.env.local` in the project root
2. Update the following values:

```env
ZENDESK_SUBDOMAIN=your-subdomain
ZENDESK_EMAIL=your-admin-email@example.com
ZENDESK_API_TOKEN=your_api_token_here
```

## Step 3: Install Dependencies and Run

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

1. Implement Zendesk SSO (Single Sign-On) with JWT
2. Use Zendesk's Web Widget SDK for better integration
3. Add proper password hashing and secure storage
4. Implement rate limiting and security headers

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
