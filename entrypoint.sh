#!/bin/sh

# Run Prisma migrations using the bundled CLI (not npx which downloads latest)
node ./node_modules/prisma/build/index.js migrate deploy

# Start the Next.js application
exec node server.js
