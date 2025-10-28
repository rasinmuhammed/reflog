from crewai import Task, Crew, Process
from agents import analyst, psychologist, strategist, contrarian
from typing import Dict, List
import json
import models
from datetime import datetime
import io
import sys

class SageMentorCrew:
    def __init__(self):
        self.analyst = analyst
        self.psychologist = psychologist
        self.strategist = strategist
        self.contrarian = contrarian
    
    def analyze_developer(self, github_data: Dict, checkin_history: List[Dict] = None) -> Dict:
        """Main analysis flow: All agents deliberate on the developer's situation"""
        
        context = self._prepare_context(github_data, checkin_history)
        
        analysis_task = Task(
            description=f"""Analyze this developer's GitHub data and extract key insights:
            
            GitHub Data:
            {json.dumps(github_data, indent=2)}
            
            Your job:
            1. Identify what they CLAIM to be (based on repo names, languages used)
            2. Identify what they ACTUALLY do (based on commit patterns, active repos)
            3. Spot the gap between started projects and finished projects
            4. Calculate their consistency score
            5. Identify any tutorial hell patterns
            
            Be specific with numbers. Point out contradictions.""",
            agent=self.analyst,
            expected_output="A detailed analysis report with specific metrics and patterns"
        )
        
        psychology_task = Task(
            description=f"""Based on the analyst's findings and this context:
            
            Context: {context}
            
            Identify psychological patterns:
            1. What are they avoiding? (Look for project abandonment patterns)
            2. What does their commit timing tell us about their energy/motivation?
            3. Are they in tutorial hell? Why?
            4. Any signs of perfectionism? (lots of refactoring, few features)
            5. Any signs of burnout or overwhelm?
            
            Be empathetic but honest. Connect behavior to underlying psychology.""",
            agent=self.psychologist,
            expected_output="Psychological pattern analysis with behavioral insights",
            context=[analysis_task]
        )
        
        strategy_task = Task(
            description=f"""Based on the Analyst's data and Psychologist's insights:
            
            Create a brutally specific action plan:
            1. ONE main focus for the next 2 weeks (not 5 goals, just 1)
            2. Specific daily actions (with time commitments)
            3. What to STOP doing (as important as what to start)
            4. Success metrics (how will we know if they followed through?)
            5. Accountability checkpoints
            
            Rules:
            - No vague advice like "improve skills" - be specific
            - Include deadlines (dates, not "soon")
            - Must be achievable in 2 weeks
            - Call out any BS (if they keep asking about X but never do X)""",
            agent=self.strategist,
            expected_output="A specific, time-bound action plan with clear accountability metrics",
            context=[analysis_task, psychology_task]
        )
        
        crew = Crew(
            agents=[self.analyst, self.psychologist, self.strategist],
            tasks=[analysis_task, psychology_task, strategy_task],
            process=Process.sequential,
            verbose=True
        )
        
        result = crew.kickoff()
        
        return self._structure_output(result, github_data)
    
    def _capture_output(self, crew):
        """Capture verbose output from crew execution"""
        # CrewAI's verbose mode prints to stdout, we'll capture it
        old_stdout = sys.stdout
        sys.stdout = captured_output = io.StringIO()
        
        try:
            result = crew.kickoff()
            output = captured_output.getvalue()
            self.raw_output = output.split('\n')
            return result
        finally:
            sys.stdout = old_stdout
    
    def chat_deliberation(self, user_message: str, user_context: Dict, additional_context: Dict = None) -> Dict:
        """Multi-agent deliberation for chat messages with raw output"""
        
        self.raw_output = []  # Reset raw output
        
        context_str = f"""
        User Context:
        - GitHub: {user_context['github']}
        - Recent Performance: {user_context['recent_performance']}
        - Life Decisions: {user_context['life_decisions']}

        Additional Context: {additional_context if additional_context else 'None'}
        """
        
        analyst_task = Task(
            description=f"""Analyze this user's question from a data perspective:
            
            User Question: "{user_message}"
            
            {context_str}
            
            Your job:
            1. What does their data say about this question?
            2. Any patterns that relate to what they're asking?
            3. What are they NOT seeing in their own behavior?
            4. Provide specific numbers and facts
            
            Be direct. Point out contradictions between what they ask and what their data shows.""",
            agent=self.analyst,
            expected_output="Data-driven analysis with specific metrics and patterns"
        )
        
        psychologist_task = Task(
            description=f"""Based on the Analyst's findings and the user's question:
            
            User Question: "{user_message}"
            
            Your job:
            1. What are they REALLY asking? (look beyond the surface)
            2. What psychological patterns are at play?
            3. What are they avoiding by asking this question?
            4. What fear or insecurity is driving this?
            
            Be empathetic but unflinchingly honest. Call out self-deception.""",
            agent=self.psychologist,
            expected_output="Psychological interpretation with underlying motivations",
            context=[analyst_task]
        )
        
        contrarian_task = Task(
            description=f"""Challenge everything said so far:
            
            User Question: "{user_message}"
            
            Your job:
            1. What assumptions are the user making that might be wrong?
            2. What if the OPPOSITE of what they're asking is true?
            3. What uncomfortable truth are they not ready to hear?
            4. Play devil's advocate ruthlessly
            
            Ask the hard questions. No sugar coating.""",
            agent=self.contrarian,
            expected_output="Contrarian perspective challenging core assumptions",
            context=[analyst_task, psychologist_task]
        )
        
        strategist_task = Task(
            description=f"""Synthesize all agent perspectives and create actionable response:
            
            User Question: "{user_message}"
            
            Your job:
            1. Synthesize Analyst, Psychologist, and Contrarian perspectives
            2. Give ONE clear, direct answer to their question
            3. Provide 2-3 specific, immediate actions (with timeframes)
            4. Call out any BS in their question or underlying assumptions
            5. What should they do RIGHT NOW (today)?
            
            Be brutally specific. No vague advice. Include deadlines and metrics.""",
            agent=self.strategist,
            expected_output="Actionable response with specific steps and timeframes",
            context=[analyst_task, psychologist_task, contrarian_task]
        )
        
        crew = Crew(
            agents=[self.analyst, self.psychologist, self.contrarian, self.strategist],
            tasks=[analyst_task, psychologist_task, contrarian_task, strategist_task],
            process=Process.sequential,
            verbose=True
        )
        
        # Capture output
        result = self._capture_output(crew)
        
        # Parse raw output for agent contributions
        agent_contributions = self._parse_agent_output(self.raw_output)
        
        return {
            "final_response": str(result),
            "debate": [
                {"agent": "Analyst", "perspective": "Data-driven reality check", "color": "blue"},
                {"agent": "Psychologist", "perspective": "Underlying psychology", "color": "purple"},
                {"agent": "Contrarian", "perspective": "Challenging assumptions", "color": "red"},
                {"agent": "Strategist", "perspective": "Actionable synthesis", "color": "green"}
            ],
            "key_insights": self._extract_key_points(str(result)),
            "actions": self._extract_actions(str(result)),
            "raw_deliberation": agent_contributions  # NEW: Raw deliberation data
        }
    
    def _parse_agent_output(self, raw_lines: List[str]) -> List[Dict]:
        """Parse raw output to extract agent contributions"""
        contributions = []
        current_agent = None
        current_output = []
        
        for line in raw_lines:
            # Detect agent starting to work
            if "Agent:" in line or "Working Agent:" in line:
                # Save previous agent's output
                if current_agent and current_output:
                    contributions.append({
                        "agent": current_agent,
                        "output": "\n".join(current_output),
                        "timestamp": datetime.now().isoformat()
                    })
                
                # Extract agent name
                if "Data Analyst" in line:
                    current_agent = "Analyst"
                elif "Developer Psychologist" in line:
                    current_agent = "Psychologist"
                elif "Devil's Advocate" in line:
                    current_agent = "Contrarian"
                elif "Strategic Advisor" in line:
                    current_agent = "Strategist"
                
                current_output = []
            
            # Collect output lines
            elif current_agent and line.strip() and not line.startswith("###"):
                # Filter out system messages
                if not any(skip in line for skip in ["Task output:", "Final Answer:", "Thought:"]):
                    current_output.append(line.strip())
        
        # Add last agent's output
        if current_agent and current_output:
            contributions.append({
                "agent": current_agent,
                "output": "\n".join(current_output),
                "timestamp": datetime.now().isoformat()
            })
        
        return contributions
    
    def analyze_life_decision(self, decision: Dict, user_id: int, db) -> Dict:
        """Analyze a major life decision"""
        
        past_decisions = db.query(models.LifeEvent).filter(
            models.LifeEvent.user_id == user_id
        ).order_by(models.LifeEvent.timestamp.desc()).limit(5).all()
        
        past_context = "\n".join([
            f"- {e.description} ({e.event_type})" # Removed the incorrect e.outcome reference
            for e in past_decisions
        ])
        
        analysis_task = Task(
            description=f"""Analyze this life decision comprehensively:
            
            Decision: {decision['title']}
            Description: {decision['description']}
            Type: {decision['type']}
            Impact Areas: {decision['impact_areas']}
            
            Past Decisions:
            {past_context}
            
            Your job:
            1. Analyze this decision critically (what's good, what's risky)
            2. How does it fit their past decision patterns?
            3. What are they not considering?
            4. Rate this decision on a scale of 1-10 (with reasoning)
            5. Extract 3-5 key lessons from this decision
            6. How can they use this experience going forward?
            7. What could go wrong? What could go right?
            
            Be honest. If it's a bad decision, say so. If it's good, explain why.
            Focus on extracting transferable lessons.""",
            agent=self.strategist,
            expected_output="Comprehensive analysis with lessons and future guidance"
        )
        
        crew = Crew(
            agents=[self.strategist],
            tasks=[analysis_task],
            process=Process.sequential,
            verbose=False
        )
        
        result = crew.kickoff()
        result_str = str(result)
        
        lessons = []
        for line in result_str.split('\n'):
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['lesson:', 'learn:', 'takeaway:', 'insight:']):
                lessons.append(line.split(':', 1)[-1].strip())
        
        return {
            "analysis": result_str,
            "lessons": lessons[:5] if lessons else ["Reflect on the decision-making process"],
            "long_term_impact": "Use this decision as a reference point for future choices"
        }
    
    def reevaluate_decision(self, original_event, current_situation: str, what_changed: str, user_id: int, db) -> Dict:
        """Re-evaluate a past decision with hindsight"""
        
        reevaluation_task = Task(
            description=f"""Re-evaluate this past decision with hindsight:
            
            Original Decision: {original_event.description}
            Original Analysis: {original_event.context.get('ai_analysis', 'No original analysis')}
            Time Since Decision: {(datetime.now() - original_event.timestamp).days} days
            
            Current Situation: {current_situation}
            What Changed: {what_changed}
            
            Your job:
            1. How did this decision age? (Good? Bad? Neutral?)
            2. What would you tell your past self now?
            3. What NEW lessons emerged that weren't visible before?
            4. How should this update their decision-making framework?
            5. Rate: Did this decision help or hurt them? (1-10 scale)
            
            Be brutally honest about what they got right and wrong.
            Focus on extracting wisdom from hindsight.""",
            agent=self.psychologist,
            expected_output="Honest retrospective with updated lessons"
        )
        
        crew = Crew(
            agents=[self.psychologist],
            tasks=[reevaluation_task],
            process=Process.sequential,
            verbose=False
        )
        
        result = crew.kickoff()
        result_str = str(result)
        
        new_lessons = []
        for line in result_str.split('\n'):
            line = line.strip()
            if 'lesson' in line.lower() or 'learned' in line.lower():
                new_lessons.append(line)
        
        if 'good decision' in result_str.lower() or 'right choice' in result_str.lower():
            aging = "Aged well - good decision"
        elif 'bad decision' in result_str.lower() or 'mistake' in result_str.lower():
            aging = "Aged poorly - learning opportunity"
        else:
            aging = "Mixed results - nuanced outcome"
        
        return {
            "analysis": result_str,
            "new_lessons": new_lessons[:3] if new_lessons else ["Continue observing outcomes"],
            "how_it_aged": aging
        }
    
    def quick_checkin_analysis(self, checkin_data: Dict, user_history: Dict) -> Dict:
        """Quick analysis for daily check-ins"""
        
        checkin_task = Task(
            description=f"""Analyze this daily check-in:
            
            Check-in Data:
            - Energy Level: {checkin_data.get('energy_level')}/10
            - Avoiding: {checkin_data.get('avoiding_what')}
            - Commitment: {checkin_data.get('commitment')}
            - Mood: {checkin_data.get('mood', 'Not specified')}
            
            Recent History:
            {json.dumps(user_history, indent=2)}
            
            Your job:
            1. Is this check-in honest or are they fooling themselves?
            2. Compare today's commitment to past performance
            3. Red flags in what they're avoiding?
            4. One specific question to ask them that they don't want to answer
            
            Be direct. Reference their patterns.""",
            agent=self.psychologist,
            expected_output="Brief analysis with one uncomfortable question"
        )
        
        crew = Crew(
            agents=[self.psychologist],
            tasks=[checkin_task],
            process=Process.sequential,
            verbose=False
        )
        
        result = crew.kickoff()
        return {"analysis": str(result)}
    
    def evening_checkin_review(self, morning_commitment: str, shipped: bool, excuse: str = None) -> Dict:
        """Review whether user followed through on morning commitment"""
        
        review_task = Task(
            description=f"""Review this day's outcome:
            
            Morning Commitment: "{morning_commitment}"
            Did they ship it? {shipped}
            {"Excuse given: " + excuse if excuse else "No excuse provided"}
            
            Your job:
            1. If shipped: Acknowledge but don't over-celebrate (it's expected)
            2. If not shipped: Call out the excuse if it's BS
            3. If no excuse: Point out they didn't even own the failure
            4. Pattern recognition: Is this a recurring behavior?
            
            Keep it short but impactful. One or two sentences.""",
            agent=self.contrarian,
            expected_output="Brief, direct feedback on the day's outcome"
        )
        
        crew = Crew(
            agents=[self.contrarian],
            tasks=[review_task],
            process=Process.sequential,
            verbose=False
        )
        
        result = crew.kickoff()
        return {"feedback": str(result)}
    
    def _prepare_context(self, github_data: Dict, checkin_history: List[Dict] = None) -> str:
        """Prepare context from available data"""
        context = f"GitHub Analysis: {json.dumps(github_data, indent=2)}"
        
        if checkin_history:
            context += f"\n\nRecent Check-ins: {json.dumps(checkin_history[-7:], indent=2)}"
        
        return context
    
    def _structure_output(self, crew_result, github_data: Dict) -> Dict:
        """Structure the crew output into a usable format"""
        
        result_str = str(crew_result)
        
        return {
            "timestamp": str(datetime.now()),
            "github_summary": {
                "total_repos": github_data.get("total_repos", 0),
                "active_repos": github_data.get("active_repos", 0),
                "languages": github_data.get("languages", {}),
                "patterns": github_data.get("patterns", [])
            },
            "agent_insights": {
                "full_analysis": result_str,
                "key_findings": self._extract_key_points(result_str)
            },
            "recommended_actions": self._extract_actions(result_str)
        }
    
    def _extract_key_points(self, text: str) -> List[str]:
        """Extract key points from the analysis"""
        lines = text.split('\n')
        key_points = []
        
        for line in lines:
            line = line.strip()
            if line and (
                line.startswith('-') or 
                line.startswith('•') or 
                any(keyword in line.lower() for keyword in ['pattern:', 'key:', 'important:', 'critical:'])
            ):
                key_points.append(line.lstrip('-•').strip())
        
        return key_points[:5]
    
    def _extract_actions(self, text: str) -> List[Dict]:
        """Extract actionable items from the strategist's output"""
        actions = []
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            line = line.strip()
            if any(word in line.lower() for word in ['action:', 'todo:', 'task:', 'do:', 'must:']):
                actions.append({
                    "action": line,
                    "priority": "high" if "critical" in line.lower() or "must" in line.lower() else "medium"
                })
        
        return actions[:3]