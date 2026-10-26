#!/bin/bash

echo "🔍 Checking current state..."
cd "$(dirname "$0")/.."

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Verifying installation..."
node scripts/check-deps.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 All dependencies installed successfully!"
    echo "You can now run: npm run dev"
else
    echo ""
    echo "❌ Installation verification failed."
    echo "Please check the npm install output above for errors."
    exit 1
fi

