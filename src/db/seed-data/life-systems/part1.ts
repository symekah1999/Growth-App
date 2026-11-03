import type { LifeSystem } from "./types";

// STOIC · HABITS · PRODUCTIVITY
export const SYSTEMS_1: LifeSystem[] = [
  // ---------------- STOIC ----------------
  {
    id: "dichotomy-of-control",
    title: "The Dichotomy of Control",
    origin: "Epictetus, Enchiridion",
    category: "stoic",
    summary:
      "Split every situation into what is up to you (your judgements, choices and effort) and what is not (other people, outcomes, the past). Pour all your energy into the first list and release the second.",
    steps: [
      "When something worries you, write two columns: 'In my control' and 'Not in my control'.",
      "Cross out everything in the second column and say: 'This is not mine to carry.'",
      "Choose one action from the first column and do it today.",
      "Judge your day by your effort and choices, not by outcomes you couldn't decide.",
    ],
    tryToday: "Pick your biggest worry and sort it into the two columns before lunch.",
  },
  {
    id: "evening-review",
    title: "The Evening Review",
    origin: "Seneca, On Anger (borrowed from Sextius)",
    category: "stoic",
    summary:
      "Each night, review your day like a fair judge: what did I do well, where did I fall short, what will I do better tomorrow? Small daily corrections compound into character.",
    steps: [
      "Before sleep, sit quietly for five minutes.",
      "Ask: What did I do well today? Where did I fall short? What did I leave undone?",
      "Write one specific correction for tomorrow.",
      "Forgive yourself and close the day — the goal is improvement, not self-punishment.",
    ],
    tryToday: "Answer the three questions in your journal tonight.",
    habit: { name: "Evening review (3 questions)", targetPerWeek: 7 },
  },
  {
    id: "premeditatio-malorum",
    title: "Premeditatio Malorum (Rehearse Setbacks)",
    origin: "Seneca, Letters to Lucilius",
    category: "stoic",
    summary:
      "Briefly imagine what could go wrong before an important day or project. You lose the shock of setbacks, plan your response in advance, and appreciate what you have.",
    steps: [
      "Before a big event, list three things that could go wrong.",
      "For each one, write how you would respond calmly.",
      "Prepare one safeguard for the most likely problem.",
      "Then let it go and act with confidence — you are ready.",
    ],
    tryToday: "Before your next important task, write the worst realistic outcome and your calm response.",
  },
  {
    id: "view-from-above",
    title: "The View From Above",
    origin: "Marcus Aurelius, Meditations",
    category: "stoic",
    summary:
      "Picture yourself from high above — your room, your city, the whole earth, the span of history. Problems shrink to their true size and petty worries lose their grip.",
    steps: [
      "Close your eyes and picture yourself where you sit.",
      "Slowly rise: see your building, Nairobi, Kenya, Africa, the whole planet.",
      "Remember how many people have lived and struggled before you.",
      "Come back down and ask: what really matters here?",
    ],
    tryToday: "Use it the next time someone irritates you, before you reply.",
  },
  {
    id: "memento-mori",
    title: "Memento Mori",
    origin: "Stoic and Christian tradition (Psalm 90:12; Marcus Aurelius)",
    category: "stoic",
    summary:
      "Remember that life is short. Not to be gloomy, but to stop wasting days on what doesn't matter and to love people while you can. 'So teach us to number our days, that we may apply our hearts unto wisdom.'",
    steps: [
      "Calculate roughly how many weeks you have lived.",
      "Each morning ask: if this were one of my last days, would I spend it this way?",
      "Remove one thing from today that fails that test.",
      "Tell someone you love them while you can.",
    ],
    tryToday: "Read Psalm 90:12 and cut one time-waster from today.",
  },
  {
    id: "voluntary-discomfort",
    title: "Voluntary Discomfort",
    origin: "Seneca, Letter 18; Musonius Rufus",
    category: "stoic",
    summary:
      "Regularly choose small hardships — a cold shower, a fast, a hard walk, a simple meal. You build toughness, lose fear of losing comfort, and become harder to break.",
    steps: [
      "Choose one discomfort per week: cold shower, skipping a meal, no phone for a day, a long walk.",
      "Do it calmly, noticing that you are fine.",
      "Reflect: 'Is this what I feared?'",
      "Increase gradually as you grow stronger.",
    ],
    tryToday: "End your shower with 30 seconds of cold water.",
    habit: { name: "One voluntary discomfort", targetPerWeek: 2 },
  },
  {
    id: "amor-fati",
    title: "Amor Fati (Love Your Fate)",
    origin: "Nietzsche's phrase for an old Stoic idea (Epictetus, Marcus Aurelius)",
    category: "stoic",
    summary:
      "Don't just accept what happens — use it. Treat every obstacle as material for growth. 'The impediment to action advances action. What stands in the way becomes the way.' (Marcus Aurelius)",
    steps: [
      "Name a setback you are facing.",
      "Ask: what can this teach me or train in me?",
      "Write one way this could become an advantage.",
      "Act on that advantage this week.",
    ],
    tryToday: "Turn today's biggest annoyance into a training exercise for patience.",
  },
  {
    id: "morning-preparation",
    title: "The Morning Preparation",
    origin: "Marcus Aurelius, Meditations 2.1",
    category: "stoic",
    summary:
      "Start the day expecting difficult people and setbacks, and decide in advance how you will act. You meet the day prepared instead of surprised.",
    steps: [
      "Before checking your phone, take two minutes.",
      "Say: 'Today I may meet ungrateful, rude or difficult people. I will not be harmed by them.'",
      "Pick the one virtue you will practise today (patience, courage, honesty, discipline).",
      "Review your top three tasks.",
    ],
    tryToday: "Choose one virtue for today and write it on your to-do list.",
    habit: { name: "Morning preparation (2 min)", targetPerWeek: 7 },
  },

  // ---------------- HABITS ----------------
  {
    id: "atomic-habits-laws",
    title: "The Four Laws of Behaviour Change",
    origin: "James Clear, Atomic Habits",
    category: "habits",
    summary:
      "To build a habit make it obvious, attractive, easy and satisfying. To break one, make it invisible, unattractive, difficult and unsatisfying.",
    steps: [
      "Obvious: put the cue where you'll see it (Bible on your pillow, running shoes by the door).",
      "Attractive: pair it with something you enjoy.",
      "Easy: shrink it until it takes under two minutes to start.",
      "Satisfying: track it — tick it off in Habits the moment you finish.",
    ],
    tryToday: "Take one habit and redesign it with all four laws.",
  },
  {
    id: "habit-stacking",
    title: "Habit Stacking",
    origin: "BJ Fogg (Tiny Habits) and James Clear",
    category: "habits",
    summary:
      "Attach a new habit to something you already do every day. The old habit becomes the trigger: 'After I [current habit], I will [new habit].'",
    steps: [
      "List things you do daily without fail (wake up, brush teeth, make tea, sit at your desk).",
      "Pick one as an anchor.",
      "Write: 'After I ___, I will ___.'",
      "Keep the new habit tiny for the first two weeks.",
    ],
    tryToday: "Write one habit stack, e.g. 'After I make my morning tea, I will read one chapter of Proverbs.'",
  },
  {
    id: "two-minute-rule",
    title: "The Two-Minute Rule",
    origin: "David Allen (Getting Things Done) and James Clear",
    category: "habits",
    summary:
      "Two rules: if a task takes under two minutes, do it now; and start any new habit with a version that takes two minutes or less. Starting is the hardest part, so make starting easy.",
    steps: [
      "Shrink each habit: 'read' becomes 'read one page', 'exercise' becomes 'put on gym clothes'.",
      "Do the two-minute version daily, even on bad days.",
      "Let it grow naturally once it's automatic.",
      "For small tasks under two minutes, do them immediately.",
    ],
    tryToday: "Clear every task on your list that takes under two minutes.",
  },
  {
    id: "never-miss-twice",
    title: "Never Miss Twice",
    origin: "James Clear",
    category: "habits",
    summary:
      "Missing once is an accident; missing twice is the start of a new habit. Perfection isn't required — fast recovery is.",
    steps: [
      "Accept that you will miss days.",
      "When you miss, make the very next day non-negotiable.",
      "On hard days, do the smallest version so the chain survives.",
      "Watch your Habits heatmap for two-day gaps and close them.",
    ],
    tryToday: "Check your Habits page: any habit you missed yesterday must happen today.",
  },
  {
    id: "identity-based-habits",
    title: "Identity-Based Habits",
    origin: "James Clear, Atomic Habits",
    category: "habits",
    summary:
      "Focus on who you want to become, not just what you want to achieve. Each action is a vote for that identity: 'I am a runner', 'I am a man of the Word', 'I am someone who saves'.",
    steps: [
      "Write the identity: 'I am the kind of person who…'",
      "List three small actions that person does daily.",
      "Each time you do one, say: 'That's a vote for who I'm becoming.'",
      "Add the identity statement to your Mantras.",
    ],
    tryToday: "Write one identity statement and add it to Mantras & Values.",
  },
  {
    id: "environment-design",
    title: "Environment Design",
    origin: "Behavioural science; James Clear, BJ Fogg",
    category: "habits",
    summary:
      "Willpower runs out; environment doesn't. Make good choices the easy default and bad choices hard to reach.",
    steps: [
      "Remove triggers for bad habits (delete apps, keep junk food out of the house).",
      "Put tools for good habits in plain sight.",
      "Give each space one job: desk for work, bed for sleep.",
      "Change who you spend time with if needed — people are environment too.",
    ],
    tryToday: "Move your phone charger out of your bedroom tonight.",
  },
  {
    id: "temptation-bundling",
    title: "Temptation Bundling",
    origin: "Katherine Milkman, Wharton",
    category: "habits",
    summary:
      "Only allow yourself something you love while doing something you should. Your favourite podcast only at the gym; your favourite coffee only while studying.",
    steps: [
      "List things you crave (shows, podcasts, treats).",
      "List things you avoid (exercise, study, chores).",
      "Pair one from each list and make a rule.",
      "Keep the rule strict — the treat only comes with the task.",
    ],
    tryToday: "Choose one podcast you'll only listen to while walking or training.",
  },
  {
    id: "implementation-intentions",
    title: "Implementation Intentions",
    origin: "Peter Gollwitzer, psychology research",
    category: "habits",
    summary:
      "People who decide exactly when and where they'll act are far more likely to follow through. Replace 'I'll exercise more' with 'I will train at 6 am at the gym on Monday, Wednesday and Friday.'",
    steps: [
      "Take a vague intention.",
      "Rewrite it as: 'I will [behaviour] at [time] in [place].'",
      "Add an if-then plan for obstacles: 'If it rains, I will do push-ups at home.'",
      "Put it in your calendar or To-Dos.",
    ],
    tryToday: "Rewrite one goal as 'I will ___ at ___ in ___.'",
  },

  // ---------------- PRODUCTIVITY ----------------
  {
    id: "eisenhower-matrix",
    title: "The Eisenhower Matrix",
    origin: "Attributed to Dwight D. Eisenhower; popularised by Stephen Covey",
    category: "productivity",
    summary:
      "Sort tasks by urgent vs important. Do important and urgent now, schedule important but not urgent, delegate urgent but unimportant, and delete the rest. Most growth lives in 'important, not urgent'.",
    steps: [
      "Draw four boxes: Do, Schedule, Delegate, Delete.",
      "Place every task in one box.",
      "Do the 'Do' box first.",
      "Block time this week for the 'Schedule' box — that's where your future is built.",
    ],
    tryToday: "Sort today's to-dos into the four boxes before you start working.",
  },
  {
    id: "eat-the-frog",
    title: "Eat the Frog",
    origin: "Brian Tracy, Eat That Frog!",
    category: "productivity",
    summary:
      "Do your hardest, most important task first thing, before anything else. Momentum builds, procrastination loses, and the rest of the day feels lighter.",
    steps: [
      "The night before, choose tomorrow's 'frog' — the task you most want to avoid.",
      "Do it first, before email or social media.",
      "Work on it until it's done or for a fixed block (60–90 minutes).",
      "Celebrate finishing it.",
    ],
    tryToday: "Name tomorrow's frog before you sleep tonight.",
    habit: { name: "Eat the frog first", targetPerWeek: 5 },
  },
  {
    id: "time-blocking",
    title: "Time Blocking",
    origin: "Cal Newport, Deep Work; used by many high performers",
    category: "productivity",
    summary:
      "Give every hour of your workday a job. A schedule protects your priorities from other people's demands and shows you what you can realistically do.",
    steps: [
      "Each morning (or the night before), block your day in 30–90 minute chunks.",
      "Put deep work in your best-energy hours.",
      "Batch small tasks (email, calls) into one or two blocks.",
      "When plans change, re-block — don't abandon the plan.",
    ],
    tryToday: "Block tomorrow on paper in 60-minute chunks.",
  },
  {
    id: "deep-work",
    title: "Deep Work Sessions",
    origin: "Cal Newport, Deep Work",
    category: "productivity",
    summary:
      "Focused, distraction-free work on hard things creates most of your value. One 90-minute deep session often beats a full day of shallow multitasking.",
    steps: [
      "Choose one cognitively demanding task.",
      "Phone in another room, notifications off, one tab open.",
      "Work for 60–90 minutes without switching.",
      "Log what you produced — build the muscle over weeks.",
    ],
    tryToday: "Do one 60-minute session with your phone in another room.",
    habit: { name: "Deep work session (60+ min)", targetPerWeek: 5 },
  },
  {
    id: "pomodoro",
    title: "The Pomodoro Technique",
    origin: "Francesco Cirillo",
    category: "productivity",
    summary:
      "Work in 25-minute sprints with 5-minute breaks; after four, take a longer break. Short sprints make starting easy and keep your energy fresh.",
    steps: [
      "Pick a task and set a 25-minute timer.",
      "Work only on that task until it rings.",
      "Take a 5-minute break away from screens.",
      "After four rounds, rest 15–30 minutes.",
    ],
    tryToday: "Do two Pomodoros on the task you've been delaying.",
  },
  {
    id: "ivy-lee-method",
    title: "The Ivy Lee Method",
    origin: "Ivy Lee, productivity consultant (1918)",
    category: "productivity",
    summary:
      "At the end of each day write the six most important tasks for tomorrow in order. Tomorrow, work on the first until it's done, then the second. Simple, and decades old for a reason.",
    steps: [
      "At day's end, write six tasks for tomorrow.",
      "Rank them by true importance.",
      "Tomorrow, work through them in order — no skipping.",
      "Move unfinished tasks to the next day's list.",
    ],
    tryToday: "Write tomorrow's six tasks in order before you stop work today.",
  },
  {
    id: "weekly-review",
    title: "The Weekly Review",
    origin: "David Allen, Getting Things Done",
    category: "productivity",
    summary:
      "Once a week, step back: clear your inboxes, review goals and commitments, and plan the coming week. It keeps you steering instead of drifting.",
    steps: [
      "Pick a fixed time (e.g. Sunday evening).",
      "Clear loose notes, messages and to-dos.",
      "Review your Goals and Progress pages: what moved, what stalled?",
      "Choose the three big outcomes for next week.",
    ],
    tryToday: "Put a recurring weekly review in your calendar.",
    habit: { name: "Weekly review", targetPerWeek: 1 },
  },
  {
    id: "pareto",
    title: "The 80/20 Principle",
    origin: "Vilfredo Pareto; Joseph Juran; Richard Koch",
    category: "productivity",
    summary:
      "A small share of your efforts produces most of your results. Find the vital few activities, people and habits that matter most — and do more of them.",
    steps: [
      "List your activities in an area (work, money, health).",
      "Mark the 20% that produce most of the results.",
      "Do more of those; cut or reduce the rest.",
      "Repeat every quarter.",
    ],
    tryToday: "Find the one task this week that would make everything else easier.",
  },
];
