/**
 * Content for the 6-Month "Disappear" challenge, adapted from the
 * "Disappear for 6 Months: The Cheat Sheet" document. Pure data, no database.
 */

export const CHALLENGE_NAME = "6-Month Challenge";

/** The seven daily non-negotiables. Score = how many are ticked (0 to 7). */
export const DAILY_CHECKS = [
  { key: "wake", label: "Up at the set time", rule: 8 },
  { key: "deep", label: "Deep-work block done before anything else", rule: 6 },
  { key: "trained", label: "Trained, or walked on a rest day", rule: 7 },
  { key: "ate", label: "Ate to plan and hit protein", rule: 9 },
  { key: "clean", label: "Stayed clean on the vice list", rule: 10 },
  { key: "social", label: "Social apps under 30 minutes", rule: 1 },
  { key: "logged", label: "Day logged and tomorrow's first task written", rule: 2 },
] as const;
export type CheckKey = (typeof DAILY_CHECKS)[number]["key"];

export type Rule = {
  n: number;
  slogan: string;
  phase: 1 | 2 | 3;
  means: string;
  proof: string;
  tips: string[];
  /** Months (1-6) in which this rule is a main focus. Rules 2 and 3 run all six. */
  months: number[];
};

export const PHASES: Record<number, { name: string; blurb: string }> = {
  1: { name: "Clear the ground", blurb: "Remove things: noise, blame habits, excuses and vices." },
  2: { name: "Build the engine", blurb: "Add things: a reason, a hard task, protected hours, training, a timetable and fuel." },
  3: { name: "Cash it in", blurb: "Measure what the inputs produced: change, upgrades, shipped work, thriving, the win." },
};

