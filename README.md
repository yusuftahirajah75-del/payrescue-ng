# 🛡️ PAYRESCUE NG — Transaction Recovery & Payment Reconciliation Infrastructure

> **"One transaction → one rescue case."**

PayRescue is a production-grade digital transaction recovery, cryptographic evidence vault, payment reconciliation, merchant verification, dispute management, and trust infrastructure engineered for the Nigerian financial ecosystem.

---

## 🚀 Key Features

* **One Transaction → One Rescue Case Engine**: Enforces strict financial tracking, statutory SLA countdowns, and immutable audit trails for every consumer and business dispute.
* **Cryptographic Evidence Vault**: Guarantees non-repudiation with SHA-256 file hashing, MIME validation, and pluggable ClamAV malware scanning. Never treats screenshots alone as proof of payment.
* **Rules-Based Classification**: Automatically categorizes transactions into `DEBITED_NOT_CREDITED`, `FAILED_SERVICE`, `SERVICE_NOT_RECEIVED`, `DUPLICATE`, and `WRONG_AMOUNT`.
* **Nigerian Provider Directory & Adapters**: Curated directory of Nigerian commercial banks (GTBank, Access, Zenith, etc.), PSPs (OPay, PalmPay), Telcos (MTN, Airtel), Electricity DisCos (EKEDC, IKEDC), and Payment Gateways (Paystack). Automatically generates formal complaint packages pre-formatted to Central Bank of Nigeria (CBN) and NCC regulatory standards.
* **Multi-Tenant Payment Reconciliation**: Automated matching of customer payment claims against bank/gateway settlement CSV feeds, detecting discrepancies, duplicate claims, and uncredited transfers.
* **Merchant Payment Verification**: Validates incoming bank transfers before physical fulfillment to stop fake SMS alert fraud.
* **Trust & Risk Signal Engine**: Flags duplicate transaction references across different accounts, amount deviations, and abnormal dispute velocity.
* **TrustPay Developer Platform**: Full REST API (`/api/v1`) with SHA-256 hashed API keys, rate-limiting, idempotency support, and HMAC-signed webhooks.
* **Billing & Monetization**: Tiered plans (`FREE`, `STARTER`, `BUSINESS`) with Paystack billing and webhook integration.
* **8-Tier Role-Based Access Control (RBAC)**: `USER`, `BUSINESS_OWNER`, `BUSINESS_ADMIN`, `BUSINESS_AGENT`, `SUPPORT_AGENT`, `FRAUD_ANALYST`, `ADMIN`, `SUPER_ADMIN`.
* **Secure Session Architecture**: JWT tokens stored in `httpOnly`, `SameSite=lax`, `secure` cookies with automatic token rotation.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Runtime | Node.js 20+ (Node 24 tested) |
| Framework | Express.js & TypeScript |
| Database | PostgreSQL 17+ with Prisma ORM |
| Caching & Queues | Redis-ready architecture (BullMQ compatible) |
| Validation | Zod Schema Validation |
| Security | Helmet, CORS, Argon2/bcrypt, SHA-256, HMAC-SHA256, Rate Limiter |
| Evidence Storage | Local Disk, AWS S3 / MinIO, Cloudinary |
| Payments | Paystack Integration Architecture |
| Documentation | OpenAPI 3.0 / Swagger UI |
| Testing | Jest & Supertest |
| Containerization | Docker & Docker Compose |

---

## 📁 Repository Structure

