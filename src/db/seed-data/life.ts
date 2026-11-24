/** Content for the To-don't list, Affirmations and Year plan sections. */

export const TODONT_CATEGORIES = [
  { key: "mind", label: "Mind & attention" },
  { key: "body", label: "Body & health" },
  { key: "money", label: "Money" },
  { key: "time", label: "Time & work" },
  { key: "people", label: "People & words" },
  { key: "faith", label: "Faith & character" },
  { key: "life", label: "Life" },
] as const;

export type TodontSuggestion = { key: string; category: string; text: string; why: string; instead: string };

export const TODONT_SUGGESTIONS: TodontSuggestion[] = [
  { key: "phone-first", category: "mind", text: "Don't touch my phone for the first hour of the day", why: "The first hour sets the direction of the whole day. Starting with other people's agendas makes you reactive before you have chosen anything.", instead: "Pray, move, then do the first block of real work." },
  { key: "scroll-bed", category: "mind", text: "Don't scroll in bed", why: "Screens in bed delay sleep and train your brain to stay alert where it should switch off.", instead: "Phone charges outside the bedroom; read a few pages of a book." },
  { key: "doomscroll", category: "mind", text: "Don't open social apps without a reason", why: "Feeds are designed to keep you, not to serve you. Mindless opening is how 30 minutes becomes 3 hours.", instead: "Decide the reason first; set a 10-minute timer." },
  { key: "multitask", category: "mind", text: "Don't multitask on deep work", why: "Switching leaves part of your attention on the last task, so both get done worse.", instead: "One tab, one task, phone in another room." },
  { key: "skip-sleep", category: "body", text: "Don't trade sleep for screen time", why: "Lost sleep costs mood, focus, discipline and muscle; nothing on a screen is worth that.", instead: "Lights out at the set time; the show will still be there tomorrow." },
  { key: "skip-training", category: "body", text: "Don't skip training twice in a row", why: "Missing once is life; missing twice is a new habit forming.", instead: "Do the minimum: 20 minutes, or a brisk walk." },
  { key: "junk-late", category: "body", text: "Don't eat junk late at night", why: "Late junk wrecks sleep quality and undoes the day's discipline.", instead: "Kitchen closes after dinner; tea or water if hungry." },
  { key: "drink-stress", category: "body", text: "Don't use alcohol or sugar to handle stress", why: "It numbs the feeling for an hour and adds to the problem for days.", instead: "Walk, pray, write it down or call someone." },
  { key: "impulse-buy", category: "money", text: "Don't buy anything non-essential on impulse", why: "Impulse spending is the quiet leak that keeps savings goals out of reach.", instead: "Wait 48 hours; if you still want it, decide calmly." },
  { key: "lend-unplanned", category: "money", text: "Don't lend money I cannot afford to lose", why: "Unplanned loans strain both your budget and the relationship.", instead: "Give a small amount as a gift, or say no kindly." },
  { key: "spend-first", category: "money", text: "Don't spend before saving", why: "Savings that wait for leftovers never happen.", instead: "Move the savings amount on payday, before anything else." },
  { key: "lifestyle-creep", category: "money", text: "Don't upgrade my lifestyle every time income rises", why: "Rising spending turns every raise into nothing.", instead: "Save at least half of every increase." },
  { key: "yes-everything", category: "time", text: "Don't say yes to everything", why: "Every yes is a no to something else, usually your priorities.", instead: "Say 'let me check and get back to you', then decide against your plan." },
  { key: "procrastinate", category: "time", text: "Don't start the day without knowing my one decisive task", why: "A day without a priority gets eaten by urgent but unimportant things.", instead: "Write tomorrow's first task before bed." },
  { key: "late", category: "time", text: "Don't arrive late or unprepared", why: "Small lateness quietly erodes trust and your own self-respect.", instead: "Plan to arrive 10 minutes early; prepare the night before." },
  { key: "overcommit", category: "time", text: "Don't promise what I cannot deliver", why: "Broken promises cost more than an honest 'not now'.", instead: "Under-promise, then over-deliver." },
  { key: "gossip", category: "people", text: "Don't gossip or speak badly of people who are absent", why: "It cheapens you, and others assume you speak of them the same way.", instead: "Speak well, or say nothing; take concerns to the person directly." },
  { key: "reply-angry", category: "people", text: "Don't reply when I'm angry", why: "Words said in anger outlast the anger.", instead: "Wait an hour, or sleep on it, then answer calmly." },
  { key: "compare", category: "people", text: "Don't compare my journey to anyone else's highlight reel", why: "Comparison steals joy and tells you nothing true about your path.", instead: "Compare yourself to who you were last month." },
  { key: "please-all", category: "people", text: "Don't seek everyone's approval", why: "Living for applause makes you easy to steer and hard to respect.", instead: "Ask: is this right, and is it mine to do?" },
  { key: "fools-company", category: "people", text: "Don't spend long hours with people who pull me down", why: "You become like the people you walk with (Proverbs 13:20).", instead: "Invest that time with people who sharpen you." },
  { key: "skip-prayer", category: "faith", text: "Don't start the day without God", why: "Starting in your own strength makes the day heavier than it needs to be.", instead: "Two minutes of prayer and one verse before the phone." },
  { key: "hide-sin", category: "faith", text: "Don't hide my mistakes", why: "He that covereth his sins shall not prosper (Proverbs 28:13). Hidden things grow.", instead: "Own it quickly, confess it, fix what you can." },
  { key: "self-pity", category: "faith", text: "Don't stay in self-pity", why: "Self-pity feels like rest but drains the strength you need to get up.", instead: "Name the feeling, then do the next small right thing." },
  { key: "quit-plateau", category: "life", text: "Don't quit in the plateau", why: "Most progress is invisible at first; the curve bends late.", instead: "Keep the minimum going and review results quarterly, not daily." },
  { key: "blame", category: "life", text: "Don't blame other people or circumstances", why: "Blame hands your power to someone else.", instead: "Ask: what part of this is mine to fix?" },
];

