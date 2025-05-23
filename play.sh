#!/bin/bash

# The Watcher's Grove - Launch Script

echo "=================================="
echo "   THE WATCHER'S GROVE"
echo "=================================="
echo ""
echo "Launching the game in your default browser..."
echo ""

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Open the game in the default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$DIR/index.html"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "$DIR/index.html"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    start "$DIR/index.html"
fi

echo "Game launched!"
echo ""
echo "Tips:"
echo "- Watch the blinking pattern carefully"
echo "- Click the eyes in the same sequence"
echo "- Don't let your sanity reach 0%"
echo ""
echo "Good luck in the grove..."