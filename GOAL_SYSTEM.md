# 🎯 Goals System Documentation

## Overview

The Goals System transforms Reflog into a comprehensive AI mentorship platform. It provides:

- **Life Goals**: Set and track major life objectives
- **Subgoals**: Break down goals into manageable steps
- **Tasks**: Actionable items for each subgoal
- **Milestones**: Celebrate achievements along the way
- **AI Guidance**: Multi-agent analysis and progress feedback


## Key Features

### 1. **Goal Creation with AI Analysis**

When you create a goal, the AI:
- Analyzes feasibility based on your GitHub activity
- Identifies psychological patterns
- Challenges assumptions
- Suggests concrete subgoals and tasks
- Provides obstacles and recommendations

**Goal Types:**
- `career` - Professional advancement
- `personal` - Self-improvement
- `financial` - Money goals
- `health` - Fitness/wellness
- `learning` - Skill acquisition
- `project` - Specific projects

**Priority Levels:**
- `critical` - Must-have, time-sensitive
- `high` - Important, near-term
- `medium` - Valuable, flexible timing
- `low` - Nice-to-have

### 2. **Subgoals and Tasks**

Goals are broken into:
- **Subgoals**: 3-5 major steps (sequential or parallel)
- **Tasks**: Specific actions under each subgoal

**Task Properties:**
- Status: `todo`, `in_progress`, `done`, `cancelled`
- Priority: `high`, `medium`, `low`
- Estimated/Actual hours
- Due dates

### 3. **Progress Tracking**

Log updates with:
- Progress percentage (0-100)
- Notes on what you did
- Obstacles encountered
- Wins achieved
- Current mood

**AI Feedback:**
- Analyzes progress rate
- Identifies if you're stalling
- Flags concerns
- Suggests next steps

### 4. **Milestones**

Set meaningful checkpoints:
- 30/60/90 day markers
- Key deliverables
- Celebration moments

### 5. **Weekly Review**

Get AI-powered weekly guidance:
- Priority recommendations
- Neglected goal alerts
- Focus suggestions
- Reprioritization advice

---

## API Endpoints

### Goals

```
POST   /goals/{username}                    # Create goal
GET    /goals/{username}                    # List goals
GET    /goals/{username}/{goal_id}          # Get goal details
PATCH  /goals/{username}/{goal_id}          # Update goal
GET    /goals/{username}/dashboard          # Goals dashboard
GET    /goals/{username}/weekly-review      # Weekly AI review
```

### Progress

```
POST   /goals/{username}/{goal_id}/progress              # Log progress
GET    /goals/{username}/{goal_id}/progress              # Progress history
```

### Subgoals

```
POST   /goals/{username}/{goal_id}/subgoals              # Add subgoal
PATCH  /goals/{username}/{goal_id}/subgoals/{sg_id}      # Update status
```

### Milestones

```
POST   /goals/{username}/{goal_id}/milestones/{ms_id}/achieve  # Mark achieved
```

---

## Usage Examples

### Create a Goal

```typescript
const response = await axios.post(`${API_URL}/goals/${username}`, {
  title: "Become Senior Developer",
  description: "Advance to senior role within 12 months...",
  goal_type: "career",
  priority: "high",
  target_date: "2025-10-30",
  success_criteria: [
    "Lead 2 major projects",
    "Mentor 3 junior developers",
    "Master system design",
    "Contribute to 5 open source projects"
  ]
})
```

### Log Progress

```typescript
await axios.post(`${API_URL}/goals/${username}/${goalId}/progress`, {
  progress: 35,
  notes: "Completed system design course, started leading project X",
  mood: "motivated",
  obstacles: "Time management with current workload",
  wins: "Team praised my design document"
})
```

### Get Weekly Review

```typescript
const review = await axios.get(`${API_URL}/goals/${username}/weekly-review`)
console.log(review.review) // AI guidance
console.log(review.needs_reprioritization) // Boolean
```

---

## AI Agent Behavior

### Goal Analysis

When creating a goal, agents provide:

**Analyst:**
- Feasibility assessment (1-10 score)
- Resource requirements
- Time estimates
- Success criteria evaluation

