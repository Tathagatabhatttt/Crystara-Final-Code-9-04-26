#!/bin/bash

# Order Management System - Setup Script
# Run this to set up all environment variables

echo "==============================================="
echo "Order Management System - Setup Assistant"
echo "==============================================="
echo ""

# Check if server/.env exists
if [ -f "server/.env" ]; then
    echo "✅ server/.env already exists"
else
    echo "❌ server/.env not found. Creating from template..."
    cp server/.env.example server/.env
    echo "✅ Created server/.env"
    echo ""
    echo "⚠️  Please update server/.env with your credentials:"
    echo "   - RAZORPAY_KEY_ID"
    echo "   - RAZORPAY_KEY_SECRET"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
fi

# Check if frontend .env.local exists
if [ -f ".env.local" ]; then
    if grep -q "VITE_SERVER_URL" .env.local; then
        echo "✅ VITE_SERVER_URL already set in .env.local"
    else
        echo "⚠️  Adding VITE_SERVER_URL to .env.local"
        echo "VITE_SERVER_URL=http://localhost:5001" >> .env.local
        echo "✅ Added VITE_SERVER_URL"
    fi
else
    echo "Creating .env.local..."
    cat > .env.local << EOF
VITE_SERVER_URL=http://localhost:5001
EOF
    echo "✅ Created .env.local with VITE_SERVER_URL"
fi

echo ""
echo "==============================================="
echo "✅ Environment Setup Complete!"
echo "==============================================="
echo ""
echo "Next steps:"
echo "1. Edit server/.env with your credentials"
echo "2. Run: cd server && npm install"
echo "3. Run: npm start (to start server)"
echo "4. Run database migration in Supabase"
echo "5. Add routes to your frontend router"
echo ""
echo "For detailed instructions, see:"
echo "- ORDERS_SETUP_GUIDE.md"
echo "- CART_TO_ORDERS_INTEGRATION.md"
echo ""