export const RULES: Rule[] = [
  {
    n: 1, slogan: "Become a ghost", phase: 1, months: [1],
    means: "Cut the noise, not the people: stop broadcasting, stop scrolling, stop saying yes by default.",
    proof: "Screen time on social apps under 30 min a day.",
    tips: [
      "Delete social apps from the phone; log out after each use on a laptop.",
      "Stop announcing plans. Share results after they exist.",
      "Default answer to new invitations: \"not until May\". Decide exceptions in advance.",
      "Phone on Do Not Disturb during deep work and from one hour before bed.",
      "Give the hour you took from scrolling a named job.",
    ],
  },
  {
    n: 2, slogan: "Make everything your fault", phase: 1, months: [1, 2, 3, 4, 5, 6],
    means: "Treat every result as something your own actions can change. Control, not guilt.",
    proof: "Each setback logged with one thing you will do differently.",
    tips: [
      "When something goes wrong, write three lines: what happened, what was in my control, what I will do next time.",
      "Replace \"I didn't have time\", \"they didn't\", \"it wasn't fair\" with \"I chose\" or \"next time I will\".",
      "Some things really are outside your control. Note them once, then focus on your response.",
    ],
  },
  {
    n: 3, slogan: "Find the beast", phase: 2, months: [1, 2, 3, 4, 5, 6],
    means: "Know the one reason this matters enough to do on bad days.",
    proof: "A written \"why\" you reread each morning.",
    tips: [
      "Write your why in three sentences: what you want, who it is for, what staying the same costs in five years.",
      "Keep one piece of evidence of what you can do and reread it on bad days.",
      "Decide who you are being: \"I am someone who trains at 6\".",
    ],
  },
  {
    n: 4, slogan: "Throw yourself into pain", phase: 2, months: [3],
    means: "Choose the hard, useful thing daily, on purpose. Chosen discomfort, never injury or burnout.",
    proof: "One deliberately hard task done before noon.",
    tips: [
      "Do the hardest important task first, before messages and easy wins.",
      "Practise at the edge of your ability.",
      "Add one small voluntary discomfort a day (cold finish to the shower, stairs, an early start).",
      "Hard but repeatable is the target. Sharp pain, weeks of dread or falling performance means back off.",
    ],
  },
  {
    n: 5, slogan: "Cut the excuses", phase: 1, months: [1],
    means: "Remove the conditions that let you skip.",
    proof: "Missed days per month: 2 or fewer, never 2 in a row.",
    tips: [
      "List your five most-used excuses and write an if-then plan for each.",
      "Set a minimum version of every habit (10 minutes, one set, one page). A bad day gets the minimum, never zero.",
      "Never miss twice. One missed day is an accident; two is a new habit.",
      "Prepare the night before: clothes, bag, first task, food.",
    ],
  },
  {
    n: 6, slogan: "Go all in on yourself", phase: 2, months: [3],
    means: "One main goal gets your best hours and your money.",
    proof: "2 to 4 protected deep-work hours a day on that goal.",
    tips: [
      "Give the headline target your best 2 to 4 hours every day, the same hours.",
      "Spend on the goal before comfort: the course, the book, the gym fee, the exam registration.",
      "Monthly \"stop doing\" review: drop one commitment that does not serve the target.",
      "Keep your job and obligations. All in does not mean reckless with income.",
    ],
  },
  {
    n: 7, slogan: "Train like a warrior", phase: 2, months: [2],
    means: "Structured, progressive training, not random workouts.",
    proof: "4 sessions a week logged, numbers going up.",
    tips: [
      "4 days a week: three strength sessions on the main lifts, one conditioning session.",
      "Progressive overload: add a little weight or one rep whenever you hit your target reps. Log every session.",
      "Walk 8,000 to 10,000 steps daily. Sleep 7 to 8 hours.",
      "One full rest day, and an easier week every fourth or fifth week.",
    ],
  },
  {
    n: 8, slogan: "Work like a robot", phase: 2, months: [2],
    means: "Same schedule, same triggers, no negotiating with mood.",
    proof: "A fixed daily timetable followed 6 days out of 7.",
    tips: [
      "Fix wake time, deep-work block, training slot and shutdown time, six days a week.",
      "Focused blocks of 50 to 90 minutes with 10-minute breaks, phone in another room.",
      "Write tomorrow's first task before you stop today.",
      "A robot also powers down: end work at a fixed time.",
    ],
  },
  {
    n: 9, slogan: "Eat like a king", phase: 2, months: [2],
    means: "Eat for performance: enough protein, real food, water.",
    proof: "Meals planned ahead; protein target hit daily.",
    tips: [
      "Build each meal around protein, then vegetables, then a whole-food carbohydrate.",
      "A common target is about 1.6 g of protein per kg of bodyweight per day. Adjust to your needs.",
      "Drink 2 to 3 litres of water a day. Limit sugar, soda, alcohol and fried takeaway.",
      "Cook in bulk twice a week and eat at regular times.",
    ],
  },
  {
    n: 10, slogan: "Reject vices", phase: 1, months: [1],
    means: "Name your 1 to 3 biggest drains and remove access.",
    proof: "Days clean, counted.",
    tips: [
      "Remove the supply: delete the app, block the site, cancel the subscription, change the route home.",
      "Know your trigger window and schedule something specific into it.",
      "Tell your accountability partner exactly what you are quitting.",
      "If you slip, log the trigger, restart the count the same day and tighten the barrier that failed.",
      "If it feels bigger than a habit, bring in a professional or a support group.",
    ],
  },
  {
    n: 11, slogan: "Transform", phase: 3, months: [6],
    means: "Visible change in body, skill and habits.",
    proof: "Before and after measurements.",
    tips: [
      "Track three things monthly: body (weight, waist, main lifts, a photo), skill, habits.",
      "Expect the visible change to lag; most of it arrives in months 4 to 6.",
    ],
  },
  {
    n: 12, slogan: "Upgrade", phase: 3, months: [5],
    means: "Better tools, environment, circle and standards.",
    proof: "Three specific upgrades made.",
    tips: [
      "Environment: a clean desk, a fixed place to work, a room that helps you sleep.",
      "Tools: fix the one that slows you down most.",
      "Circle: spend time with one or two people ahead of you.",
      "Money: a written budget, an emergency buffer, no new lifestyle debt.",
    ],
  },
  {
    n: 13, slogan: "Create", phase: 3, months: [4],
    means: "Ship finished work others can see or use.",
    proof: "Something published every month.",
    tips: [
      "Ship something finished every month: a project, an article, a portfolio piece, a feature.",
      "1-to-3 rule: for every hour of learning, three hours of building.",
      "Keep the work private while you build, then publish the result.",
    ],
  },
  {
    n: 14, slogan: "Thrive", phase: 3, months: [6],
    means: "Sustainable energy, sleep, money and relationships.",
    proof: "7+ hours sleep; budget kept; key people still close.",
    tips: [
      "Sleep is steady, energy is good most days, and you do not dread the routine.",
      "Key relationships intact or better. Call home.",
      "You spent less than you earned and know where it went.",
      "One rest day a week and one thing you do purely because you enjoy it.",
    ],
  },
  {
    n: 15, slogan: "Win", phase: 3, months: [6],
    means: "Hit the one target you set on day 1.",
    proof: "Target met, yes or no.",
    tips: [
      "On the last day, score it: hit, partly hit, or missed. Write why in five lines.",
      "If you hit it, set the next target within a week.",
      "If you missed, the habits, skills and body you built still stand. Extend the deadline, keep the system.",
    ],
  },
];

export const MONTHS: { n: number; title: string; rules: string; focus: string }[] = [
  { n: 1, title: "Strip and set up", rules: "Rules 1, 5, 10", focus: "Delete the apps, remove the vices, fix the timetable, record the baseline. Only three habits: wake time, one deep-work block, training. Expect withdrawal and boredom; that is the plan working." },
  { n: 2, title: "Lock the routine", rules: "Rules 7, 8, 9", focus: "Four training sessions a week, meals planned, timetable held through the December holidays. The holidays are the first real test of never missing twice." },
  { n: 3, title: "Raise the load", rules: "Rules 4, 6", focus: "Extend deep work to 3 or 4 hours, take on the hardest part of the headline target, drop one commitment. Do the mid-point review at the end of this month." },
  { n: 4, title: "Produce", rules: "Rule 13", focus: "Shift from learning to shipping; the first finished piece of work goes out. Take an easier training week." },
  { n: 5, title: "Upgrade and push", rules: "Rule 12", focus: "Fix the tools, environment and circle that are now the bottleneck. Peak-effort month for the headline target." },
  { n: 6, title: "Finish and reappear", rules: "Rules 11, 14, 15", focus: "Close out the target, take final measurements, score the result, and decide what you show the world." },
];

