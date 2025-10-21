# Supabase Integration for FF-FINM Finance Management

This document explains how to integrate the finance management application with Supabase PostgreSQL database.

## 🚀 Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note down your project URL and API keys

### 2. Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update the environment variables:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Enable Supabase (set to 'true' to use Supabase, 'false' for JSON files)
   NEXT_PUBLIC_USE_SUPABASE=true
   ```

### 3. Database Schema Setup

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `database/schema.sql`
4. Execute the SQL script to create all tables, indexes, and functions

### 4. Verify Installation

1. Check that all tables are created:
   - `organizations`
   - `books`
   - `accounts`
   - `journals`
   - `ledger_entries`
   - `contacts`

2. Verify RLS policies are enabled
3. Test the connection by running the application

## 📊 Database Schema Overview

### Core Tables

- **organizations**: Companies/entities using the system
- **books**: Accounting books within organizations
- **accounts**: Chart of accounts (assets, liabilities, equity, revenue, expenses)
- **journals**: Transaction headers (like invoices, payments, adjustments)
- **ledger_entries**: Individual debit/credit lines within journals
- **contacts**: Customers and suppliers

### Key Features

- ✅ **Automatic ID Generation**: UUIDs for all primary keys
- ✅ **Audit Timestamps**: `created_at` and `updated_at` on all tables
- ✅ **Account Balance Automation**: Automatic calculation when entries are posted
- ✅ **Journal Number Generation**: Auto-incrementing journal numbers per book
- ✅ **Double-Entry Validation**: Database constraints ensure accounting integrity
- ✅ **Row Level Security**: RLS policies for multi-tenant security

## 🔄 Migration from JSON Files

The application supports both JSON file storage (development) and Supabase (production):

### Current State Check
```bash
# Check if using Supabase
echo $NEXT_PUBLIC_USE_SUPABASE
```

### Migration Process
1. Ensure Supabase is set up and configured
2. Set `NEXT_PUBLIC_USE_SUPABASE=true` in `.env.local`
3. Use the migration function (when implemented):
   ```typescript
   import { DataStore } from '@/lib/unified-data-store'
   await DataStore.migrateToSupabase()
   ```

## 🛠️ Development

### Data Store Usage

The application uses a unified data store that automatically switches between JSON files and Supabase:

```typescript
import { DataStore } from '@/lib/unified-data-store'

// Works with both JSON and Supabase
const organizations = await DataStore.getOrganizations()
const newOrg = await DataStore.createOrganization({
  name: 'My Company',
  countryCode: 'US'
})
```

### API Routes

All API routes are updated to use the unified data store:
- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- Similar patterns for books, accounts, journals, etc.

## 🔐 Security

### Row Level Security (RLS)

All tables have RLS enabled with service role access. Future enhancements can add:
- User-specific access controls
- Organization-level data isolation
- Role-based permissions

### Authentication Integration

The system integrates with the centralized Furfield Auth Service:
- JWT token validation
- User role checking
- API route protection

## 📈 Performance Optimizations

### Database Indexes

Optimized indexes for common queries:
- Book lookups by organization
- Account filtering by book and type
- Journal date range queries
- Ledger entry account aggregation

### Triggers and Functions

- **Auto-updating timestamps**: `updated_at` automatically maintained
- **Account balance calculation**: Real-time balance updates
- **Journal numbering**: Sequential number generation
- **Default chart of accounts**: Automatic setup for new books

## 🧪 Testing

### Connection Test
```bash
# Test Supabase connection
curl -H "Authorization: Bearer YOUR_SERVICE_KEY" \
     "https://your-project.supabase.co/rest/v1/organizations"
```

### Data Verification
- Check that organizations and books from JSON files are accessible
- Verify account balances are calculated correctly
- Test journal entry creation with proper double-entry validation

## 🚀 Production Deployment

### Environment Variables
Ensure all production environment variables are set:
- Supabase production URLs and keys
- `NEXT_PUBLIC_USE_SUPABASE=true`
- Auth service configuration

### Database Setup
1. Run the schema script in production Supabase
2. Set up any additional RLS policies for production security
3. Configure backup and monitoring

### Migration Checklist
- [ ] Supabase project created
- [ ] Environment variables configured  
- [ ] Database schema deployed
- [ ] Connection tested
- [ ] Data migrated (if applicable)
- [ ] API routes verified
- [ ] Frontend functionality tested
- [ ] Authentication integration working

## 🔧 Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify Supabase URL and keys
   - Check network connectivity
   - Validate RLS policies

2. **Migration Issues**
   - Ensure schema is properly deployed
   - Check for data type mismatches
   - Verify foreign key constraints

3. **Performance Issues**
   - Review query patterns
   - Check index usage
   - Monitor connection pooling

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

This provides detailed error messages and query logging for troubleshooting.