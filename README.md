# BankingWorkSystem (MERN)

A secure banking-style backend service built with **Node.js + Express + MongoDB (Mongoose)**.

## Features

- User registration, login, logout using **JWT**
- Authentication with middleware supporting:
  - Normal users
  - **System user** access (for initial-funds transaction)
- Account management
- Fund transfers using **ledger-based balance**
- **Idempotency** for transaction creation (prevents duplicates)
- Transaction consistency using **MongoDB sessions/transactions**
- Email notifications via **Nodemailer (Gmail OAuth2)**
- Logout token invalidation using **token blacklist** with TTL

## Tech Stack

- Backend: Node.js, Express, Mongoose, JWT, Cookie Parser, Nodemailer
- Database: MongoDB


## Project Structure (Backend)

- `backend/server.js` - server entry
- `backend/src/app.js` - express app + route mounting
- `backend/src/config/db.js` - MongoDB connection
- `backend/src/routes/`
  - `auth.routes.js`
  - `account.routes.js`
  - `transaction.routes.js`
- `backend/src/controllers/`
  - `auth.controller.js`
  - `account.controller.js`
  - `transaction.controller.js`
- `backend/src/middlewares/`
  - `auth.middleware.js` (JWT auth + blacklist + system user check)
- `backend/src/models/`
  - `user.model.js`
  - `account.model.js`
  - `transaction.model.js`
  - `ledger.model.js` (immutable)
  - `blackList.model.js` (TTL)
- `backend/src/services/`
  - `email.service.js`

## API Endpoints

Base path (Backend): `http://localhost:3000/api`

### Auth

- **POST** `/api/auth/register`
  - Body:
    - `email` (string)
    - `userName` (string)
    - `password` (string)
  - Notes: sets JWT in cookie `token` and sends welcome email.

- **POST** `/api/auth/login`
  - Body:
    - `email` (string)
    - `password` (string)
  - Notes: sets JWT in cookie `token`.

- **POST** `/api/auth/logout`
  - Auth required (token via cookie or `Authorization: Bearer <token>`)
  - Notes: blacklists the token (TTL ~ 3 days).

### Accounts

All account routes require authentication.

- **POST** `/api/accounts/`
  - Creates a new account for the authenticated user.

- **GET** `/api/accounts/`
  - Returns accounts of the authenticated user.

- **GET** `/api/accounts/balance/:accountId`
  - Returns current balance computed from ledger entries.

### Transactions

All transaction routes require authentication.

- **POST** `/api/transactions/`
  - Body:
    - `fromAccount` (ObjectId/string)
    - `toAccount` (ObjectId/string)
    - `amount` (number)
    - `idempotencyKey` (string, unique)
  - Behavior:
    - Validates request + idempotency
    - Uses MongoDB session
    - Creates `transaction` with `PENDING`
    - Creates ledger entries:
      - `DEBIT` for sender
      - `CREDIT` for receiver
    - Marks transaction `COMPLETED`
    - Sends transaction success email

- **POST** `/api/transactions/system/initial-funds`
  - Auth: **system user only**
  - Body:
    - `toAccount` (ObjectId/string)
    - `amount` (number)
    - `idempotencyKey` (string, unique)
  - Behavior:
    - Creates a funds transaction from the system user account
    - Writes debit/credit ledger entries
    - Marks transaction `COMPLETED`

## Environment Variables

Create a `.env` file inside `backend/`.

Required variables (inferred from code):

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - secret for signing/verifying JWT

Email (Gmail OAuth2 via Nodemailer):
- `GOOGLE_USER`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `EMAIL_USER` (used as `from` address)

## How to Run

### Backend

```bash
cd backend
npm install
npm run dev
```

Server runs on port `3000`.

### Frontend

A `frontend/` folder exists, but its source was not available during analysis. If it contains a standard React/Vite setup, run it from inside `frontend` with its own package scripts.

## Notes / Important Behavior

- **JWT token transport**: cookie `token` and also supports `Authorization` header.
- **Ledger entries are immutable**: updates/deletes are blocked via Mongoose pre-hooks.
- **Idempotency**: `idempotencyKey` is unique at the transaction model level.
- **Token blacklist TTL**: blacklist entries expire automatically.

## License

Add your license here.

for any query/ discussion about any project contact me here - 
mail - jitendra0202006@gmail.com / jitendrakumar.dev.cs@gmail.com