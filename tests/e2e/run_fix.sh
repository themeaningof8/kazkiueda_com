#!/bin/bash
set -e

echo "Cleaning up..."
pkill -f 'next dev' || true

echo "Starting DB..."
bun run test:db:up
bun run test:migrate

echo "Starting Server..."
# Use nounset to avoid unbound variable errors if any
set -u

# Start server in background
# We use full path to dotenvx just in case, or rely on path
echo "Invoking next dev via dotenvx..."
# Ensure we are in project root
cd "$(dirname "$0")/../../"

# Run next dev
bunx dotenvx run -f projects/.env.development -- npx next dev --port 3001 > /tmp/next-server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

echo "Waiting for server on port 3001..."
if bunx wait-on http://localhost:3001 -t 60000; then
    echo "Server is ready."
else
    echo "Server failed to start."
    cat /tmp/next-server.log
    kill $SERVER_PID || true
    exit 1
fi

echo "Running Auth Setup..."
if bunx tsx tests/e2e/helpers/setup.ts; then
    echo "Setup complete."
else
    echo "Setup failed."
    kill $SERVER_PID || true
    exit 1
fi

echo "Running Test..."
bunx playwright test tests/e2e/accessibility-essential.spec.ts --reporter=line
TEST_EXIT_CODE=$?

echo "Stopping Server..."
kill $SERVER_PID || true

exit $TEST_EXIT_CODE
