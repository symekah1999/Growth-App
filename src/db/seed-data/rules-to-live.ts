/**
 * "Life Hacks, Growth Challenges & Rules to Live By": Shadrack's notebook, in full.
 * Part 1: 14 life hacks. Part 2: 7 growth challenges. Part 3: 27 sentences. Part 4: quick reference.
 * Each item keeps the notebook text, the "put it into practice" box, and adds a reflection question.
 */

export type Hack = {
  n: number;
  key: string;
  title: string;
  area: string;
  oneLine: string;
  body: string[];
  practice: string;
  reflect: string;
  table?: { head: string[]; rows: string[][] };
  tool?: "sleep" | "budget" | "decide" | "plan333" | "razor";
  trial?: string; // key of a trackable challenge this hack can be run as
};

export const HACKS: Hack[] = [
  {
    n: 1, key: "one-percent", title: "Adopt the 1% Mindset", area: "Growth", oneLine: "Improve 1% a day; it compounds.",
    body: ["Aim to improve by just 1% each day. Small, incremental improvements add up over time."],
    practice: "Pick one skill and ask each evening: what did I do 1% better today? Small daily gains compound: 1.01^365 is about 37.8, roughly 38 times better over a year in theory.",
    reflect: "What did I do 1% better today than yesterday?",
  },
  {
    n: 2, key: "90-90-1", title: "The 90-90-1 Rule", area: "Focus", oneLine: "First 90 min on your top goal, for 90 days.",
    body: ["Spend the first 90 minutes of your day on your most important goal, for 90 days. This creates momentum and progress."],
    practice: "Decide the night before what the 90 minutes will be spent on. Keep the phone and email closed until it is done. Mark a 90-day tracker and tick off each completed day.",
    reflect: "Did my first 90 minutes today go to the one goal that matters most?",
    trial: "90-90-1",
  },
  {
    n: 3, key: "888", title: "The 8 + 8 + 8 Rule", area: "Balance", oneLine: "Work 8, sleep 8, 8 for the 3 Fs, 3 Hs, 3 Ss.",
    body: [
      "Divide your day into 8 + 8 + 8 hours to keep a good \"balance sheet\" of your life:",
      "8 hours of honest hard work. 8 hours of good sleep. 8 hours spent on the 3 Fs, 3 Hs and 3 Ss.",
    ],
    table: { head: ["3 Fs", "3 Hs", "3 Ss"], rows: [["Family", "Health", "Soul"], ["Friends", "Hygiene", "Service"], ["Faith", "Hobby", "Smile"]] },
    practice: "Audit one ordinary weekday. Where does the third block of 8 actually go? Assign at least one activity to each of the 3 Fs, 3 Hs and 3 Ss this week.",
    reflect: "Which of the nine (family, friends, faith, health, hygiene, hobby, soul, service, smile) did I starve this week?",
  },
  {
    n: 4, key: "321", title: "The 3-2-1 Rule for Better Sleep", area: "Sleep", oneLine: "No food 3h, no drinks 2h, no screens 1h before bed.",
    body: ["3 hours before bed: no food. 2 hours before bed: no drinks. 1 hour before bed: no screens."],
    practice: "Work backwards from your bedtime. If you sleep at 10:30 pm: last meal by 7:30, last drink by 8:30, screens off by 9:30.",
    reflect: "Which of the three cut-offs did I break last night, and how did I sleep?",
    tool: "sleep",
  },
  {
    n: 5, key: "rule-100", title: "The Rule of 100", area: "Skill", oneLine: "100 hrs/yr (~15 min/day) beats 95% of people.",
    body: ["If you spend 100 hours a year on any discipline, only about 15 minutes a day, you'll be better than 95% of the world in that discipline.", "Consistency is everything."],
    practice: "Choose one discipline and book a fixed 15-minute daily slot. 15 min × 365 days ≈ 91 hours, so add a few longer weekend sessions to clear 100.",
    reflect: "Which one discipline is getting my 100 hours this year?",
  },
  {
    n: 6, key: "503020", title: "The 50/30/20 Budget Rule", area: "Money", oneLine: "Needs 50, wants 30, savings 20.",
    body: ["Allocate your income into three buckets."],
    table: {
      head: ["50%: Needs", "30%: Wants", "20%: Savings"],
      rows: [["Food", "Travel", "Emergency fund"], ["Housing", "Fashion / gear", "Debt payments"], ["Insurance", "Entertainment", "Investments"], ["Basic utilities", "", "Retirement"], ["Transportation", "", ""]],
    },
    practice: "When income arrives, move the 20% to savings first, then live on the rest. Example on KES 60,000: 30,000 needs, 18,000 wants, 12,000 savings.",
    reflect: "Did I pay myself the 20% first this month, before anything else?",
    tool: "budget",
  },
  {
    n: 7, key: "101010", title: "The 10/10/10 Rule", area: "Decisions", oneLine: "How will I feel in 10 min, 10 months, 10 years?",
    body: ["Consider how you'll feel about a decision in 10 minutes, 10 months and 10 years. It gives perspective and leads to better decisions."],
    practice: "Before a big or emotional choice, write the three answers down. If the 10-year answer is \"won't matter\", let it go; if it is \"will matter a lot\", give it more time.",
    reflect: "What decision am I carrying right now, and what does the 10-year me say about it?",
    tool: "decide",
  },
  {
    n: 8, key: "5-second", title: "The 5-Second Rule (Mel Robbins)", area: "Action", oneLine: "Count 5-4-3-2-1 and move.",
    body: ["When you have an impulse to act on a goal, count 5-4-3-2-1 and move physically towards it. This interrupts self-doubt and gets you into action."],
    practice: "Use it for the moments you usually stall: getting out of bed, starting a workout, sending an awkward message. On \"1\", move.",
    reflect: "Where did I stall today when a 5-4-3-2-1 would have moved me?",
  },
  {
    n: 9, key: "333", title: "The 3-3-3 Method", area: "Planning", oneLine: "3h deep work, 3 short tasks, 3 maintenance tasks.",
    body: [
      "Structure your day around three blocks:",
      "3 hours of deep work on your most important project, with clearly defined goals for what to finish. 3 shorter tasks: a few minutes each, such as meetings and calls. 3 maintenance tasks: such as cleaning, emails, exercise and journaling.",
    ],
    practice: "Each morning, write three lines: Deep work: ___ / Short tasks: ___ ___ ___ / Maintenance: ___ ___ ___. Do the deep work first.",
    reflect: "Did the deep-work block happen first, or did the small tasks eat it?",
    tool: "plan333",
  },
  {
    n: 10, key: "todont", title: "Build a To-Don't List", area: "Focus", oneLine: "Name your time-wasters and avoid them.",
    body: ["Identify the activities that waste your time or distract you from your goals, and consciously avoid them."],
    practice: "List your top 5 time-wasters (e.g. scrolling in bed, opening email first thing). Keep the list somewhere you see it daily, next to your to-do list.",
    reflect: "Which time-waster cost me the most this week?",
  },
  {
    n: 11, key: "mono", title: "Embrace Mono-Tasking (Deep Work)", area: "Focus", oneLine: "One task at a time, full attention.",
    body: ["Forget multitasking. Focus on one task at a time and give it your full attention."],
    practice: "Work in single-task blocks of 25 to 50 minutes: one window open, notifications off. Write any stray thoughts on paper and come back to them later.",
    reflect: "How many true single-task blocks did I do today?",
  },
  {
    n: 12, key: "zeigarnik", title: "Leverage the Zeigarnik Effect", area: "Starting", oneLine: "Start for a few minutes; momentum follows.",
    body: ["Start a task, even if only for a few minutes. Once you've begun, your brain will want to complete it."],
    practice: "When procrastinating, commit to just 2 to 5 minutes: open the file, write the first line. Unfinished tasks keep pulling you back.",
    reflect: "What have I been avoiding that I could start for just two minutes right now?",
  },
  {
    n: 13, key: "razor", title: "The Everyday Razor", area: "Habits", oneLine: "Weekly to daily = 7x output.",
    body: ["If you go from doing a task weekly to daily, you achieve 7 years of output in 1 year.", "If you also apply 1% compound improvement each time, you achieve about 54 years of output in 1 year."],
    practice: "Find one weekly habit (reading, coding, exercise) and turn it into a smaller daily one. The \"54 years\" figure is an illustration of compounding rather than an exact calculation; the point is that frequency plus small improvements stacks up fast.",
    reflect: "Which weekly habit could become a smaller daily one?",
    tool: "razor",
  },
  {
    n: 14, key: "30-for-30", title: "The 30-for-30 Challenge", area: "Habits", oneLine: "30 min/day for 30 days = 900 minutes.",
    body: [
      "Do one thing you want to improve at for 30 minutes a day, every day, for 30 days straight.",
      "Thirty days of consistent effort can make a significant impact on your life. Thirty minutes a day is short enough to accept the challenge mentally, but long enough to make a real difference.",
      "30 days × 30 minutes = 900 minutes of focused, accumulated effort. Be prepared to be shocked: the results can be life-changing.",
    ],
    practice: "Pick one skill, fix a time slot, and mark a 30-box grid. Missing a day restarts the count, which keeps you honest.",
    reflect: "What would 900 focused minutes on one skill change for me?",
    trial: "30-for-30",
  },
];

