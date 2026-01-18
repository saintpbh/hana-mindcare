#!/bin/bash

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Hana Mindcare Automation Tool ===${NC}"

# 1. Local Backup
echo -e "\n${YELLOW}[1/3] Creating Local Backup...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
# Create a backups folder in the parent directory to keep project clean
BACKUP_DIR="../hana_backups"
mkdir -p "$BACKUP_DIR"

# Zip the current directory, excluding heavy/unnecessary folders
zip -r "$BACKUP_DIR/backup_$TIMESTAMP.zip" . -x "node_modules/*" ".next/*" ".git/*" ".gemini/*" "npm-debug.log"
echo -e "${GREEN}✅ Backup saved to: $BACKUP_DIR/backup_$TIMESTAMP.zip${NC}"

# 2. GitHub Push
echo -e "\n${YELLOW}[2/3] Pushing to GitHub (Vercel Deploy)...${NC}"
if [[ -n $(git status -s) ]]; then
    git add .
    # Ask for commit message with a default
    read -p "Enter commit message (default: Auto-update $TIMESTAMP): " MSG
    MSG=${MSG:-"Auto-update $TIMESTAMP"}
    
    git commit -m "$MSG"
    git push
    echo -e "${GREEN}✅ Changes pushed to GitHub.${NC}"
else
    echo -e "${GREEN}✨ No changes to commit.${NC}"
fi

# 3. Restart Server
echo -e "\n${YELLOW}[3/3] Restarting Development Server...${NC}"
# Find and kill process on port 3000
PID=$(lsof -ti:3000)
if [ -n "$PID" ]; then
    kill -9 $PID
    echo -e "${GREEN}✅ Stopped existing server (PID: $PID).${NC}"
else
    echo "No server running on port 3000."
fi

echo -e "${BLUE}🚀 Starting 'npm run dev'...${NC}"
npm run dev