```
payrescue-ng/
├── src/
│   ├── app.ts                  # Express setup, security middleware, route mounts
│   ├── server.ts               # Server startup, graceful shutdown handlers
│   ├── config/                 # Zod validated configuration from environment
│   ├── prisma/                 # Prisma database client singleton & health checks
│   ├── middleware/             # Auth, RBAC, tenant isolation, rate limiter, idempotency, errors
│   ├── modules/
│   │   ├── public/             # Landing page info, FAQ, features, platform status
│   │   ├── auth/               # Register, login, session cookies, password reset
│   │   ├── transactions/       # Immutable transaction ledger & audit events
│   │   ├── cases/              # Consumer rescue case state machine & timeline
│   │   ├── evidence/           # Storage drivers (Local/S3), SHA-256 hash, malware scanner
│   │   ├── ocr/                # Receipt & bank alert parsing heuristics
│   │   ├── classification/     # Rules engine for dispute classification
│   │   ├── providers/          # Nigerian Banks, Telcos, DisCos directory & adapters
│   │   ├── complaints/         # Standardized CBN/NCC regulatory complaint generator
│   │   ├── escalations/        # Statutory SLA countdown & escalation engine
│   │   ├── business/           # Multi-tenant business management & team members
│   │   ├── reconciliation/     # CSV bank settlement reconciliation engine
│   │   ├── verification/       # Merchant payment verification
│   │   ├── risk/               # Risk signals, duplicate reference detector
│   │   ├── developer/          # TrustPay API keys, HMAC webhooks, audit logs
│   │   ├── billing/            # Plans, subscriptions, Paystack integration
│   │   ├── notifications/      # In-app, Email (Resend/SMTP), SMS (Termii)
│   │   ├── admin/              # Admin control center, audit logs, feature flags
│   │   └── analytics/          # Financial recovery aggregations & resolution stats
│   ├── utils/                  # Nigerian phone validator, NGN formatter, crypto helpers
│   ├── contracts/              # Frontend TypeScript API contracts
│   └── docs/                   # Swagger specification
├── prisma/
│   ├── schema.prisma           # 35+ PostgreSQL relational models & enums
│   └── seed.ts                 # Realistic Nigerian seed dataset
├── tests/                      # Jest & Supertest automated test suite
├── docs/                       # Architecture, Frontend, & Deployment docs
├── Dockerfile                  # Production multi-stage container build
├── docker-compose.yml          # PostgreSQL 17 + Redis + API composition
└── package.json
```

---

## ⚙️ Quickstart & Local Setup

### 1. Prerequisites
- Node.js v20+ and npm v10+
- PostgreSQL 17+ (or Docker)
- Redis 7+ (optional, for background queues)

### 2. Installation
```bash
# Clone repository
git clone https://github.com/payrescue/payrescue-backend.git
cd payrescue-backend

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Review key configuration variables:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/payrescue_db?schema=public"
JWT_ACCESS_SECRET="payrescue_super_secure_access_secret_key_2026_lagos"
JWT_REFRESH_SECRET="payrescue_super_secure_refresh_secret_key_2026_nigeria"
STORAGE_DRIVER=local
```

### 4. Database Setup & Seeding
```bash
# Generate Prisma Client
npm run prisma:generate

# Apply database migrations
npm run prisma:migrate

# Seed with realistic Nigerian institutions, users, and plans
npm run prisma:seed
```

### 5. Running the Application
```bash
# Development mode (with live reload)
npm run dev

# Production build and run
npm run build
npm start
```

---

## 🧪 Testing

Execute the comprehensive automated test suite with Jest:
```bash
# Run all unit and integration tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## 📚 API Endpoints & Documentation

### Interactive Swagger UI
Explore and test all endpoints interactively in your browser:
- **Swagger Documentation**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

### Observability & Health Checks
- **Liveness Probe**: `GET http://localhost:5000/health`
- **Readiness Probe**: `GET http://localhost:5000/ready`
- **API Health**: `GET http://localhost:5000/api/v1/health`

---

## 👥 Seed Credentials (Development)

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@payrescue.ng` | `PayRescue2026!` |
| Dispute Support Agent | `support@payrescue.ng` | `PayRescue2026!` |
| Consumer User | `chidi.okafor@example.ng` | `PayRescue2026!` |
| Business Owner | `amina.merchant@lagosretail.ng` | `PayRescue2026!` |

---

## 🐳 Docker Deployment

To launch the complete infrastructure (PostgreSQL 17 + Redis 7 + PayRescue API) with a single command:
```bash
docker-compose up --build -d
```

Check service status:
```bash
docker-compose ps
docker-compose logs -f api
```

---

## ⚖️ Legal & Regulatory Safeguards

- **Independent Infrastructure**: PayRescue is not a commercial bank, payment service provider, or regulatory dispute tribunal. We provide technology-enabled transaction recovery assistance, evidence dossiers, and reconciliation infrastructure.
- **No Direct Refund Execution**: PayRescue does not process debit card chargebacks directly. Funds remain with licensed financial institutions; PayRescue enforces resolution through standardized statutory complaint routing and statutory SLA tracking.
