#!/bin/bash

################################################################################
# p5.js Web Editor API - Sketch Upload Test Script (Bash/curl)
#
# PURPOSE: Test uploading sketches to editor.p5js.org using curl
#
# REQUIREMENTS:
# - curl
# - jq (optional, for pretty JSON output)
#
# SETUP:
# 1. Log into editor.p5js.org in your browser
# 2. Open DevTools → Application → Cookies
# 3. Copy the value of 'connect.sid' cookie
# 4. Set it as SESSION_COOKIE below
#
# OR (if Personal Access Tokens are working):
# 1. Generate token in Account Settings
# 2. Set USERNAME and ACCESS_TOKEN variables
#
# USAGE:
# chmod +x test-upload.sh
# ./test-upload.sh
################################################################################

# ============================================================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================================================

# Method 1: Session Cookie (copy from browser DevTools)
SESSION_COOKIE="YOUR_SESSION_COOKIE_HERE"

# Method 2: Personal Access Token (if available)
USERNAME="your_username"
ACCESS_TOKEN="your_personal_access_token"

# Which authentication method to use (cookie or token)
AUTH_METHOD="cookie"  # Set to "token" to use Personal Access Token

# ============================================================================
# API CONFIGURATION
# ============================================================================

API_BASE_URL="https://editor.p5js.org/api"

# ============================================================================
# COLORS FOR OUTPUT
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log_info() {
    echo -e "${CYAN}$1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if jq is installed
if command -v jq &> /dev/null; then
    HAVE_JQ=true
    log_info "📦 jq is installed - JSON output will be formatted"
else
    HAVE_JQ=false
    log_warning "jq is not installed - JSON output will be raw"
    log_info "Install with: sudo apt install jq  OR  brew install jq"
fi

# ============================================================================
# VALIDATION
# ============================================================================

validate_config() {
    log_info "🔧 Validating configuration..."

    if [ "$AUTH_METHOD" = "cookie" ] && [ "$SESSION_COOKIE" = "YOUR_SESSION_COOKIE_HERE" ]; then
        log_error "SESSION_COOKIE not configured!"
        echo ""
        echo "📖 Instructions:"
        echo "1. Log into editor.p5js.org in your browser"
        echo "2. Open DevTools (F12) → Application → Cookies"
        echo "3. Copy the value of 'connect.sid' cookie"
        echo "4. Paste it in this script as SESSION_COOKIE"
        echo ""
        echo "OR set AUTH_METHOD=\"token\" and configure token credentials"
        echo ""
        exit 1
    fi

    if [ "$AUTH_METHOD" = "token" ] && ([ "$USERNAME" = "your_username" ] || [ "$ACCESS_TOKEN" = "your_personal_access_token" ]); then
        log_error "Token credentials not configured!"
        echo ""
        echo "📖 Instructions:"
        echo "1. Log into editor.p5js.org"
        echo "2. Go to Account Settings"
        echo "3. Generate a Personal Access Token"
        echo "4. Set USERNAME and ACCESS_TOKEN in this script"
        echo ""
        echo "OR set AUTH_METHOD=\"cookie\" and use session cookie instead"
        echo ""
        exit 1
    fi

    log_success "Configuration valid"
    echo ""
}

# ============================================================================
# API FUNCTIONS
# ============================================================================

make_request() {
    local method=$1
    local endpoint=$2
    local data=$3

    log_info "📤 $method $endpoint"

    # Build curl command based on auth method
    local curl_cmd="curl -s -w '\n%{http_code}' -X $method"

    if [ "$AUTH_METHOD" = "token" ]; then
        # HTTP Basic Auth
        curl_cmd="$curl_cmd -u '$USERNAME:$ACCESS_TOKEN'"
        log_info "🔑 Using Token Authentication"
    else
        # Session Cookie
        curl_cmd="$curl_cmd -H 'Cookie: connect.sid=$SESSION_COOKIE'"
        log_info "🔑 Using Session Cookie Authentication"
    fi

    # Add headers and data
    curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
    curl_cmd="$curl_cmd -H 'User-Agent: p5-api-test-client-bash/1.0'"

    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi

    curl_cmd="$curl_cmd '$API_BASE_URL$endpoint'"

    # Execute curl command
    local response=$(eval $curl_cmd)

    # Extract status code (last line)
    local status_code=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | sed '$d')

    # Log status
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        log_success "Response: $status_code"
    else
        log_error "Response: $status_code"
    fi

    # Pretty print JSON if jq is available
    if [ "$HAVE_JQ" = true ] && [ -n "$body" ]; then
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo "$body"
    fi

    # Return status code for checking
    return $([ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ])
}