export type Trial = {
  key: string;
  title: string;
  days: number;
  unit: "day" | "week";
  oneLine: string;
  body: string[];
  practice: string;
  reflect: string;
  focusLabel?: string; // ask for a focus when starting (e.g. which skill)
  fromHack?: boolean;
};

/** Part 2 (plus the two hacks that are really challenges), as trackable experiments. */
export const TRIALS: Trial[] = [
  {
    key: "no-complaint", title: "21-Day No-Complaint Experiment", days: 21, unit: "day", oneLine: "21 days, no complaining or gossip.",
    body: ["Don't complain, criticise or gossip for 21 consecutive days. Every time you slip, you start over."],
    practice: "Wear a band or ring and switch wrists each time you slip, so you notice the slip. Replace each complaint with a request or a solution.",
    reflect: "What did I almost complain about today, and what request or solution did I offer instead?",
  },
  {
    key: "minimalism", title: "30-Day Minimalism Game", days: 30, unit: "day", oneLine: "Day n = remove n items; 465 in 30 days.",
    body: ["Proposed by The Minimalists: get rid of 1 item on day 1, 2 items on day 2, and so on. It leads to decluttering and a simpler life."],
    practice: "By day 30 you will have let go of 465 items (1 + 2 + … + 30). Start with clothes, papers and old electronics. Donate, sell or recycle.",
    reflect: "What am I holding on to that I don't use, and why?",
  },
  {
    key: "75-hard", title: "75 Hard", days: 75, unit: "day", oneLine: "Diet, water, 10 pages, photo, 2 workouts.",
    body: [
      "A 75-day challenge to develop mental toughness. Every day you must:",
      "Follow a strict diet (no alcohol, no cheat meals). Drink a gallon of water (about 3.8 litres). Read 10 pages of a non-fiction or self-help book. Take a progress picture. Do two 45-minute workouts, one of them outside.",
    ],
    practice: "Missing any rule on any day means starting again from day 1. Plan your two workouts and reading time the evening before.",
    reflect: "Which of the five rules was hardest today, and what made me keep it?",
  },
  {
    key: "tech-free", title: "Tech-Free Saturdays", days: 84, unit: "week", oneLine: "One screen-free day each week.",
    body: ["Take a \"screen sabbatical\" one day every week and avoid digital devices. The goal is to reduce screen time, unplug from the constant flow of digital information and reconnect with the physical world around you."],
    practice: "Tell people the day before. Plan offline activities: a walk, a physical book, cooking, visiting friends. If going all day is too much, start with a half day.",
    reflect: "What did I notice about myself on the screen-free day?",
  },
  {
    key: "52-week", title: "52-Week Money Challenge", days: 364, unit: "week", oneLine: "KES 100 more each week: KES 137,800 in a year.",
    body: [
      "Save $1 in week 1, $2 in week 2, and so on. By the end of the year you'll have saved $1,378.",
      "Double it: start with $2 in week 1, $4 in week 2, $6 in week 3, and so on up to $104 in week 52. You'll save $2,756.",
      "Shilling version: KES 100 in week 1 rising by KES 100 each week (KES 5,200 in week 52) gives KES 137,800.",
    ],
    practice: "Tip: run it in reverse, with big amounts early, when motivation is highest.",
    reflect: "Did this week's amount go in before I spent on wants?",
  },
  {
    key: "charger", title: "3-Day Phone Charger Challenge", days: 3, unit: "day", oneLine: "Charge the phone outside the bedroom.",
    body: [
      "Move your phone's charger outside your bedroom and see the knock-on benefits across your whole day. Your morning alarm makes you get out of bed, so you're less likely to hit snooze.",
      "You can easily reclaim about 10 minutes per day: over 60 hours per year.",
    ],
    practice: "Buy a cheap analogue alarm if you need one. Charge the phone in another room. Notice the change in your sleep and mornings after 3 days.",
    reflect: "How did my sleep and first hour change without the phone beside me?",
  },
  {
    key: "morning-pages", title: "Morning Pages", days: 30, unit: "day", oneLine: "Three handwritten pages every morning.",
    body: ["Write three pages of stream-of-consciousness thoughts every morning. You'll declutter your thinking and generate creative ideas."],
    practice: "Write by hand, straight after waking. Don't edit or re-read: just keep the pen moving until you have filled three pages.",
    reflect: "What kept coming up in my pages this week?",
  },
  {
    key: "90-90-1", title: "90-90-1 Rule", days: 90, unit: "day", oneLine: "First 90 minutes on the top goal, for 90 days.", fromHack: true,
    body: ["Spend the first 90 minutes of your day on your most important goal, for 90 days."],
    practice: "Decide the night before what the 90 minutes will be spent on. Keep the phone and email closed until it is done.",
    reflect: "Did the first 90 minutes go to the goal today?",
    focusLabel: "Your most important goal",
  },
  {
    key: "30-for-30", title: "30-for-30", days: 30, unit: "day", oneLine: "30 minutes a day, 30 days straight.", fromHack: true,
    body: ["Do one thing you want to improve at for 30 minutes a day, every day, for 30 days straight. 900 minutes of focused effort."],
    practice: "Pick one skill, fix a time slot. Missing a day restarts the count, which keeps you honest.",
    reflect: "What got 1% better in my skill today?",
    focusLabel: "The skill",
  },
];

