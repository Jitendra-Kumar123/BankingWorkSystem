# Project Report: BankingWorkSystem (MERN)

## 1. Project Overview

BankingWorkSystem is a MERN-based backend service that supports a simplified banking workflow:

- Users can register and authenticate using JWT.
- Authenticated users can create accounts.
- Users can transfer funds between accounts.
- Account balances are derived from ledger entries to ensure traceability.
- Transaction processing is protected using idempotency and MongoDB transactions.
- Logout is handled by token blacklisting to prevent further use of invalid tokens.
- Email notifications are triggered on important user/account events.

## 2. Requirements (High-level)

- Secure authentication using JWT.
- Prevent replay/duplicate transaction submissions.
- Ensure transaction consistency when updating balances.
- Provide reliable balance computation.
- Maintain immutable transaction records (ledger).
- Provide operational notifications using email.

## 3. System Architecture

### 3.1 Backend Layers

- **Routes** (`backend/src/routes/`):
  - `auth.routes.js` → register/login/logout
  - `account.routes.js` → create account, list accounts, get balance
  - `transaction.routes.js` → create transfer transaction, create initial funds (system user)

- **Controllers** (`backend/src/controllers/`):
  - `auth.controller.js`
  - `account.controller.js`
  - `transaction.controller.js`

- **Middleware** (`backend/src/middlewares/`):
  - `auth.middleware.js`
    - Verifies JWT
    - Checks token blacklist
    - Ensures system-user authorization for privileged route

- **Data Models** (`backend/src/models/`):
  - `user.model.js`
  - `account.model.js`
  - `transaction.model.js`
  - `ledger.model.js`
  - `blackList.model.js`

- **Services** (`backend/src/services/`):
  - `email.service.js` (nodemailer + OAuth2)

## 4. Data Model Design

### 4.1 User

- Stores:
  - `email` (unique)
  - `userName`
  - `password` (hashed via bcrypt)
  - `systemUser` (boolean, `select: false` by default)

### 4.2 Account

- Stores:
  - `user` (reference to user)
  - `status`: `ACTIVE | FROZEN | CLOSED`
  - `currency` (default `INR`)
- Includes:
  - `getBalance()` method (ledger-based aggregation)

### 4.3 Transaction

- Stores:
  - `fromAccount`, `toAccount`
  - `amount`
  - `idempotencyKey` (unique)
  - `status`: `PENDING | COMPLETED | FAILED | REVERSED`

### 4.4 Ledger (Immutable)

- Stores:
  - `account` (reference)
  - `transaction` (reference)
  - `type`: `DEBIT | CREDIT`
  - `amount`
- Immutability:
  - Mongoose pre-hooks block updates/deletes to keep ledger records tamper-evident.

### 4.5 Token Blacklist

- Stores:
  - `token` (unique)
- TTL behavior:
  - Entries expire automatically after ~3 days.

## 5. Core Application Flows

### 5.1 Registration

1. Validate user does not already exist by email.
2. Create user with bcrypt-hashed password.
3. Sign a JWT containing `userId` with 3-day expiry.
4. Set JWT in cookie `token`.
5. Send welcome email (Nodemailer OAuth2).

### 5.2 Login

1. Find user by email and fetch password hash.
2. Validate password using `comparePassword`.
3. Create JWT and set cookie `token`.

### 5.3 Logout

1. Extract token from cookie or `Authorization: Bearer <token>`.
2. Blacklist token by inserting it into blacklist collection.
3. Clear cookie value.

### 5.4 Create Transaction (Transfer)

**Route:** `POST /api/transactions/`

1. **Validate request**: `fromAccount`, `toAccount`, `amount`, `idempotencyKey`.
2. **Idempotency check**:
   - If `idempotencyKey` already exists, return an appropriate response based on prior status.
3. **Validate account status**: ensure both accounts are `ACTIVE`.
4. **Balance check**:
   - Sender’s available balance derived via `fromAccount.getBalance()`.
5. **MongoDB session**:
   - Start session and transaction.
6. **Create Transaction** with status `PENDING`.
7. **Create Ledger Entries** (atomic within session):
   - Debit sender ledger
   - Credit receiver ledger
8. **Mark transaction completed**.
9. **Commit session**.
10. **Send success email notification**.

### 5.5 Create Initial Funds (System User)

**Route:** `POST /api/transactions/system/initial-funds`

1. System user authentication via `authSystemUserMiddleware`.
2. Identify system user account (source of funds).
3. Validate destination account.
4. Start session + create transaction with ledger entries.
5. Mark transaction `COMPLETED`.

## 6. Security Considerations

- **JWT-based authentication**
- **Token blacklist** on logout to mitigate token reuse.
- **Idempotency key** to prevent duplicate transfers.
- **Ledger immutability** to preserve accounting history.
- **MongoDB transactional writes** to prevent partial updates.
- Passwords are stored securely using **bcrypt** hashing.

## 7. Testing & Verification Checklist

- Auth:
  - Register → login → verify JWT cookie is set
  - Logout → ensure token cannot access protected routes
- Accounts:
  - Create account → fetch accounts → fetch balances
- Transactions:
  - Successful transfer creates Transaction + 2 Ledger entries
  - Insufficient balance returns proper error
  - Re-submit same `idempotencyKey` does not double-credit
- System initial funds:
  - Validate system-user-only authorization
- Email:
  - Registration and transaction endpoints trigger email sending

## 8. Deployment Notes

- Use environment variables to configure:
  - `MONGO_URI`, `JWT_SECRET`
  - Gmail OAuth2 credentials
- Recommended:
  - Run backend behind a production-grade reverse proxy
  - Use HTTPS so JWT cookies are transmitted securely

## 9. Conclusion

BankingWorkSystem demonstrates a ledger-based approach to balance management with robust transaction consistency guarantees, idempotency protections, and token invalidation for logout. It provides a solid foundation for extending into full banking features such as transaction histories, account freezing, and audit dashboards.
