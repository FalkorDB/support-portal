# FalkorDB Support Portal

A modern customer-facing support portal that integrates with Zendesk to allow users to view and manage their support tickets. Users can authenticate, view their ticket history, filter by status, and reply to tickets directly from the portal.

## Features

- 🔐 Secure authentication with Zendesk integration
- 🔑 Google OAuth login/signup support
- 📋 Dashboard view of all support tickets with real-time status counters
- 💬 Detailed ticket view with full comment history
- ✉️ Reply to tickets directly from the portal (Ctrl+Enter to send)
- 📱 Responsive design for desktop, tablet, and mobile
- 🔍 Search and filter tickets by status (open, pending, resolved)
- 🎨 Modern UI with Tailwind CSS v4
- 👥 Support for both end-users and agents with role-based ticket views
- 🔄 User registration creates Zendesk end-user accounts automatically

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Authentication**: NextAuth.js v5 with Google OAuth + Cookie-based sessions
- **API Integration**: Zendesk REST API v2
- **Runtime**: Node.js 20+

## Prerequisites

- Node.js 20+
- A Zendesk account (any plan with API access)
- Zendesk API token (see [ZENDESK_SETUP.md](ZENDESK_SETUP.md) for instructions)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Zendesk Configuration
ZENDESK_SUBDOMAIN=your_subdomain
ZENDESK_EMAIL=your_admin_email@example.com
ZENDESK_API_TOKEN=your_api_token_here

# Session Secret (generate a random string)
SESSION_SECRET=your_random_secret_key_here

# NextAuth Configuration (for OAuth)
AUTH_SECRET=your_random_secret_key_here

# Google OAuth (optional - for Google login/signup)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Google OAuth Setup (Optional):**

To enable Google login/signup:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. In the left sidebar, go to "APIs & Services" → "OAuth consent screen" and configure the consent screen
4. Then go to "APIs & Services" → "Credentials" → "Create Credentials" → "OAuth client ID" (choose "Web application")
5. Ensure your application information and scopes are correctly set on the OAuth consent screen
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env.local`

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

- `POST /api/auth/login` - Authenticate user via Zendesk user search (legacy)
- `POST /api/auth/signup` - Register new user (creates Zendesk end-user) (legacy)
- `POST /api/auth/logout` - Log out user
- `GET/POST /api/auth/[...nextauth]` - NextAuth authentication handlers (Google OAuth)
- `GET /api/conversations/[id]/messages` - Get ticket comments
- `POST /api/conversations/[id]/messages` - Add comment to ticket

## Security

- Zendesk API credentials never exposed to the frontend
- All API calls proxied through secure Next.js API routes
- Authentication tokens stored in httpOnly cookies
- Protected routes using Next.js middleware with NextAuth
- Input validation on all forms
- Google OAuth for secure authentication
- Basic authentication with Zendesk API (email/token)

**⚠️ Production Security Notes:**

- Current legacy authentication uses basic email lookup (development only)
- Google OAuth is recommended for production use
- For production, consider implementing Zendesk SSO/JWT authentication
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
   - `ZENDESK_EMAIL`
   - `ZENDESK_API_TOKEN`
   - `SESSION_SECRET`
   - `AUTH_SECRET`
   - `GOOGLE_CLIENT_ID` (optional)
   - `GOOGLE_CLIENT_SECRET` (optional)

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
