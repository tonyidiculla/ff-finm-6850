# MYCE - Multi-Tenant Accounting System

This is a Next.js application for multi-tenant accounting system with organizations, books, chart of accounts, contacts, items, journals, invoices, bills, payments, banking, and financial reports.

## Domain Model
- Organizations (1) ─┬─< Books (fiscal configuration)
                     ├─< Users (profiles) ──<> org_memberships (role)
                     └─< Contacts (customers/suppliers)

- Books (1) ─┬─< Accounts (chart of accounts)
             ├─< Taxes
             ├─< Items
             ├─< Journals
             ├─< Invoices ──< Invoice_lines
             ├─< Bills ──< Bill_lines
             ├─< Payments ──< Payment_applications (to invoice/bill)
             ├─< Bank_accounts ──< Bank_transactions ──< Reconciliations
             └─< Ledger_entries (posting rows)

## Features
- Multi-tenant organizations and books
- Chart of Accounts CRUD with templates
- Contacts (Customers/Suppliers)
- Items (non-inventory for MVP)
- Double-entry bookkeeping engine
- Sales Invoices and Purchase Bills
- Payments/Receipts with AR/AP settlement
- Banking with CSV import and reconciliation
- Financial Reports: Trial Balance, GL, P&L, Balance Sheet, Tax Summary

## Technology Stack
- Next.js 14+ with TypeScript
- Prisma ORM for database management
- PostgreSQL database
- Tailwind CSS for styling
- NextAuth.js for authentication
- React Hook Form for form handling
- Zod for validation