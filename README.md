# BTC Guess Game

A web app that allows users to make guesses on whether the market price of Bitcoin (BTC/USD) will be higher or lower after one minute.

## Tech Stack

### Backend
- AWS using SAM
- Amazon DynamoDB
- Zod validation
- Vitest

### Frontend
- React 19 with Vite
- TanStack Query
- `shadcn/ui` with TailwindCSS
- Vitest, React Testing Library

## Prerequisites

- AWS CLI
- SAM CLI

## Deployment

### Backend (AWS)

```bash
cd backend
pnpm build
sam build
sam deploy  # uses samconfig.toml for configuration
```

### Frontend (Vercel)

Deploy via Vercel CLI or connect your Git repository. Ensure `VITE_API_URL` environment variable is set (check `env.example`).

## Technical Details

### Infrastructure

- SAM is used for controlling AWS infrastructure as code
- Serverless architecture with Lambda functions and DynamoDB
- EventBridge scheduled job runs every minute to resolve guesses

### Core Features

- **Guess Resolution**: Resolves guesses even if the user closes the browser via EventBridge scheduled job
- **One Guess Per User**: Blocks creating more than one active guess per user
- **Player Management**: Player creation uses `localStorage` for persistence and syncs with DB
- **Resolution Logic**: Guesses resolve after 60 seconds; frontend polls every 5 seconds if price hasn't changed
- **Price Updates**: BTC price fetched separately from guess requests, updating every 15 seconds
- **Data Storage**: DynamoDB stores player scores and guess history for potential stats/analytics

### Code Quality

- **Test Coverage**: Test suite for both frontend and backend
- **Type Safety**: TypeScript coverage with strict mode
- **Validation**: Zod schema validation for API inputs
- **Error Handling**: Proper error states and HTTP status codes
- **UX**: Loading states & error messages

### UI Development

- Built with `shadcn/ui` for fast, accessible component development (using Base UI)
- Real-time countdown and status updates
