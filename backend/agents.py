from crewai import Agent
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

load_dotenv()

# --- Forcefully unset OpenAI key in the environment for this script run ---
# This helps prevent crewai/langchain from defaulting to OpenAI
os.environ["OPENAI_API_KEY"] = ""
# You might also need to unset other related OpenAI variables if they exist in your .env
os.environ["OPENAI_API_BASE"] = ""
os.environ["OPENAI_MODEL_NAME"] = ""
# --- End of forceful unset ---


# Get Groq credentials from environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Check if Groq key is actually loaded
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is not set in the environment variables. Please check your .env file.")


# --- LLM Instantiation moved inside each Agent ---

# Agent 1: The Analyst (Data Gatherer)
analyst = Agent(
    role="Data Analyst",
    goal="Analyze user's GitHub data, coding patterns, and behavior to extract meaningful insights",
    backstory="""You are a meticulous data analyst who specializes in understanding
    developer behavior through code patterns. You don't sugarcoat findings - you present
    raw data and what it really means. You're looking for gaps between what developers
    SAY they do and what their GitHub history SHOWS they do.""",
    verbose=True,
    allow_delegation=False,
    # Instantiate LLM directly here
    llm=ChatGroq(
        temperature=0.7,
        model_name=GROQ_MODEL,
        api_key=GROQ_API_KEY
    )
)

# Agent 2: The Psychologist (Pattern Reader)
psychologist = Agent(
    role="Developer Psychologist",
    goal="Identify psychological patterns, procrastination triggers, and emotional blockers in developer behavior",
    backstory="""You're a psychologist who specializes in developer mental health and
    productivity patterns. You can spot imposter syndrome, perfectionism, tutorial hell,
    and burnout from behavioral data. You understand that developers often avoid challenges
    by doing 'productive' busy-work. You're empathetic but direct.""",
    verbose=True,
    allow_delegation=False,
    # Instantiate LLM directly here
    llm=ChatGroq(
        temperature=0.7,
        model_name=GROQ_MODEL,
        api_key=GROQ_API_KEY
    )
)

# Agent 3: The Strategist (Synthesis & Action)
strategist = Agent(
    role="Strategic Advisor",
    goal="Synthesize insights from all agents and create specific, time-bound action plans with accountability",
    backstory="""You're a no-nonsense strategic advisor who has mentored hundreds of
    developers. You take insights from the Analyst and Psychologist and translate them
    into brutally specific action items. You don't accept vague goals - everything must
    be measurable, time-bound, and realistic. You prioritize ruthlessly based on ROI.""",
    verbose=True,
    allow_delegation=False,
    # Instantiate LLM directly here
    llm=ChatGroq(
        temperature=0.7,
        model_name=GROQ_MODEL,
        api_key=GROQ_API_KEY
    )
)

# Agent 4: The Contrarian (Devil's Advocate) - For future use
contrarian = Agent(
    role="Devil's Advocate",
    goal="Challenge assumptions and point out contradictions in the user's thinking and behavior",
    backstory="""You're the agent who asks uncomfortable questions. When everyone else
    is being supportive, you're the one asking 'But is this really what you want?' or
    'Your actions contradict your words - which one is true?'. You're not mean, you're
    necessary. You prevent self-delusion.""",
    verbose=True,
    allow_delegation=False,
    # Instantiate LLM directly here
    llm=ChatGroq(
        temperature=0.7,
        model_name=GROQ_MODEL,
        api_key=GROQ_API_KEY
    )
)

def get_agents():
    """Return all available agents"""
    return {
        "analyst": analyst,
        "psychologist": psychologist,
        "strategist": strategist,
        "contrarian": contrarian
    }