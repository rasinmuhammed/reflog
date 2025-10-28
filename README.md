# Sage AI Mentor 🧠

> **Your brutally honest AI development mentor. No validation, just truth.**

Stop getting generic advice. Start getting called out on your patterns. Sage uses multi-agent AI to analyze your GitHub, track your progress, and hold you accountable.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-14-black.svg)

## 🎯 The Problem

- **AI chatbots validate you** instead of challenging you
- **Mentors are expensive** ($100-$500/hr)
- **You keep making the same mistakes** without realizing it
- **Tutorial hell** is real and nobody calls it out

## ✨ The Solution

Sage is a multi-agent AI system that:

- ✅ **Analyzes YOUR history** (GitHub repos, commit patterns, behavior)
- ✅ **Calls out YOUR bullshit** (tutorial hell, procrastination, pattern recognition)
- ✅ **Holds YOU accountable** (daily check-ins, commitment tracking)
- ✅ **Gives brutally specific advice** (no vague "improve your skills" nonsense)

## 🏗️ Architecture

### Multi-Agent System (CrewAI)

1. **The Analyst** - Examines your GitHub data and extracts behavioral insights
2. **The Psychologist** - Identifies patterns like imposter syndrome, perfectionism, burnout
3. **The Strategist** - Creates specific, time-bound action plans with accountability

### Tech Stack

