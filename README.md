# Reflog 🧠

> **Reflect on Your Code. Get Unstuck.**
> The AI mentor built out of necessity.

We're drowning in AI that tells us "You're right," even when we're demonstrably stuck. I saw a meme that perfectly captured it: *"In this era, anyone dumb is being told 'You are right' by ChatGPT."* That hit home. We ask for advice, hoping for challenge, but often get validation that keeps us spinning our wheels.

My greatest weakness? Never having a real mentor to call out my patterns and push me past my comfort zone. When you lack that guidance, you build it. That's the builder's spirit, and that's why Reflog exists.

Reflog isn't trying to be your friend; it's designed to be the objective, data-driven mirror developers need. It connects to your GitHub, analyzes your *actual* coding habits, helps you define and track concrete goals, and provides brutally honest feedback based on your actions, not just your words.

**This MVP focuses squarely on developer accountability.** It's the first step towards a larger vision: creating a personalized advisory board for anyone seeking clarity and growth. But for now, Reflog delivers what many developers are missing: **unbiased reflection and a push towards consistent shipping.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-14-black.svg)

## 🎯 The Problem: Why We Get Stuck

* **ChatGPT & The Validation Trap:** Modern AI often defaults to supportive agreement, failing to challenge flawed assumptions or point out negative patterns. It tells us we're right, even when our results say otherwise.
* **Lack of Objective Feedback:** Without a mentor, it's hard to get an unbiased view of our habits, blind spots, and recurring mistakes (hello, tutorial hell!).
* **The Illusion of Progress:** We feel busy – configuring tools, starting new courses, refactoring endlessly – but aren't actually *shipping* consistently.
* **Inaccessible Mentorship:** Real, experienced mentors are invaluable but often out of reach due to cost or availability.

## ✨ The Reflog Solution: Data-Driven Honesty & Accountability

Reflog tackles this by focusing on your *actions* recorded in Git:

* ✅ **Analyzes Your Git History:** Connects to GitHub to examine commit frequency, repository activity, project lifecycles, and language usage patterns.
* ✅ **Identifies Real Patterns:** Uses a multi-agent AI system (Analyst, Psychologist, Strategist) to spot concrete behaviors like starting projects but not finishing, inconsistent activity ("yo-yo coding"), or potential "shiny object syndrome."
* ✅ **Enforces Accountability:** Daily check-ins demand specific, *shippable* commitments. Reflog tracks your follow-through based on your input. No vague goals allowed.
* ✅ **Delivers Unfiltered Insights:** Provides feedback derived from *your data* and debated by multiple AI perspectives. It's designed to challenge, not just confirm.

## 🏗️ How Reflog is Built (Current Tech)

### Multi-Agent AI System (CrewAI)

1.  **The Analyst:** Extracts objective metrics and facts from GitHub data.
2.  **The Psychologist:** Identifies potential behavioral patterns (procrastination, perfectionism) based on the data.
3.  **The Strategist:** Creates specific, actionable feedback and suggestions based on the analysis.

### Technology Stack

* **Backend:** FastAPI | CrewAI | Groq (Llama 3 Inference) | SQLAlchemy (SQLite/PostgreSQL)
* **Frontend:** Next.js 14 | TypeScript | Tailwind CSS (Reflog Palette: `#000000`, `#242424`, `#FBFAEE`, `#933DC9`, `#53118F`)
* **AI:** Fast multi-agent deliberation via Groq API.
* **Data:** Local-first storage (SQLite), portable.

## 📖 How Reflog Works *Right Now*

1.  **Connect GitHub:** Securely link your account. Reflog performs an initial analysis based on your public/private (if token allows) repo metadata and activity.
2.  **Get Your Baseline:** Receive the first AI-driven assessment of your development patterns, highlighting potential strengths and blind spots.
3.  **Daily Check-in:**
    * **Morning:** Log energy, state what you're avoiding, and define *one concrete thing you will ship today*.
    * **Evening (Optional):** Record whether you shipped the commitment. If not, state the reason (Reflog tracks excuse patterns).
4.  **Review Insights & Chat:** Get AI analysis on your check-ins and progress. Use the chat feature to ask specific questions and receive deliberated answers based on your context.
5.  **Log Decisions:** Use the dedicated log to track significant career or project choices and get AI analysis on them.
6.  **Monitor Your Dashboard:** Visualize your consistency, success rate, detected patterns, and recent AI feedback.

