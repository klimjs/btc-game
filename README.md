# BTC Guess Game

A web app that allows users to make guesses on whether the market price of Bitcoin (BTC/USD) will be higher or lower after one minute.

## Important Notice

There are 2 main ways of implementing an app:

- Frontend orchestration: Using the backend only for updating the score based on the BTC price. It's more simple, but e.g. if the user closes the window the guess is lost and no data for future stats.
- (Chosen for this assignment) **Backend-heavy approach**: Strong backend to save the guesses, resolving them, having the user id stored in `localStorage` and DB as well. It opens more fair guesses and even ability to close the browser. Overall more robust solution.

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
- Rate Limiting: API Gateway throttling configured (5 requests/second, burst limit 10) since there's no API authentication

### Core Logic & Features

- **Guesses resolution logic**: Guesses resolved after 60 seconds; frontend polls every 5 seconds if price hasn't changed
- **Forgotten guesses resolution**: Resolves guesses even if the user closes the browser via EventBridge scheduled job
- **One Guess Per User**: Blocks creating more than one active guess per user
- **Player Management**: Player creation uses `localStorage` for persistence and syncs with DB
- **Price Updates**: BTC price fetched separately from guess requests, updating every 15 seconds
- **Data Storage**: DynamoDB stores player scores and guess history for potential stats/analytics

### Code Quality

- **Test Coverage**: Test suite for both frontend and backend
- **Type Safety**: TypeScript coverage with strict mode
- **Validation**: Zod schema validation for API inputs
- **Error Handling**: Proper error states and HTTP status codes
- **UX**: Loading states & error messages

### UI Development

- Initialized with `shadcn/ui start` for fast, accessible component development (using Base UI)
- Real-time countdown and status updates
