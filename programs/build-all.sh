#!/bin/bash
# Build all Leo programs for AXIS Protocol

set -e

echo "🔧 Building AXIS Protocol Programs..."
echo ""

PROGRAMS_DIR="$(dirname "$0")"

# Build axis_score
echo "📦 Building axis_score.aleo..."
cd "$PROGRAMS_DIR/axis_score"
leo build
echo "✅ axis_score built successfully"
echo ""

# Build axis_lending
echo "📦 Building axis_lending.aleo..."
cd "$PROGRAMS_DIR/axis_lending"
leo build
echo "✅ axis_lending built successfully"
echo ""

echo "🎉 All programs built successfully!"
