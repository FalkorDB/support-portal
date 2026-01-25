# Chatwoot Support Portal

A customer-facing support portal that allows users to log in and view their support cases (conversations) from Chatwoot using the Chatwoot Client API and Platform API.

## Features

- 🔐 Secure authentication with Chatwoot Client API
- 📋 Dashboard view of all support cases
- 💬 Detailed conversation threads with message history
- ✉️ Reply to support cases directly from the portal
- 📱 Responsive design for desktop, tablet, and mobile
- 🔍 Search and filter support cases
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Authentication**: Cookie-based sessions with Next.js middleware
- **API Integration**: Chatwoot Client API and Platform API

## Prerequisites

- Node.js 18+ 
- A Chatwoot instance (cloud or self-hosted)
- Chatwoot account with API access

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Chatwoot Configuration
CHATWOOT_BASE_URL=https://app.chatwoot.com
CHATWOOT_ACCOUNT_ID=your_account_id

# Session Secret (generate a random string)
SESSION_SECRET=your_random_secret_key_here
```

See `.env.example` for a template.

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

All Chatwoot API calls are proxied through Next.js API routes for security:

- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Log out user
- `GET /api/conversations` - Fetch user conversations
- `GET /api/conversations/[id]` - Get conversation details
- `GET /api/conversations/[id]/messages` - Get messages
- `POST /api/conversations/[id]/messages` - Send a message

## Security

- API credentials are never exposed to the frontend
- All API calls go through secure Next.js API routes
- Authentication tokens stored in httpOnly cookies
- Protected routes using Next.js middleware
- CSRF protection enabled
- Input validation on all forms

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

- **Vercel** (recommended)
- **Netlify**
- **Docker**
- **Any Node.js hosting**

Make sure to set up environment variables in your deployment platform.

## Chatwoot API Documentation

- [Client APIs](https://developers.chatwoot.com/contributing-guide/chatwoot-apis#client-apis)
- [Platform APIs](https://developers.chatwoot.com/contributing-guide/chatwoot-platform-apis)

## License

MIT