**Psychologist:**
- Real motivation vs. stated motivation
- Psychological obstacles
- Alignment with demonstrated behavior
- Mindset shift recommendations

**Contrarian:**
- Challenges goal validity
- Questions assumptions
- Identifies opportunity costs
- Asks uncomfortable questions

**Strategist:**
- Concrete subgoals (3-5)
- Tasks for each subgoal
- Milestones and deadlines
- Accountability plan
- Obstacle mitigation

### Progress Analysis

**Psychologist:**
- Progress rate assessment
- Obstacle pattern recognition
- Mood/energy sustainability
- Genuine progress vs. busywork
- Next focus areas
- Red flags for reconsideration

### Weekly Review

**Strategist:**
- Top priority recommendation
- Neglected goal identification
- Abandonment suggestions
- Focus consolidation
- Weekly time commitment
- Specific actions

---

## Best Practices

### 1. **Be Specific**

❌ **Bad:** "Get better at coding"
✅ **Good:** "Master React and TypeScript, build 3 production apps, contribute to 5 open source projects"

### 2. **Set Measurable Criteria**

Include numbers, deadlines, and observable outcomes:
- "Complete X by Y date"
- "Achieve Z metric"
- "Ship N features"

### 3. **Start with 1-3 Goals**

Don't overcommit. The AI will flag if you have too many active goals.

### 4. **Update Progress Weekly**

Regular updates keep the AI feedback relevant and maintain accountability.

### 5. **Trust the AI Challenges**

When the Contrarian agent questions your goal, take it seriously. It's designed to prevent wasted effort.

### 6. **Celebrate Milestones**

Mark milestones as achieved and add celebration notes. Momentum matters.

### 7. **Review and Adjust**

Goals can be paused or abandoned. The system rewards honesty over stubbornness.

---

## Integration with Existing Features

### Commitments

Daily commitments now can be linked to goal progress:
- Commitments should advance specific subgoals
- AI tracks if commitments align with stated goals

### Chat

Ask about goals in chat:
- "Should I pursue this goal?"
- "I'm stuck on goal X, what should I do?"
- "Which goal should I focus on this week?"

### Decisions

Log major decisions that affect goals:
- Career changes
- Skill pivots
- Life events

---

## Database Schema

```sql
-- Goals table
goals (
  id, user_id, title, description, goal_type, priority, 
  status, progress, target_date, success_criteria, 
  current_metrics, ai_analysis, ai_insights, obstacles_identified,
  created_at, updated_at, completed_at
)

-- Subgoals table
subgoals (
  id, goal_id, title, description, order, status, 
  progress, target_date, depends_on, 
  created_at, completed_at
)

-- Tasks table
tasks (
  id, subgoal_id, title, description, status, priority,
  estimated_hours, actual_hours, due_date,
  created_at, completed_at
)

-- Milestones table
milestones (
  id, goal_id, title, description, target_date,
  achieved, achieved_at, celebration_note
)

-- Progress logs table
goal_progress (
  id, goal_id, timestamp, progress, notes,
  mood, obstacles, wins, ai_feedback
)
```

---

## Troubleshooting

### "Failed to analyze goal"

The goal is created but AI analysis failed. You can:
1. Manually add subgoals
2. Try re-analyzing later
3. Continue without AI guidance

### "Too many active goals"

The AI will warn if you have >3 high-priority goals. Consider:
1. Lowering priority of some goals
2. Pausing goals temporarily
3. Focusing on fewer objectives

### Progress not updating

Make sure you're calling the progress endpoint with the correct goal ID and progress percentage.

### Subgoals not appearing

Check that the goal has completed AI analysis or manually add subgoals via the API.

---

## Future Enhancements

Potential additions:
- Goal templates (common goals with pre-filled criteria)
- Goal sharing/accountability partners
- Integration with calendar for time blocking
- Mobile notifications for milestone achievements
- Goal dependency graphs
- Team goals for collaborative projects

---

## Support

For issues or questions:
- Check API logs: `backend/sage.log`
- Review AI agent output in terminal
- Verify database migrations completed
- Test endpoints with `/docs` interactive API

---

**Remember:** The goal system is designed to be brutally honest. If the AI suggests abandoning a goal, seriously consider it. Better to pivot early than waste months on misaligned objectives.