- **Backend**: FastAPI + CrewAI + Groq (Llama 3) + SQLite
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **AI**: Multi-agent deliberation with Groq's fast inference
- **Storage**: SQLite (local), easily portable to PostgreSQL

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Groq API key (free at [console.groq.com](https://console.groq.com))
- GitHub Personal Access Token

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/sage-ai-mentor.git
cd sage-ai-mentor

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your GROQ_API_KEY and GITHUB_TOKEN

# Frontend setup
cd ../frontend
npm install

# Run backend (Terminal 1)
cd backend
source venv/bin/activate
python main.py

# Run frontend (Terminal 2)
cd frontend
npm run dev
```

Visit `http://localhost:3000` and enter your GitHub username!

### Using Docker (Alternative)

```bash
# Set environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Run with Docker Compose
docker-compose up
```

## 📖 How It Works

### 1. **Onboarding**
- Enter your GitHub username
- AI agents analyze your repos, commit patterns, and activity
- Get your first brutally honest assessment

### 2. **Daily Check-ins**
- Morning: Log energy level, what you're avoiding, what you'll ship
- Evening: Did you ship it? No excuses accepted
- AI calls out patterns and holds you accountable

### 3. **Agent Deliberation**
- Agents discuss your situation (visible to you)
- Analyst presents data, Psychologist interprets patterns
- Strategist creates specific action plan
- No vague advice - everything is measurable and time-bound

### 4. **Pattern Recognition**
- **Tutorial Hell**: Starting projects but not finishing
- **Shiny Object Syndrome**: Too many languages/frameworks
- **Perfectionism**: Refactoring instead of shipping
- **Avoidance**: What you keep procrastinating on

## 📊 Features

### Current (MVP)

- [x] GitHub profile analysis
- [x] Multi-agent AI deliberation
- [x] Daily check-in system
- [x] Pattern detection (tutorial hell, consistency issues)
- [x] Brutally honest feedback
- [x] Dashboard with metrics

### Coming Soon

- [ ] Weekly accountability reports
- [ ] Evening check-in reminders
- [ ] Wakatime integration (actual coding time)
- [ ] Mobile app (React Native)
- [ ] Community patterns (anonymous benchmarking)
- [ ] Voice check-ins for busy developers


## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Key Endpoints

#### Create User
```http
POST /users
Content-Type: application/json

{
  "github_username": "octocat",
  "email": "octocat@github.com"
}
```

#### Analyze GitHub
```http
POST /analyze-github/{github_username}
```
Returns complete GitHub analysis + AI agent insights

#### Daily Check-in
```http
POST /checkins/{github_username}
Content-Type: application/json

{
  "energy_level": 7,
  "avoiding_what": "Writing tests for my API",
  "commitment": "Deploy authentication feature by 5pm",
  "mood": "Focused"
}
```

#### Get Dashboard
```http
GET /dashboard/{github_username}
```
Returns complete dashboard data (GitHub stats, check-ins, AI advice)

#### Evening Check-in
```http
PATCH /checkins/{checkin_id}/evening
Content-Type: application/json

{
  "shipped": false,
  "excuse": "Got distracted refactoring"
}
```

Full API docs at `http://localhost:8000/docs` (FastAPI auto-generated)

## 🔒 Privacy & Data

- **Your data stays local** (SQLite database)
- **No data is sold** or shared with third parties
- **GitHub data** is analyzed but not stored permanently (only insights)
- **Open source** - audit the code yourself
- **Self-hostable** - run it on your own machine

## 🎯 Roadmap

### Phase 1: MVP (Current)
- [x] Core agent system
- [x] GitHub integration
- [x] Daily check-ins
- [x] Basic dashboard

### Phase 2: Enhanced Accountability (Next 2 months)
- [ ] All 7 agents (add Contrarian, Historian, Oracle, Accountability Partner)
- [ ] Agent debate visualization
- [ ] "Advice Graveyard" (track ignored advice)
- [ ] Weekly review emails
- [ ] Wakatime integration



## 🤔 FAQ

### Why not just use ChatGPT?

ChatGPT validates you instead of challenging you. It doesn't know YOUR history, YOUR patterns, YOUR repeated mistakes. Sage tracks everything and calls you out.

### Is my GitHub data safe?

Yes. Your data is stored locally in SQLite. Only aggregated, anonymous patterns may be used to improve the AI (and you can opt out).

### Why Groq instead of OpenAI?

Groq is **crazy fast** (800+ tokens/sec) and has a generous free tier. Perfect for real-time agent deliberation. You can swap to OpenAI/Claude if you prefer.

### Can I use this without GitHub?

Currently, GitHub integration is core to the product. Manual data entry is planned for future releases.

### Will this actually help me?

If you're honest with it, yes. This isn't magic - it's pattern recognition + accountability. The AI can only work with what you give it.

### Can I customize the agents?

Absolutely! The agent definitions are in `backend/agents.py`. Modify the backstory, goals, or add new agents entirely.

## 🛠️ Development

### Project Structure
```
sage-ai-mentor/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── agents.py            # CrewAI agent definitions
│   ├── crew.py              # Agent orchestration
│   ├── models.py            # Database models
│   ├── database.py          # SQLite setup
│   ├── github_integration.py # GitHub API
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main page
│   │   ├── layout.tsx       # App layout
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── CheckInModal.tsx # Check-in form
│   │   ├── AgentInsights.tsx # AI insights display
│   │   └── Onboarding.tsx   # Onboarding flow
│   └── package.json
├── docker-compose.yml
└── README.md
```

### Running Tests
```bash
# Backend tests (coming soon)
cd backend
pytest

# Frontend tests (coming soon)
cd frontend
npm test
```

### Code Style
- **Python**: PEP 8, use `black` formatter
- **TypeScript**: ESLint + Prettier
- **Commits**: Conventional commits (feat:, fix:, docs:, etc.)


## 📣 Feedback & Support

- **Issues**: [GitHub Issues](https://github.com/rasinmuhammed/sage-ai-mentor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rasinmuhammed/sage-ai-mentor/discussions)
- **Twitter**: [@yourusername](https://twitter.com/rasinmuhammedx)
- **Email**: rasinbinabdulla@gmail.com
## 📜 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- **CrewAI** for the amazing multi-agent framework
- **Groq** for blazing-fast LLM inference
- **GitHub** for the API
- **All contributors** who make this better

## 🚨 Warning

This AI is brutally honest. If you're looking for validation and feel-good messages, this isn't for you. Sage tells you what you need to hear, not what you want to hear.

---

⭐ **Star this repo if you've ever:**
- Started 10 projects and finished 0
- Spent more time on tooling than building
- Asked "should I learn X?" instead of just learning it
- Needed someone to call out your BS

Let's build something real together. 🚀