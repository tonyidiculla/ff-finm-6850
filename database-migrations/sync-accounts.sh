#!/bin/bash

# Sync Chart of Accounts with Database
# This script creates the finm_accounts table and related infrastructure

echo "🔄 Syncing Chart of Accounts with Database..."

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if Supabase is configured
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
    echo "Please run: source .env.local"
    exit 1
fi

echo "✅ Supabase connection configured"

# Execute the migration SQL
echo "📝 Creating finm_accounts table..."

psql "$DATABASE_URL" -f "$SCRIPT_DIR/create-accounts-table.sql"

if [ $? -eq 0 ]; then
    echo "✅ finm_accounts table created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Test the accounts API: curl http://localhost:6850/api/accounts"
    echo "2. Create accounts from template via the UI"
    echo "3. Create journal entries using the accounts"
else
    echo "❌ Failed to create finm_accounts table"
    echo "Please check the SQL file and try again"
    exit 1
fi
