#!/bin/bash

echo "🧠 Sage AI Mentor - Setup Script"
echo "================================"
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python $python_version found"

# Check Node.js version
echo "Checking Node.js version..."
node_version=$(node --version 2>&1)
echo "✓ Node.js $node_version found"

echo ""
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Setup .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env and add your API keys:"
    echo "   - GROQ_API_KEY (get from console.groq.com)"
    echo "   - GITHUB_TOKEN (get from github.com/settings/tokens)"
    echo ""
fi

cd ..

echo ""
echo "🎨 Setting up Frontend..."
cd frontend

# Install npm dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Edit backend/.env and add your API keys"
echo "   2. Run Backend:"
echo "      cd backend"
echo "      source venv/bin/activate"
echo "      python main.py"
echo ""
echo "   3. Run Frontend (in new terminal):"
echo "      cd frontend"
echo "      npm run dev"
echo ""
echo "   4. Visit http://localhost:3000"
echo ""
echo "🚀 Let's build something real!"