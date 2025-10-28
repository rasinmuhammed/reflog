from crewai import Task, Crew, Process
from agents import analyst, psychologist, strategist, contrarian
from typing import Dict, List
import json
from datetime import datetime

class SageMentorCrew:
    def __init__(self):
        self.analyst = analyst
        self.psychologist = psychologist
        self.strategist = strategist
        self.contrarian = contrarian
    
    def analyze_developer(self, github_data: Dict, checkin_history: List[Dict] = None) -> Dict:
        """
        Main analysis flow: All agents deliberate on the developer's situation
        """
        
        # Prepare context
        context = self._prepare_context(github_data, checkin_history)
        
        # Task 1: Analyst examines the data
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
        
        # Task 2: Psychologist interprets patterns
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
        
        # Task 3: Strategist creates action plan
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
        
        # Create and run the crew
        crew = Crew(
            agents=[self.analyst, self.psychologist, self.strategist],
            tasks=[analysis_task, psychology_task, strategy_task],
            process=Process.sequential,
            verbose=True
        )
        
        result = crew.kickoff()
        
        # Parse and structure the output
        return self._structure_output(result, github_data)
    
    def quick_checkin_analysis(self, checkin_data: Dict, user_history: Dict) -> Dict:
        """
        Quick analysis for daily check-ins
        """
        
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
        """
        Review whether user followed through on morning commitment
        """
        
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
        # Simple extraction - in production, use better NLP
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
        
        return key_points[:5]  # Top 5 points
    
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
        
        return actions[:3]  # Top 3 actions


