# FF-FINM-6850 - Finance Management Module

A **Next.js 15** finance management application that provides comprehensive accounting capabilities for multi-tenant organizations. Part of the Furfield ecosystem with centralized authentication and organization management.

## Features

- **Entity-based financial management** with platform ID references
- **Chart of Accounts** with hierarchical structure and GAAP compliance
- **Double-entry bookkeeping** with automated balance calculations
- **Financial transactions** with journal entries and ledger management
- **Financial Reports**: Trial Balance, Balance Sheet, Income Statement
- **Location-based currency** management with proper formatting
- **Supabase integration** for production-grade data storage

## Architecture

### Multi-App Ecosystem
- **ff-auth-6800**: Centralized authentication and user management
- **ff-orgn-6820**: Organization and entity creation/management
- **ff-finm-6850**: Finance management (this app)

### Key Concepts
- **Organizations**: Subscribers to the service (managed by ff-orgn-6820)
- **Entities**: Business units within organizations (managed by ff-orgn-6820)
- **Entity Platform IDs**: Format `E + entity_type + 6_chars` (E01ABC123, E02XYZ789, etc.)
- **Entity Types**: 01=hospital, 02=estore, 03=pstore, 04=channel_partner

### Data Dependencies
- **Organizations & Entities**: Created and managed by ff-orgn-6820
- **Authentication**: Handled by ff-auth-6800
- **Financial Data**: Managed by this app (ff-finm-6850)

## Getting Started

First, ensure ff-auth-6800 is running for authentication:

```bash
# Terminal 1 - Authentication service
cd ../ff-auth-6800
npm run dev
```

Then run the finance management app:

```bash
# Terminal 2 - Finance management
npm run dev
```

Open [http://localhost:6850](http://localhost:6850) with your browser.

## Environment Variables

Create a `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Enable Supabase (set to 'false' for JSON mode)
NEXT_PUBLIC_USE_SUPABASE=true

# Authentication service
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:6800
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── organizations/ # Organization endpoints
│   │   ├── books/         # Book endpoints
│   │   └── accounts/      # Chart of Accounts endpoints
│   └── page.tsx           # Marketing landing page
├── lib/
│   ├── data-store.ts      # JSON-based data persistence
│   └── services/
│       ├── double-entry.ts           # Core bookkeeping engine
│       └── chart-of-accounts.ts      # COA templates & management
└── types/
    └── accounting.ts      # Complete domain type definitions
```

## Domain Model

- **Organizations** (1) ─┬─< Books (fiscal configuration)
                         ├─< Users (profiles) ──<> org_memberships (role)
                         └─< Contacts (customers/suppliers)

- **Books** (1) ─┬─< Accounts (chart of accounts)
                 ├─< Taxes
                 ├─< Items
                 ├─< Journals
                 ├─< Invoices ──< Invoice_lines
                 ├─< Bills ──< Bill_lines
                 ├─< Payments ──< Payment_applications (to invoice/bill)
                 ├─< Bank_accounts ──< Bank_transactions ──< Reconciliations
                 └─< Ledger_entries (posting rows)

## API Endpoints

- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `GET /api/books` - List books for organization
- `POST /api/books` - Create book
- `GET /api/accounts` - List chart of accounts
- `POST /api/accounts` - Create account
- `POST /api/accounts/from-template` - Create COA from template

## Data Storage

The application uses a JSON file-based storage system located in:
- `data/organizations.json`
- `data/books.json`
- `data/accounts.json`
- Additional entity files as needed

## Development

Build the project:
```bash
npm run build
```

Run linting:
```bash
npm run lint
```

## Technology Stack

- **Next.js 14+** with TypeScript
- **Tailwind CSS** for styling
- **Pure implementation** - no external databases or ORMs
- **JSON file storage** for data persistence
- **Custom accounting engine** with double-entry validation
