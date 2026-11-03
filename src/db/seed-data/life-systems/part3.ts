import type { LifeSystem } from "./types";

// HEALTH · MONEY · RELATIONSHIPS · FAITH · CAREER
export const SYSTEMS_3: LifeSystem[] = [
  // ---------------- HEALTH ----------------
  {
    id: "150-minutes",
    title: "150 Minutes a Week",
    origin: "World Health Organization physical activity guidelines",
    category: "health",
    summary:
      "Adults are advised to get at least 150–300 minutes of moderate activity a week plus strength training twice a week. It's one of the strongest levers for long life and a steady mood.",
    steps: [
      "Split it: 30 minutes, five days a week (brisk walking counts).",
      "Add two strength sessions.",
      "Schedule them like meetings.",
      "Track them as a habit.",
    ],
    tryToday: "Take a brisk 30-minute walk.",
    habit: { name: "30 min movement", targetPerWeek: 5 },
  },
  {
    id: "sleep-anchor",
    title: "The Sleep Anchor",
    origin: "Sleep research (consistent sleep-wake timing)",
    category: "health",
    summary:
      "A fixed wake-up time, even on weekends, steadies your body clock. Better sleep improves willpower, mood, focus and resistance to cravings.",
    steps: [
      "Choose a wake time you can keep seven days a week.",
      "Count back 7–8 hours for your bedtime.",
      "No screens for the last 30 minutes.",
      "Get daylight within an hour of waking.",
    ],
    tryToday: "Set a fixed bedtime alarm for tonight.",
    habit: { name: "In bed by bedtime", targetPerWeek: 6 },
  },
  {
    id: "hara-hachi-bu",
    title: "Hara Hachi Bu (Eat Until 80% Full)",
    origin: "Okinawan tradition, Japan",
    category: "health",
    summary:
      "Okinawans traditionally stop eating when about 80% full. Eating slowly and stopping early helps the body's fullness signals catch up.",
    steps: [
      "Eat slowly, putting your fork down between bites.",
      "Pause halfway and check your hunger.",
      "Stop when you're satisfied, not stuffed.",
      "Use smaller plates.",
    ],
    tryToday: "At dinner, stop when you feel about 80% full.",
  },
  {
    id: "walk-after-meals",
    title: "Walk After Meals",
    origin: "Studies on post-meal movement and blood sugar",
    category: "health",
    summary:
      "A short walk of 10–15 minutes after eating helps the body handle blood sugar and digestion — an easy health win to stack onto meals.",
    steps: [
      "After lunch or dinner, walk for 10–15 minutes.",
      "Make it social: walk with family or a friend.",
      "Use it to call someone or pray.",
      "Track it as a habit.",
    ],
    tryToday: "Walk for 10 minutes after dinner tonight.",
  },
  {
    id: "progressive-overload",
    title: "Progressive Overload",
    origin: "Strength training principle",
    category: "health",
    summary:
      "To get stronger, slowly increase the demand: a little more weight, one more rep, one more set. The body adapts to what you ask of it.",
    steps: [
      "Log every session (weight, sets, reps).",
      "Each week, add a small amount of weight or reps.",
      "Keep form strict.",
      "Deload every 4–8 weeks to recover.",
    ],
    tryToday: "Beat one number from your last training session.",
  },

  // ---------------- MONEY ----------------
  {
    id: "pay-yourself-first",
    title: "Pay Yourself First",
    origin: "George S. Clason, The Richest Man in Babylon",
    category: "finance",
    summary:
      "Save a fixed share of your income the day you're paid, before spending anything. Clason's rule was at least one tenth. Spend what's left, not save what's left.",
    steps: [
      "Choose a percentage (start at 10%).",
      "On payday, move it to savings first.",
      "Automate the transfer if possible.",
      "Raise the percentage with each raise.",
    ],
    tryToday: "Set up a savings plan in Savings for your 'pay yourself first' amount.",
  },
  {
    id: "50-30-20",
    title: "The 50/30/20 Budget",
    origin: "Elizabeth Warren & Amelia Warren Tyagi, All Your Worth",
    category: "finance",
    summary:
      "Roughly 50% of take-home pay for needs, 30% for wants and 20% for savings and debt repayment. A simple starting frame you can adjust.",
    steps: [
      "Calculate monthly take-home pay.",
      "List needs (rent, food, transport) and see what share they take.",
      "Cap wants at about 30%.",
      "Direct 20% to savings and extra debt payments.",
    ],
    tryToday: "Split last month's spending into needs, wants and savings.",
  },
  {
    id: "debt-snowball",
    title: "The Debt Snowball",
    origin: "Popularised by Dave Ramsey",
    category: "finance",
    summary:
      "Pay minimums on all debts, throw every extra shilling at the smallest balance, then roll that payment into the next. Quick wins keep you motivated. (The avalanche — highest interest first — saves more money.)",
    steps: [
      "List debts smallest to largest on the Debts page.",
      "Pay minimums on all.",
      "Put all extra money on the smallest.",
      "When it's gone, roll its payment to the next.",
    ],
    tryToday: "Run the Snowball and Avalanche plans on the Debts page and compare.",
  },
  {
    id: "emergency-fund",
    title: "The Emergency Fund",
    origin: "Standard personal-finance practice",
    category: "finance",
    summary:
      "Build savings to cover 3–6 months of essential expenses. It turns emergencies into inconveniences and stops you sliding into debt.",
    steps: [
      "Calculate monthly essential costs.",
      "Set a first target of one month's costs.",
      "Keep it in a separate, easy-to-reach account (not invested in risky assets).",
      "Grow it to 3–6 months.",
    ],
    tryToday: "Create an 'Emergency fund' plan in Savings with a one-month target.",
  },
  {
    id: "rule-of-72",
    title: "The Rule of 72",
    origin: "Classic compound-interest shortcut",
    category: "finance",
    summary:
      "Divide 72 by an annual return rate to estimate how many years it takes money to double. At 8%, about 9 years. It shows why starting early matters so much — and why high-interest debt is so dangerous.",
    steps: [
      "Take an interest rate (savings, investment or debt).",
      "Divide 72 by it.",
      "That's roughly how many years to double.",
      "Use it to compare options and to fear high-interest debt.",
    ],
    tryToday: "Work out how fast your highest-APR debt would double if unpaid.",
  },
  {
    id: "48-hour-rule",
    title: "The 48-Hour Rule",
    origin: "Common anti-impulse-spending rule",
    category: "finance",
    summary:
      "For any non-essential purchase above a set amount, wait 48 hours. Most impulses fade; what remains is a real want.",
    steps: [
      "Set your threshold (e.g. KES 5,000).",
      "Above it, write the item down and wait 48 hours.",
      "Ask: do I still want it? Can I afford it without touching savings?",
      "Buy only if both answers are yes.",
    ],
    tryToday: "Set your personal threshold and write it in Mantras.",
  },

  // ---------------- RELATIONSHIPS ----------------
  {
    id: "five-to-one",
    title: "The 5:1 Ratio",
    origin: "John Gottman, relationship research",
    category: "relationships",
    summary:
      "Gottman's research found that stable couples have about five positive interactions for every negative one during conflict. Deposits of kindness carry relationships through hard moments.",
    steps: [
      "Notice your ratio of positive to critical comments with someone close.",
      "Add small positives daily: thanks, a compliment, attention, touch.",
      "During conflict, keep criticism about the behaviour, not the person.",
      "Repair quickly after arguments.",
    ],
    tryToday: "Give three sincere compliments to people close to you.",
  },
  {
    id: "love-languages",
    title: "The Five Love Languages",
    origin: "Gary Chapman",
    category: "relationships",
    summary:
      "People feel loved in different ways: words of affirmation, quality time, acts of service, gifts and physical touch. Love people in their language, not just yours.",
    steps: [
      "Guess the main love language of the people closest to you.",
      "Ask them, if you can.",
      "Do one thing in their language this week.",
      "Notice their response.",
    ],
    tryToday: "Do one act in someone else's love language today.",
  },
  {
    id: "carnegie-principles",
    title: "Carnegie's People Principles",
    origin: "Dale Carnegie, How to Win Friends and Influence People",
    category: "relationships",
    summary:
      "Don't criticise, condemn or complain. Give honest appreciation. Become genuinely interested in others. Remember names. Be a good listener. Timeless and surprisingly powerful.",
    steps: [
      "In each conversation, ask more questions than you answer.",
      "Use people's names.",
      "Give sincere appreciation, not flattery.",
      "Replace complaints with suggestions.",
    ],
    tryToday: "In your next conversation, only ask questions and listen for five minutes.",
  },
  {
    id: "weekly-connection",
    title: "The Weekly Connection List",
    origin: "Practice drawn from research on social ties and wellbeing (Harvard Study of Adult Development)",
    category: "relationships",
    summary:
      "The long-running Harvard Study of Adult Development links warm relationships to health and happiness. Relationships need maintenance like anything else — so schedule it.",
    steps: [
      "List 10 people who matter to you.",
      "Each week, reach out to two of them.",
      "Call, don't just text, when you can.",
      "Rotate through the list monthly.",
    ],
    tryToday: "Call one person you haven't spoken to in a month.",
    habit: { name: "Reach out to someone", targetPerWeek: 2 },
  },

  // ---------------- FAITH ----------------
  {
    id: "daniel-rhythm",
    title: "Daniel's Prayer Rhythm",
    origin: "Daniel 6:10",
    category: "faith",
    summary:
      "Daniel prayed three times a day, 'as he did aforetime', even when it was dangerous. Fixed times of prayer anchor the whole day in God.",
    steps: [
      "Choose three moments: morning, midday, evening.",
      "Set gentle reminders.",
      "Pray even briefly — consistency matters more than length.",
      "Give thanks each time, as Daniel did.",
    ],
    tryToday: "Set three prayer reminders on your phone.",
    habit: { name: "Pray morning, midday, evening", targetPerWeek: 7 },
  },
  {
    id: "examen",
    title: "The Daily Examen",
    origin: "Ignatius of Loyola, Spiritual Exercises",
    category: "faith",
    summary:
      "A short evening prayer reviewing the day with God: where did I sense His presence, where did I fall short, what do I need for tomorrow?",
    steps: [
      "Become aware of God's presence.",
      "Review the day with gratitude.",
      "Notice your emotions and what they reveal.",
      "Ask forgiveness where needed and pray for tomorrow.",
    ],
    tryToday: "Spend ten minutes on the Examen before bed.",
  },
  {
    id: "lectio-divina",
    title: "Lectio Divina",
    origin: "Ancient monastic practice (Benedictine tradition)",
    category: "faith",
    summary:
      "Slow, prayerful reading of a short passage: read, reflect, respond in prayer, and rest in God. Depth over volume.",
    steps: [
      "Read a short passage slowly, twice.",
      "Notice the word or phrase that stands out.",
      "Reflect on what it says to your life today.",
      "Pray it back to God and sit quietly.",
    ],
    tryToday: "Do Lectio Divina on today's verse of the day.",
  },
  {
    id: "sabbath",
    title: "Keep a Sabbath",
    origin: "Exodus 20:8–10; Mark 2:27",
    category: "faith",
    summary:
      "One day a week of rest and worship. It protects you from burnout, reorders your priorities and reminds you that your worth isn't your output.",
    steps: [
      "Choose your Sabbath day.",
      "Prepare the day before (chores, shopping).",
      "Rest, worship, spend time with family, enjoy creation.",
      "Avoid work and money tasks.",
    ],
    tryToday: "Plan what you'll stop doing on your next Sabbath.",
  },
  {
    id: "scripture-memory",
    title: "Scripture Memory",
    origin: "Psalm 119:11",
    category: "faith",
    summary:
      "'Thy word have I hid in mine heart, that I might not sin against thee.' Memorised verses are with you in temptation, fear and decisions when no Bible is open.",
    steps: [
      "Choose one verse a week (the verse of the day is a good source).",
      "Write it on a card and read it morning and night.",
      "Say it from memory before checking.",
      "Review old verses weekly.",
    ],
    tryToday: "Memorise today's verse of the day.",
    habit: { name: "Review memory verse", targetPerWeek: 7 },
  },
  {
    id: "first-fruits",
    title: "Firstfruits Giving",
    origin: "Proverbs 3:9–10; Malachi 3:10; 2 Corinthians 9:7",
    category: "faith",
    summary:
      "Give first, not from leftovers. Planned, cheerful generosity keeps money as a servant, not a master.",
    steps: [
      "Decide a percentage to give from every income.",
      "Set it aside first, alongside savings.",
      "Give cheerfully and with intention.",
      "Review the impact of your giving yearly.",
    ],
    tryToday: "Decide your giving percentage and write it in Mantras & Values.",
  },

  // ---------------- CAREER ----------------
  {
    id: "career-capital",
    title: "Build Career Capital",
    origin: "Cal Newport, So Good They Can't Ignore You",
    category: "career",
    summary:
      "Passion often follows mastery. Build rare and valuable skills first; they give you the leverage to choose meaningful, well-paid work.",
    steps: [
      "Identify skills that are rare and valuable in your field (e.g. data + finance + full-stack).",
      "Practise them deliberately every week.",
      "Show your work: projects, portfolio, results.",
      "Use your growing capital to negotiate for better roles.",
    ],
    tryToday: "Write the three rarest, most valuable skills you could build this year.",
  },
  {
    id: "skill-stack",
    title: "The Skill Stack",
    origin: "Common career strategy",
    category: "career",
    summary:
      "Being in the top 25% at two or three complementary skills can make you rarer than being the best at one. Economics + data science + shipping apps is a powerful stack.",
    steps: [
      "List your current skills.",
      "Find two or three that combine unusually well.",
      "Get good, not perfect, at each.",
      "Market yourself at the intersection.",
    ],
    tryToday: "Write a one-line description of your unique skill stack.",
  },
  {
    id: "personal-board",
    title: "A Personal Board of Advisers",
    origin: "Mentoring practice; Proverbs 15:22",
    category: "career",
    summary:
      "'Without counsel purposes are disappointed: but in the multitude of counsellors they are established.' Gather a few mentors for career, money, faith and life.",
    steps: [
      "Name the areas where you need guidance.",
      "Identify one wise person for each.",
      "Ask them one specific question each quarter.",
      "Report back on what you did with their advice.",
    ],
    tryToday: "Message one potential mentor with a thoughtful question.",
  },
  {
    id: "ikigai",
    title: "Ikigai",
    origin: "Japanese concept, popularised in the West by García & Miralles",
    category: "career",
    summary:
      "Look for the overlap between what you love, what you're good at, what the world needs and what you can be paid for. It's a compass, not a single answer.",
    steps: [
      "Draw four overlapping circles.",
      "Fill each: love, good at, world needs, paid for.",
      "Look for items that appear in three or four circles.",
      "Design small experiments to test them.",
    ],
    tryToday: "Fill in the four Ikigai circles in your journal.",
  },
  {
    id: "brag-document",
    title: "The Wins Log (Brag Document)",
    origin: "Common practice in engineering and corporate careers",
    category: "career",
    summary:
      "Keep a running list of your achievements, results and praise. It makes reviews, CVs, interviews and raise conversations far easier — and boosts confidence on hard days.",
    steps: [
      "Create a document or journal tag for wins.",
      "Each Friday, add what you shipped, fixed or learned.",
      "Include numbers and impact where possible.",
      "Review it before any review or interview.",
    ],
    tryToday: "Write five professional wins from the last three months.",
  },
];
