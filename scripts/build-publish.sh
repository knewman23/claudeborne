#!/bin/bash
set -e

echo "Building claudeborne for publish..."

# 1. Build web app
echo "  Building web..."
npm run build --workspace=packages/web

# 2. Bundle CLI + shared into single file with esbuild
echo "  Bundling CLI..."
npx esbuild packages/cli/src/index.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=dist/index.js \
  --external:express \
  --external:ws \
  --external:open

# 3. Copy web dist into publish output
echo "  Copying web assets..."
rm -rf dist/web
cp -r packages/web/dist dist/web

echo "Done! Publish-ready output in dist/"
