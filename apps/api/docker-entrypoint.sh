#!/bin/sh
set -e

echo "⏳ Checking database connection and applying Prisma schema..."
npx prisma db push --skip-generate

echo "🌱 Running database seed (if needed)..."
npx tsx src/seed.ts || echo "Seed skipped or already populated."

echo "🚀 Starting Mestory Fastify API..."
exec node dist/server.js
