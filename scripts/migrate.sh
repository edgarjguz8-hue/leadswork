#!/bin/bash

# Script to run database migrations
# This applies the SQL migrations to the Neon database

set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

echo "Running database migrations..."

# Get the migrations directory
MIGRATIONS_DIR="$(dirname "$0")/../migrations"

# Apply migrations in order
for migration in "$MIGRATIONS_DIR"/*.sql; do
  if [ -f "$migration" ]; then
    echo "Applying migration: $(basename "$migration")"
    psql "$DATABASE_URL" < "$migration"
    echo "✓ Migration applied successfully"
  fi
done

echo "✓ All migrations completed successfully"