export const TERMS = [
  { key: "headline", label: "One headline target", hint: "A result with a number and a date. One, not five." },
  { key: "support", label: "Two supporting targets", hint: "Usually one for body and one for money or skill." },
  { key: "vices", label: "Your vice list", hint: "The 1 to 3 habits that cost you most. Be specific." },
  { key: "people", label: "Who stays in the loop", hint: "3 to 5 people who hear from you weekly." },
  { key: "baseline", label: "Your baseline", hint: "Record starting numbers in the scorecard on day 1." },
];

/** Scorecard rows. `auto` means the page can compute a live value from your daily log. */
export const SCORECARD: { key: string; label: string; auto?: string }[] = [
  { key: "headline", label: "Headline target: progress" },
  { key: "support1", label: "Supporting target 1" },
  { key: "support2", label: "Supporting target 2" },
  { key: "deep", label: "Deep-work blocks per week", auto: "deep" },
  { key: "training", label: "Training sessions per week", auto: "training" },
  { key: "lifts", label: "Main lifts (squat / press / pull)" },
  { key: "body", label: "Bodyweight and waist" },
  { key: "sleep", label: "Average sleep (hours)", auto: "sleep" },
  { key: "social", label: "Daily social-app time (min)", auto: "social" },
  { key: "clean", label: "Longest streak clean on vice list (days)", auto: "clean" },
  { key: "shipped", label: "Pieces of work shipped" },
  { key: "money", label: "Savings rate or money kept to budget" },
  { key: "score", label: "Average daily score out of 7", auto: "score" },
];

export const SUNDAY_STEPS = [
  "Add up the week: daily scores, deep-work blocks, training sessions, days clean, money spent.",
  "Name the one thing that worked and keep it.",
  "Name the one thing that failed, own your part, and change one condition so it cannot fail the same way.",
  "Check progress against the headline target: on pace, behind or ahead?",
  "Plan next week: put deep-work and training blocks in the calendar first.",
  "Message your accountability partner the numbers.",
];

export const SAMPLE_DAY: { time: string; block: string; rules: string }[] = [
  { time: "5:00", block: "Wake, water, reread your why, no phone", rules: "3, 8" },
  { time: "5:15 to 7:15", block: "Deep work on the headline target", rules: "4, 6" },
  { time: "7:15 to 8:00", block: "Breakfast, get ready, commute", rules: "9" },
  { time: "8:00 to 17:00", block: "Job, done properly; walk at lunch", rules: "2, 8" },
  { time: "17:30 to 18:45", block: "Training", rules: "7" },
  { time: "19:00 to 20:00", block: "Dinner, prep tomorrow's food and clothes", rules: "5, 9" },
  { time: "20:00 to 21:00", block: "Second block: study or build (optional on heavy days)", rules: "6, 13" },
  { time: "21:00 to 21:30", block: "Shutdown: log the day, write tomorrow's first task", rules: "2, 8" },
  { time: "21:30", block: "Screens off, in bed by 22:00", rules: "1, 14" },
];

export const TRAPS: { line: string; trap: string; better: string }[] = [
  { line: "Become a ghost", trap: "Cutting off family and friends; isolation lowers mood and removes the people who would catch you slipping.", better: "Go quiet online and socially selective; keep your 3 to 5 people and weekly contact." },
  { line: "Make everything your fault", trap: "Self-blame for things you could not control, which turns into shame and paralysis.", better: "Own your response and your next move; drop the guilt." },
  { line: "Throw yourself into pain", trap: "Injury, no sleep, treating exhaustion as a medal.", better: "Hard and repeatable beats brutal and brief; recovery is part of training." },
  { line: "Cut out all the excuses", trap: "Ignoring real limits such as illness, grief or an emergency.", better: "Real reasons get the minimum version and a restart date; they are not excuses." },
  { line: "Go all in on yourself", trap: "Quitting the job, burning savings, neglecting dependants.", better: "Concentrate your free hours and spare money; protect your income." },
  { line: "Work like a robot", trap: "No rest, no joy, then a crash in month 3.", better: "Automate decisions, not feelings; keep the rest day." },
  { line: "Reject vices", trap: "White-knuckling alone, then one slip ends the whole plan.", better: "Remove access, get support, restart the same day." },
  { line: "Disappear for 6 months", trap: "Waiting for a perfect clean start; treating month 7 as a return to the old life.", better: "Start today with month 1's three habits; the aim is a system you keep." },
];

export const WARNING_SIGNS = [
  "Sleep under 6 hours for more than a week.",
  "Performance falling despite more effort.",
  "Feeling flat or hopeless for more than two weeks.",
];