export type Sentence = { n: number; text: string; theme: string; act: string };

/** Part 3: 27 sentences for your 20s and 30s, each with a small way to live it today. */
export const SENTENCES: Sentence[] = [
  { n: 1, theme: "Execution", text: "Ideas mean nothing. Zero. Zilch. Execution is the only thing that matters. It's not what you thought about doing; it's about what you did.", act: "Ship one thing today, however small, that has only lived in your head." },
  { n: 2, theme: "Discipline", text: "Do not watch porn. It kills your energy. It numbs your ability to feel. It's a life killer.", act: "Close the door before it opens: phone out of the bedroom, filters on, a plan for the weak hour." },
  { n: 3, theme: "Boundaries", text: "Never let anyone get comfortable disrespecting you.", act: "Name one pattern you have tolerated, and say it calmly the next time it happens." },
  { n: 4, theme: "Time", text: "Be selfish with your time. A lot of people don't deserve it.", act: "Protect one block today that nobody else gets." },
  { n: 5, theme: "Motivation", text: "Share your progress, not your goals, and you will always be motivated.", act: "Talk about what you finished, not what you plan to do." },
  { n: 6, theme: "Mindset", text: "Every second you spend comparing your life to someone else's is a second spent wasting yours. So stop comparing, and create your own definition of success instead.", act: "Write one line: success for me this year means ___." },
  { n: 7, theme: "Attitude", text: "Smile often. Smile so much that others think you exist in a world of optimism and positivity, because you do.", act: "Greet the first five people you meet today with a real smile." },
  { n: 8, theme: "Wealth", text: "You grow rich when you seek new experiences, not material things.", act: "Do one thing today you have never done: a new route, dish, conversation or place." },
  { n: 9, theme: "Boundaries", text: "Learn to say No. Respect your time and energy. Don't be so nice that you \"yes-man\" yourself into having no space or time for yourself.", act: "Say one kind, clear no today." },
  { n: 10, theme: "Time", text: "There is a difference between being patient and wasting time.", act: "Look at one thing you are \"waiting on\". Is it patience, or avoidance? Act on it if it's the second." },
  { n: 11, theme: "Mindset", text: "You spend your entire life inside your head. Make it a nice place to be.", act: "Catch one harsh thought about yourself and rewrite it the way a friend would say it." },
  { n: 12, theme: "Focus", text: "In today's digital-first world, the greatest skill you can build is the power of focused attention, and the way to build it is through daily meditation.", act: "Ten minutes of stillness: breathe, pray, or simply sit without the phone." },
  { n: 13, theme: "Confidence", text: "You have to believe in yourself before anyone else does. That is the cornerstone on which self-confidence is built.", act: "Write down one thing you have already proven you can do." },
  { n: 14, theme: "Character", text: "If you can't find a good person, be one.", act: "Do one good thing today that no one will ever know about." },
  { n: 15, theme: "Curiosity", text: "Stay curious, question everything, and if you want something, ask for it.", act: "Ask for one thing you want: a meeting, feedback, a chance." },
  { n: 16, theme: "Mindset", text: "The life you experience is simply a reflection of your mindset and decisions.", act: "Trace one current frustration back to a decision you can change." },
  { n: 17, theme: "Consistency", text: "Consistency > Intensity.", act: "Do the small daily version of your goal, even on a bad day." },
  { n: 18, theme: "Perspective", text: "You don't live once; you live multiple lives within one.", act: "Write what the next \"life\" (season) you are building looks like." },
  { n: 19, theme: "Emotions", text: "Master your emotions. A calm mind can handle every storm.", act: "When something stings today, pause ten breaths before you respond." },
  { n: 20, theme: "Work", text: "Don't be lazy. Do the work. You won't grow from easy.", act: "Pick the hardest task on your list and do it first." },
  { n: 21, theme: "Persistence", text: "You will never lose if you never quit.", act: "Return to one thing you quit too early, and do one step." },
  { n: 22, theme: "Character", text: "There is a big difference between people who are good and those who get good grades.", act: "Measure yourself today by how you treated people, not by output alone." },
  { n: 23, theme: "Time", text: "Money comes and money goes in life, but time only moves in one direction.", act: "Spend one hour today on something that will matter in ten years." },
  { n: 24, theme: "Standards", text: "Keep your standards high, and don't settle for something just because it's available.", act: "Raise the bar on one thing you have been doing \"good enough\"." },
  { n: 25, theme: "Relationships", text: "Never expect to get back what you give, or you will always be disappointed.", act: "Give something today with no score kept." },
  { n: 26, theme: "Relationships", text: "Accept people for who they are, not who you want them to be.", act: "Let one person be themselves today without trying to fix them." },
  { n: 27, theme: "Growth", text: "The best revenge is no revenge. Improve yourself and forget they exist.", act: "Put the energy from one old grudge into your own work today." },
];

export const SENTENCE_INTRO = "If you are in your 20s or 30s, read these 27 sentences to put yourself ahead of 97% of people your age.";
export const SENTENCE_PRACTICE = "Read one sentence each morning and pick a single action that lives it out that day. After 27 days, start again: the list becomes a monthly rhythm.";

/** Day n of the year (1-based) → the sentence and hack for that day. */
export const sentenceForDay = (dayNo: number) => SENTENCES[(((Math.max(1, dayNo) - 1) % 27) + 27) % 27];
export const hackForDay = (dayNo: number) => HACKS[(((Math.max(1, dayNo) - 1) % 14) + 14) % 14];
export const trialByKey = (k: string) => TRIALS.find((t) => t.key === k);
