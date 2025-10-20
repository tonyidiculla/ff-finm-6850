# MYCE - Multi-Tenant Accounting System

A **pure Next.js** application for multi-tenant accounting with organizations, books, chart of accounts, contacts, items, journals, invoices, bills, payments, banking, and financial reports. Built without external databases or dependencies.

## Features

- **Multi-tenant architecture** with organizations and books
- **Chart of Accounts** with predefined templates (Simple Business, Retail, Service)
- **Double-entry bookkeeping** engine with accounting invariants
- **Contacts** management for customers and suppliers
- **Items** and inventory tracking (non-inventory for MVP)
- **Sales Invoices** and Purchase Bills
- **Payments & Receipts** with AR/AP settlement
- **Banking** with transaction management
- **Financial Reports**: Trial Balance, General Ledger, P&L, Balance Sheet

## Architecture

This is a **pure Next.js** implementation that uses:
- JSON file-based data storage (no external database)
- Custom double-entry bookkeeping service
- TypeScript for type safety
- Tailwind CSS for styling
- App Router with API routes

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:6850](http://localhost:6850) with your browser to see the application.

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
