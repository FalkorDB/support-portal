# Quick Start Guide

Get the Chatwoot Support Portal running in 5 minutes!

## 1. Prerequisites

- Node.js 18 or higher
- A Chatwoot account (cloud or self-hosted)

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment

Edit `.env.local` with your Chatwoot details:

```env
CHATWOOT_BASE_URL=https://app.chatwoot.com
CHATWOOT_ACCOUNT_ID=your_account_id
SESSION_SECRET=generate_random_secret
```

### How to find your Account ID:
1. Log in to Chatwoot
2. Look at the URL: `https://app.chatwoot.com/app/accounts/{YOUR_ID}/dashboard`
3. The number after `/accounts/` is your Account ID

## 4. Run the Development Server

```bash
npm run dev
```

## 5. Open the Application

Visit [http://localhost:3000](http://localhost:3000)

## 6. Log In

Use your Chatwoot email and password to log in.

## 🎉 That's it!

You should now see your support cases dashboard.

## Next Steps

- Customize the branding in `app/layout.tsx`
- Adjust colors in `app/globals.css`
- Read the full [SETUP.md](SETUP.md) for deployment options

## Need Help?

- Check [SETUP.md](SETUP.md) for detailed documentation
- Review the [Chatwoot API docs](https://developers.chatwoot.com/)
- Verify your environment variables are correct
