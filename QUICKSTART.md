# 🚀 Sage AI Mentor - Quick Start Guide

Get up and running in **5 minutes**.

## Prerequisites Check

Before starting, make sure you have:

- ✅ Python 3.9+ installed (`python3 --version`)
- ✅ Node.js 18+ installed (`node --version`)
- ✅ Git installed (`git --version`)

## Step 1: Get Your API Keys (2 minutes)

### Groq API Key (FREE)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (it's free!)
3. Click "API Keys" → "Create API Key"
4. Copy your key (starts with `gsk_...`)

### GitHub Token
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "Sage AI Mentor"
4. Check the `repo` scope
5. Click "Generate token"
6. Copy your token (starts with `ghp_...`)

## Step 2: Clone and Setup (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/sage-ai-mentor.git
cd sage-ai-mentor

# Run automated setup
chmod +x setup.sh
./setup.sh
```

The script will:
- Create Python virtual environment
- Install all Python dependencies
- Install all Node.js dependencies
- Create `.env` file

## Step 3: Add Your API Keys (30 seconds)

Open `backend/.env` in your text editor and add your keys:

```bash
GROQ_API_KEY=gsk_your_groq_key_here
GITHUB_TOKEN=ghp_your_github_token_here
DATABASE_URL=sqlite:///./sage.db
GROQ_MODEL=llama-3.1-70b-versatile
```

## Step 4: Start the Application (30 seconds)

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
```

## Step 5: Use Sage! (1 minute)

1. Open your browser to `http://localhost:3000`
2. Enter your GitHub username
3. Wait ~30 seconds for AI analysis
4. View your brutally honest dashboard 😅

## 🎉 You're Done!

### What to do next:

1. **Complete a daily check-in** to start tracking your progress
2. **Review AI insights** - they're based on your actual GitHub behavior
3. **Come back tomorrow** for your next check-in
4. **Be honest** - the AI can only help if you're truthful

## Common Issues & Fixes

### "Module not found" error (Python)
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### "Cannot find module" error (Node)
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### "Failed to analyze GitHub" error
- Check your `GITHUB_TOKEN` in `backend/.env`
- Make sure the token has `repo` scope
- Verify your GitHub username is correct

### "Groq API error"
- Check your `GROQ_API_KEY` in `backend/.env`
- Visit [console.groq.com](https://console.groq.com) to verify your key
- Make sure you haven't hit rate limits (unlikely with free tier)

### Database errors
```bash
cd backend
rm sage.db  # Delete and start fresh
python main.py  # Will recreate database
```

### Port already in use
```bash
# Backend (8000)
lsof -ti:8000 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

## Testing the API

### Check Backend Health
```bash
curl http://localhost:8000
```

Should return:
```json
{
  "message": "Sage AI Mentor API",
  "version": "1.0.0",
  "status": "running"
}
```

### View API Documentation
Open `http://localhost:8000/docs` in your browser for interactive API docs

## Next Steps

- Read the full [README.md](README.md) for detailed features
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Join our community discussions
- Star the repo if you find it useful! ⭐

## Need Help?

- **Issues**: [GitHub Issues](https://github.com/yourusername/sage-ai-mentor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/sage-ai-mentor/discussions)
- **Twitter**: [@yourusername](https://twitter.com/yourusername)

---

**Remember**: Sage is brutally honest. If you're not ready for the truth, don't ask for it. 😉

Happy shipping! 🚀