# Chatwoot Support Portal - Setup Guide

## Overview

This guide will walk you through setting up the Chatwoot Support Portal, a customer-facing application that allows users to view and interact with their support cases from Chatwoot.

## Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed on your system
2. **A Chatwoot account** (cloud or self-hosted)
3. **Chatwoot API access** (you'll need your base URL and account ID)
4. Basic knowledge of Next.js and React

## Step 1: Environment Configuration

1. Copy the `.env.example` file to create your local environment file:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and configure the following variables:

```env
# Your Chatwoot instance URL
CHATWOOT_BASE_URL=https://app.chatwoot.com

# Your Chatwoot account ID
# You can find this in your Chatwoot dashboard URL: 
# https://app.chatwoot.com/app/accounts/{ACCOUNT_ID}/dashboard
CHATWOOT_ACCOUNT_ID=1

# Session secret for secure cookie encryption
# Generate a strong random string for production
SESSION_SECRET=your_random_secret_key_here
```

### Finding Your Chatwoot Account ID

1. Log in to your Chatwoot dashboard
2. Look at the URL in your browser
3. The account ID is the number after `/accounts/`
   - Example: `https://app.chatwoot.com/app/accounts/123/dashboard` → Account ID is `123`

### Generating a Session Secret

For production, generate a secure random string:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

## Step 3: Run Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 4: Testing the Application

### Test Login

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. You'll be redirected to the login page
3. Use your Chatwoot user credentials (email and password)
4. After successful login, you'll be redirected to the dashboard

### Expected Behavior

- **Login Page**: Users can authenticate with Chatwoot credentials
- **Dashboard**: Shows all support cases with status, dates, and search/filter options
- **Case Detail**: Click any case to view full conversation history
- **Reply**: Users can send messages directly from the case detail page

## Project Structure

```
├── app/
│   ├── api/                      # API routes (server-side)
│   │   ├── auth/
│   │   │   ├── login/           # POST /api/auth/login
│   │   │   └── logout/          # POST /api/auth/logout
│   │   └── conversations/
│   │       ├── route.ts         # GET /api/conversations
│   │       └── [id]/
│   │           ├── route.ts     # GET /api/conversations/:id
│   │           └── messages/
│   │               └── route.ts # GET/POST messages
│   ├── dashboard/               # Dashboard page
│   │   ├── page.tsx            # Server component
│   │   ├── DashboardClient.tsx # Client component
│   │   ├── loading.tsx         # Loading state
│   │   └── error.tsx           # Error boundary
│   ├── login/                   # Login page
│   │   └── page.tsx
│   ├── cases/[id]/             # Case detail page
│   │   ├── page.tsx            # Server component
│   │   ├── CaseDetailClient.tsx # Client component
│   │   ├── loading.tsx         # Loading state
│   │   └── error.tsx           # Error boundary
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home (redirects)
│   └── globals.css             # Global styles
├── lib/
│   ├── chatwoot.ts             # Chatwoot API client
│   ├── session.ts              # Session management
│   └── utils.ts                # Utility functions
├── types/
│   └── index.ts                # TypeScript types
├── middleware.ts               # Route protection
├── .env.example                # Environment template
└── .env.local                  # Your local config (not in git)
```

## Authentication Flow

1. User submits email/password on login page
2. Client sends POST request to `/api/auth/login`
3. API route calls Chatwoot's `/auth/sign_in` endpoint
4. On success, session data is stored in an httpOnly cookie
5. Middleware protects authenticated routes
6. All subsequent API calls include authentication headers from session

## API Routes

All Chatwoot API calls are proxied through Next.js API routes to keep credentials secure:

- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Log out user
- `GET /api/conversations` - Fetch user conversations
- `GET /api/conversations/:id` - Get specific conversation
- `GET /api/conversations/:id/messages` - Get conversation messages
- `POST /api/conversations/:id/messages` - Send a message

## Security Features

- **httpOnly Cookies**: Authentication tokens stored securely
- **Server-side API Calls**: Credentials never exposed to client
- **Route Protection**: Middleware enforces authentication
- **Input Validation**: All user inputs validated
- **HTTPS Ready**: Secure cookie flag enabled in production

## Troubleshooting

### "Authentication failed" error

- Verify your Chatwoot credentials are correct
- Check that `CHATWOOT_BASE_URL` matches your instance
- Ensure your Chatwoot account is active

### "Failed to fetch conversations" error

- Verify `CHATWOOT_ACCOUNT_ID` is correct
- Check that the authenticated user has access to conversations
- Review server logs for detailed error messages

### Empty dashboard

- Ensure the user has at least one conversation in Chatwoot
- Check API responses in browser DevTools Network tab
- Verify user permissions in Chatwoot admin panel

### Port already in use

If port 3000 is already in use:

```bash
npm run dev -- -p 3001
```

## Building for Production

1. Build the application:

```bash
npm run build
```

2. Start production server:

```bash
npm start
```

3. Or export as static site (if applicable):

```bash
npm run build
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables in Vercel project settings
4. Deploy

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t chatwoot-portal .
docker run -p 3000:3000 --env-file .env.local chatwoot-portal
```

## Customization

### Branding

Update branding in:
- [app/layout.tsx](app/layout.tsx) - Page title and metadata
- [app/login/page.tsx](app/login/page.tsx) - Login page title
- [app/globals.css](app/globals.css) - Colors and theme

### Features

To add new features:
1. Define TypeScript types in [types/index.ts](types/index.ts)
2. Add API routes in `app/api/`
3. Create components in `components/`
4. Update pages in `app/`

## Support

For issues or questions:
- Check Chatwoot API documentation: https://developers.chatwoot.com/
- Review Next.js documentation: https://nextjs.org/docs
- Open an issue in the project repository

## License

MIT