## 📊 Current Features (MVP Focused on Developer Accountability)

* [x] GitHub profile analysis (metadata, activity patterns).
* [x] Multi-agent AI deliberation for feedback generation.
* [x] Daily check-in system for setting shippable goals.
* [x] Commitment tracking & success rate visualization.
* [x] Detection of patterns (e.g., tutorial hell, inconsistency).
* [x] Brutally honest, data-grounded feedback.
* [x] Interactive dashboard with key metrics.
* [x] AI Chat interface for contextual Q&A.
* [x] Life Decision Log with AI analysis.

## 🌱 Future Vision: Towards a Personal Advisory Board

While the MVP delivers tangible value for developer accountability *today*, the long-term vision is much broader:

Reflog aims to evolve into an integrated AI mentor – your personal advisory board. Imagine it connecting seamlessly with your Notion, calendar, project management tools, and more, providing holistic, context-aware guidance across different facets of your professional life. Today's focus on coding habits is the essential first step on that journey.

## 📚 API Overview (Current)

*(This section details the existing API for technical users)*

The backend provides a FastAPI interface.

### Base URL
`http://localhost:8000` (when running locally)

### Core Endpoints
* `POST /users`
* `POST /analyze-github/{github_username}`
* `POST /checkins/{github_username}`
* `POST /commitments/{checkin_id}/review`
* `GET /dashboard/{github_username}`
* `POST /chat/{github_username}`
* `POST /life-decisions/{github_username}`
* `GET /life-decisions/{github_username}`

*Full interactive docs available via `/docs` endpoint when running.*

## 🔒 Privacy & Data

* **Local Data:** Your check-ins and analysis insights are stored locally (SQLite default).
* **No Data Selling:** Your personal data is not for sale. Period.
* **GitHub Scan:** Analysis focuses on metadata and activity patterns. Code content is not stored.
* **Open Source:** Verify the code yourself.
* **Self-Hostable:** Run it entirely under your control.

## 🤔 FAQ

* **How is this better than asking ChatGPT for advice?**
    Reflog uses *your actual GitHub data and check-in history* as context. ChatGPT often validates based only on what you tell it, lacking the objective grounding in your real-world actions. Reflog is designed to challenge your assumptions with data.
* **Is my GitHub data safe?**
    Yes. Analysis uses the official GitHub API for metadata and activity. Code isn't stored. Insights derived are stored locally (or where you host it).
* **Why Groq for AI?**
    Speed. Fast inference allows the multi-agent deliberation to be near real-time.
* **Will this *really* make me ship more?**
    It provides the structure, reflection, and accountability often missing. If you engage honestly with the check-ins and feedback, it highlights the friction points and patterns preventing you from shipping. It's a tool to empower *you* to change.

## 📣 Feedback & Contribution

This is actively developed based on a real need. Your feedback is crucial.

* **Issues & Ideas:** [github.com/rasinmuhammed/reflog-ai-mentor/issues](https://github.com/rasinmuhammed/reflog-ai-mentor/issues)
* **Discussions:** [github.com/rasinmuhammed/reflog-ai-mentor/discussions](https://github.com/rasinmuhammed/reflog-ai-mentor/discussions)
* **Contact:** rasinbinabdulla@gmail.com | [@rasinmuhammedx on X/Twitter](https://twitter.com/rasinmuhammedx)

## 📜 License

MIT License - see [LICENSE.md](LICENSE.md).

## 🙏 Acknowledgments

* **CrewAI, Groq, FastAPI, Next.js:** The tech enabling this.
* **GitHub API:** The source of truth.

## 🚨 Expect Honesty

Reflog prioritizes objective, data-driven feedback over feel-good validation. It's built to challenge and provoke reflection. Be prepared for insights that might be uncomfortable but ultimately constructive.

---

⭐ **Star this repo if you:**

* Are tired of AI simply agreeing with you.
* Suspect you're stuck in patterns but can't quite pinpoint them.
* Believe that real growth comes from confronting reality.
* Want a tool that pushes you to *ship*, not just *work*.
* Needed a mentor, so you appreciate someone building one.

Let's use data to build better habits. 🚀