#!/bin/bash

#
# Fanalytics - Vercel Environment Setup Script
#
# This script sets up Vercel environment variables for the Fanalytics application.
# Run this from the project root: ./scripts/setup-vercel-env.sh
#
# @author Fanalytics Team
# @created November 24, 2025
# @license MIT
#

echo "Setting up Vercel environment variables for Fanalytics..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "lib" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

echo "Adding NEBIUS_API_KEY..."
echo "$(grep NEBIUS_API_KEY .env.local | cut -d'=' -f2)" | vercel env add NEBIUS_API_KEY

echo ""
echo "Adding NEBIUS_BASE_URL..."
echo "$(grep NEBIUS_BASE_URL .env.local | cut -d'=' -f2)" | vercel env add NEBIUS_BASE_URL

echo ""
echo "Adding NEXT_PUBLIC_BASE_URL..."
echo "$(grep NEXT_PUBLIC_BASE_URL .env.local | cut -d'=' -f2)" | vercel env add NEXT_PUBLIC_BASE_URL

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "Next steps:"
echo "1. Redeploy your app: vercel --prod"
echo "2. Or push to GitHub to trigger automatic deployment"
echo ""
echo "Your environment variables:"
echo "- NEBIUS_API_KEY: $(grep NEBIUS_API_KEY .env.local | cut -d'=' -f2 | head -c 20)...[truncated]"
echo "- NEBIUS_BASE_URL: $(grep NEBIUS_BASE_URL .env.local | cut -d'=' -f2)"
echo "- NEXT_PUBLIC_BASE_URL: $(grep NEXT_PUBLIC_BASE_URL .env.local | cut -d'=' -f2)"
echo ""
echo "To set the production NEXT_PUBLIC_BASE_URL, you'll need to update it manually:"
echo "vercel env add NEXT_PUBLIC_BASE_URL"
echo "# Paste: https://your-vercel-app.vercel.app"
