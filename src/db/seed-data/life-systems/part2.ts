import type { LifeSystem } from "./types";

// GOALS · MINDSET · DECISIONS · LEARNING
export const SYSTEMS_2: LifeSystem[] = [
  // ---------------- GOALS ----------------
  {
    id: "woop",
    title: "WOOP (Wish, Outcome, Obstacle, Plan)",
    origin: "Gabriele Oettingen, Rethinking Positive Thinking",
    category: "goals",
    summary:
      "Positive dreaming alone can drain motivation. WOOP pairs the dream with an honest look at the inner obstacle and an if-then plan, which research shows improves follow-through.",
    steps: [
      "Wish: name a goal that is challenging but possible.",
      "Outcome: picture the best result and how it would feel.",
      "Obstacle: name the main thing inside you that could stop you.",
      "Plan: 'If [obstacle], then I will [action].'",
    ],
    tryToday: "WOOP one goal from your Goals page and add the plan as a milestone.",
  },
  {
    id: "smart-goals",
    title: "SMART Goals",
    origin: "George T. Doran (1981)",
    category: "goals",
    summary:
      "Make goals Specific, Measurable, Achievable, Relevant and Time-bound. 'Save more' becomes 'Save KES 100,000 by 30 June by saving KES 12,500 a month.'",
    steps: [
      "Write the goal as it is now.",
      "Make it specific and measurable (a number).",
      "Check it's realistic and matters to you.",
      "Give it a deadline in the Goals page so pacing can track it.",
    ],
    tryToday: "Rewrite one vague goal as a SMART goal with a deadline.",
  },
  {
    id: "okrs",
    title: "Objectives & Key Results (OKRs)",
    origin: "Andy Grove (Intel); John Doerr, Measure What Matters",
    category: "goals",
    summary:
      "An Objective is the inspiring direction; Key Results are 2–4 measurable signs you got there. Set them per quarter and score yourself honestly.",
    steps: [
      "Write one objective for this quarter (e.g. 'Become financially stable').",
      "Add 2–4 key results with numbers (e.g. 'Emergency fund reaches KES 60,000').",
      "Turn each key result into a milestone with a due date.",
      "Score each result 0–1 at quarter's end; 0.7 is a strong stretch.",
    ],
    tryToday: "Draft one objective and three key results for the next 90 days.",
  },
  {
    id: "backward-planning",
    title: "Backward Planning",
    origin: "Project planning; used by athletes and coaches",
    category: "goals",
    summary:
      "Start from the finished goal and work backwards to today: what must be true a month before, a month before that… until you reach the first step you can take this week.",
    steps: [
      "Write the end result and its date.",
      "Ask: what must be done one month before? And before that?",
      "Keep going back until you reach this week.",
      "Add the steps as milestones with due dates.",
    ],
    tryToday: "Map one goal backwards to a step you can do this week.",
  },
  {
    id: "systems-over-goals",
    title: "Systems Over Goals",
    origin: "James Clear, Atomic Habits",
    category: "goals",
    summary:
      "Winners and losers often have the same goals. The difference is the system — the daily process. Set the goal for direction, then fall in love with the process.",
    steps: [
      "For each goal, ask: what daily or weekly action would make this inevitable?",
      "Turn that action into a habit.",
      "Measure the process (sessions done), not only the result.",
      "Review results monthly; review the process daily.",
    ],
    tryToday: "For your top goal, create one supporting habit in Habits.",
  },
  {
    id: "ten-year-vision",
    title: "The 10-Year Vision, 1-Year Goals, 90-Day Focus",
    origin: "Long-range planning used by leaders and entrepreneurs",
    category: "goals",
    summary:
      "Write a vivid picture of your life in 10 years. Choose 3–5 one-year goals that move toward it. Then pick only what matters in the next 90 days.",
    steps: [
      "Describe your life in 10 years: faith, family, health, work, money, impact.",
      "Pick 3–5 one-year goals that move toward that picture.",
      "Choose 1–3 priorities for the next 90 days.",
      "Re-read the vision every month.",
    ],
    tryToday: "Write one page describing your life in 10 years in your journal.",
  },

  // ---------------- MINDSET ----------------
  {
    id: "growth-mindset",
    title: "Growth Mindset",
    origin: "Carol Dweck, Mindset",
    category: "mindset",
    summary:
      "Believing abilities can grow through effort leads people to embrace challenges, learn from criticism and persist after failure. Add 'yet': 'I can't do this… yet.'",
    steps: [
      "Notice fixed-mindset thoughts ('I'm just not good at this').",
      "Add 'yet' to them.",
      "Praise effort and strategy, in yourself and others, not just talent.",
      "Treat feedback as information, not a verdict.",
    ],
    tryToday: "Catch one 'I can't' today and add 'yet'.",
  },
  {
    id: "grit",
    title: "Grit: Passion + Perseverance",
    origin: "Angela Duckworth, Grit",
    category: "mindset",
    summary:
      "Long-term success often depends less on talent than on sticking with a meaningful goal for years. Grit grows through interest, deliberate practice, purpose and hope.",
    steps: [
      "Choose one top-level goal that gives your life direction.",
      "Practise deliberately: work at the edge of your ability.",
      "Connect the work to a purpose beyond yourself.",
      "After setbacks, remind yourself of past comebacks.",
    ],
    tryToday: "Write why your biggest goal matters to someone other than you.",
  },
  {
    id: "cbt-reframe",
    title: "Thought Reframing (Catch, Check, Change)",
    origin: "Cognitive Behavioural Therapy (Aaron Beck)",
    category: "mindset",
    summary:
      "Your feelings follow your interpretations. Catch an unhelpful thought, check it against the evidence, and change it to something more accurate and useful.",
    steps: [
      "Catch: write down the thought exactly ('I always fail').",
      "Check: what is the evidence for and against it?",
      "Change: write a more balanced version ('I failed this time; I've succeeded before').",
      "Notice how the feeling shifts.",
    ],
    tryToday: "Run one negative thought through Catch, Check, Change in your journal.",
  },
  {
    id: "gratitude-three",
    title: "Three Good Things",
    origin: "Martin Seligman, positive psychology research",
    category: "mindset",
    summary:
      "Each night write three things that went well and why. Studies have linked this simple practice to higher happiness and lower depressive symptoms over time.",
    steps: [
      "Before bed, write three good things from today.",
      "For each, write why it happened.",
      "Be specific ('My colleague helped me finish the report').",
      "Do it for at least two weeks before judging.",
    ],
    tryToday: "Write three good things in your journal tonight.",
    habit: { name: "Three good things", targetPerWeek: 7 },
  },
  {
    id: "extreme-ownership",
    title: "Extreme Ownership",
    origin: "Jocko Willink & Leif Babin, Extreme Ownership",
    category: "mindset",
    summary:
      "Take full responsibility for everything in your world, including the mistakes of others you could have influenced. Blame gives away your power; ownership takes it back.",
    steps: [
      "When something goes wrong, ask first: what could I have done differently?",
      "Say it out loud — own it without excuses.",
      "Make a plan to fix it.",
      "Give credit to others when things go right.",
    ],
    tryToday: "Take ownership of one problem you've been blaming on someone else.",
  },
  {
    id: "box-breathing",
    title: "Box Breathing",
    origin: "Used in military and first-responder training (popularised by Mark Divine)",
    category: "mindset",
    summary:
      "Breathe in 4 seconds, hold 4, out 4, hold 4. A few rounds calm your nervous system so you can think clearly under pressure.",
    steps: [
      "Sit upright and breathe in through your nose for 4 seconds.",
      "Hold for 4 seconds.",
      "Breathe out slowly for 4 seconds.",
      "Hold for 4 seconds. Repeat 4–6 rounds.",
    ],
    tryToday: "Do four rounds before your next stressful conversation.",
  },

  // ---------------- DECISIONS ----------------
  {
    id: "inversion",
    title: "Inversion",
    origin: "Carl Jacobi; championed by Charlie Munger",
    category: "decisions",
    summary:
      "Instead of asking how to succeed, ask how you would guarantee failure — then avoid those things. It is often easier to see what to avoid than what to do.",
    steps: [
      "State the goal (e.g. a happy marriage, financial freedom).",
      "Ask: what would guarantee the opposite?",
      "List those behaviours honestly.",
      "Make rules to avoid each one.",
    ],
    tryToday: "Invert one goal: list five ways to ruin it, and check you're not doing any.",
  },
  {
    id: "regret-minimization",
    title: "The Regret Minimization Framework",
    origin: "Jeff Bezos",
    category: "decisions",
    summary:
      "For big life decisions, imagine yourself at 80 looking back. Which choice would you regret not making? Most regrets come from what we didn't try.",
    steps: [
      "Picture yourself at 80.",
      "Look back at this decision.",
      "Ask which option you'd regret NOT taking.",
      "Weigh that alongside the practical facts.",
    ],
    tryToday: "Apply it to one decision you've been postponing.",
  },
  {
    id: "ten-ten-ten",
    title: "10-10-10",
    origin: "Suzy Welch",
    category: "decisions",
    summary:
      "How will I feel about this decision in 10 minutes, 10 months and 10 years? It stops short-term emotion from hijacking long-term good.",
    steps: [
      "Name the decision.",
      "Ask how you'll feel in 10 minutes.",
      "Then in 10 months.",
      "Then in 10 years — and let that answer weigh most.",
    ],
    tryToday: "Use it on your next tempting purchase or argument.",
  },
  {
    id: "pre-mortem",
    title: "The Pre-Mortem",
    origin: "Gary Klein, psychologist",
    category: "decisions",
    summary:
      "Before starting a project, imagine it has failed badly. Write the story of why. You'll spot risks your optimism was hiding.",
    steps: [
      "Imagine it's a year from now and the plan failed.",
      "Write every reason it might have failed.",
      "Rank the most likely ones.",
      "Add a safeguard for each to your plan.",
    ],
    tryToday: "Do a five-minute pre-mortem on your biggest current goal.",
  },
  {
    id: "second-order-thinking",
    title: "Second-Order Thinking",
    origin: "Howard Marks, The Most Important Thing",
    category: "decisions",
    summary:
      "First-order thinking asks 'what happens next?' Second-order asks 'and then what?' Many choices feel good now but cost later — or hurt now but pay off later.",
    steps: [
      "Write the immediate result of a decision.",
      "Ask 'and then what?' three times.",
      "Consider effects on other people too.",
      "Choose based on the full chain, not just step one.",
    ],
    tryToday: "Ask 'and then what?' three times about one decision today.",
  },
  {
    id: "one-way-doors",
    title: "One-Way vs Two-Way Doors",
    origin: "Jeff Bezos, Amazon shareholder letters",
    category: "decisions",
    summary:
      "Most decisions are reversible (two-way doors): make them fast and adjust. A few are hard to reverse (one-way doors): slow down and think carefully.",
    steps: [
      "Ask: can I easily undo this?",
      "If yes, decide quickly and learn from the result.",
      "If no, gather advice, sleep on it, pray about it.",
      "Don't treat small decisions like big ones.",
    ],
    tryToday: "Make one reversible decision you've been overthinking — now.",
  },
  {
    id: "circle-of-competence",
    title: "Circle of Competence",
    origin: "Warren Buffett and Charlie Munger",
    category: "decisions",
    summary:
      "Know what you truly understand and stay inside it for big bets. Grow the circle slowly by learning — but be honest about where its edge is.",
    steps: [
      "List areas where you have real knowledge and experience.",
      "Before a big decision, ask: is this inside my circle?",
      "If not, learn more or get advice from someone whose circle it is.",
      "Expand the circle deliberately each year.",
    ],
    tryToday: "Write your circle of competence in one paragraph.",
  },

  // ---------------- LEARNING ----------------
  {
    id: "feynman-technique",
    title: "The Feynman Technique",
    origin: "Inspired by physicist Richard Feynman",
    category: "learning",
    summary:
      "If you can't explain it simply, you don't understand it yet. Teach the idea to an imaginary 12-year-old, find the gaps, and go back to the source.",
    steps: [
      "Write the concept's name at the top of a page.",
      "Explain it in plain words as if teaching a child.",
      "Where you get stuck, return to the material.",
      "Simplify and use an analogy.",
    ],
    tryToday: "Explain one topic from your ACCA studies on one page in plain language.",
  },
  {
    id: "spaced-repetition",
    title: "Spaced Repetition",
    origin: "Hermann Ebbinghaus, the forgetting curve",
    category: "learning",
    summary:
      "We forget quickly unless we review. Reviewing at growing intervals (1 day, 3 days, 1 week, 1 month) locks knowledge into long-term memory with less total effort.",
    steps: [
      "After learning something, review it the next day.",
      "Then after 3 days, a week, and a month.",
      "Use flashcards (paper or an app like Anki).",
      "Review a little every day rather than cramming.",
    ],
    tryToday: "Make ten flashcards from something you learned this week.",
  },
  {
    id: "active-recall",
    title: "Active Recall",
    origin: "Learning science (the 'testing effect')",
    category: "learning",
    summary:
      "Testing yourself beats re-reading. Close the book and try to recall what you learned; the effort of retrieving is what builds memory.",
    steps: [
      "Read a section once.",
      "Close it and write everything you remember.",
      "Check what you missed.",
      "Repeat with the gaps.",
    ],
    tryToday: "After your next study session, write a summary from memory before checking.",
  },
  {
    id: "deliberate-practice",
    title: "Deliberate Practice",
    origin: "K. Anders Ericsson, Peak",
    category: "learning",
    summary:
      "Experts don't just repeat; they practise at the edge of their ability with clear goals, focus and fast feedback.",
    steps: [
      "Pick one specific sub-skill to improve.",
      "Practise just beyond your comfort zone.",
      "Get immediate feedback (a coach, a test, a recording).",
      "Repeat, adjusting each round.",
    ],
    tryToday: "Practise your weakest sub-skill for 30 focused minutes.",
  },
  {
    id: "read-daily",
    title: "Read Every Day",
    origin: "Practice of lifelong learners, e.g. Warren Buffett and Charlie Munger",
    category: "learning",
    summary:
      "Reading compounds like interest. Twenty pages a day is roughly a book every two weeks — over 25 books a year.",
    steps: [
      "Set a daily page target (start with 10–20).",
      "Read at the same time each day (morning or before bed).",
      "Keep a book with you for waiting time.",
      "Write one lesson from each book in Lessons.",
    ],
    tryToday: "Read 20 pages before you sleep.",
    habit: { name: "Read 20 pages", targetPerWeek: 7 },
  },
  {
    id: "learn-teach",
    title: "Learn, Then Teach",
    origin: "The 'protégé effect' in learning research",
    category: "learning",
    summary:
      "People learn more deeply when they expect to teach. Share what you learn — a post, a talk, explaining it to a friend.",
    steps: [
      "Learn something new this week.",
      "Explain it to a friend, colleague or online.",
      "Answer their questions honestly — gaps show what to study next.",
      "Repeat weekly.",
    ],
    tryToday: "Teach one thing you learned this week to someone today.",
  },
];