# ============================================================================
# TEST AUTHENTICATION
# ============================================================================

test_authentication() {
    log_info ""
    log_info "🔍 Testing Authentication..."

    make_request "GET" "/auth/access-check" ""

    if [ $? -eq 0 ]; then
        log_success "Authentication successful!"
    else
        log_warning "Test endpoint not found (this may be okay)"
    fi
}

# ============================================================================
# CREATE SKETCH
# ============================================================================

create_sketch() {
    log_info ""
    log_info "📝 Creating sketch..."

    # JSON payload for sketch
    # Note: In bash, we need to escape quotes and newlines carefully
    local sketch_data=$(cat <<'EOF'
{
  "name": "Test Sketch - Bash",
  "files": [
    {
      "name": "sketch.js",
      "content": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(220);\n  \n  // Draw a circle\n  fill(255, 0, 0);\n  circle(mouseX, mouseY, 50);\n  \n  // Display coordinates\n  fill(0);\n  textAlign(CENTER);\n  text('x: ' + mouseX + ', y: ' + mouseY, width / 2, 20);\n}",
      "fileType": "file"
    },
    {
      "name": "index.html",
      "content": "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Test Sketch</title>\n    <style>\n      body {\n        padding: 0;\n        margin: 0;\n      }\n    </style>\n    <script src=\"https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js\"></script>\n    <script src=\"sketch.js\"></script>\n  </head>\n  <body>\n  </body>\n</html>",
      "fileType": "file"
    }
  ]
}
EOF
)

    local response=$(make_request "POST" "/projects" "$sketch_data")

    if [ $? -eq 0 ]; then
        log_success "Sketch created successfully!"

        # Extract project ID and username
        if [ "$HAVE_JQ" = true ]; then
            PROJECT_ID=$(echo "$response" | jq -r '.id')
            PROJECT_USERNAME=$(echo "$response" | jq -r '.owner.username // .user.username // "'$USERNAME'"')

            if [ -n "$PROJECT_ID" ] && [ "$PROJECT_ID" != "null" ]; then
                echo ""
                log_info "🔗 Sketch URL:"
                echo "   https://editor.p5js.org/$PROJECT_USERNAME/sketches/$PROJECT_ID"
                echo ""
                log_info "🎨 Full View:"
                echo "   https://editor.p5js.org/$PROJECT_USERNAME/full/$PROJECT_ID"
            fi
        fi
    else
        log_error "Failed to create sketch"
    fi
}

# ============================================================================
# GET PROJECT
# ============================================================================

get_project() {
    if [ -z "$PROJECT_ID" ]; then
        log_warning "No PROJECT_ID available, skipping get_project test"
        return
    fi

    log_info ""
    log_info "🔍 Fetching project $PROJECT_ID..."

    make_request "GET" "/projects/$PROJECT_ID" ""

    if [ $? -eq 0 ]; then
        log_success "Project fetched successfully"
    else
        log_error "Failed to fetch project"
    fi
}

# ============================================================================
# LIST USER SKETCHES
# ============================================================================

list_user_sketches() {
    if [ "$USERNAME" = "your_username" ]; then
        log_warning "USERNAME not configured, skipping list_user_sketches test"
        return
    fi

    log_info ""
    log_info "📋 Listing sketches for user: $USERNAME..."

    # This endpoint doesn't require authentication
    local response=$(curl -s "$API_BASE_URL/$USERNAME/sketches")

    if [ "$HAVE_JQ" = true ]; then
        local count=$(echo "$response" | jq '. | length')
        log_success "Found $count sketches"

        echo "$response" | jq -r '.[:5] | .[] | "\n  • \(.name)\n    ID: \(.id)\n    Updated: \(.updatedAt)"'

        if [ "$count" -gt 5 ]; then
            echo ""
            echo "  ... and $((count - 5)) more"
        fi
    else
        echo "$response"
    fi
}

# ============================================================================
# MAIN TEST SUITE
# ============================================================================

run_tests() {
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║    p5.js Web Editor API - Upload Test Suite (Bash)            ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""

    test_authentication
    create_sketch
    get_project
    list_user_sketches

    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║    ✅ Tests completed!                                         ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
}

# ============================================================================
# RUN
# ============================================================================

validate_config
run_tests