export const AFFIRMATION_CATEGORIES = [
  { key: "identity", label: "Identity" },
  { key: "faith", label: "Faith" },
  { key: "discipline", label: "Discipline" },
  { key: "body", label: "Body & health" },
  { key: "mind", label: "Mind & peace" },
  { key: "work", label: "Work & calling" },
  { key: "money", label: "Money & provision" },
  { key: "people", label: "Love & relationships" },
  { key: "resilience", label: "Resilience" },
  { key: "purpose", label: "Purpose & legacy" },
  { key: "year", label: "This new year" },
] as const;

export type Affirmation = { key: string; category: string; text: string; deeper: string };

export const AFFIRMATIONS: Affirmation[] = [
  // Identity
  { key: "id-1", category: "identity", text: "I am not my worst day, my last mistake or my bank balance. I am who God says I am, and I am becoming who I choose to be.", deeper: "Your identity is not a scoreboard. Events describe what happened; they do not define who you are. Separate the two and failure becomes something you learn from, not something you are." },
  { key: "id-2", category: "identity", text: "I keep the promises I make to myself, so I trust myself more every day.", deeper: "Self-trust is built exactly like trust with anyone else: kept promises, small and repeated. Make fewer promises, keep them all, and confidence follows." },
  { key: "id-3", category: "identity", text: "I am the kind of man who does the hard thing first.", deeper: "Habits follow identity. When you act as the person you want to become, each action is a vote for that identity, and the votes add up." },
  { key: "id-4", category: "identity", text: "I do not need to be loud to be strong. My work and my character speak for me.", deeper: "Real presence is quiet. People trust consistency, calm and kept commitments far more than noise." },
  // Faith
  { key: "fa-1", category: "faith", text: "God is with me today. I do not walk into anything alone.", deeper: "You can take risks, face hard conversations and carry heavy days differently when you know you are not on your own. Courage grows from that security." },
  { key: "fa-2", category: "faith", text: "I do my part with all my strength, and I trust God with what I cannot control.", deeper: "This is the balance between effort and surrender. Work like it depends on you, pray like it depends on God, then release the outcome." },
  { key: "fa-3", category: "faith", text: "I ask for wisdom and I receive it. I make my decisions from peace, not panic.", deeper: "James 1:5 promises wisdom to those who ask. Decisions made in panic tend to be short-sighted; decisions made after prayer and counsel are steadier." },
  { key: "fa-4", category: "faith", text: "My worth is settled. I work from love, not for it.", deeper: "When your worth is not on the line every day, you can fail, learn and try again without fear. Grace is the ground you stand on, not a reward you chase." },
  // Discipline
  { key: "di-1", category: "discipline", text: "I do what I said I would do, especially when I don't feel like it.", deeper: "Motivation is a visitor; discipline lives with you. The days you act without feeling like it are the days that build you the most." },
  { key: "di-2", category: "discipline", text: "Discipline is my freedom. Every hard choice today buys me options tomorrow.", deeper: "Each disciplined choice (the training, the saved money, the finished task) is an investment in a future with more freedom, not less." },
  { key: "di-3", category: "discipline", text: "I never miss twice. A bad day gets the minimum, never zero.", deeper: "Perfection is not the goal; continuity is. A minimum version of each habit keeps the chain alive through hard seasons." },
  { key: "di-4", category: "discipline", text: "I master my impulses. They do not master me.", deeper: "Proverbs compares a man without self-control to a city without walls. Every 'no' to an impulse strengthens the walls around everything you are building." },
  // Body
  { key: "bo-1", category: "body", text: "My body is a gift and a temple. I train it, feed it and rest it with respect.", deeper: "Caring for your body is stewardship, not vanity. Strength, energy and long life make it possible to serve and to enjoy what you are building." },
  { key: "bo-2", category: "body", text: "I am getting stronger every week, in body and in will.", deeper: "Progressive overload works in the gym and in life: a little more than last time, repeated, is how strength is built." },
  { key: "bo-3", category: "body", text: "Sleep is part of my work. I protect it like a meeting with my future self.", deeper: "Muscle repair, emotional balance and clear thinking all happen during sleep. Treat bedtime as a commitment, not an afterthought." },
  { key: "bo-4", category: "body", text: "I fuel myself for the life I want, not for the craving I feel.", deeper: "Every meal is a vote for your energy tomorrow. Planning ahead removes most of the battle." },
  // Mind
  { key: "mi-1", category: "mind", text: "I control my response. Nothing outside me can take my peace without my permission.", deeper: "The Stoics taught that events are not up to us but our judgements are. Between what happens and how you respond there is a space, and you can widen it." },
  { key: "mi-2", category: "mind", text: "I guard my attention because my attention shapes my life.", deeper: "What you pay attention to grows. Guarding your inputs (feeds, conversations, thoughts) is guarding your heart, from which life flows (Proverbs 4:23)." },
  { key: "mi-3", category: "mind", text: "I can feel anxious and still act with courage.", deeper: "Courage is not the absence of fear; it is moving while fear is present. Feelings are information, not instructions." },
  { key: "mi-4", category: "mind", text: "I am a learner. Every day I become a little wiser than yesterday.", deeper: "Wisdom compounds. Teachability keeps you growing long after talent alone would have plateaued." },
  // Work
  { key: "wo-1", category: "work", text: "I do excellent work, and excellent work opens doors for me.", deeper: "Proverbs 22:29: a man diligent in his business will stand before kings. Mastery of your craft is the most reliable career strategy there is." },
  { key: "wo-2", category: "work", text: "I am a data scientist who ships. I turn ideas into products people use.", deeper: "Shipping is a skill. Finished, imperfect work teaches more and is worth more than perfect work that never leaves your laptop." },
  { key: "wo-3", category: "work", text: "Opportunities are looking for someone prepared, and I am preparing every day.", deeper: "Luck tends to favour the prepared. Deep work today makes you ready for the door that opens tomorrow." },
  { key: "wo-4", category: "work", text: "My work is a form of service, and I bring my full self to it.", deeper: "When work serves people (clients, colleagues, tenants, users) it carries meaning beyond the paycheck, and that meaning sustains effort." },
  // Money
  { key: "mo-1", category: "money", text: "I am a good steward. Money flows to me and I manage it with wisdom.", deeper: "Wealth is built more by managing well than by earning more. Faithfulness with little is the training ground for more." },
  { key: "mo-2", category: "money", text: "I pay myself first, I live below my means and I build quietly.", deeper: "Quiet, steady saving and investing beat loud spending every time. Your future self is the one you are paying." },
  { key: "mo-3", category: "money", text: "I am free from debt that controls me. Every payment is a step towards freedom.", deeper: "Debt borrows from your future. Paying it down is buying back choices." },
  { key: "mo-4", category: "money", text: "I am generous, because what I give is never lost.", deeper: "Proverbs 11:25: the liberal soul shall be made fat. Generosity breaks the grip money tries to have on you." },
  // People
  { key: "pe-1", category: "people", text: "I am a man people can rely on. My word is my bond.", deeper: "Reliability is rare and valuable. A reputation for keeping your word is built in small moments nobody sees." },
  { key: "pe-2", category: "people", text: "I give my full attention to the people in front of me.", deeper: "Presence is one of the deepest forms of respect and love. Phone down, eyes up, listen to understand." },
  { key: "pe-3", category: "people", text: "I walk with wise people, and I am becoming wiser.", deeper: "You become like those you spend time with. Choosing your circle is choosing your future." },
  { key: "pe-4", category: "people", text: "I honour my family, and I build a home of peace.", deeper: "Strong roots hold you steady through storms. Love shown in small consistent acts lasts longer than grand gestures." },
  // Resilience
  { key: "re-1", category: "resilience", text: "I fall, and I get up again. Every time.", deeper: "Proverbs 24:16: a just man falleth seven times, and riseth up again. Resilience is not avoiding falls; it is refusing to stay down." },
  { key: "re-2", category: "resilience", text: "Setbacks are lessons in disguise. I am being prepared, not punished.", deeper: "Many breakthroughs follow failure. Ask of every setback: what is this teaching me, and what does it make possible?" },
  { key: "re-3", category: "resilience", text: "I have survived every hard day so far. I will survive this one too.", deeper: "Your track record of getting through is 100%. Remember the storms you have already come through." },
  { key: "re-4", category: "resilience", text: "Pressure is shaping me into someone stronger.", deeper: "Diamonds and muscles both form under pressure. Hard seasons, handled well, build capacity you could not get any other way." },
  // Purpose
  { key: "pu-1", category: "purpose", text: "My life has a purpose, and I live it on purpose.", deeper: "Purpose is lived in daily choices, not discovered once. Align today with what matters and meaning follows." },
  { key: "pu-2", category: "purpose", text: "I am building a life I will be proud to look back on.", deeper: "Imagine the 80-year-old you looking back on this year. Live in a way that makes him grateful." },
  { key: "pu-3", category: "purpose", text: "I use my gifts to make life better for others.", deeper: "Talents are given to be multiplied and shared. Impact on others is the most lasting legacy." },
  { key: "pu-4", category: "purpose", text: "I am planting trees whose shade I may never sit in.", deeper: "The greatest things are built for the long term. Faithful work now blesses people you may never meet." },
  // Year
  { key: "yr-1", category: "year", text: "This is my year of focus, discipline and visible progress.", deeper: "Name the year and it becomes a filter for decisions. Every choice can be checked against the theme." },
  { key: "yr-2", category: "year", text: "At this age I stop waiting for permission and start building.", deeper: "No one is coming to hand you the life you want. Start before you feel ready; readiness comes from doing." },
  { key: "yr-3", category: "year", text: "I enter this new year grateful for the last one and expectant for the next.", deeper: "Gratitude for the past and hope for the future are the two wings of a good year." },
  { key: "yr-4", category: "year", text: "By my next birthday I will be stronger, wiser, freer and closer to God than I am today.", deeper: "A clear picture of who you will be in one year makes the daily choices obvious. Read it often and live towards it." },
];

