# FalkorDB Support Portal

A modern customer-facing support portal that integrates with Zendesk to allow users to view and manage their support tickets. Users can authenticate, view their ticket history, filter by status, and reply to tickets directly from the portal.

## Features

- 🔐 Secure authentication with Zendesk OAuth
- 📋 Dashboard view of all support tickets with real-time status counters
- 💬 Detailed ticket view with full comment history
- ✉️ Reply to tickets directly from the portal (Ctrl+Enter to send)
- 📱 Responsive design for desktop, tablet, and mobile
- 🔍 Search and filter tickets by status (open, pending, resolved)
- 🎨 Modern UI with Tailwind CSS v4
- 👥 Support for both end-users and agents with role-based ticket views
- 🔄 User registration creates Zendesk end-user accounts automatically

## Screenshots

### Sign In
<img src="https://github.com/user-attachments/assets/5e01eccf-0814-45b2-a215-7c71b0bfb10a" alt="Sign in with Zendesk" width="800">

### Authentication
<img src="https://github.com/user-attachments/assets/5f318501-b4c0-4228-bd3d-22c0df5abf25" alt="Authentication Screen" width="800">

### Support Cases Dashboard
<img src="https://github.com/user-attachments/assets/da0afcee-607d-4c79-b389-ced590f12a79" alt="Support Cases Dashboard" width="800">

### Case Details
<img src="https://github.com/user-attachments/assets/e05f8e2a-d88d-4625-9b70-59b45ebc22ea" alt="Case Details View" width="800">

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Authentication**: NextAuth.js v5 with Zendesk OAuth
- **API Integration**: Zendesk REST API v2
- **Runtime**: Node.js 20+

## Prerequisites

- Node.js 20+
- A Zendesk account (any plan with API access)
- Zendesk OAuth client credentials (see [ZENDESK_SETUP.md](ZENDESK_SETUP.md) for setup)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Zendesk Configuration
ZENDESK_SUBDOMAIN=your_subdomain

# Zendesk OAuth Configuration
ZENDESK_OAUTH_CLIENT_ID=your_zendesk_oauth_client_id
ZENDESK_OAUTH_CLIENT_SECRET=your_zendesk_oauth_client_secret

# Session Secret (generate a random string)
SESSION_SECRET=your_random_secret_key_here

# NextAuth Configuration
AUTH_SECRET=your_random_secret_key_here
AUTH_URL=http://localhost:3000  # Change to your production URL in production
```

See `.env.example` for a template and [ZENDESK_SETUP.md](ZENDESK_SETUP.md) for detailed setup instructions.

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables (see above)

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── api/                    # API routes (server-side)
│   │   ├── auth/              # Authentication endpoints
│   │   └── conversations/     # Conversation endpoints
│   ├── dashboard/             # Dashboard page
│   ├── login/                 # Login page
│   ├── cases/[id]/           # Individual case detail page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page (redirects)
├── components/                # Reusable components
├── lib/                      # Utility functions and helpers
├── middleware.ts             # Route protection middleware
└── types/                    # TypeScript type definitions
```

## API Routes

All Zendesk API calls are proxied through Next.js API routes for security:

- `GET/POST /api/auth/[...nextauth]` - NextAuth authentication handlers (Zendesk OAuth)
- `GET /api/conversations/[id]/messages` - Get ticket comments
- `POST /api/conversations/[id]/messages` - Add comment to ticket
- `PATCH /api/conversations/[id]/status` - Update ticket status
- `POST /api/tickets` - Create new ticket

## Security

- **OAuth-based operations**: All user operations (view tickets, add comments, create tickets) use the user's OAuth access token
- **Principle of least privilege**: Users can only access what their Zendesk permissions allow
- Zendesk API credentials never exposed to the frontend
- All API calls proxied through secure Next.js API routes
- JWT-based session management with NextAuth
- Protected routes using Next.js middleware with NextAuth
- Input validation on all forms
- Zendesk OAuth for secure authentication
- Rate limiting on API endpoints
- Proper audit trail showing which user made changes

**⚠️ Production Security Notes:**

- Zendesk OAuth is the authentication method
- Users authenticate using their Zendesk accounts
- OAuth access tokens are stored securely in encrypted JWT sessions
- Each user's operations are performed with their own permissions
- See [ZENDESK_SETUP.md](ZENDESK_SETUP.md) for security recommendations

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

This application can be deployed to any platform that supports Next.js:

### Deployment Steps:

1. Set up environment variables in your deployment platform:
   - `ZENDESK_SUBDOMAIN`
   - `ZENDESK_OAUTH_CLIENT_ID`
   - `ZENDESK_OAUTH_CLIENT_SECRET`
   - `SESSION_SECRET`
   - `AUTH_SECRET`
   - `AUTH_URL` - Your production URL (e.g., `https://yourdomain.com`)

2. For GitHub Actions deployment, add these as repository secrets

3. Ensure Node.js 20+ is configured

4. Build command: `npm run build`
5. Start command: `npm start`

### CI/CD

GitHub Actions workflows are configured for:

- **CI**: Automated testing, linting, and build verification on push/PR
- **Deploy**: Automated deployment on push to main branch
- **PR Checks**: Code quality validation, semantic PR titles, and pre-merge checks
- **Dependabot**: Automated dependency updates

## Documentation

- [Zendesk Setup Guide](ZENDESK_SETUP.md) - Complete setup instructions
- [Zendesk API Documentation](https://developer.zendesk.com/api-reference/ticketing/introduction/)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
