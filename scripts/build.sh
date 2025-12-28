#!/bin/bash
set -e

# Backup existing uploads before build
UPLOADS_BACKUP="/tmp/logsdb-uploads-backup"
STANDALONE_UPLOADS=".next/standalone/public/uploads"

if [ -d "$STANDALONE_UPLOADS/logs" ]; then
  echo "Backing up existing uploads..."
  rm -rf "$UPLOADS_BACKUP"
  mkdir -p "$UPLOADS_BACKUP"
  cp -r "$STANDALONE_UPLOADS/logs" "$UPLOADS_BACKUP/" 2>/dev/null || true
  cp "$STANDALONE_UPLOADS/logs-metadata.json" "$UPLOADS_BACKUP/" 2>/dev/null || true
fi

# Run Next.js build
echo "Building Next.js application..."
npx next build

# Copy static files and env
echo "Copying static files..."
cp -r .next/static .next/standalone/.next/
cp .env.local .next/standalone/

# Ensure uploads directory exists
mkdir -p .next/standalone/public/uploads/logs

# Restore uploads if backup exists
if [ -d "$UPLOADS_BACKUP/logs" ]; then
  echo "Restoring uploads..."
  cp -r "$UPLOADS_BACKUP/logs/"* ".next/standalone/public/uploads/logs/" 2>/dev/null || true
  cp "$UPLOADS_BACKUP/logs-metadata.json" ".next/standalone/public/uploads/" 2>/dev/null || true
fi

echo "Build complete!"