/** Rotate through the library, one affirmation per calendar day. */
export function affirmationForDay(dayISO: string): Affirmation {
  const days = Math.floor(Date.parse(dayISO + "T00:00:00Z") / 86400000);
  return AFFIRMATIONS[((days % AFFIRMATIONS.length) + AFFIRMATIONS.length) % AFFIRMATIONS.length];
}

/** A set of five for reading aloud, rotating daily across categories. */
export function affirmationSet(dayISO: string, n = 5): Affirmation[] {
  const days = Math.floor(Date.parse(dayISO + "T00:00:00Z") / 86400000);
  const out: Affirmation[] = [];
  for (let i = 0; i < n; i++) out.push(AFFIRMATIONS[(((days * 7 + i * 9) % AFFIRMATIONS.length) + AFFIRMATIONS.length) % AFFIRMATIONS.length]);
  return out.filter((a, i) => out.findIndex((b) => b.key === a.key) === i);
}

export const YEAR_AREAS = [
  { key: "faith", label: "Faith", prompt: "How will your walk with God grow this year?", example: "Read through Proverbs 12 times; pray every morning; join a small group." },
  { key: "body", label: "Body", prompt: "What will your body be able to do by your next birthday?", example: "Squat 1.5x body weight; 7+ hours sleep on 80% of nights." },
  { key: "career", label: "Career & skills", prompt: "What role, skill or project will you have finished?", example: "Land an ML or full-stack AI role; ship 3 public projects." },
  { key: "money", label: "Money", prompt: "What will your money look like in 12 months?", example: "Emergency fund full; debts cleared; investing every month." },
  { key: "mind", label: "Mind & learning", prompt: "What will you learn and read?", example: "Pass the next ACCA papers; read 24 books." },
  { key: "people", label: "Relationships", prompt: "Who will you invest in, and how?", example: "Weekly call with family; monthly mentor meeting." },
  { key: "impact", label: "Impact", prompt: "How will others be better off because of you?", example: "Mentor one younger person; give monthly." },
] as const;

export const THEME_WORDS = ["Focus", "Build", "Discipline", "Rise", "Harvest", "Courage", "Depth", "Steward", "Ship", "Unshakeable", "Foundation", "Breakthrough"];

export const QUARTER_HINTS = [
  "Q1: lay foundations. Habits, systems, baseline, first wins.",
  "Q2: build momentum. Raise the load on the main goal; finish what you started.",
  "Q3: produce. Ship visible results; let people see the work.",
  "Q4: harvest and reflect. Close the year strong, measure, celebrate, plan the next.",
];
